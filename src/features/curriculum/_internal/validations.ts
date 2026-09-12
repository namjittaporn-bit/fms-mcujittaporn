import { z } from "zod";

export const degreeLevelEnum = z.enum([
  "BACHELOR",
  "MASTER",
  "DOCTORATE",
  "DIPLOMA",
]);

export const programPlanEnum = z.enum([
  "REGULAR",
  "SPECIAL",
  "INTERNATIONAL",
  "BILINGUAL",
]);

export const programStatusEnum = z.enum([
  "ACTIVE",
  "INACTIVE",
  "REVISED",
]);

export const curriculumCategorySchema = z.object({
  category: z.string().min(1),
  credits: z.number().int().min(0),
  description: z.string().optional(),
});

export const studyPlanSemesterSchema = z.object({
  year: z.number().int().min(1),
  semester: z.number().int().min(1),
  courses: z.array(
    z.object({
      code: z.string(),
      name: z.string(),
      credits: z.number(),
    })
  ).default([]),
});

export const createProgramSchema = z.object({
  code: z.string().min(1, "code_required").max(50),
  nameTh: z.string().min(1, "nameTh_required").max(255),
  nameEn: z.string().min(1, "nameEn_required").max(255),
  degreeTitleTh: z.string().min(1, "degreeTitleTh_required").max(255),
  degreeTitleEn: z.string().min(1, "degreeTitleEn_required").max(255),
  degreeAbbrTh: z.string().min(1, "degreeAbbrTh_required").max(100),
  degreeAbbrEn: z.string().min(1, "degreeAbbrEn_required").max(100),
  departmentId: z.string().uuid().optional().nullable(),
  degreeLevel: degreeLevelEnum.default("BACHELOR"),
  programPlan: programPlanEnum.default("REGULAR"),
  durationYears: z.coerce.number().int().min(1).max(10).default(4),
  totalCredits: z.coerce.number().int().min(1).max(300).default(120),
  tuitionFeeSemester: z.coerce.number().min(0).optional().nullable(),
  descriptionTh: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  careerPaths: z.array(z.string()).default([]),
  curriculumStructure: z.array(curriculumCategorySchema).default([]),
  studyPlan: z.array(studyPlanSemesterSchema).default([]),
  tqfFileUrl: z.string().max(1000).optional().nullable(),
  coverImageUrl: z.string().max(1000).optional().nullable(),
  status: programStatusEnum.default("ACTIVE"),
  orderIndex: z.coerce.number().int().default(0),
});

export const updateProgramSchema = createProgramSchema.extend({
  id: z.string().uuid(),
});

export const toggleProgramStatusSchema = z.object({
  id: z.string().uuid(),
  status: programStatusEnum,
});

export const createDepartmentSchema = z.object({
  code: z.string().trim().min(1, "code_required").max(50),
  nameTh: z.string().trim().min(1, "nameTh_required").max(255),
  nameEn: z.string().trim().min(1, "nameEn_required").max(255),
  description: z.string().trim().optional().nullable(),
  orderIndex: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateDepartmentSchema = createDepartmentSchema.extend({
  id: z.string().uuid(),
});

export const toggleDepartmentStatusSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
});

export type DegreeLevelType = z.infer<typeof degreeLevelEnum>;
export type ProgramPlanType = z.infer<typeof programPlanEnum>;
export type ProgramStatusType = z.infer<typeof programStatusEnum>;
export type CurriculumCategory = z.infer<typeof curriculumCategorySchema>;
export type StudyPlanSemester = z.infer<typeof studyPlanSemesterSchema>;
export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
