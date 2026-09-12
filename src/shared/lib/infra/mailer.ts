import "server-only";
import nodemailer from "nodemailer";
import { env, smtpConfigured } from "./env";
import { logger } from "./logger";

export interface SmtpTransportConfig {
  host: string;
  port: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  from?: string;
}

export interface MailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
  smtpConfig?: SmtpTransportConfig;
}

/** ส่งอีเมลผ่าน SmtpTransportConfig ที่ระบุ (เช่น Gmail หรือ Custom SMTP) */
export async function sendMailViaTransport(
  config: SmtpTransportConfig,
  input: Omit<MailInput, "smtpConfig">
): Promise<{ delivered: boolean; error?: string }> {
  try {
    const transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure ?? config.port === 465,
      auth: config.user ? { user: config.user, pass: config.pass } : undefined,
    });

    await transport.sendMail({
      from: config.from || config.user || "no-reply@localhost",
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    return { delivered: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("mail send via transport failed", { to: input.to, err: msg });
    return { delivered: false, error: msg };
  }
}

/** ไม่มี SMTP → เขียนลง log ระดับ info แล้วคืน delivered:false — ระบบต้องไม่ล้มเพราะส่งอีเมลไม่ได้ */
export async function sendMail(input: MailInput): Promise<{ delivered: boolean; error?: string }> {
  if (input.smtpConfig) {
    return sendMailViaTransport(input.smtpConfig, input);
  }

  if (!smtpConfigured()) {
    logger.info("mail (no SMTP, logged only)", { to: input.to, subject: input.subject, text: input.text });
    return { delivered: false };
  }
  const e = env();
  return sendMailViaTransport(
    {
      host: e.SMTP_HOST,
      port: e.SMTP_PORT,
      secure: e.SMTP_PORT === 465,
      user: e.SMTP_USER,
      pass: e.SMTP_PASS,
      from: e.SMTP_FROM,
    },
    input
  );
}
