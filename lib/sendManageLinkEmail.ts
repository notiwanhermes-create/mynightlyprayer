/**
 * sendManageLinkEmail.ts
 * Server-only — emails a subscriber their private manage link
 * when they request it from /manage (no token in hand).
 */

import { Resend } from "resend";

export interface SendManageLinkInput {
  to:              string;
  firstName:       string;
  managementToken: string;
}

function buildHtml(firstName: string, manageUrl: string): string {
  const greeting = firstName ? `, ${firstName}` : "";
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your manage link</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F1E8;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F1E8;padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#0d1b2a;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:36px 36px 32px;">
            <p style="margin:0 0 8px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:#C6A15B;">✦ &nbsp;Nightly Prayer</p>
            <h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:400;font-style:italic;color:#F7F1E8;line-height:1.3;">Manage your subscription</h1>
            <p style="margin:0 0 26px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:300;color:rgba(240,232,216,0.75);line-height:1.8;">
              Hello${greeting} — you asked for your manage link. Use the button below to change your
              prayer settings, delivery time, pause emails, or cancel your subscription.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-radius:6px;background:linear-gradient(135deg,#D2B06C,#C6A15B);">
                  <a href="${manageUrl}" style="display:inline-block;padding:14px 32px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:#0d1b2a;text-decoration:none;">Manage my subscription</a>
                </td>
              </tr>
            </table>
            <p style="margin:26px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:300;color:rgba(240,232,216,0.5);line-height:1.7;">
              This link is private to you — please don't share it. If you didn't request this email,
              you can safely ignore it.
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

function buildText(firstName: string, manageUrl: string): string {
  const greeting = firstName ? `, ${firstName}` : "";
  return [
    "✦ NIGHTLY PRAYER",
    "",
    `Hello${greeting} — you asked for your manage link.`,
    "",
    "Use it to change your prayer settings, delivery time, pause emails, or cancel:",
    manageUrl,
    "",
    "This link is private to you — please don't share it.",
    "If you didn't request this email, you can safely ignore it.",
  ].join("\n");
}

export async function sendManageLinkEmail(input: SendManageLinkInput): Promise<void> {
  const { to, firstName, managementToken } = input;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("[sendManageLinkEmail] Missing env var: RESEND_API_KEY");

  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  const from      = process.env.FROM_EMAIL || "My Nightly Prayer <prayers@mynightlyprayer.com>";
  const manageUrl = `${appUrl}/manage?token=${managementToken}`;

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Your manage link — My Nightly Prayer",
    html:    buildHtml(firstName, manageUrl),
    text:    buildText(firstName, manageUrl),
  });

  if (error) {
    throw new Error(`[sendManageLinkEmail] Resend error: ${error.message}`);
  }
}
