"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { CURRICULUM_P } from "../permissions";
import {
  createProgramSchema,
  updateProgramSchema,
  toggleProgramStatusSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  toggleDepartmentStatusSchema,
} from "./validations";
import {
  listAdminPrograms,
  listDepartments,
  listAdminDepartments,
  createProgram,
  updateProgram,
  deleteProgram,
  toggleProgramStatus,
  createDepartment,
  updateDepartment,
  toggleDepartmentStatus,
  deleteDepartment,
  type CurriculumProgramDto,
  type DepartmentDto,
} from "./services";

export async function getAdminProgramsAction(
  filter?: { search?: string; departmentId?: string; degreeLevel?: string; status?: string }
): Promise<ActionResult<CurriculumProgramDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
    return listAdminPrograms(ctx.tenantId, filter);
  });
}

export async function getDepartmentsAction(): Promise<ActionResult<DepartmentDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
    return listDepartments(ctx.tenantId);
  });
}

export async function createProgramAction(
  input: unknown
): Promise<ActionResult<CurriculumProgramDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumCreate);
    const locale = await getLocale();
    const parsed = createProgramSchema.parse(input, { error: zodErrorMap(locale) });
    const result = await createProgram(ctx.tenantId, parsed);
    revalidatePath("/admin/curriculum");
    revalidatePath("/curriculum");
    return result;
  });
}

export async function updateProgramAction(
  input: unknown
): Promise<ActionResult<CurriculumProgramDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumUpdate);
    const locale = await getLocale();
    const parsed = updateProgramSchema.parse(input, { error: zodErrorMap(locale) });
    const result = await updateProgram(ctx.tenantId, parsed);
    revalidatePath("/admin/curriculum");
    revalidatePath("/curriculum");
    return result;
  });
}

export async function deleteProgramAction(
  id: string
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumDelete);
    await deleteProgram(ctx.tenantId, id);
    revalidatePath("/admin/curriculum");
    revalidatePath("/curriculum");
  });
}

export async function toggleProgramStatusAction(
  input: unknown
): Promise<ActionResult<CurriculumProgramDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumUpdate);
    const locale = await getLocale();
    const parsed = toggleProgramStatusSchema.parse(input, { error: zodErrorMap(locale) });
    const result = await toggleProgramStatus(ctx.tenantId, parsed.id, parsed.status);
    revalidatePath("/admin/curriculum");
    revalidatePath("/curriculum");
    return result;
  });
}

export async function listAdminDepartmentsAction(): Promise<ActionResult<DepartmentDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
    return listAdminDepartments(ctx.tenantId);
  });
}

export async function createDepartmentAction(
  input: unknown
): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumCreate);
    const locale = await getLocale();
    const parsed = createDepartmentSchema.parse(input, { error: zodErrorMap(locale) });
    const result = await createDepartment(ctx.tenantId, parsed);
    revalidatePath("/admin/curriculum");
    revalidatePath("/curriculum");
    return result;
  });
}

export async function updateDepartmentAction(
  input: unknown
): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumUpdate);
    const locale = await getLocale();
    const parsed = updateDepartmentSchema.parse(input, { error: zodErrorMap(locale) });
    const result = await updateDepartment(ctx.tenantId, parsed);
    revalidatePath("/admin/curriculum");
    revalidatePath("/curriculum");
    return result;
  });
}

export async function toggleDepartmentStatusAction(
  input: unknown
): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumUpdate);
    const locale = await getLocale();
    const parsed = toggleDepartmentStatusSchema.parse(input, { error: zodErrorMap(locale) });
    const result = await toggleDepartmentStatus(ctx.tenantId, parsed.id, parsed.isActive);
    revalidatePath("/admin/curriculum");
    revalidatePath("/curriculum");
    return result;
  });
}

export async function deleteDepartmentAction(
  id: string
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumDelete);
    await deleteDepartment(ctx.tenantId, id);
    revalidatePath("/admin/curriculum");
    revalidatePath("/curriculum");
  });
}
