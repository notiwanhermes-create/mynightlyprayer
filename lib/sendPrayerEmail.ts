/**
 * sendPrayerEmail.ts
 * Server-only — sends the nightly prayer HTML email via Resend.
 */

import { Resend } from "resend";

export interface SendPrayerEmailInput {
  to:              string;
  firstName:       string;
  subject:         string;
  prayerText:      string;
  managementToken: string;
}

export interface SendPrayerEmailResult {
  emailId: string;
}

function buildHtml(firstName: string, prayerText: string, manageUrl: string, portalUrl: string): string {
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
<body style="margin:0;padding:0;background:#F7F1E8;font-family:Georgia,serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F1E8;">
  <tr>
    <td align="center" style="padding:48px 20px 60px;">
      <table width="100%" style="max-width:540px;" cellpadding="0" cellspacing="0">

        <!-- Wordmark -->
        <tr>
          <td align="center" style="padding-bottom:36px;">
            <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#C6A15B;">
              ✦ &nbsp; N I G H T L Y &nbsp; P R A Y E R
            </p>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background:#102A43;border:1px solid rgba(198,161,91,0.28);border-radius:16px;overflow:hidden;box-shadow:0 16px 48px rgba(16,42,67,0.18);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="height:1px;background:linear-gradient(to right,transparent,rgba(198,161,91,0.55),transparent);"></td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:44px 44px 40px;">
                  <p style="margin:0 0 6px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:400;letter-spacing:0.18em;text-transform:uppercase;color:#C6A15B;">Tonight's Prayer</p>
                  <h1 style="margin:0 0 30px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;font-style:italic;color:#F7F1E8;line-height:1.3;">For you, ${firstName}.</h1>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                    <tr><td style="height:1px;background:linear-gradient(to right,transparent,rgba(198,161,91,0.28),transparent);"></td></tr>
                  </table>
                  <p style="margin:0 0 32px;font-family:Georgia,'Times New Roman',serif;font-size:16px;font-style:italic;font-weight:400;color:rgba(247,241,232,0.88);line-height:1.95;">${escapedPrayer}</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                    <tr><td style="height:1px;background:linear-gradient(to right,transparent,rgba(198,161,91,0.28),transparent);"></td></tr>
                  </table>
                  <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(198,161,91,0.6);text-align:center;">Peace &nbsp;·&nbsp; Protection &nbsp;·&nbsp; Hope &nbsp; ✦</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Management links -->
        <tr>
          <td align="center" style="padding-top:28px;padding-bottom:4px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:0 12px;">
                  <a href="${manageUrl}" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#C6A15B;text-decoration:none;letter-spacing:0.04em;">Change prayer settings</a>
                </td>
                <td style="color:rgba(16,42,67,0.25);font-size:12px;">·</td>
                <td style="padding:0 12px;">
                  <a href="${portalUrl}" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:rgba(16,42,67,0.45);text-decoration:none;letter-spacing:0.04em;">Cancel subscription</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding-top:16px;">
            <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:rgba(16,42,67,0.4);line-height:1.7;text-align:center;">
              You are receiving this because you subscribed to My Nightly Prayer.
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

function buildText(firstName: string, prayerText: string, manageUrl: string, portalUrl: string): string {
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
    `Change prayer settings: ${manageUrl}`,
    `Cancel subscription: ${portalUrl}`,
    "",
    "You are receiving this because you subscribed to My Nightly Prayer.",
  ].join("\n");
}

export async function sendPrayerEmail(input: SendPrayerEmailInput): Promise<SendPrayerEmailResult> {
  const { to, firstName, subject, prayerText, managementToken } = input;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("[sendPrayerEmail] Missing env var: RESEND_API_KEY");

  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  const from     = process.env.FROM_EMAIL || "My Nightly Prayer <prayers@mynightlyprayer.com>";
  const manageUrl = `${appUrl}/manage?token=${managementToken}`;
  const portalUrl = `${appUrl}/api/create-customer-portal?token=${managementToken}`;

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html: buildHtml(firstName, prayerText, manageUrl, portalUrl),
    text: buildText(firstName, prayerText, manageUrl, portalUrl),
  });

  if (error || !data?.id) {
    throw new Error(`[sendPrayerEmail] Resend error: ${error?.message ?? "No email ID returned"}`);
  }

  return { emailId: data.id };
}
