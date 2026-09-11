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
import { updateSettingsSchema } from "../validations/settings";
import {
  getTenantSettings,
  updateTenantSettings,
  type TenantSettings,
} from "../services/tenant.service";

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
