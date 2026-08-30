import nodemailer from "nodemailer";
import { getResendSmtpHost, getResendSmtpPort, getResendSmtpUsername, getResendSmtpPassword } from "@/lib/store/settings";

export function mailerConfigured(): boolean {
  return Boolean(getResendSmtpPassword());
}

let cachedTransporter: nodemailer.Transporter | null = null;
let cachedKey = "";

function getTransporter(): nodemailer.Transporter | null {
  const password = getResendSmtpPassword();
  if (!password) return null;

  const host = getResendSmtpHost() || "smtp.resend.com";
  const port = getResendSmtpPort() || 587;
  const username = getResendSmtpUsername() || "resend";

  // Cache the transporter, but rebuild it if the underlying settings
  // changed (e.g. the owner updated the key in the admin dashboard) —
  // settings can change at runtime here since they're not process env.
  const key = `${host}:${port}:${username}:${password}`;
  if (cachedTransporter && cachedKey === key) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS (secure: false, nodemailer upgrades automatically)
    auth: { user: username, pass: password },
  });
  cachedKey = key;
  return cachedTransporter;
}

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

interface SendMailResult {
  sent: boolean;
  reason?: "not_configured" | "send_failed";
  errorDetail?: string;
}

/** DEW's default From address — Resend requires the sending domain to be
 * verified in your Resend dashboard before this address will actually
 * deliver; using an unverified domain will bounce or land in spam. */
const DEFAULT_FROM = "DEW by Aphia <hello@dewbyaphia.online>";

export async function sendMail(params: SendMailParams): Promise<SendMailResult> {
  const transporter = getTransporter();
  if (!transporter) return { sent: false, reason: "not_configured" };

  try {
    await transporter.sendMail({
      from: params.from ?? DEFAULT_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
    return { sent: true };
  } catch (err) {
    console.error("Email send failed:", err);
    return { sent: false, reason: "send_failed", errorDetail: String(err) };
  }
}
