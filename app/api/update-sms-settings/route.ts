import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DeliveryChannel = "email" | "sms" | "both";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      token:                    string;
      phoneNumber?:             string;
      smsEnabled?:              boolean;
      preferredDeliveryChannel?: DeliveryChannel;
    };

    const { token, phoneNumber, smsEnabled, preferredDeliveryChannel } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }

    const db = getSupabaseAdmin();

    const { data: subscriber, error: fetchErr } = await db
      .from("subscribers")
      .select("id, sms_consent_at, sms_enabled")
      .eq("management_token", token)
      .maybeSingle();

    if (fetchErr) return NextResponse.json({ error: "Database error." }, { status: 500 });
    if (!subscriber) return NextResponse.json({ error: "Invalid or expired link." }, { status: 404 });

    const now = new Date().toISOString();

    // Build update object — only include fields explicitly provided
    const updates: Record<string, unknown> = { updated_at: now };

    if (phoneNumber !== undefined) {
      updates.phone_number = phoneNumber?.trim() || null;
    }

    if (smsEnabled === true) {
      updates.sms_enabled            = true;
      updates.sms_unsubscribed_at    = null;
      // Set consent timestamp if not already set
      if (!subscriber.sms_consent_at) {
        updates.sms_consent_at       = now;
        updates.sms_opt_in_source    = "manage";
      }
    } else if (smsEnabled === false) {
      updates.sms_enabled         = false;
      updates.sms_unsubscribed_at = now;
    }

    if (preferredDeliveryChannel !== undefined) {
      updates.preferred_delivery_channel = preferredDeliveryChannel;
    }

    const { error: updateErr } = await db
      .from("subscribers")
      .update(updates)
      .eq("id", subscriber.id);

    if (updateErr) {
      console.error("[update-sms-settings] DB error:", updateErr.message);
      return NextResponse.json({ error: "Failed to save SMS settings." }, { status: 500 });
    }

    console.log(`[update-sms-settings] Updated subscriber ${subscriber.id}`);
    return NextResponse.json({ success: true });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    console.error("[update-sms-settings] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
