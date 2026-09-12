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

export const contactSettingsSchema = z.object({
  addressTh: z.string().trim().max(500).optional().default(""),
  addressEn: z.string().trim().max(500).optional().default(""),
  phone: z.string().trim().max(100).optional().default(""),
  email: z.string().trim().email().or(z.literal("")).optional().default(""),
  workingHoursTh: z.string().trim().max(100).optional().default(""),
  workingHoursEn: z.string().trim().max(100).optional().default(""),
  facebookUrl: z.string().trim().url().or(z.literal("")).optional().default(""),
  lineId: z.string().trim().max(100).optional().default(""),
  websiteUrl: z.string().trim().url().or(z.literal("")).optional().default(""),
  googleMapUrl: z.string().trim().url().or(z.literal("")).optional().default(""),
});

export const geminiSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  apiKey: z.string().trim().max(255).optional().default(""),
  model: z.string().trim().max(100).default("gemini-1.5-flash"),
});

export const testGeminiInputSchema = z.object({
  gemini: geminiSettingsSchema,
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
  contact: contactSettingsSchema.optional().nullable(),
  gemini: geminiSettingsSchema.optional().nullable(),
});
export const updateProfileSchema = z.object({ name: z.string().trim().min(1).max(255), locale: z.enum(["th", "en"]) });
export type SmtpSettings = z.infer<typeof smtpSettingsSchema>;
export type ContactSettings = z.infer<typeof contactSettingsSchema>;
export type GeminiSettings = z.infer<typeof geminiSettingsSchema>;
export type TestSmtpInput = z.infer<typeof testSmtpInputSchema>;
export type TestGeminiInput = z.infer<typeof testGeminiInputSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
