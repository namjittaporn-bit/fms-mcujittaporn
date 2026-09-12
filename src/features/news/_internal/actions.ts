"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { errors } from "@/shared/lib/errors";
import { requirePermission, getTenantGemini } from "@/features/identity/server";
import { translateThaiNewsToEnglish } from "@/shared/lib/infra/gemini";
import { NEWS_P } from "../permissions";
import {
  createNewsSchema,
  updateNewsSchema,
  togglePinNewsSchema,
} from "./validations";
import {
  listAdminNews,
  createNews,
  updateNews,
  deleteNews,
  togglePinNews,
  type NewsArticleDto,
} from "./services";

export async function getAdminNewsAction(
  filter?: { search?: string; category?: string; status?: string },
): Promise<ActionResult<NewsArticleDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsRead);
    return listAdminNews(ctx.tenantId, filter);
  });
}

export async function createNewsAction(
  input: unknown,
): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsCreate);
    const locale = await getLocale();
    const parsed = createNewsSchema.parse(input, { error: zodErrorMap(locale) });
    const result = await createNews(ctx.tenantId, ctx.userId ?? null, parsed);
    revalidatePath("/admin/news");
    revalidatePath("/news");
    revalidatePath("/");
    return result;
  });
}

export async function updateNewsAction(
  input: unknown,
): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsUpdate);
    const locale = await getLocale();
    const parsed = updateNewsSchema.parse(input, { error: zodErrorMap(locale) });
    const result = await updateNews(ctx.tenantId, parsed);
    revalidatePath("/admin/news");
    revalidatePath("/news");
    revalidatePath("/");
    return result;
  });
}

export async function togglePinNewsAction(
  input: unknown,
): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsPin);
    const locale = await getLocale();
    const parsed = togglePinNewsSchema.parse(input, { error: zodErrorMap(locale) });
    const result = await togglePinNews(ctx.tenantId, parsed);
    revalidatePath("/admin/news");
    revalidatePath("/news");
    revalidatePath("/");
    return result;
  });
}

export async function deleteNewsAction(
  id: string,
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsDelete);
    await deleteNews(ctx.tenantId, id);
    revalidatePath("/admin/news");
    revalidatePath("/news");
    revalidatePath("/");
  });
}

const translateNewsSchema = z.object({
  titleTh: z.string().trim().min(1),
  contentTh: z.string().trim().min(1),
});

export async function translateNewsWithGeminiAction(
  input: unknown,
): Promise<ActionResult<{ titleEn: string; contentEn: string }>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsCreate);
    const locale = await getLocale();
    const isEn = locale === "en";
    const parsed = translateNewsSchema.parse(input, { error: zodErrorMap(locale) });

    const tenantGemini = await getTenantGemini(ctx.tenantId);
    const apiKey = tenantGemini?.apiKey || process.env.GEMINI_API_KEY || "";
    const model = tenantGemini?.model || "gemini-1.5-flash";

    if (!apiKey) {
      throw errors.validation(
        isEn
          ? "Google Gemini API key is not configured. Please configure your API key in Organization Settings (/settings)."
          : "ยังไม่ได้ตั้งค่า Google Gemini API Key กรุณากำหนดค่าในหน้าการตั้งค่าองค์กร (/settings)"
      );
    }

    try {
      const result = await translateThaiNewsToEnglish({
        apiKey,
        model,
        titleTh: parsed.titleTh,
        contentTh: parsed.contentTh,
      });
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw errors.validation(
        isEn
          ? `Gemini translation error: ${msg}`
          : `เกิดข้อผิดพลาดในการแปลด้วย Gemini: ${msg}`
      );
    }
  });
}

