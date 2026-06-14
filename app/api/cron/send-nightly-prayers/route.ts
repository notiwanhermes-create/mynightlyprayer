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
 */
function normalizeTime(raw: string | null | undefined): string {
  if (!raw) return "22:00";
  const s = raw.trim();

  const match12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

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

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/**
 * Minutes elapsed since delivery_time (positive = past, negative = future).
 * Wraps around midnight so e.g. 23:50 delivery / 00:05 current = +15.
 */
function minutesSinceDelivery(currentHHMM: string, deliveryHHMM: string): number {
  let diff = toMin(currentHHMM) - toMin(deliveryHHMM);
  // If more than 12 hours in the past, it's actually a future delivery (midnight wrap)
  if (diff < -720) diff += 1440;
  return diff;
}

/**
 * True if current local time is 0–10 minutes PAST the delivery time.
 * Window = 10 min (cron fires every 10 min, so at most one fire per window).
 */
function inDeliveryWindow(currentHHMM: string, deliveryHHMM: string): boolean {
  const diff = minutesSinceDelivery(currentHHMM, deliveryHHMM);
  return diff >= 0 && diff <= 10;
}

/* ══════════════════════════════════════════════
   Auth
══════════════════════════════════════════════ */
function authorized(req: NextRequest): { ok: boolean; source: string } {
  const secret = process.env.CRON_SECRET;
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";

  if (secret) {
    const header = req.headers.get("authorization") ?? "";
    const token  = header.startsWith("Bearer ") ? header.slice(7) : header;
    if (token === secret) {
      return { ok: true, source: isVercelCron ? "vercel-cron" : "manual-bearer" };
    }
  }

  if (isVercelCron && !secret) {
    return { ok: true, source: "vercel-cron-no-secret" };
  }

  return { ok: false, source: "rejected" };
}

/* ══════════════════════════════════════════════
   Debug entry shape
══════════════════════════════════════════════ */
interface DebugEntry {
  email: string;
  is_active: boolean;
  subscription_status: string | null;
  delivery_time_raw: string;
  delivery_time_normalized: string;
  timezone: string;
  current_local_time: string;
  minutes_since_delivery: number;
  in_window: boolean;
  already_sent_today: boolean;
  action: "sent" | "skipped" | "failed";
  skipped_reason?: string;
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
      `[cron] Unauthorized. x-vercel-cron: ${req.headers.get("x-vercel-cron") ?? "absent"}, ` +
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
  const debug: DebugEntry[] = [];

  for (const sub of subscribers ?? []) {
    results.checked++;

    const tz           = sub.timezone     || "America/Toronto";
    const rawTime      = sub.delivery_time ?? "22:00";
    const delivery24   = normalizeTime(rawTime);
    const nowLocal     = localTimeHHMM(tz);
    const todayLocal   = localDateYMD(tz);
    const minDiff      = minutesSinceDelivery(nowLocal, delivery24);
    const inWindow     = inDeliveryWindow(nowLocal, delivery24);

    const entry: DebugEntry = {
      email:                    sub.email,
      is_active:                sub.is_active,
      subscription_status:      sub.subscription_status ?? null,
      delivery_time_raw:        rawTime,
      delivery_time_normalized: delivery24,
      timezone:                 tz,
      current_local_time:       nowLocal,
      minutes_since_delivery:   minDiff,
      in_window:                inWindow,
      already_sent_today:       false,
      action:                   "skipped",
    };

    console.log(
      `[cron] ${sub.email} | tz: ${tz} | delivery: ${delivery24} | ` +
      `now: ${nowLocal} | diff: ${minDiff}min | in_window: ${inWindow}`,
    );

    if (!inWindow) {
      entry.skipped_reason = "outside_send_window";
      console.log(`[cron]   → skip (${minDiff < 0 ? "not yet" : "window passed"}, diff=${minDiff}min)`);
      results.skipped++;
      debug.push(entry);
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
      entry.already_sent_today = true;
      entry.skipped_reason     = "already_sent_today";
      console.log(`[cron]   → skip (already sent on ${todayLocal})`);
      results.skipped++;
      debug.push(entry);
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

      entry.action = "sent";
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

      entry.action         = "failed";
      entry.skipped_reason = msg;
      results.failed++;
    }

    debug.push(entry);
  }

  console.log(
    `[cron] ── Done ── checked: ${results.checked} | sent: ${results.sent} | ` +
    `skipped: ${results.skipped} | failed: ${results.failed}`,
  );

  return NextResponse.json({ ...results, utc: utcNow, debug });
}
