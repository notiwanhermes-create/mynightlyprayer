import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Normalise any phone string to E.164 (+12267241954).
 * Handles: "+12267241954", "2267241954", "12267241954",
 *          "012267241954", "(226) 724-1954", "+44 7700 900123".
 * Returns null if the result is implausibly short/long.
 */
function normalizePhoneE164(raw: string): string | null {
  if (!raw?.trim()) return null;

  const hasPlus = raw.trimStart().startsWith("+");
  const digits  = raw.replace(/\D/g, "");

  if (!digits) return null;

  if (hasPlus) {
    // Already international — validate length and return
    return digits.length >= 7 && digits.length <= 15 ? `+${digits}` : null;
  }

  // Strip leading zeros (e.g. 012267241954 → 12267241954)
  const stripped = digits.replace(/^0+/, "") || digits;

  if (stripped.length === 10) {
    // 10-digit North American: prepend +1
    return `+1${stripped}`;
  }
  if (stripped.length === 11 && stripped.startsWith("1")) {
    // 11-digit with country code: prepend +
    return `+${stripped}`;
  }
  if (stripped.length >= 7 && stripped.length <= 15) {
    // Other international: prepend +
    return `+${stripped}`;
  }

  return null;
}

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
    if (plan === "sms" && !smsConsent) {
      return NextResponse.json({ error: "SMS consent is required to continue." }, { status: 400 });
    }

    /* ── Normalize phone to E.164 for SMS plan ── */
    let normalizedPhone = "";
    if (plan === "sms") {
      const e164 = normalizePhoneE164(String(phoneNumber ?? ""));
      if (!e164) {
        return NextResponse.json(
          { error: "Invalid mobile number. Please include your country code (e.g. +1 for US/Canada)." },
          { status: 400 },
        );
      }
      normalizedPhone = e164;
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
      plan:         plan           ?? "email",
      firstName:    firstName      ?? "",
      email:        email          ?? "",
      phoneNumber:  normalizedPhone,          // E.164 for SMS plan, "" for email plan
      deliveryTime: deliveryTime   ?? "",
      timezone:     timezone       ?? "",
      prayerFocus:  prayerFocus    ?? "",
      tone:         tone           ?? "",
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
