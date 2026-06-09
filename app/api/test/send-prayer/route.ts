import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin }  from "@/lib/supabaseAdmin";
import { generatePrayer }    from "@/lib/generatePrayer";
import { sendPrayerEmail }   from "@/lib/sendPrayerEmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function localDateYMD(tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());
  }
}

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  const token  = header.startsWith("Bearer ") ? header.slice(7) : header;
  return token === secret;
}

export async function GET(req: NextRequest)  { return run(req); }
export async function POST(req: NextRequest) { return run(req); }

async function run(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET not set." }, { status: 500 });
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  /* ── Resolve email / subscriberId ── */
  const url          = new URL(req.url);
  let email          = url.searchParams.get("email");
  let subscriberId   = url.searchParams.get("subscriberId");

  if (!email && !subscriberId && req.method === "POST") {
    try {
      const body = await req.json() as { email?: string; subscriberId?: string };
      email        = body.email        ?? null;
      subscriberId = body.subscriberId ?? null;
    } catch { /* no body */ }
  }

  if (!email && !subscriberId) {
    return NextResponse.json(
      { error: 'Provide ?email=you@example.com or ?subscriberId=uuid as a query param.' },
      { status: 400 },
    );
  }

  /* ── Find subscriber ── */
  const db = getSupabaseAdmin();

  const { data: rows, error: fetchErr } = email
    ? await db.from("subscribers").select("*").eq("email", email).limit(1)
    : await db.from("subscribers").select("*").eq("id", subscriberId!).limit(1);

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }
  if (!rows?.length) {
    return NextResponse.json({ error: "Subscriber not found." }, { status: 404 });
  }

  const sub = rows[0];
  const tz  = sub.timezone ?? "America/Toronto";
  const today = localDateYMD(tz);

  /* ── Generate + send ── */
  try {
    const { subject, prayerText } = await generatePrayer({
      firstName:   sub.first_name   ?? "Friend",
      prayerFocus: sub.prayer_focus ?? "peace",
      tone:        sub.tone         ?? "gentle",
    });

    const testSubject = `[TEST] ${subject}`;

    const { emailId } = await sendPrayerEmail({
      to:              sub.email,
      firstName:       sub.first_name ?? "Friend",
      subject:         testSubject,
      prayerText,
      managementToken: sub.management_token ?? "",
    });

    /* Save as test_sent — does not block real sends today */
    await db.from("sent_prayers").insert({
      subscriber_id:   sub.id,
      email:           sub.email,
      prayer_date:     today,
      delivery_time:   sub.delivery_time,
      timezone:        tz,
      subject:         testSubject,
      prayer_text:     prayerText,
      resend_email_id: emailId,
      status:          "test_sent",
    });

    console.log(`[test] Prayer sent → ${sub.email}`);

    return NextResponse.json({
      success:    true,
      email:      sub.email,
      subject:    testSubject,
      prayerText,
      emailId,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[test] Failed for ${sub.email}:`, msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
