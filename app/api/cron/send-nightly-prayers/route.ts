import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin }   from "@/lib/supabaseAdmin";
import { generatePrayer, generateSmsPrayer } from "@/lib/generatePrayer";
import { sendPrayerEmail }    from "@/lib/sendPrayerEmail";
import { sendSmsPrayer }      from "@/lib/sendSmsPrayer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ══════════════════════════════════════════════
   Time helpers
══════════════════════════════════════════════ */

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

function minutesSinceDelivery(currentHHMM: string, deliveryHHMM: string): number {
  let diff = toMin(currentHHMM) - toMin(deliveryHHMM);
  if (diff < -720) diff += 1440;
  return diff;
}

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
   SMS eligibility guard
══════════════════════════════════════════════ */
function smsEligible(sub: Record<string, unknown>): { eligible: boolean; reason?: string } {
  if (process.env.SMS_FEATURE_ENABLED !== "true") return { eligible: false, reason: "feature_disabled" };
  if (!sub.sms_enabled)        return { eligible: false, reason: "sms_not_enabled" };
  if (!sub.phone_number)       return { eligible: false, reason: "no_phone_number" };
  if (!sub.sms_consent_at)     return { eligible: false, reason: "no_consent" };
  if (sub.sms_unsubscribed_at) return { eligible: false, reason: "unsubscribed" };
  return { eligible: true };
}

/* ══════════════════════════════════════════════
   Debug entry shape
══════════════════════════════════════════════ */
interface DebugEntry {
  email:                      string;
  is_active:                  boolean;
  subscription_status:        string | null;
  delivery_time_raw:          string;
  delivery_time_normalized:   string;
  timezone:                   string;
  current_local_time:         string;
  minutes_since_delivery:     number;
  in_window:                  boolean;
  preferred_delivery_channel: string;
  email_already_sent_today:   boolean;
  email_action:               "sent" | "skipped" | "failed" | "n/a";
  email_skipped_reason?:      string;
  sms_eligible:               boolean;
  sms_ineligible_reason?:     string;
  sms_already_sent_today:     boolean;
  sms_action:                 "sent" | "skipped" | "failed" | "n/a";
  sms_skipped_reason?:        string;
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

  const smsFeatEnabled = process.env.SMS_FEATURE_ENABLED === "true";

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

  const results = {
    checked:       0,
    email_sent:    0,
    email_skipped: 0,
    email_failed:  0,
    sms_sent:      0,
    sms_skipped:   0,
    sms_failed:    0,
  };
  const debug: DebugEntry[] = [];

  for (const sub of subscribers ?? []) {
    results.checked++;

    const tz         = sub.timezone     || "America/Toronto";
    const rawTime    = sub.delivery_time ?? "22:00";
    const delivery24 = normalizeTime(rawTime);
    const nowLocal   = localTimeHHMM(tz);
    const todayLocal = localDateYMD(tz);
    const minDiff    = minutesSinceDelivery(nowLocal, delivery24);
    const inWindow   = inDeliveryWindow(nowLocal, delivery24);
    const channel    = (sub.preferred_delivery_channel as string) || "email";

    const { eligible: canSms, reason: smsIneligibleReason } = smsEligible(sub as Record<string, unknown>);

    const entry: DebugEntry = {
      email:                      sub.email,
      is_active:                  sub.is_active,
      subscription_status:        sub.subscription_status ?? null,
      delivery_time_raw:          rawTime,
      delivery_time_normalized:   delivery24,
      timezone:                   tz,
      current_local_time:         nowLocal,
      minutes_since_delivery:     minDiff,
      in_window:                  inWindow,
      preferred_delivery_channel: channel,
      email_already_sent_today:   false,
      email_action:               "n/a",
      sms_eligible:               canSms,
      sms_ineligible_reason:      smsIneligibleReason,
      sms_already_sent_today:     false,
      sms_action:                 "n/a",
    };

    console.log(
      `[cron] ${sub.email} | tz: ${tz} | delivery: ${delivery24} | ` +
      `now: ${nowLocal} | diff: ${minDiff}min | in_window: ${inWindow} | channel: ${channel}`,
    );

    if (!inWindow) {
      entry.email_action         = "skipped";
      entry.email_skipped_reason = "outside_send_window";
      entry.sms_action           = "skipped";
      entry.sms_skipped_reason   = "outside_send_window";
      console.log(`[cron]   → skip (${minDiff < 0 ? "not yet" : "window passed"}, diff=${minDiff}min)`);
      results.email_skipped++;
      if (canSms) results.sms_skipped++;
      debug.push(entry);
      continue;
    }

    const wantsEmail = channel === "email" || channel === "both";
    const wantsSms   = (channel === "sms" || channel === "both") && canSms;

    /* ── Email delivery ── */
    let prayerText: string | null = null;
    let subject: string | null    = null;

    if (wantsEmail) {
      const { data: alreadySentEmail, error: alreadyEmailErr } = await db
        .from("sent_prayers")
        .select("id")
        .eq("subscriber_id", sub.id)
        .eq("prayer_date", todayLocal)
        .not("status", "eq", "test_sent")
        .maybeSingle();

      if (alreadyEmailErr) console.error(`[cron]   → DB error checking sent_prayers: ${alreadyEmailErr.message}`);

      if (alreadySentEmail) {
        entry.email_already_sent_today = true;
        entry.email_action             = "skipped";
        entry.email_skipped_reason     = "already_sent_today";
        console.log(`[cron]   → email: skip (already sent on ${todayLocal})`);
        results.email_skipped++;
      } else {
        console.log(`[cron]   → generating prayer for email…`);
        try {
          const generated = await generatePrayer({
            firstName:   sub.first_name   ?? "Friend",
            prayerFocus: sub.prayer_focus ?? "peace",
            tone:        sub.tone         ?? "gentle",
          });
          prayerText = generated.prayerText;
          subject    = generated.subject;
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
          if (insertErr) console.error(`[cron]   → sent_prayers insert error: ${insertErr.message}`);

          entry.email_action = "sent";
          results.email_sent++;

        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[cron]   → email FAILED for ${sub.email}: ${msg}`);
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
          entry.email_action         = "failed";
          entry.email_skipped_reason = msg;
          results.email_failed++;
        }
      }
    } else {
      entry.email_action         = "skipped";
      entry.email_skipped_reason = "channel_is_sms_only";
      results.email_skipped++;
    }

    /* ── SMS delivery ── */
    if (wantsSms) {
      const { data: alreadySentSms, error: alreadySmsErr } = await db
        .from("sent_sms")
        .select("id")
        .eq("subscriber_id", sub.id)
        .eq("sms_date", todayLocal)
        .not("status", "eq", "test_sent")
        .maybeSingle();

      if (alreadySmsErr) console.error(`[cron]   → DB error checking sent_sms: ${alreadySmsErr.message}`);

      if (alreadySentSms) {
        entry.sms_already_sent_today = true;
        entry.sms_action             = "skipped";
        entry.sms_skipped_reason     = "already_sent_today";
        console.log(`[cron]   → sms: skip (already sent on ${todayLocal})`);
        results.sms_skipped++;
      } else {
        // Always generate a dedicated short prayer for SMS
        let smsPrayerText: string;
        try {
          const generated = await generateSmsPrayer({
            firstName:   sub.first_name   ?? "Friend",
            prayerFocus: sub.prayer_focus ?? "peace",
            tone:        sub.tone         ?? "gentle",
          });
          smsPrayerText = generated.prayerText;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[cron]   → SMS prayer generation failed for ${sub.email}: ${msg}`);
          entry.sms_action         = "failed";
          entry.sms_skipped_reason = msg;
          results.sms_failed++;
          debug.push(entry);
          continue;
        }

        console.log(`[cron]   → sending SMS to ${sub.phone_number}…`);
        try {
          const { messageSid, smsText } = await sendSmsPrayer({
            to:         sub.phone_number,
            firstName:  sub.first_name ?? "Friend",
            prayerText: smsPrayerText,
          });
          console.log(`[cron]   → SMS sent, SID: ${messageSid}`);

          const { error: smsInsertErr } = await db.from("sent_sms").insert({
            subscriber_id:      sub.id,
            phone_number:       sub.phone_number,
            sms_date:           todayLocal,
            delivery_time:      rawTime,
            timezone:           tz,
            sms_text:           smsText,
            twilio_message_sid: messageSid,
            status:             "sent",
          });
          if (smsInsertErr) console.error(`[cron]   → sent_sms insert error: ${smsInsertErr.message}`);

          entry.sms_action = "sent";
          results.sms_sent++;

        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[cron]   → SMS FAILED for ${sub.email}: ${msg}`);
          try {
            await db.from("sent_sms").insert({
              subscriber_id: sub.id,
              phone_number:  sub.phone_number,
              sms_date:      todayLocal,
              delivery_time: rawTime,
              timezone:      tz,
              status:        "failed",
              error_message: msg,
            });
          } catch { /* best-effort */ }
          entry.sms_action         = "failed";
          entry.sms_skipped_reason = msg;
          results.sms_failed++;
        }
      }
    } else if (channel === "sms" || channel === "both") {
      entry.sms_action         = "skipped";
      entry.sms_skipped_reason = smsIneligibleReason ?? "not_eligible";
      results.sms_skipped++;
    }

    debug.push(entry);
  }

  console.log(
    `[cron] ── Done ── checked: ${results.checked} | ` +
    `email: sent=${results.email_sent} skipped=${results.email_skipped} failed=${results.email_failed} | ` +
    `sms: sent=${results.sms_sent} skipped=${results.sms_skipped} failed=${results.sms_failed}`,
  );

  return NextResponse.json({ ...results, utc: utcNow, sms_feature_enabled: smsFeatEnabled, debug });
}
