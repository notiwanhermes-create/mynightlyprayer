import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
    }

    const stripe = new Stripe(secretKey, { apiVersion: "2026-05-27.dahlia" });

    const body = await req.json();
    const {
      plan = "email",
      firstName, email, phoneNumber,
      deliveryTime, timezone, prayerFocus, tone,
      smsConsent,
    } = body;

    /* ── Validate required fields per plan ── */
    if (plan === "email" && !email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    if (plan === "sms" && !phoneNumber) {
      return NextResponse.json({ error: "Mobile number is required." }, { status: 400 });
    }

    /* ── Select price ID based on plan ── */
    let priceId: string;
    if (plan === "sms") {
      priceId = process.env.STRIPE_SMS_PRICE_ID ?? "";
      if (!priceId) {
        return NextResponse.json({ error: "SMS checkout is not available yet." }, { status: 400 });
      }
    } else {
      // Email plan — support both new STRIPE_EMAIL_PRICE_ID and legacy STRIPE_PRICE_ID
      priceId = process.env.STRIPE_EMAIL_PRICE_ID ?? process.env.STRIPE_PRICE_ID ?? "";
      if (!priceId) {
        return NextResponse.json({ error: "Price is not configured." }, { status: 500 });
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

    const sharedMetadata: Record<string, string> = {
      plan:         plan          ?? "email",
      firstName:    firstName     ?? "",
      email:        email         ?? "",
      phoneNumber:  phoneNumber   ?? "",
      deliveryTime: deliveryTime  ?? "",
      timezone:     timezone      ?? "",
      prayerFocus:  prayerFocus   ?? "",
      tone:         tone          ?? "",
      smsConsent:   smsConsent ? "true" : "false",
    };

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode:       "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata:   sharedMetadata,
      subscription_data: {
        trial_period_days: 7,
        metadata: sharedMetadata,
      },
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/cancel`,
    };

    // For email plan, pre-fill customer email so Stripe skips the email step
    if (plan === "email" && email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error("[create-checkout-session]", err);
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
