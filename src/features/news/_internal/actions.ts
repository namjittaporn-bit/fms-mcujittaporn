"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
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
