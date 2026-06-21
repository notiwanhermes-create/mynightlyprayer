import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { generateSmsPrayer } from "@/lib/generatePrayer";
import { sendSmsPrayer }    from "@/lib/sendSmsPrayer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  const token  = header.startsWith("Bearer ") ? header.slice(7) : header;
  return token === secret;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const email = new URL(req.url).searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "?email= is required." }, { status: 400 });
  }

  const db = getSupabaseAdmin();

  const { data: sub, error: fetchErr } = await db
    .from("subscribers")
    .select("id, first_name, email, phone_number, sms_enabled, sms_consent_at, sms_unsubscribed_at, prayer_focus, tone")
    .eq("email", email)
    .maybeSingle();

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if (!sub)     return NextResponse.json({ error: `No subscriber found for ${email}.` }, { status: 404 });

  if (!sub.phone_number) {
    return NextResponse.json({ error: "Subscriber has no phone_number on record." }, { status: 400 });
  }
  if (!sub.sms_consent_at) {
    return NextResponse.json({ error: "Subscriber has not given SMS consent (sms_consent_at is null)." }, { status: 400 });
  }

  try {
    const { prayerText } = await generateSmsPrayer({
      firstName:   sub.first_name   ?? "Friend",
      prayerFocus: sub.prayer_focus ?? "peace",
      tone:        sub.tone         ?? "gentle",
    });

    const { messageSid, smsText } = await sendSmsPrayer({
      to:         sub.phone_number,
      firstName:  sub.first_name ?? "Friend",
      prayerText,
    });

    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto" }).format(new Date());

    await db.from("sent_sms").insert({
      subscriber_id:      sub.id,
      phone_number:       sub.phone_number,
      sms_date:           today,
      sms_text:           smsText,
      twilio_message_sid: messageSid,
      status:             "test_sent",
    });

    return NextResponse.json({
      ok:         true,
      to:         sub.phone_number,
      messageSid,
      smsText,
      chars:      smsText.length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[test/send-sms-prayer]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
