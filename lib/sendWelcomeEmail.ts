/**
 * sendWelcomeEmail.ts
 * Server-only — sends a one-time welcome email when a new subscriber is created.
 */

import { Resend } from "resend";

export interface SendWelcomeEmailInput {
  to:              string;
  firstName:       string;
  deliveryTime:    string; // "22:00" 24-hour format
  managementToken: string;
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period  = h >= 12 ? "PM" : "AM";
  const hour    = h % 12 || 12;
  return m === 0
    ? `${hour}:00 ${period}`
    : `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

function buildHtml(
  firstName:    string,
  deliveryTime: string,
  manageUrl:    string,
  portalUrl:    string,
): string {
  const formattedTime = deliveryTime ? formatTime(deliveryTime) : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Welcome to My Nightly Prayer</title>
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

                  <!-- Eyebrow -->
                  <p style="margin:0 0 6px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:400;letter-spacing:0.18em;text-transform:uppercase;color:#C6A15B;">Welcome</p>

                  <!-- Heading -->
                  <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;font-style:italic;color:#F7F1E8;line-height:1.3;">Welcome to My Nightly Prayer.</h1>

                  <!-- Confirmation -->
                  <p style="margin:0 0 24px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:300;color:rgba(247,241,232,0.82);line-height:1.85;">
                    Your nightly prayer is now active${firstName ? `, ${firstName}` : ""}.${formattedTime ? ` Your nightly prayers will begin arriving at <strong style="color:#F7F1E8;font-weight:400;">${formattedTime}</strong> each evening.` : " Your nightly prayers will begin arriving at your chosen bedtime."}
                  </p>

                  <!-- Divider -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                    <tr><td style="height:1px;background:linear-gradient(to right,transparent,rgba(198,161,91,0.28),transparent);"></td></tr>
                  </table>

                  <!-- Prayer eyebrow -->
                  <p style="margin:0 0 10px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:400;letter-spacing:0.18em;text-transform:uppercase;color:rgba(198,161,91,0.7);">A prayer for your first night</p>

                  <!-- Prayer -->
                  <p style="margin:0 0 28px;font-family:Georgia,'Times New Roman',serif;font-size:16px;font-style:italic;font-weight:400;color:rgba(247,241,232,0.88);line-height:1.95;">
                    Lord, thank You for bringing me into this quiet place of prayer.<br/>
                    Let this become a peaceful rhythm at the end of each day.<br/>
                    Fill my nights with calm, protect my heart from worry,<br/>
                    and remind me that I am never alone.<br/>
                    May every prayer I receive lead me closer to peace,<br/>
                    gratitude, strength, and faith.<br/>
                    Amen.
                  </p>

                  <!-- Divider -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                    <tr><td style="height:1px;background:linear-gradient(to right,transparent,rgba(198,161,91,0.28),transparent);"></td></tr>
                  </table>

                  <!-- What happens next -->
                  <p style="margin:0 0 14px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:400;letter-spacing:0.18em;text-transform:uppercase;color:rgba(198,161,91,0.7);">What happens next</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
                    <tr>
                      <td style="padding:4px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:300;color:rgba(247,241,232,0.72);line-height:1.75;">
                        ✦ &nbsp; Your nightly prayer will arrive at your chosen bedtime.
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:300;color:rgba(247,241,232,0.72);line-height:1.75;">
                        ✦ &nbsp; You can change your prayer focus, tone, or delivery time anytime.
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:300;color:rgba(247,241,232,0.72);line-height:1.75;">
                        ✦ &nbsp; You can pause or cancel anytime.
                      </td>
                    </tr>
                  </table>

                  <!-- Bottom accent -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                    <tr><td style="height:1px;background:linear-gradient(to right,transparent,rgba(198,161,91,0.28),transparent);"></td></tr>
                  </table>
                  <p style="margin:16px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(198,161,91,0.6);text-align:center;">Peace &nbsp;·&nbsp; Protection &nbsp;·&nbsp; Hope &nbsp; ✦</p>

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

function buildText(
  firstName:    string,
  deliveryTime: string,
  manageUrl:    string,
  portalUrl:    string,
): string {
  const formattedTime = deliveryTime ? formatTime(deliveryTime) : "your chosen bedtime";
  const greeting      = firstName ? `, ${firstName}` : "";
  return [
    "✦ NIGHTLY PRAYER",
    "",
    "Welcome to My Nightly Prayer.",
    "",
    `Your nightly prayer is now active${greeting}. Your nightly prayers will begin arriving at ${formattedTime} each evening.`,
    "",
    "─────────────────────",
    "A prayer for your first night",
    "─────────────────────",
    "",
    "Lord, thank You for bringing me into this quiet place of prayer.",
    "Let this become a peaceful rhythm at the end of each day.",
    "Fill my nights with calm, protect my heart from worry,",
    "and remind me that I am never alone.",
    "May every prayer I receive lead me closer to peace,",
    "gratitude, strength, and faith.",
    "Amen.",
    "",
    "─────────────────────",
    "What happens next:",
    "",
    "· Your nightly prayer will arrive at your chosen bedtime.",
    "· You can change your prayer focus, tone, or delivery time anytime.",
    "· You can pause or cancel anytime.",
    "",
    `Change prayer settings: ${manageUrl}`,
    `Cancel subscription: ${portalUrl}`,
    "",
    "You are receiving this because you subscribed to My Nightly Prayer.",
  ].join("\n");
}

export async function sendWelcomeEmail(input: SendWelcomeEmailInput): Promise<void> {
  const { to, firstName, deliveryTime, managementToken } = input;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("[sendWelcomeEmail] Missing env var: RESEND_API_KEY");

  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  const from      = process.env.FROM_EMAIL || "My Nightly Prayer <prayers@mynightlyprayer.com>";
  const manageUrl = `${appUrl}/manage?token=${managementToken}`;
  const portalUrl = `${appUrl}/api/create-customer-portal?token=${managementToken}`;

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Welcome to My Nightly Prayer",
    html:    buildHtml(firstName, deliveryTime, manageUrl, portalUrl),
    text:    buildText(firstName, deliveryTime, manageUrl, portalUrl),
  });

  if (error) {
    throw new Error(`[sendWelcomeEmail] Resend error: ${error.message}`);
  }
}
