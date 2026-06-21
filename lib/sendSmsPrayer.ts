/**
 * sendSmsPrayer.ts
 * Server-only — sends a nightly prayer via Twilio SMS.
 * Never import this from client components.
 */

import twilio from "twilio";

export interface SendSmsPrayerInput {
  to:          string;
  firstName:   string;
  prayerText:  string;
}

export interface SendSmsPrayerResult {
  messageSid: string;
  smsText:    string;
}

/** Shorten the prayer to fit a ~300-char SMS including our header/footer. */
function buildSmsText(firstName: string, prayerText: string): string {
  const header = `Tonight's prayer for ${firstName}: `;
  const footer = `\n— My Nightly Prayer\nReply STOP to opt out.`;
  const maxPrayer = 280 - header.length - footer.length;

  let prayer = prayerText.trim();

  if (prayer.length > maxPrayer) {
    const slice = prayer.slice(0, maxPrayer);
    // Prefer cutting at a sentence boundary
    const lastPeriod = Math.max(
      slice.lastIndexOf(". "),
      slice.lastIndexOf(".\n"),
      slice.lastIndexOf("! "),
      slice.lastIndexOf("? "),
    );
    if (lastPeriod > 30) {
      prayer = slice.slice(0, lastPeriod + 1);
    } else {
      const lastSpace = slice.lastIndexOf(" ");
      prayer = slice.slice(0, lastSpace > 0 ? lastSpace : maxPrayer) + "…";
    }
  }

  return `${header}${prayer}${footer}`;
}

export async function sendSmsPrayer(input: SendSmsPrayerInput): Promise<SendSmsPrayerResult> {
  const { to, firstName, prayerText } = input;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error(
      "[sendSmsPrayer] Missing Twilio env vars. Required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER",
    );
  }

  const smsText = buildSmsText(firstName, prayerText);
  const client  = twilio(accountSid, authToken);

  const message = await client.messages.create({
    body: smsText,
    from: fromNumber,
    to,
  });

  console.log(`[sendSmsPrayer] Sent to ${to} — SID: ${message.sid}`);
  return { messageSid: message.sid, smsText };
}
