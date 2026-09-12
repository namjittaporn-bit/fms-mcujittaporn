import { z } from "zod";
import { PALETTE_IDS } from "@/shared/lib/palette";

export const smtpSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  user: z.string().trim().email().or(z.literal("")).default(""),
  pass: z.string().trim().max(100).optional().default(""),
  fromName: z.string().trim().max(255).optional().default(""),
  fromEmail: z.string().trim().email().or(z.literal("")).optional().default(""),
  port: z.union([z.literal(465), z.literal(587)]).default(465),
  secure: z.boolean().default(true),
});

export const testSmtpInputSchema = z.object({
  toEmail: z.string().trim().email(),
  smtp: smtpSettingsSchema,
});

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
  smtp: smtpSettingsSchema.optional().nullable(),
});
export const updateProfileSchema = z.object({ name: z.string().trim().min(1).max(255), locale: z.enum(["th", "en"]) });
export type SmtpSettings = z.infer<typeof smtpSettingsSchema>;
export type TestSmtpInput = z.infer<typeof testSmtpInputSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
