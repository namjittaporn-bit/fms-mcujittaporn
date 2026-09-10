"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { PERSONNEL_P } from "../permissions";
import {
  createStaffSchema,
  updateStaffSchema,
} from "./validations";
import {
  listAdminStaff,
  listDepartments,
  createStaff,
  updateStaff,
  deleteStaff,
  type StaffProfileDto,
  type DepartmentDto,
} from "./services";

export async function getAdminStaffAction(
  filter?: { search?: string; departmentId?: string; personnelType?: string },
): Promise<ActionResult<StaffProfileDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelRead);
    return listAdminStaff(ctx.tenantId, filter);
  });
}

export async function getDepartmentsAction(): Promise<ActionResult<DepartmentDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelRead);
    return listDepartments(ctx.tenantId);
  });
}

export async function createStaffAction(
  input: unknown,
): Promise<ActionResult<StaffProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelCreate);
    const locale = await getLocale();
    const parsed = createStaffSchema.parse(input, { error: zodErrorMap(locale) });
    const result = await createStaff(ctx.tenantId, parsed);
    revalidatePath("/admin/personnel");
    revalidatePath("/personnel");
    return result;
  });
}

export async function updateStaffAction(
  input: unknown,
): Promise<ActionResult<StaffProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelUpdate);
    const locale = await getLocale();
    const parsed = updateStaffSchema.parse(input, { error: zodErrorMap(locale) });
    const result = await updateStaff(ctx.tenantId, parsed);
    revalidatePath("/admin/personnel");
    revalidatePath("/personnel");
    return result;
  });
}

export async function deleteStaffAction(
  id: string,
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelDelete);
    await deleteStaff(ctx.tenantId, id);
    revalidatePath("/admin/personnel");
    revalidatePath("/personnel");
  });
}
