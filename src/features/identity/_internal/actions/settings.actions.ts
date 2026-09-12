"use server";
import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { errors } from "@/shared/lib/errors";
import { P } from "../../permissions";
import { requirePermission } from "../rbac";
import { updateSettingsSchema, testSmtpInputSchema, testGeminiInputSchema } from "../validations/settings";
import {
  getTenantSettings,
  updateTenantSettings,
  type TenantSettings,
} from "../services/tenant.service";
import { sendMailViaTransport } from "@/shared/lib/infra/mailer";
import { testGeminiConnection } from "@/shared/lib/infra/gemini";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export async function getSettingsAction(): Promise<ActionResult<TenantSettings>> {
  return runAction(async () =>
    getTenantSettings((await requirePermission(P.settingsManage)).tenantId)
  );
}

export async function updateSettingsAction(
  input: unknown
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    await updateTenantSettings({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      ...updateSettingsSchema.parse(input, {
        error: zodErrorMap(await getLocale()),
      }),
    });
    revalidatePath("/", "layout"); // data-palette บน <html> อ่านใหม่
  });
}

export async function uploadLogoAction(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    const file = formData.get("file");

    if (!file || !(file instanceof File) || file.size === 0) {
      throw errors.validation("No file provided");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw errors.validation("File size exceeds 2MB limit");
    }

    const ext = ALLOWED_MIME_TYPES[file.type];
    if (!ext) {
      throw errors.validation(
        "Only PNG, JPEG, WebP, and SVG images are supported"
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `logo-${ctx.tenantId}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    return { url: `/uploads/logos/${filename}` };
  });
}

export async function testSmtpAction(
  input: unknown
): Promise<ActionResult<{ success: boolean; message: string }>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    const locale = await getLocale();
    const isEn = locale === "en";
    const data = testSmtpInputSchema.parse(input, {
      error: zodErrorMap(locale),
    });

    // If password wasn't provided in the test payload, check if there's an existing password saved for the tenant
    let pass = data.smtp.pass;
    if (!pass || pass.trim() === "") {
      const current = await getTenantSettings(ctx.tenantId);
      pass = current.smtp?.pass || "";
    }

    if (!pass) {
      throw errors.validation(
        isEn
          ? "Please provide Google App Password to test connection"
          : "กรุณาระบุรหัสผ่านสำหรับแอป (Google App Password) เพื่อทดสอบการส่ง"
      );
    }

    if (!data.smtp.user) {
      throw errors.validation(
        isEn
          ? "Please provide Gmail address"
          : "กรุณาระบุอีเมลบัญชี Gmail"
      );
    }

    const fromAddress = data.smtp.fromEmail?.trim() || data.smtp.user;
    const fromName = data.smtp.fromName?.trim() || "Faculty of Technology & Management";
    const fromHeader = `"${fromName}" <${fromAddress}>`;

    const result = await sendMailViaTransport(
      {
        host: "smtp.gmail.com",
        port: data.smtp.port,
        secure: data.smtp.secure ?? data.smtp.port === 465,
        user: data.smtp.user,
        pass: pass,
        from: fromHeader,
      },
      {
        to: data.toEmail,
        subject: isEn
          ? `[FMS] Gmail SMTP Connection Test (${new Date().toLocaleTimeString()})`
          : `[FMS] ทดสอบการเชื่อมต่อระบบส่งอีเมล Gmail SMTP สำเร็จ (${new Date().toLocaleTimeString()})`,
        text: isEn
          ? `This is a test email sent from FMS System via Gmail SMTP (${data.smtp.user}). Your email configuration is working properly!`
          : `อีเมลนี้เป็นข้อความทดสอบที่ส่งจากระบบบริหารจัดการ FMS ผ่านบริการ Gmail SMTP (${data.smtp.user}) การตั้งค่าระบบส่งอีเมลของคุณทำงานได้อย่างถูกต้องเรียบร้อยแล้ว!`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="margin-bottom: 16px;">
              <span style="display: inline-block; padding: 4px 12px; background-color: #10b981; color: white; font-weight: bold; border-radius: 9999px; font-size: 12px;">
                ${isEn ? "TEST SUCCESS" : "ทดสอบสำเร็จ"}
              </span>
            </div>
            <h2 style="color: #0f172a; margin-top: 0;">
              ${isEn ? "Gmail SMTP Connection Successful!" : "การเชื่อมต่อ Gmail SMTP สำเร็จเรียบร้อย!"}
            </h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              ${
                isEn
                  ? "This test message confirms that your Gmail SMTP credentials, host connection, and SSL/TLS encryption are configured properly."
                  : "ข้อความนี้เพื่อยืนยันว่าข้อมูลบัญชี Gmail SMTP, การเชื่อมต่อโฮสต์ และการเข้ารหัสความปลอดภัย SSL/TLS ของคุณได้รับการตั้งค่าอย่างถูกต้องและพร้อมใช้งาน"
              }
            </p>
            <div style="background-color: #f8fafc; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #64748b; margin: 16px 0;">
              <div><strong>Sender / บัญชีที่ส่ง:</strong> ${data.smtp.user}</div>
              <div><strong>Port / พอร์ต:</strong> ${data.smtp.port} (${data.smtp.secure ? "SSL" : "TLS"})</div>
              <div><strong>Recipient / ผู้รับ:</strong> ${data.toEmail}</div>
              <div><strong>Timestamp / เวลา:</strong> ${new Date().toLocaleString()}</div>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
              FMS Enterprise System • Faculty of Technology and Management
            </p>
          </div>
        `,
      }
    );

    if (!result.delivered) {
      throw errors.validation(
        result.error ||
          (isEn
            ? "Failed to connect to Gmail SMTP. Please verify your Gmail address and 16-character App Password."
            : "ไม่สามารถเชื่อมต่อกับ Gmail SMTP ได้ กรุณาตรวจสอบอีเมลและรหัสผ่านสำหรับแอป (App Password 16 หลัก)")
      );
    }

    return {
      success: true,
      message: isEn
        ? `Test email sent successfully to ${data.toEmail}`
        : `ส่งอีเมลทดสอบไปยัง ${data.toEmail} สำเร็จเรียบร้อยแล้ว`,
    };
  });
}

export async function testGeminiAction(
  input: unknown
): Promise<ActionResult<{ success: boolean; message: string; model: string }>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    const locale = await getLocale();
    const isEn = locale === "en";
    const data = testGeminiInputSchema.parse(input, {
      error: zodErrorMap(locale),
    });

    let apiKey = data.gemini.apiKey;
    if (!apiKey || apiKey.trim() === "") {
      const current = await getTenantSettings(ctx.tenantId);
      apiKey = current.gemini?.apiKey || "";
    }

    if (!apiKey) {
      throw errors.validation(
        isEn
          ? "Please provide Google Gemini API Key to test connection"
          : "กรุณาระบุ Google Gemini API Key เพื่อทดสอบการเชื่อมต่อ"
      );
    }

    try {
      const model = data.gemini.model || "gemini-1.5-flash";
      await testGeminiConnection(apiKey, model);
      return {
        success: true,
        model,
        message: isEn
          ? `Gemini API connection successful using model "${model}"`
          : `เชื่อมต่อกับ Google Gemini API (${model}) สำเร็จเรียบร้อยแล้ว`,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      throw errors.validation(
        isEn
          ? `Failed to connect to Gemini API: ${errorMsg}`
          : `ไม่สามารถเชื่อมต่อกับ Google Gemini API ได้: ${errorMsg}`
      );
    }
  });
}

