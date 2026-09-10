import { prisma } from "@/shared/lib/infra/prisma";
import type {
  CreateProgramInput,
  UpdateProgramInput,
  CurriculumCategory,
  StudyPlanSemester,
} from "./validations";
import type { DegreeLevel, ProgramPlan, ProgramStatus } from "@/generated/prisma";

export interface DepartmentDto {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
}

export interface CurriculumProgramDto {
  id: string;
  tenantId: string;
  departmentId: string | null;
  departmentNameTh: string | null;
  departmentNameEn: string | null;
  code: string;
  nameTh: string;
  nameEn: string;
  degreeTitleTh: string;
  degreeTitleEn: string;
  degreeAbbrTh: string;
  degreeAbbrEn: string;
  degreeLevel: string;
  programPlan: string;
  durationYears: number;
  totalCredits: number;
  tuitionFeeSemester: number | null;
  descriptionTh: string | null;
  descriptionEn: string | null;
  careerPaths: string[];
  curriculumStructure: CurriculumCategory[];
  studyPlan: StudyPlanSemester[];
  tqfFileUrl: string | null;
  coverImageUrl: string | null;
  status: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToDto(item: any): CurriculumProgramDto {
  return {
    id: item.id,
    tenantId: item.tenantId,
    departmentId: item.departmentId,
    departmentNameTh: item.department?.nameTh ?? null,
    departmentNameEn: item.department?.nameEn ?? null,
    code: item.code,
    nameTh: item.nameTh,
    nameEn: item.nameEn,
    degreeTitleTh: item.degreeTitleTh,
    degreeTitleEn: item.degreeTitleEn,
    degreeAbbrTh: item.degreeAbbrTh,
    degreeAbbrEn: item.degreeAbbrEn,
    degreeLevel: item.degreeLevel,
    programPlan: item.programPlan,
    durationYears: item.durationYears,
    totalCredits: item.totalCredits,
    tuitionFeeSemester: item.tuitionFeeSemester ? Number(item.tuitionFeeSemester) : null,
    descriptionTh: item.descriptionTh,
    descriptionEn: item.descriptionEn,
    careerPaths: (item.careerPaths as string[]) ?? [],
    curriculumStructure: (item.curriculumStructure as CurriculumCategory[]) ?? [],
    studyPlan: (item.studyPlan as StudyPlanSemester[]) ?? [],
    tqfFileUrl: item.tqfFileUrl,
    coverImageUrl: item.coverImageUrl,
    status: item.status,
    orderIndex: item.orderIndex,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export async function listDepartments(tenantId: string): Promise<DepartmentDto[]> {
  const list = await prisma.department.findMany({
    where: { tenantId, isActive: true },
    orderBy: { orderIndex: "asc" },
  });
  return list.map((d) => ({
    id: d.id,
    code: d.code,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
  }));
}

export async function listAdminPrograms(
  tenantId: string,
  filter?: { search?: string; departmentId?: string; degreeLevel?: string; status?: string }
): Promise<CurriculumProgramDto[]> {
  const where: Record<string, unknown> = { tenantId };

  if (filter?.search) {
    where.OR = [
      { code: { contains: filter.search, mode: "insensitive" } },
      { nameTh: { contains: filter.search, mode: "insensitive" } },
      { nameEn: { contains: filter.search, mode: "insensitive" } },
      { degreeTitleTh: { contains: filter.search, mode: "insensitive" } },
      { degreeTitleEn: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  if (filter?.departmentId && filter.departmentId !== "ALL") {
    where.departmentId = filter.departmentId;
  }

  if (filter?.degreeLevel && filter.degreeLevel !== "ALL") {
    where.degreeLevel = filter.degreeLevel as DegreeLevel;
  }

  if (filter?.status && filter.status !== "ALL") {
    where.status = filter.status as ProgramStatus;
  }

  const items = await prisma.curriculumProgram.findMany({
    where,
    include: { department: true },
    orderBy: [{ orderIndex: "asc" }, { code: "asc" }],
  });

  return items.map(mapToDto);
}

export async function listPublicPrograms(
  tenantId: string,
  filter?: { search?: string; departmentId?: string; degreeLevel?: string }
): Promise<CurriculumProgramDto[]> {
  const where: Record<string, unknown> = {
    tenantId,
    status: "ACTIVE",
  };

  if (filter?.degreeLevel && filter.degreeLevel !== "ALL") {
    where.degreeLevel = filter.degreeLevel as DegreeLevel;
  }

  if (filter?.departmentId && filter.departmentId !== "ALL") {
    where.departmentId = filter.departmentId;
  }

  if (filter?.search) {
    where.OR = [
      { code: { contains: filter.search, mode: "insensitive" } },
      { nameTh: { contains: filter.search, mode: "insensitive" } },
      { nameEn: { contains: filter.search, mode: "insensitive" } },
      { degreeTitleTh: { contains: filter.search, mode: "insensitive" } },
      { degreeTitleEn: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const items = await prisma.curriculumProgram.findMany({
    where,
    include: { department: true },
    orderBy: [{ orderIndex: "asc" }, { code: "asc" }],
  });

  return items.map(mapToDto);
}

export async function getPublicProgramById(
  tenantId: string,
  id: string
): Promise<CurriculumProgramDto | null> {
  const item = await prisma.curriculumProgram.findFirst({
    where: { id, tenantId },
    include: { department: true },
  });
  return item ? mapToDto(item) : null;
}

export async function createProgram(
  tenantId: string,
  input: CreateProgramInput
): Promise<CurriculumProgramDto> {
  const created = await prisma.curriculumProgram.create({
    data: {
      tenantId,
      departmentId: input.departmentId || null,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      degreeTitleTh: input.degreeTitleTh,
      degreeTitleEn: input.degreeTitleEn,
      degreeAbbrTh: input.degreeAbbrTh,
      degreeAbbrEn: input.degreeAbbrEn,
      degreeLevel: input.degreeLevel as DegreeLevel,
      programPlan: input.programPlan as ProgramPlan,
      durationYears: input.durationYears,
      totalCredits: input.totalCredits,
      tuitionFeeSemester: input.tuitionFeeSemester != null ? input.tuitionFeeSemester : null,
      descriptionTh: input.descriptionTh || null,
      descriptionEn: input.descriptionEn || null,
      careerPaths: input.careerPaths ?? [],
      curriculumStructure: (input.curriculumStructure as object[]) ?? [],
      studyPlan: (input.studyPlan as object[]) ?? [],
      tqfFileUrl: input.tqfFileUrl || null,
      coverImageUrl: input.coverImageUrl || null,
      status: input.status as ProgramStatus,
      orderIndex: input.orderIndex,
    },
    include: { department: true },
  });

  return mapToDto(created);
}

export async function updateProgram(
  tenantId: string,
  input: UpdateProgramInput
): Promise<CurriculumProgramDto> {
  const updated = await prisma.curriculumProgram.update({
    where: { id: input.id, tenantId },
    data: {
      departmentId: input.departmentId || null,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      degreeTitleTh: input.degreeTitleTh,
      degreeTitleEn: input.degreeTitleEn,
      degreeAbbrTh: input.degreeAbbrTh,
      degreeAbbrEn: input.degreeAbbrEn,
      degreeLevel: input.degreeLevel as DegreeLevel,
      programPlan: input.programPlan as ProgramPlan,
      durationYears: input.durationYears,
      totalCredits: input.totalCredits,
      tuitionFeeSemester: input.tuitionFeeSemester != null ? input.tuitionFeeSemester : null,
      descriptionTh: input.descriptionTh || null,
      descriptionEn: input.descriptionEn || null,
      careerPaths: input.careerPaths ?? [],
      curriculumStructure: (input.curriculumStructure as object[]) ?? [],
      studyPlan: (input.studyPlan as object[]) ?? [],
      tqfFileUrl: input.tqfFileUrl || null,
      coverImageUrl: input.coverImageUrl || null,
      status: input.status as ProgramStatus,
      orderIndex: input.orderIndex,
    },
    include: { department: true },
  });

  return mapToDto(updated);
}

export async function toggleProgramStatus(
  tenantId: string,
  id: string,
  status: ProgramStatus
): Promise<CurriculumProgramDto> {
  const updated = await prisma.curriculumProgram.update({
    where: { id, tenantId },
    data: { status },
    include: { department: true },
  });
  return mapToDto(updated);
}

export async function deleteProgram(tenantId: string, id: string): Promise<void> {
  await prisma.curriculumProgram.delete({
    where: { id, tenantId },
  });
}
