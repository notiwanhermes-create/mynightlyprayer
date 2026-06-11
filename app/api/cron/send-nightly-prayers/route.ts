import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin }   from "@/lib/supabaseAdmin";
import { generatePrayer }     from "@/lib/generatePrayer";
import { sendPrayerEmail }    from "@/lib/sendPrayerEmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ══════════════════════════════════════════════
   Time helpers
══════════════════════════════════════════════ */

/**
 * Normalize any delivery_time format to "HH:mm" (24-hour).
 * Handles: "22:00", "22:00:00", "22:00:00+00", "10:00+00:00",
 *          "9:30 PM", "10:00 AM", missing/null.
 * Uses parseInt so timezone offsets and seconds are safely ignored.
 */
function normalizeTime(raw: string | null | undefined): string {
  if (!raw) return "22:00";
  const s = raw.trim();

  // 12-hour format: "9:30 PM" / "10:00 AM"
  const match12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  // 24-hour / Postgres time formats: "22:00", "22:00:00", "22:00:00+00", "10:00+00:00"
  // parseInt stops at the first non-numeric character, so "+00" and ":00" suffixes are ignored.
  const parts = s.split(":");
  const h = parseInt(parts[0] ?? "", 10);
  const m = parseInt(parts[1] ?? "0",  10);
  if (!isNaN(h) && !isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  return "22:00";
}

/** Current local time as "HH:mm" for the given IANA timezone */
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

/** Current local date as "YYYY-MM-DD" for the given IANA timezone */
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
 * True if current local time is 0–windowMinutes PAST the delivery time.
 * Window = 15 min — safe for a cron that fires every 10 min.
 */
function inDeliveryWindow(currentHHMM: string, deliveryHHMM: string, windowMin = 15): boolean {
  const toMin = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  let diff = toMin(currentHHMM) - toMin(deliveryHHMM);
  if (diff < -windowMin) diff += 1440; // handle midnight wrap
  return diff >= 0 && diff <= windowMin;
}

/* ══════════════════════════════════════════════
   Auth
══════════════════════════════════════════════ */
function authorized(req: NextRequest): { ok: boolean; source: string } {
  const secret = process.env.CRON_SECRET;

  // Vercel Cron sends Authorization: Bearer <CRON_SECRET> and x-vercel-cron: 1
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";

  if (secret) {
    const header = req.headers.get("authorization") ?? "";
    const token  = header.startsWith("Bearer ") ? header.slice(7) : header;
    if (token === secret) {
      return { ok: true, source: isVercelCron ? "vercel-cron" : "manual-bearer" };
    }
  }

  // If CRON_SECRET is not configured but Vercel marks it as a cron request, allow it
  // (Vercel strips x-vercel-cron from external traffic so this is safe in production)
  if (isVercelCron && !secret) {
    return { ok: true, source: "vercel-cron-no-secret" };
  }

  return { ok: false, source: "rejected" };
}

/* ══════════════════════════════════════════════
   Route handlers
══════════════════════════════════════════════ */
export async function GET(req: NextRequest)  { return run(req); }
export async function POST(req: NextRequest) { return run(req); }

async function run(req: NextRequest) {
  const utcNow = new Date().toISOString();
  console.log(`[cron] ── Route started ── UTC: ${utcNow}`);

  const auth = authorized(req);
  if (!auth.ok) {
    console.warn(
      `[cron] Unauthorized request. ` +
      `x-vercel-cron: ${req.headers.get("x-vercel-cron") ?? "absent"}, ` +
      `CRON_SECRET set: ${!!process.env.CRON_SECRET}`,
    );
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  console.log(`[cron] Auth passed — source: ${auth.source}`);

  const db = getSupabaseAdmin();

  const { data: subscribers, error: fetchErr } = await db
    .from("subscribers")
    .select("*")
    .eq("is_active", true);

  if (fetchErr) {
    console.error("[cron] DB fetch error:", fetchErr.message);
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  const count = subscribers?.length ?? 0;
  console.log(`[cron] Active subscribers fetched: ${count}`);

  const results = { checked: 0, sent: 0, skipped: 0, failed: 0 };

  for (const sub of subscribers ?? []) {
    results.checked++;

    const tz         = sub.timezone     || "America/Toronto";
    const rawTime    = sub.delivery_time ?? "22:00";
    const delivery24 = normalizeTime(rawTime);
    const nowLocal   = localTimeHHMM(tz);
    const todayLocal = localDateYMD(tz);
    const inWindow   = inDeliveryWindow(nowLocal, delivery24);

    console.log(
      `[cron] Checking ${sub.email} | tz: ${tz} | ` +
      `raw_delivery: ${rawTime} | normalized: ${delivery24} | ` +
      `local_now: ${nowLocal} | local_date: ${todayLocal} | ` +
      `in_window: ${inWindow}`,
    );

    if (!inWindow) {
      console.log(`[cron]   → skip (outside delivery window)`);
      results.skipped++;
      continue;
    }

    /* Already sent a real prayer today (test_sent rows do NOT block this) */
    const { data: already, error: alreadyErr } = await db
      .from("sent_prayers")
      .select("id")
      .eq("subscriber_id", sub.id)
      .eq("prayer_date", todayLocal)
      .not("status", "eq", "test_sent")
      .maybeSingle();

    if (alreadyErr) {
      console.error(`[cron]   → DB error checking sent_prayers: ${alreadyErr.message}`);
    }

    if (already) {
      console.log(`[cron]   → skip (already sent on ${todayLocal})`);
      results.skipped++;
      continue;
    }

    /* Generate + send */
    console.log(`[cron]   → generating prayer for ${sub.email}…`);
    try {
      const { subject, prayerText } = await generatePrayer({
        firstName:   sub.first_name   ?? "Friend",
        prayerFocus: sub.prayer_focus ?? "peace",
        tone:        sub.tone         ?? "gentle",
      });
      console.log(`[cron]   → prayer generated, subject: "${subject}"`);

      const { emailId } = await sendPrayerEmail({
        to:              sub.email,
        firstName:       sub.first_name ?? "Friend",
        subject,
        prayerText,
        managementToken: sub.management_token ?? "",
      });
      console.log(`[cron]   → email sent, resend_id: ${emailId}`);

      const { error: insertErr } = await db.from("sent_prayers").insert({
        subscriber_id:   sub.id,
        email:           sub.email,
        prayer_date:     todayLocal,
        delivery_time:   rawTime,
        timezone:        tz,
        subject,
        prayer_text:     prayerText,
        resend_email_id: emailId,
        status:          "sent",
      });

      if (insertErr) {
        console.error(`[cron]   → DB insert error: ${insertErr.message}`);
      } else {
        console.log(`[cron]   → sent_prayers row inserted (status: sent)`);
      }

      results.sent++;

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[cron]   → FAILED for ${sub.email}: ${msg}`);

      try {
        await db.from("sent_prayers").insert({
          subscriber_id: sub.id,
          email:         sub.email,
          prayer_date:   todayLocal,
          delivery_time: rawTime,
          timezone:      tz,
          status:        "failed",
          error_message: msg,
        });
      } catch { /* best-effort */ }

      results.failed++;
    }
  }

  console.log(
    `[cron] ── Done ── checked: ${results.checked} | sent: ${results.sent} | ` +
    `skipped: ${results.skipped} | failed: ${results.failed}`,
  );

  return NextResponse.json({ ...results, utc: utcNow });
}
