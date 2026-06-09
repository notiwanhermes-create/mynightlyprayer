import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { token?: string; action?: string };
    const { token, action } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }
    if (action !== "pause" && action !== "resume") {
      return NextResponse.json({ error: "Action must be 'pause' or 'resume'." }, { status: 400 });
    }

    const db = getSupabaseAdmin();

    /* Verify token */
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

    const isPausing = action === "pause";

    const { error: updateErr } = await db
      .from("subscribers")
      .update({
        is_active:       !isPausing,
        unsubscribed_at: isPausing ? new Date().toISOString() : null,
        updated_at:      new Date().toISOString(),
      })
      .eq("id", subscriber.id);

    if (updateErr) {
      console.error("[pause-emails] DB error:", updateErr.message);
      return NextResponse.json({ error: "Failed to update subscription." }, { status: 500 });
    }

    console.log(`[pause-emails] ${action} for subscriber ${subscriber.id}`);
    return NextResponse.json({ success: true, active: !isPausing });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    console.error("[pause-emails] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
