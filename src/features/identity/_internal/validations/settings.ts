import { z } from "zod";
import { PALETTE_IDS } from "@/shared/lib/palette";

export const updateSettingsSchema = z.object({
  nameTh: z.string().trim().min(1).max(255),
  nameEn: z.string().trim().min(1).max(255),
  logoUrl: z
    .union([
      z.string().trim().url().max(500),
      z.string().trim().startsWith("/").max(500),
      z.literal(""),
    ])
    .default(""),
  palette: z.enum(PALETTE_IDS),
});
export const updateProfileSchema = z.object({ name: z.string().trim().min(1).max(255), locale: z.enum(["th", "en"]) });
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
