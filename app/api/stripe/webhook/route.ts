import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { randomBytes } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendWelcomeEmail } from "@/lib/sendWelcomeEmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  /* ── Guard: env vars ── */
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const secretKey     = process.env.STRIPE_SECRET_KEY;

  if (!webhookSecret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }
  if (!secretKey) {
    console.error("[webhook] STRIPE_SECRET_KEY is not set");
    return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });
  }

  /* ── Verify Stripe signature ── */
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2026-05-27.dahlia" });

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[webhook] Signature verification failed: ${msg}`);
    return NextResponse.json({ error: `Webhook error: ${msg}` }, { status: 400 });
  }

  console.log(`[webhook] Event received: ${event.type}`);

  try {
    const db = getSupabaseAdmin();

    switch (event.type) {

      /* ──────────────────────────────────────────────────────
         1. checkout.session.completed — save new subscriber
      ────────────────────────────────────────────────────── */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode !== "subscription") {
          console.log("[webhook] Skipping non-subscription session");
          break;
        }

        const metadata       = session.metadata ?? {};
        const customerId     = typeof session.customer     === "string"
          ? session.customer     : (session.customer as Stripe.Customer | null)?.id     ?? "";
        const subscriptionId = typeof session.subscription === "string"
          ? session.subscription : (session.subscription as Stripe.Subscription | null)?.id ?? "";

        if (!subscriptionId) {
          console.error("[webhook] No subscription ID — skipping");
          break;
        }

        /* Preserve existing management_token; also read welcome_email_sent_at for duplicate guard */
        const { data: existing } = await db
          .from("subscribers")
          .select("id, management_token, welcome_email_sent_at")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();

        const managementToken = existing?.management_token ?? randomBytes(32).toString("hex");

        /* Fetch the real subscription so the saved status matches Stripe —
           a trial checkout completes before any payment, so it's "trialing" */
        let subscriptionStatus: Stripe.Subscription.Status = "active";
        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          subscriptionStatus = subscription.status;
        } catch (subErr) {
          console.error(
            "[webhook] Could not retrieve subscription, defaulting status to active:",
            subErr instanceof Error ? subErr.message : subErr,
          );
        }

        const fields = {
          first_name:                 metadata.firstName      ?? "",
          email:                      session.customer_email  ?? metadata.email ?? "",
          delivery_time:              metadata.deliveryTime   ?? "",
          timezone:                   metadata.timezone       ?? "",
          prayer_focus:               metadata.prayerFocus    ?? "",
          tone:                       metadata.tone           ?? "",
          stripe_customer_id:         customerId,
          stripe_subscription_id:     subscriptionId,
          stripe_checkout_session_id: session.id,
          subscription_status:        subscriptionStatus,
          last_payment_status:        session.payment_status  ?? "",
          is_active:                  subscriptionStatus === "active" || subscriptionStatus === "trialing",
          management_token:           managementToken,
          updated_at:                 new Date().toISOString(),
        };

        let dbError;
        if (existing) {
          const { error } = await db
            .from("subscribers")
            .update(fields)
            .eq("id", existing.id);
          dbError = error;
        } else {
          const { error } = await db
            .from("subscribers")
            .insert(fields);
          dbError = error;
        }

        if (dbError) {
          console.error("[webhook] Supabase error:", dbError.message);
        } else {
          console.log(`[webhook] Subscriber saved → ${fields.email} (${subscriptionId})`);

          /* Send welcome email once per subscription */
          if (!existing?.welcome_email_sent_at && fields.email) {
            try {
              await sendWelcomeEmail({
                to:              fields.email,
                firstName:       fields.first_name,
                deliveryTime:    fields.delivery_time,
                managementToken: managementToken,
              });
              await db
                .from("subscribers")
                .update({ welcome_email_sent_at: new Date().toISOString() })
                .eq("stripe_subscription_id", subscriptionId);
              console.log(`[webhook] Welcome email sent → ${fields.email}`);
            } catch (emailErr) {
              console.error(
                "[webhook] Welcome email failed (non-fatal):",
                emailErr instanceof Error ? emailErr.message : emailErr,
              );
            }
          }
        }
        break;
      }

      /* ──────────────────────────────────────────────────────
         2. customer.subscription.updated — sync status
      ────────────────────────────────────────────────────── */
      case "customer.subscription.updated": {
        const sub      = event.data.object as Stripe.Subscription;
        const isActive = sub.status === "active" || sub.status === "trialing";

        const { error } = await db
          .from("subscribers")
          .update({
            subscription_status: sub.status,
            is_active:           isActive,
            updated_at:          new Date().toISOString(),
          })
          .eq("stripe_subscription_id", sub.id);

        if (error) console.error("[webhook] Update error:", error.message);
        else console.log(`[webhook] Subscription updated → ${sub.id} : ${sub.status}`);
        break;
      }

      /* ──────────────────────────────────────────────────────
         3. customer.subscription.deleted — mark canceled
      ────────────────────────────────────────────────────── */
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        const { error } = await db
          .from("subscribers")
          .update({
            subscription_status: "canceled",
            is_active:           false,
            canceled_at:         new Date().toISOString(),
            updated_at:          new Date().toISOString(),
          })
          .eq("stripe_subscription_id", sub.id);

        if (error) console.error("[webhook] Update error:", error.message);
        else console.log(`[webhook] Subscription canceled → ${sub.id}`);
        break;
      }

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("[webhook] Handler threw:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
