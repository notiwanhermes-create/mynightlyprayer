import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin }   from "@/lib/supabaseAdmin";
import { generatePrayer }     from "@/lib/generatePrayer";
import { sendPrayerEmail }    from "@/lib/sendPrayerEmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ══════════════════════════════════════════════
   Time helpers (no external libraries needed)
══════════════════════════════════════════════ */

/**
 * Parse "9:30 PM" or "21:30" → "21:30" (24-hour HH:mm)
 */
function normalizeTime(raw: string): string {
  if (!raw) return "22:00";
  const s = raw.trim();

  // Already 24h: "21:30" or "9:30"
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    const [h, m] = s.split(":").map(Number);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  // 12h: "9:30 PM" / "10:00 AM"
  const match = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  return "22:00"; // safe fallback
}

/** Get current local time as "HH:mm" for the given IANA timezone */
function localTimeHHMM(tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/Toronto", hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date());
  }
}

/** Get current local date as "YYYY-MM-DD" for the given IANA timezone */
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

/**
 * True if the current local time is 0–windowMinutes PAST the delivery time.
 * Window default = 15 min → safe for a cron that fires every 10–15 min.
 */
function inDeliveryWindow(currentHHMM: string, deliveryHHMM: string, windowMin = 15): boolean {
  const toMin = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  let diff = toMin(currentHHMM) - toMin(deliveryHHMM);
  // Handle midnight wrap (delivery 23:55, current 00:05)
  if (diff < -windowMin) diff += 1440;
  return diff >= 0 && diff <= windowMin;
}

/* ══════════════════════════════════════════════
   Auth helper
══════════════════════════════════════════════ */
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  const token  = header.startsWith("Bearer ") ? header.slice(7) : header;
  return token === secret;
}

/* ══════════════════════════════════════════════
   Route handlers
══════════════════════════════════════════════ */
export async function GET(req: NextRequest)  { return run(req); }
export async function POST(req: NextRequest) { return run(req); }

async function run(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    console.error("[cron] CRON_SECRET env var is not set");
    return NextResponse.json({ error: "Server misconfigured." }, { status: 500 });
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const db = getSupabaseAdmin();

  /* ── Fetch active subscribers ── */
  const { data: subscribers, error: fetchErr } = await db
    .from("subscribers")
    .select("*")
    .eq("is_active", true);

  if (fetchErr) {
    console.error("[cron] DB fetch error:", fetchErr.message);
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  const results = { checked: 0, sent: 0, skipped: 0, failed: 0 };

  for (const sub of subscribers ?? []) {
    results.checked++;

    const tz          = sub.timezone    || "America/Toronto";
    const nowLocal    = localTimeHHMM(tz);
    const todayLocal  = localDateYMD(tz);
    const delivery24  = normalizeTime(sub.delivery_time ?? "22:00");

    /* Not in delivery window yet */
    if (!inDeliveryWindow(nowLocal, delivery24)) {
      results.skipped++;
      continue;
    }

    /* Already sent a real prayer today */
    const { data: already } = await db
      .from("sent_prayers")
      .select("id")
      .eq("subscriber_id", sub.id)
      .eq("prayer_date", todayLocal)
      .not("status", "eq", "test_sent")
      .maybeSingle();

    if (already) {
      console.log(`[cron] Already sent to ${sub.email} on ${todayLocal} — skip`);
      results.skipped++;
      continue;
    }

    /* Generate + send */
    try {
      const { subject, prayerText } = await generatePrayer({
        firstName:   sub.first_name   ?? "Friend",
        prayerFocus: sub.prayer_focus ?? "peace",
        tone:        sub.tone         ?? "gentle",
      });

      const { emailId } = await sendPrayerEmail({
        to:         sub.email,
        firstName:  sub.first_name ?? "Friend",
        subject,
        prayerText,
      });

      await db.from("sent_prayers").insert({
        subscriber_id:   sub.id,
        email:           sub.email,
        prayer_date:     todayLocal,
        delivery_time:   sub.delivery_time,
        timezone:        tz,
        subject,
        prayer_text:     prayerText,
        resend_email_id: emailId,
        status:          "sent",
      });

      console.log(`[cron] Sent → ${sub.email}`);
      results.sent++;

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[cron] Failed for ${sub.email}:`, msg);

      /* Save the failure so we can debug */
      try {
        await db.from("sent_prayers").insert({
          subscriber_id: sub.id,
          email:         sub.email,
          prayer_date:   todayLocal,
          delivery_time: sub.delivery_time,
          timezone:      tz,
          status:        "failed",
          error_message: msg,
        });
      } catch { /* best-effort */ }

      results.failed++;
    }
  }

  console.log(
    `[cron] Done — checked:${results.checked} sent:${results.sent} ` +
    `skipped:${results.skipped} failed:${results.failed}`,
  );

  return NextResponse.json(results);
}
