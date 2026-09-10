import { prisma } from "@/shared/lib/infra/prisma";
import type { CreateStaffInput, UpdateStaffInput, EducationItem } from "./validations";
import type { AcademicRank, AdminPosition, PersonnelType } from "@/generated/prisma";

export interface DepartmentDto {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
}

export interface StaffProfileDto {
  id: string;
  tenantId: string;
  departmentId: string | null;
  departmentNameTh: string | null;
  departmentNameEn: string | null;
  userId: string | null;
  prefixTh: string;
  prefixEn: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  fullNameTh: string;
  fullNameEn: string;
  academicRank: string;
  adminPosition: string;
  personnelType: string;
  email: string;
  phone: string | null;
  roomNumber: string | null;
  avatarUrl: string | null;
  educationHistory: EducationItem[];
  expertise: string[];
  researchInterests: string | null;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function computeFullName(item: {
  prefixTh: string;
  prefixEn: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  academicRank: string;
}) {
  let rankTh = "";
  let rankEn = "";
  if (item.academicRank === "PROFESSOR") { rankTh = "ศ. "; rankEn = "Prof. "; }
  else if (item.academicRank === "ASSOC_PROF") { rankTh = "รศ. "; rankEn = "Assoc. Prof. "; }
  else if (item.academicRank === "ASST_PROF") { rankTh = "ผศ. "; rankEn = "Asst. Prof. "; }
  else if (item.academicRank === "LECTURER") { rankTh = "อ. "; rankEn = "Lect. "; }

  const fullTh = `${rankTh}${item.prefixTh ? item.prefixTh + " " : ""}${item.firstNameTh} ${item.lastNameTh}`.trim();
  const fullEn = `${rankEn}${item.prefixEn ? item.prefixEn + " " : ""}${item.firstNameEn} ${item.lastNameEn}`.trim();

  return { fullTh, fullEn };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToDto(item: any): StaffProfileDto {
  const { fullTh, fullEn } = computeFullName(item);
  return {
    id: item.id,
    tenantId: item.tenantId,
    departmentId: item.departmentId,
    departmentNameTh: item.department?.nameTh ?? null,
    departmentNameEn: item.department?.nameEn ?? null,
    userId: item.userId,
    prefixTh: item.prefixTh,
    prefixEn: item.prefixEn,
    firstNameTh: item.firstNameTh,
    lastNameTh: item.lastNameTh,
    firstNameEn: item.firstNameEn,
    lastNameEn: item.lastNameEn,
    fullNameTh: fullTh,
    fullNameEn: fullEn,
    academicRank: item.academicRank,
    adminPosition: item.adminPosition,
    personnelType: item.personnelType,
    email: item.email,
    phone: item.phone,
    roomNumber: item.roomNumber,
    avatarUrl: item.avatarUrl,
    educationHistory: (item.educationHistory as EducationItem[]) ?? [],
    expertise: (item.expertise as string[]) ?? [],
    researchInterests: item.researchInterests,
    orderIndex: item.orderIndex,
    isActive: item.isActive,
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

export async function listAdminStaff(
  tenantId: string,
  filter?: { search?: string; departmentId?: string; personnelType?: string },
): Promise<StaffProfileDto[]> {
  const where: Record<string, unknown> = { tenantId };

  if (filter?.search) {
    where.OR = [
      { firstNameTh: { contains: filter.search, mode: "insensitive" } },
      { lastNameTh: { contains: filter.search, mode: "insensitive" } },
      { firstNameEn: { contains: filter.search, mode: "insensitive" } },
      { lastNameEn: { contains: filter.search, mode: "insensitive" } },
      { email: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  if (filter?.departmentId && filter.departmentId !== "ALL") {
    where.departmentId = filter.departmentId;
  }

  if (filter?.personnelType && filter.personnelType !== "ALL") {
    where.personnelType = filter.personnelType as PersonnelType;
  }

  const items = await prisma.staffProfile.findMany({
    where,
    include: { department: true },
    orderBy: [{ orderIndex: "asc" }, { firstNameTh: "asc" }],
  });

  return items.map(mapToDto);
}

export async function listPublicStaff(
  tenantId: string,
  filter?: { search?: string; departmentId?: string; onlyExecutives?: boolean },
): Promise<StaffProfileDto[]> {
  const where: Record<string, unknown> = {
    tenantId,
    isActive: true,
  };

  if (filter?.onlyExecutives) {
    where.adminPosition = { not: "NONE" };
  }

  if (filter?.departmentId && filter.departmentId !== "ALL") {
    where.departmentId = filter.departmentId;
  }

  if (filter?.search) {
    where.OR = [
      { firstNameTh: { contains: filter.search, mode: "insensitive" } },
      { lastNameTh: { contains: filter.search, mode: "insensitive" } },
      { firstNameEn: { contains: filter.search, mode: "insensitive" } },
      { lastNameEn: { contains: filter.search, mode: "insensitive" } },
      { researchInterests: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const items = await prisma.staffProfile.findMany({
    where,
    include: { department: true },
    orderBy: [{ orderIndex: "asc" }, { firstNameTh: "asc" }],
  });

  return items.map(mapToDto);
}

export async function getPublicStaffById(
  tenantId: string,
  id: string,
): Promise<StaffProfileDto | null> {
  const item = await prisma.staffProfile.findFirst({
    where: { id, tenantId, isActive: true },
    include: { department: true },
  });
  return item ? mapToDto(item) : null;
}

export async function createStaff(
  tenantId: string,
  input: CreateStaffInput,
): Promise<StaffProfileDto> {
  const created = await prisma.staffProfile.create({
    data: {
      tenantId,
      departmentId: input.departmentId || null,
      userId: input.userId || null,
      prefixTh: input.prefixTh,
      prefixEn: input.prefixEn,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn,
      lastNameEn: input.lastNameEn,
      academicRank: input.academicRank as AcademicRank,
      adminPosition: input.adminPosition as AdminPosition,
      personnelType: input.personnelType as PersonnelType,
      email: input.email,
      phone: input.phone || null,
      roomNumber: input.roomNumber || null,
      avatarUrl: input.avatarUrl || null,
      educationHistory: (input.educationHistory as object[]) ?? [],
      expertise: input.expertise ?? [],
      researchInterests: input.researchInterests || null,
      orderIndex: input.orderIndex,
      isActive: input.isActive,
    },
    include: { department: true },
  });

  return mapToDto(created);
}

export async function updateStaff(
  tenantId: string,
  input: UpdateStaffInput,
): Promise<StaffProfileDto> {
  const updated = await prisma.staffProfile.update({
    where: { id: input.id, tenantId },
    data: {
      departmentId: input.departmentId || null,
      userId: input.userId || null,
      prefixTh: input.prefixTh,
      prefixEn: input.prefixEn,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn,
      lastNameEn: input.lastNameEn,
      academicRank: input.academicRank as AcademicRank,
      adminPosition: input.adminPosition as AdminPosition,
      personnelType: input.personnelType as PersonnelType,
      email: input.email,
      phone: input.phone || null,
      roomNumber: input.roomNumber || null,
      avatarUrl: input.avatarUrl || null,
      educationHistory: (input.educationHistory as object[]) ?? [],
      expertise: input.expertise ?? [],
      researchInterests: input.researchInterests || null,
      orderIndex: input.orderIndex,
      isActive: input.isActive,
    },
    include: { department: true },
  });

  return mapToDto(updated);
}

export async function deleteStaff(tenantId: string, id: string): Promise<void> {
  await prisma.staffProfile.delete({
    where: { id, tenantId },
  });
}
