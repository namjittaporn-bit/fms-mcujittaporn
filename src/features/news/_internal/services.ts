import { prisma } from "@/shared/lib/infra/prisma";
import type { CreateNewsInput, UpdateNewsInput, TogglePinNewsInput } from "./validations";
import type { NewsCategory, NewsStatus } from "@/generated/prisma";

export interface NewsAttachmentDto {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
}

export interface NewsArticleDto {
  id: string;
  tenantId: string;
  titleTh: string;
  titleEn: string;
  slug: string;
  contentTh: string;
  contentEn: string;
  coverImageUrl: string | null;
  category: string;
  status: string;
  isPinned: boolean;
  viewCount: number;
  publishedAt: string | null;
  expiresAt: string | null;
  authorId: string | null;
  authorName: string | null;
  attachments: NewsAttachmentDto[];
  createdAt: string;
  updatedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToDto(item: any): NewsArticleDto {
  return {
    id: item.id,
    tenantId: item.tenantId,
    titleTh: item.titleTh,
    titleEn: item.titleEn,
    slug: item.slug,
    contentTh: item.contentTh,
    contentEn: item.contentEn,
    coverImageUrl: item.coverImageUrl,
    category: item.category,
    status: item.status,
    isPinned: item.isPinned,
    viewCount: item.viewCount,
    publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
    expiresAt: item.expiresAt ? item.expiresAt.toISOString() : null,
    authorId: item.authorId,
    authorName: item.author?.name ?? null,
    attachments: (item.attachments ?? []).map((att: { id: string; fileName: string; fileUrl: string; fileSize: number | null; mimeType: string | null }) => ({
      id: att.id,
      fileName: att.fileName,
      fileUrl: att.fileUrl,
      fileSize: att.fileSize,
      mimeType: att.mimeType,
    })),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export async function listAdminNews(
  tenantId: string,
  filter?: { search?: string; category?: string; status?: string },
): Promise<NewsArticleDto[]> {
  const where: Record<string, unknown> = { tenantId };

  if (filter?.search) {
    where.OR = [
      { titleTh: { contains: filter.search, mode: "insensitive" } },
      { titleEn: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  if (filter?.category && filter.category !== "ALL") {
    where.category = filter.category as NewsCategory;
  }

  if (filter?.status && filter.status !== "ALL") {
    where.status = filter.status as NewsStatus;
  }

  const items = await prisma.newsArticle.findMany({
    where,
    include: {
      author: { select: { id: true, name: true } },
      attachments: true,
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  return items.map(mapToDto);
}

export async function listPublicNews(
  tenantId: string,
  filter?: { search?: string; category?: string; limit?: number },
): Promise<NewsArticleDto[]> {
  const now = new Date();
  const where: Record<string, unknown> = {
    tenantId,
    status: "PUBLISHED" as NewsStatus,
    OR: [
      { publishedAt: null },
      { publishedAt: { lte: now } },
    ],
    AND: [
      {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
    ],
  };

  if (filter?.search) {
    where.AND = [
      ...(where.AND as object[]),
      {
        OR: [
          { titleTh: { contains: filter.search, mode: "insensitive" } },
          { titleEn: { contains: filter.search, mode: "insensitive" } },
        ],
      },
    ];
  }

  if (filter?.category && filter.category !== "ALL") {
    where.category = filter.category as NewsCategory;
  }

  const items = await prisma.newsArticle.findMany({
    where,
    include: {
      author: { select: { id: true, name: true } },
      attachments: true,
    },
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    take: filter?.limit ?? 50,
  });

  return items.map(mapToDto);
}

export async function getPublicNewsBySlug(
  tenantId: string,
  slug: string,
): Promise<NewsArticleDto | null> {
  const item = await prisma.newsArticle.findFirst({
    where: {
      tenantId,
      slug,
      status: "PUBLISHED",
    },
    include: {
      author: { select: { id: true, name: true } },
      attachments: true,
    },
  });

  if (!item) return null;

  // Increment view count asynchronously
  prisma.newsArticle.update({
    where: { id: item.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => { /* non-blocking */ });

  return mapToDto(item);
}

export async function getNewsById(
  tenantId: string,
  id: string,
): Promise<NewsArticleDto | null> {
  const item = await prisma.newsArticle.findFirst({
    where: { id, tenantId },
    include: {
      author: { select: { id: true, name: true } },
      attachments: true,
    },
  });

  return item ? mapToDto(item) : null;
}

export async function createNews(
  tenantId: string,
  authorId: string | null,
  input: CreateNewsInput,
): Promise<NewsArticleDto> {
  // Ensure unique slug
  let uniqueSlug = input.slug.trim().toLowerCase().replace(/\s+/g, "-");
  const existing = await prisma.newsArticle.findFirst({
    where: { tenantId, slug: uniqueSlug },
  });
  if (existing) {
    uniqueSlug = `${uniqueSlug}-${Date.now().toString().slice(-4)}`;
  }

  const publishedAt = input.status === "PUBLISHED"
    ? (input.publishedAt ? new Date(input.publishedAt) : new Date())
    : (input.publishedAt ? new Date(input.publishedAt) : null);

  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;

  const created = await prisma.newsArticle.create({
    data: {
      tenantId,
      authorId,
      titleTh: input.titleTh,
      titleEn: input.titleEn,
      slug: uniqueSlug,
      contentTh: input.contentTh,
      contentEn: input.contentEn,
      coverImageUrl: input.coverImageUrl || null,
      category: input.category as NewsCategory,
      status: input.status as NewsStatus,
      isPinned: input.isPinned,
      publishedAt,
      expiresAt,
      attachments: input.attachments && input.attachments.length > 0 ? {
        create: input.attachments.map((att) => ({
          fileName: att.fileName,
          fileUrl: att.fileUrl,
          fileSize: att.fileSize ?? null,
          mimeType: att.mimeType ?? null,
        })),
      } : undefined,
    },
    include: {
      author: { select: { id: true, name: true } },
      attachments: true,
    },
  });

  return mapToDto(created);
}

export async function updateNews(
  tenantId: string,
  input: UpdateNewsInput,
): Promise<NewsArticleDto> {
  const publishedAt = input.status === "PUBLISHED"
    ? (input.publishedAt ? new Date(input.publishedAt) : new Date())
    : (input.publishedAt ? new Date(input.publishedAt) : null);

  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;

  const updated = await prisma.$transaction(async (tx) => {
    // Delete existing attachments if replacing
    if (input.attachments !== undefined) {
      await tx.newsAttachment.deleteMany({
        where: { newsId: input.id },
      });
    }

    return tx.newsArticle.update({
      where: { id: input.id, tenantId },
      data: {
        titleTh: input.titleTh,
        titleEn: input.titleEn,
        slug: input.slug.trim().toLowerCase().replace(/\s+/g, "-"),
        contentTh: input.contentTh,
        contentEn: input.contentEn,
        coverImageUrl: input.coverImageUrl || null,
        category: input.category as NewsCategory,
        status: input.status as NewsStatus,
        isPinned: input.isPinned,
        publishedAt,
        expiresAt,
        attachments: input.attachments && input.attachments.length > 0 ? {
          create: input.attachments.map((att) => ({
            fileName: att.fileName,
            fileUrl: att.fileUrl,
            fileSize: att.fileSize ?? null,
            mimeType: att.mimeType ?? null,
          })),
        } : undefined,
      },
      include: {
        author: { select: { id: true, name: true } },
        attachments: true,
      },
    });
  });

  return mapToDto(updated);
}

export async function togglePinNews(
  tenantId: string,
  input: TogglePinNewsInput,
): Promise<NewsArticleDto> {
  const updated = await prisma.newsArticle.update({
    where: { id: input.id, tenantId },
    data: { isPinned: input.isPinned },
    include: {
      author: { select: { id: true, name: true } },
      attachments: true,
    },
  });

  return mapToDto(updated);
}

export async function deleteNews(
  tenantId: string,
  id: string,
): Promise<void> {
  await prisma.newsArticle.delete({
    where: { id, tenantId },
  });
}
