import { z } from "zod";

export const academicRankEnum = z.enum([
  "PROFESSOR",
  "ASSOC_PROF",
  "ASST_PROF",
  "LECTURER",
  "NONE",
]);

export const adminPositionEnum = z.enum([
  "DEAN",
  "VICE_DEAN",
  "ASST_DEAN",
  "HEAD_OF_DEPT",
  "SECRETARY",
  "NONE",
]);

export const personnelTypeEnum = z.enum(["ACADEMIC", "SUPPORT"]);

export const educationItemSchema = z.object({
  degree: z.string().min(1),
  field: z.string().min(1),
  institution: z.string().min(1),
  year: z.string().optional(),
});

export const createStaffSchema = z.object({
  prefixTh: z.string().min(1, "prefixTh_required").max(50),
  prefixEn: z.string().min(1, "prefixEn_required").max(50),
  firstNameTh: z.string().min(1, "firstNameTh_required").max(100),
  lastNameTh: z.string().min(1, "lastNameTh_required").max(100),
  firstNameEn: z.string().min(1, "firstNameEn_required").max(100),
  lastNameEn: z.string().min(1, "lastNameEn_required").max(100),
  academicRank: academicRankEnum.default("NONE"),
  adminPosition: adminPositionEnum.default("NONE"),
  personnelType: personnelTypeEnum.default("ACADEMIC"),
  departmentId: z.string().uuid().optional().nullable(),
  userId: z.string().uuid().optional().nullable(),
  email: z.string().email("email_invalid").max(255),
  phone: z.string().max(50).optional().nullable(),
  roomNumber: z.string().max(50).optional().nullable(),
  avatarUrl: z.string().max(1000).optional().nullable(),
  educationHistory: z.array(educationItemSchema).optional().default([]),
  expertise: z.array(z.string()).optional().default([]),
  researchInterests: z.string().optional().nullable(),
  orderIndex: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateStaffSchema = createStaffSchema.extend({
  id: z.string().uuid(),
});

export type AcademicRankType = z.infer<typeof academicRankEnum>;
export type AdminPositionType = z.infer<typeof adminPositionEnum>;
export type PersonnelTypeType = z.infer<typeof personnelTypeEnum>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
