import "server-only";

import { prisma } from "@/shared/lib/infra/prisma";
import {
  listPublicNews,
  getPublicNewsBySlug,
  listAdminNews,
  getNewsById,
  type NewsArticleDto,
} from "./_internal/services";
import { NEWS_P, NEWS_PERMISSIONS } from "./permissions";

export {
  listPublicNews,
  getPublicNewsBySlug,
  listAdminNews,
  getNewsById,
  NEWS_P,
  NEWS_PERMISSIONS,
  type NewsArticleDto,
};

export async function getDefaultTenantId(): Promise<string> {
  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return tenant?.id ?? "";
}

export async function getPortalNews(
  filter?: { search?: string; category?: string; limit?: number },
): Promise<NewsArticleDto[]> {
  const tenantId = await getDefaultTenantId();
  if (!tenantId) return [];
  return listPublicNews(tenantId, filter);
}

export async function getPortalNewsBySlug(
  slug: string,
): Promise<NewsArticleDto | null> {
  const tenantId = await getDefaultTenantId();
  if (!tenantId) return null;
  return getPublicNewsBySlug(tenantId, slug);
}
