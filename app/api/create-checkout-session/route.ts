import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Initialise inside the handler so build-time evaluation never fails
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
    }

    const stripe = new Stripe(secretKey, { apiVersion: "2026-05-27.dahlia" });

    const body = await req.json();
    const { firstName, email, deliveryTime, timezone, prayerFocus, tone } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json({ error: "Price is not configured." }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

    // Shared metadata object — stored on both the session and the subscription
    // so the webhook can read it from checkout.session.completed
    const sharedMetadata = {
      firstName:    firstName    ?? "",
      email:        email        ?? "",
      deliveryTime: deliveryTime ?? "",
      timezone:     timezone     ?? "",
      prayerFocus:  prayerFocus  ?? "",
      tone:         tone         ?? "",
    };

    const session = await stripe.checkout.sessions.create({
      mode:           "subscription",
      customer_email: email,
      line_items:     [{ price: priceId, quantity: 1 }],
      metadata:       sharedMetadata,          // readable in checkout.session.completed
      subscription_data: {
        metadata: sharedMetadata,              // readable on the subscription object
      },
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error("[create-checkout-session]", err);
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
