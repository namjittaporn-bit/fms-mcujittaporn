import { cache } from "react";
import { prisma, type Db } from "@/shared/lib/infra/prisma";
import { DEFAULT_PALETTE, isPalette, type PaletteId } from "@/shared/lib/palette";
import { errors } from "@/shared/lib/errors";
import { writeAudit } from "../audit";
import type { UpdateSettingsInput, SmtpSettings, ContactSettings } from "../validations/settings";

export interface TenantSettings {
  code: string;
  nameTh: string;
  nameEn: string;
  logoUrl: string | null;
  palette: PaletteId;
  smtp?: SmtpSettings | null;
  contact?: ContactSettings | null;
}

async function readTenantSettings(tenantId: string, db: Db): Promise<TenantSettings> {
  const t = await db.tenant.findUnique({ where: { id: tenantId } });
  if (!t) throw errors.not_found();
  const settings = (t.settings as { palette?: unknown; smtp?: SmtpSettings; contact?: ContactSettings } | null) ?? {};
  const p = settings.palette;
  const rawSmtp = settings.smtp;
  let smtp: SmtpSettings | null = null;
  if (rawSmtp && typeof rawSmtp === "object") {
    smtp = {
      enabled: Boolean(rawSmtp.enabled),
      user: typeof rawSmtp.user === "string" ? rawSmtp.user : "",
      pass: typeof rawSmtp.pass === "string" ? rawSmtp.pass : "",
      fromName: typeof rawSmtp.fromName === "string" ? rawSmtp.fromName : "",
      fromEmail: typeof rawSmtp.fromEmail === "string" ? rawSmtp.fromEmail : "",
      port: rawSmtp.port === 587 ? 587 : 465,
      secure: rawSmtp.secure !== undefined ? Boolean(rawSmtp.secure) : rawSmtp.port !== 587,
    };
  }

  const rawContact = settings.contact;
  let contact: ContactSettings | null = null;
  if (rawContact && typeof rawContact === "object") {
    contact = {
      addressTh: typeof rawContact.addressTh === "string" ? rawContact.addressTh : "",
      addressEn: typeof rawContact.addressEn === "string" ? rawContact.addressEn : "",
      phone: typeof rawContact.phone === "string" ? rawContact.phone : "",
      email: typeof rawContact.email === "string" ? rawContact.email : "",
      workingHoursTh: typeof rawContact.workingHoursTh === "string" ? rawContact.workingHoursTh : "",
      workingHoursEn: typeof rawContact.workingHoursEn === "string" ? rawContact.workingHoursEn : "",
      facebookUrl: typeof rawContact.facebookUrl === "string" ? rawContact.facebookUrl : "",
      lineId: typeof rawContact.lineId === "string" ? rawContact.lineId : "",
      websiteUrl: typeof rawContact.websiteUrl === "string" ? rawContact.websiteUrl : "",
      googleMapUrl: typeof rawContact.googleMapUrl === "string" ? rawContact.googleMapUrl : "",
    };
  }

  return {
    code: t.code,
    nameTh: t.nameTh,
    nameEn: t.nameEn,
    logoUrl: t.logoUrl,
    palette: isPalette(p) ? p : DEFAULT_PALETTE,
    smtp,
    contact,
  };
}

export async function getTenantSettings(tenantId: string): Promise<TenantSettings> {
  return readTenantSettings(tenantId, prisma);
}

/** เก็บคีย์อื่น ๆ ใน settings JSON ไว้ทั้งหมด — merge palette, smtp และ contact ไม่ทับทั้งก้อน */
export async function updateTenantSettings(input: { tenantId: string; actorId: string } & UpdateSettingsInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // อ่านผ่าน tx เดียวกัน ไม่ใช่ client กลาง — ไม่งั้นทรานแซกชันนี้กินคอนเนกชันจากพูลเพิ่มอีกเส้นเพื่ออ่าน
    // ค่าเดิม และค่าที่อ่านได้ก็อยู่นอกสแนปช็อตของทรานแซกชัน (ค่า before ของ audit อาจไม่ตรงกับที่กำลังจะทับ)
    const before = await readTenantSettings(input.tenantId, tx);
    const t = await tx.tenant.findUniqueOrThrow({ where: { id: input.tenantId }, select: { settings: true } });
    const existingSettings = (t.settings as { palette?: unknown; smtp?: SmtpSettings; contact?: ContactSettings } | null) ?? {};

    let mergedSmtp: SmtpSettings | null = null;
    if (input.smtp) {
      const existingPass = existingSettings.smtp?.pass || "";
      mergedSmtp = {
        ...input.smtp,
        pass: input.smtp.pass && input.smtp.pass.trim() !== "" ? input.smtp.pass.trim() : existingPass,
      };
    }

    const mergedContact = input.contact !== undefined ? input.contact : (existingSettings.contact ?? null);

    await tx.tenant.update({
      where: { id: input.tenantId },
      data: {
        nameTh: input.nameTh,
        nameEn: input.nameEn,
        logoUrl: input.logoUrl || null,
        settings: {
          ...existingSettings,
          palette: input.palette,
          smtp: mergedSmtp,
          contact: mergedContact,
        },
      },
    });
    await writeAudit({ tenantId: input.tenantId, actorId: input.actorId, action: "tenant.settings_update", entity: "tenant", entityId: input.tenantId, before, after: input }, tx);
  });
}

export async function getTenantSmtp(tenantId: string): Promise<SmtpSettings | null> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
  const s = (t?.settings as { smtp?: SmtpSettings } | null)?.smtp;
  if (!s || !s.enabled) return null;
  return s;
}

export async function getTenantPalette(tenantId: string): Promise<PaletteId> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
  const p = (t?.settings as { palette?: unknown } | null)?.palette;
  return isPalette(p) ? p : DEFAULT_PALETTE;
}

/**
 * tenant ของ session ถ้ามี — import แบบ dynamic เพราะ `../auth` ดึง next-auth ทั้งก้อนเข้ามา และ
 * โมดูลนี้ถูก import จาก root layout ที่รันทุก request · แยก try ของตัวเองไว้ต่างหากโดยเจตนา: เดิมมันอยู่
 * ใน try เดียวกับการอ่านฐานข้อมูล ทำให้ "โหลด auth ไม่ได้" กับ "ฐานข้อมูลล้ม" กลืนหายไปเป็นค่าเดียวกัน
 * และเส้นทางอ่าน tenant ทั้งเส้นทดสอบไม่ได้เลย (ในสภาพแวดล้อมเทสต์ next-auth resolve ไม่ผ่าน)
 */
async function sessionTenantId(): Promise<string | null> {
  try {
    const { auth } = await import("../auth");
    return (await auth())?.tenantId || null;
  } catch {
    return null;
  }
}

/** ใช้โดย root layout ทุก request — tenant จาก session ถ้ามี ไม่งั้น tenant แรก (หน้า login ยังไม่มี session) · ไม่ throw */
export const resolvePalette = cache(async (): Promise<PaletteId> => {
  try {
    const tenantId = (await sessionTenantId()) || (await prisma.tenant.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } }))?.id;
    return tenantId ? await getTenantPalette(tenantId) : DEFAULT_PALETTE;
  } catch {
    return DEFAULT_PALETTE;
  }
});

/** ดึงการตั้งค่าองค์กรสำหรับ Layouts (โลโก้, ชื่อ) — tenant จาก session ถ้ามี ไม่งั้น tenant แรก · ไม่ throw */
export const resolveTenantSettings = cache(async (): Promise<TenantSettings | null> => {
  try {
    const tenantId =
      (await sessionTenantId()) ||
      (await prisma.tenant.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } }))?.id;
    return tenantId ? await getTenantSettings(tenantId) : null;
  } catch {
    return null;
  }
});

