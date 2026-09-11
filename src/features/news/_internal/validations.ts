import { z } from "zod";

export const newsCategoryEnum = z.enum([
  "ACADEMIC",
  "ACTIVITY",
  "SCHOLARSHIP",
  "PROCUREMENT",
  "GENERAL",
]);

export const newsStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const newsAttachmentInputSchema = z.object({
  id: z.string().uuid().optional(),
  fileName: z.string().min(1).max(255),
  fileUrl: z
    .string()
    .min(1)
    .max(1000)
    .regex(/^(https?:\/\/|\/)/, "Invalid file URL scheme - must start with https://, http://, or /"),
  fileSize: z.number().int().nonnegative().optional(),
  mimeType: z.string().max(100).optional(),
});

export const createNewsSchema = z.object({
  titleTh: z.string().min(1, "titleTh_required").max(500),
  titleEn: z.string().min(1, "titleEn_required").max(500),
  slug: z.string().min(1, "slug_required").max(255),
  contentTh: z.string().min(1, "contentTh_required"),
  contentEn: z.string().min(1, "contentEn_required"),
  coverImageUrl: z
    .string()
    .max(1000)
    .regex(/^(https?:\/\/|\/)/, "Invalid image URL scheme")
    .optional()
    .nullable(),
  category: newsCategoryEnum.default("GENERAL"),
  status: newsStatusEnum.default("DRAFT"),
  isPinned: z.boolean().default(false),
  publishedAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  attachments: z.array(newsAttachmentInputSchema).optional().default([]),
});

export const updateNewsSchema = createNewsSchema.extend({
  id: z.string().uuid(),
});

export const togglePinNewsSchema = z.object({
  id: z.string().uuid(),
  isPinned: z.boolean(),
});

export type NewsCategoryType = z.infer<typeof newsCategoryEnum>;
export type NewsStatusType = z.infer<typeof newsStatusEnum>;
export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
export type TogglePinNewsInput = z.infer<typeof togglePinNewsSchema>;
