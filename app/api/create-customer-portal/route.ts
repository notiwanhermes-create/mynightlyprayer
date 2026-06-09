import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("[create-customer-portal] Missing env var: STRIPE_SECRET_KEY");
  return new Stripe(key, { apiVersion: "2026-05-27.dahlia" as never });
}

export async function GET(req: NextRequest) {
  try {
    const url   = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }

    const db = getSupabaseAdmin();

    /* Find subscriber by token */
    const { data: subscriber, error: fetchErr } = await db
      .from("subscribers")
      .select("id, stripe_customer_id, management_token")
      .eq("management_token", token)
      .maybeSingle();

    if (fetchErr) {
      return NextResponse.json({ error: "Database error." }, { status: 500 });
    }
    if (!subscriber) {
      return NextResponse.json({ error: "Invalid or expired link." }, { status: 404 });
    }

    const customerId = subscriber.stripe_customer_id as string | null;
    if (!customerId) {
      return NextResponse.json({ error: "No billing account found." }, { status: 400 });
    }

    const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
    const returnUrl  = `${appUrl}/manage?token=${token}`;

    const stripe   = getStripe();
    const session  = await stripe.billingPortal.sessions.create({
      customer:   customerId,
      return_url: returnUrl,
    });

    console.log(`[create-customer-portal] Portal session created for subscriber ${subscriber.id}`);

    /* Redirect to Stripe's portal */
    return NextResponse.redirect(session.url, 303);

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    console.error("[create-customer-portal] Error:", msg);
    /* Redirect to manage page with an error param instead of a raw JSON error */
    const token = new URL(req.url).searchParams.get("token");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
    const fallback = token
      ? `${appUrl}/manage?token=${token}&error=portal`
      : `${appUrl}/`;
    return NextResponse.redirect(fallback, 303);
  }
}
