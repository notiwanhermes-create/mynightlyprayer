/**
 * sendPrayerEmail.ts
 * Server-only — sends the nightly prayer HTML email via Resend.
 */

import { Resend } from "resend";

/* ── Types ── */
export interface SendPrayerEmailInput {
  to:         string;
  firstName:  string;
  subject:    string;
  prayerText: string;
}

export interface SendPrayerEmailResult {
  emailId: string;
}

/* ── HTML template ── */
function buildHtml(firstName: string, prayerText: string): string {
  // Escape prayer text for HTML and preserve line breaks
  const escapedPrayer = prayerText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Your Nightly Prayer</title>
</head>
<body style="margin:0;padding:0;background:#091525;font-family:Georgia,serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#091525;min-height:100vh;">
  <tr>
    <td align="center" style="padding:48px 20px 60px;">
      <table width="100%" style="max-width:540px;" cellpadding="0" cellspacing="0">

        <!-- Wordmark -->
        <tr>
          <td align="center" style="padding-bottom:36px;">
            <p style="margin:0;font-size:10px;font-family:'Helvetica Neue',Arial,sans-serif;letter-spacing:0.22em;text-transform:uppercase;color:#c9a96e;">
              ✦ &nbsp; N I G H T L Y &nbsp; P R A Y E R
            </p>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background:linear-gradient(160deg,#0d1b2a 0%,#080f1e 100%);border:1px solid rgba(201,169,110,0.22);border-radius:16px;padding:0;overflow:hidden;">

            <!-- Card top accent line -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="height:1px;background:linear-gradient(to right,transparent,rgba(201,169,110,0.55),transparent);"></td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:44px 44px 40px;">

                  <!-- Label -->
                  <p style="margin:0 0 6px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:400;letter-spacing:0.18em;text-transform:uppercase;color:#c9a96e;">
                    Tonight's Prayer
                  </p>

                  <!-- Greeting -->
                  <h1 style="margin:0 0 30px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;font-style:italic;color:#f0e8d8;line-height:1.3;">
                    For you, ${firstName}.
                  </h1>

                  <!-- Divider -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                    <tr>
                      <td style="height:1px;background:linear-gradient(to right,transparent,rgba(201,169,110,0.25),transparent);"></td>
                    </tr>
                  </table>

                  <!-- Prayer -->
                  <p style="margin:0 0 32px;font-family:Georgia,'Times New Roman',serif;font-size:16px;font-style:italic;font-weight:400;color:rgba(240,232,216,0.87);line-height:1.95;">
                    ${escapedPrayer}
                  </p>

                  <!-- Divider -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                    <tr>
                      <td style="height:1px;background:linear-gradient(to right,transparent,rgba(201,169,110,0.25),transparent);"></td>
                    </tr>
                  </table>

                  <!-- Sign-off -->
                  <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(201,169,110,0.55);text-align:center;">
                    Peace &nbsp;·&nbsp; Protection &nbsp;·&nbsp; Hope &nbsp; ✦
                  </p>

                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding-top:36px;">
            <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:rgba(240,232,216,0.22);line-height:1.7;text-align:center;">
              You are receiving this because you subscribed to Nightly Prayer.<br/>
              <a href="#" style="color:rgba(201,169,110,0.35);text-decoration:none;">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/* ── Plain text fallback ── */
function buildText(firstName: string, prayerText: string): string {
  return [
    "✦ NIGHTLY PRAYER",
    "",
    `For you, ${firstName}.`,
    "",
    "─────────────────────",
    "",
    prayerText,
    "",
    "─────────────────────",
    "Peace · Protection · Hope",
    "",
    "You are receiving this because you subscribed to Nightly Prayer.",
  ].join("\n");
}

/* ── Main function ── */
export async function sendPrayerEmail(input: SendPrayerEmailInput): Promise<SendPrayerEmailResult> {
  const { to, firstName, subject, prayerText } = input;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("[sendPrayerEmail] Missing env var: RESEND_API_KEY");

  const from = process.env.FROM_EMAIL ?? "Nightly Prayer <onboarding@resend.dev>";
  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html: buildHtml(firstName, prayerText),
    text: buildText(firstName, prayerText),
  });

  if (error || !data?.id) {
    throw new Error(`[sendPrayerEmail] Resend error: ${error?.message ?? "No email ID returned"}`);
  }

  return { emailId: data.id };
}
