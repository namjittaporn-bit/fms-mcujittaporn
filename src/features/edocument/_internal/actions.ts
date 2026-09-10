"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { EDOCUMENT_P } from "../permissions";
import {
  createDocumentSchema,
  reviewDocumentSchema,
  addCommentSchema,
} from "./validations";
import {
  listUserDocuments,
  listPendingApprovals,
  listAllDocuments,
  getDocumentById,
  createDocument,
  processApproval,
  addDocumentComment,
  deleteDocument,
  listDepartments,
  type EDocumentDto,
  type EDocumentCommentDto,
  type DepartmentDto,
} from "./services";

export async function getMyDocumentsAction(
  filter?: { search?: string; status?: string; docType?: string }
): Promise<ActionResult<EDocumentDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(EDOCUMENT_P.edocumentRead);
    return listUserDocuments(ctx.tenantId, ctx.userId, filter);
  });
}

export async function getPendingApprovalsAction(
  filter?: { search?: string }
): Promise<ActionResult<EDocumentDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(EDOCUMENT_P.edocumentApprove);
    const roleCodes = ctx.roles.map((r) => r.code);
    if (ctx.isSuperAdmin) roleCodes.push("SUPER_ADMIN");
    return listPendingApprovals(ctx.tenantId, ctx.userId, roleCodes, filter);
  });
}

export async function getAllDocumentsAction(
  filter?: { search?: string; status?: string; docType?: string; departmentId?: string }
): Promise<ActionResult<EDocumentDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(EDOCUMENT_P.edocumentManage);
    return listAllDocuments(ctx.tenantId, filter);
  });
}

export async function getDocumentDetailAction(
  id: string
): Promise<ActionResult<EDocumentDto | null>> {
  return runAction(async () => {
    const ctx = await requirePermission(EDOCUMENT_P.edocumentRead);
    return getDocumentById(ctx.tenantId, id);
  });
}

export async function getDepartmentsAction(): Promise<ActionResult<DepartmentDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(EDOCUMENT_P.edocumentRead);
    return listDepartments(ctx.tenantId);
  });
}

export async function createDocumentAction(
  input: unknown
): Promise<ActionResult<EDocumentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(EDOCUMENT_P.edocumentCreate);
    const locale = await getLocale();
    const parsed = createDocumentSchema.parse(input, { error: zodErrorMap(locale) });
    const result = await createDocument(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/admin/edocuments");
    return result;
  });
}

export async function reviewDocumentAction(
  input: unknown
): Promise<ActionResult<EDocumentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(EDOCUMENT_P.edocumentApprove);
    const locale = await getLocale();
    const parsed = reviewDocumentSchema.parse(input, { error: zodErrorMap(locale) });
    const result = await processApproval(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/admin/edocuments");
    return result;
  });
}

export async function addDocumentCommentAction(
  input: unknown
): Promise<ActionResult<EDocumentCommentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(EDOCUMENT_P.edocumentRead);
    const locale = await getLocale();
    const parsed = addCommentSchema.parse(input, { error: zodErrorMap(locale) });
    const result = await addDocumentComment(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/admin/edocuments");
    return result;
  });
}

export async function deleteDocumentAction(
  id: string
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(EDOCUMENT_P.edocumentDelete);
    await deleteDocument(ctx.tenantId, ctx.userId, id);
    revalidatePath("/admin/edocuments");
  });
}
