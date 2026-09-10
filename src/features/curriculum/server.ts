import "server-only";

import { prisma } from "@/shared/lib/infra/prisma";
import {
  listPublicPrograms,
  getPublicProgramById,
  listAdminPrograms,
  listDepartments,
  type CurriculumProgramDto,
  type DepartmentDto,
} from "./_internal/services";
import { CURRICULUM_P, CURRICULUM_PERMISSIONS } from "./permissions";

export {
  listPublicPrograms,
  getPublicProgramById,
  listAdminPrograms,
  listDepartments,
  CURRICULUM_P,
  CURRICULUM_PERMISSIONS,
  type CurriculumProgramDto,
  type DepartmentDto,
};

export async function getDefaultTenantId(): Promise<string> {
  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return tenant?.id ?? "";
}

export async function getPortalPrograms(
  filter?: { search?: string; departmentId?: string; degreeLevel?: string }
): Promise<CurriculumProgramDto[]> {
  const tenantId = await getDefaultTenantId();
  if (!tenantId) return [];
  return listPublicPrograms(tenantId, filter);
}

export async function getPortalProgramById(
  id: string
): Promise<CurriculumProgramDto | null> {
  const tenantId = await getDefaultTenantId();
  if (!tenantId) return null;
  return getPublicProgramById(tenantId, id);
}

export async function getPortalDepartments(): Promise<DepartmentDto[]> {
  const tenantId = await getDefaultTenantId();
  if (!tenantId) return [];
  return listDepartments(tenantId);
}
