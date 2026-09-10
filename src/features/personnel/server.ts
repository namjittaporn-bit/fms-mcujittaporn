import "server-only";

import { prisma } from "@/shared/lib/infra/prisma";
import {
  listPublicStaff,
  getPublicStaffById,
  listAdminStaff,
  listDepartments,
  type StaffProfileDto,
  type DepartmentDto,
} from "./_internal/services";
import { PERSONNEL_P, PERSONNEL_PERMISSIONS } from "./permissions";

export {
  listPublicStaff,
  getPublicStaffById,
  listAdminStaff,
  listDepartments,
  PERSONNEL_P,
  PERSONNEL_PERMISSIONS,
  type StaffProfileDto,
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

export async function getPortalStaff(
  filter?: { search?: string; departmentId?: string; onlyExecutives?: boolean },
): Promise<StaffProfileDto[]> {
  const tenantId = await getDefaultTenantId();
  if (!tenantId) return [];
  return listPublicStaff(tenantId, filter);
}

export async function getPortalStaffById(
  id: string,
): Promise<StaffProfileDto | null> {
  const tenantId = await getDefaultTenantId();
  if (!tenantId) return null;
  return getPublicStaffById(tenantId, id);
}

export async function getPortalDepartments(): Promise<DepartmentDto[]> {
  const tenantId = await getDefaultTenantId();
  if (!tenantId) return [];
  return listDepartments(tenantId);
}
