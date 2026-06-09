import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Allowed fields — never let token update billing/admin data */
const ALLOWED_FIELDS = ["first_name", "delivery_time", "timezone", "prayer_focus", "tone", "prayer_request"] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, string>;
    const { token, firstName, deliveryTime, timezone, prayerFocus, tone, prayerRequest } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }

    /* Basic validation */
    if (!firstName?.trim()) {
      return NextResponse.json({ error: "First name is required." }, { status: 400 });
    }

    const db = getSupabaseAdmin();

    /* Verify token and find subscriber */
    const { data: subscriber, error: fetchErr } = await db
      .from("subscribers")
      .select("id")
      .eq("management_token", token)
      .maybeSingle();

    if (fetchErr) {
      return NextResponse.json({ error: "Database error." }, { status: 500 });
    }
    if (!subscriber) {
      return NextResponse.json({ error: "Invalid or expired link." }, { status: 404 });
    }

    /* Only update safe fields */
    const updates: Partial<Record<typeof ALLOWED_FIELDS[number], string>> & { updated_at: string } = {
      first_name:     firstName.trim(),
      delivery_time:  deliveryTime  ?? "",
      timezone:       timezone      ?? "",
      prayer_focus:   prayerFocus   ?? "",
      tone:           tone          ?? "",
      prayer_request: prayerRequest ?? "",
      updated_at:     new Date().toISOString(),
    };

    const { error: updateErr } = await db
      .from("subscribers")
      .update(updates)
      .eq("id", subscriber.id);

    if (updateErr) {
      console.error("[update-settings] DB error:", updateErr.message);
      return NextResponse.json({ error: "Failed to save settings." }, { status: 500 });
    }

    console.log(`[update-settings] Settings updated for subscriber ${subscriber.id}`);
    return NextResponse.json({ success: true });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    console.error("[update-settings] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
