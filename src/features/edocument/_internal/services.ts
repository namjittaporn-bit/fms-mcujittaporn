import { prisma } from "@/shared/lib/infra/prisma";
import { writeAudit } from "@/features/identity/server";
import type {
  CreateDocumentInput,
  ReviewDocumentInput,
  AddCommentInput,
  AttachmentItem,
} from "./validations";
import type { DocType, DocUrgency, DocStatus, ApprovalAction } from "@/generated/prisma";

export interface DepartmentDto {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
}

export interface EDocumentApprovalDto {
  id: string;
  documentId: string;
  stepOrder: number;
  stepNameTh: string;
  stepNameEn: string;
  status: string;
  comment: string | null;
  approverRole: string | null;
  approverUserId: string | null;
  decidedAt: string | null;
  decidedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EDocumentAttachmentDto {
  id: string;
  documentId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  fileType: string | null;
  createdAt: string;
}

export interface EDocumentCommentDto {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  createdAt: string;
}

export interface EDocumentDto {
  id: string;
  tenantId: string;
  departmentId: string | null;
  departmentNameTh: string | null;
  departmentNameEn: string | null;
  documentNumber: string;
  title: string;
  documentType: string;
  urgency: string;
  content: string;
  amount: number | null;
  submitterId: string;
  submitterName: string;
  submitterEmail: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  createdAt: string;
  updatedAt: string;
  approvals: EDocumentApprovalDto[];
  attachments: EDocumentAttachmentDto[];
  comments: EDocumentCommentDto[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToDto(item: any): EDocumentDto {
  return {
    id: item.id,
    tenantId: item.tenantId,
    departmentId: item.departmentId,
    departmentNameTh: item.department?.nameTh ?? null,
    departmentNameEn: item.department?.nameEn ?? null,
    documentNumber: item.documentNumber,
    title: item.title,
    documentType: item.documentType,
    urgency: item.urgency,
    content: item.content,
    amount: item.amount ? Number(item.amount) : null,
    submitterId: item.submitterId,
    submitterName: item.submitter?.name ?? "Unknown",
    submitterEmail: item.submitter?.email ?? "",
    status: item.status,
    currentStep: item.currentStep,
    totalSteps: item.totalSteps,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    approvals: (item.approvals ?? []).map((a: any) => ({
      id: a.id,
      documentId: a.documentId,
      stepOrder: a.stepOrder,
      stepNameTh: a.stepNameTh,
      stepNameEn: a.stepNameEn,
      status: a.status,
      comment: a.comment,
      approverRole: a.approverRole,
      approverUserId: a.approverUserId,
      decidedAt: a.decidedAt ? a.decidedAt.toISOString() : null,
      decidedByUserId: a.decidedByUserId,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attachments: (item.attachments ?? []).map((att: any) => ({
      id: att.id,
      documentId: att.documentId,
      fileName: att.fileName,
      fileUrl: att.fileUrl,
      fileSize: att.fileSize,
      fileType: att.fileType,
      createdAt: att.createdAt.toISOString(),
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    comments: (item.comments ?? []).map((c: any) => ({
      id: c.id,
      documentId: c.documentId,
      userId: c.userId,
      userName: c.user?.name ?? "Staff",
      userEmail: c.user?.email ?? "",
      message: c.message,
      createdAt: c.createdAt.toISOString(),
    })),
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

export async function listUserDocuments(
  tenantId: string,
  userId: string,
  filter?: { search?: string; status?: string; docType?: string }
): Promise<EDocumentDto[]> {
  const where: Record<string, unknown> = {
    tenantId,
    submitterId: userId,
  };

  if (filter?.status && filter.status !== "ALL") {
    where.status = filter.status as DocStatus;
  }

  if (filter?.docType && filter.docType !== "ALL") {
    where.documentType = filter.docType as DocType;
  }

  if (filter?.search) {
    where.OR = [
      { documentNumber: { contains: filter.search, mode: "insensitive" } },
      { title: { contains: filter.search, mode: "insensitive" } },
      { content: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const items = await prisma.eDocument.findMany({
    where,
    include: {
      department: true,
      submitter: true,
      approvals: { orderBy: { stepOrder: "asc" } },
      attachments: true,
      comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return items.map(mapToDto);
}

export async function listPendingApprovals(
  tenantId: string,
  userId: string,
  userRoles: string[],
  filter?: { search?: string }
): Promise<EDocumentDto[]> {
  const isSuperAdmin = userRoles.includes("SUPER_ADMIN");

  const where: Record<string, unknown> = {
    tenantId,
    status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
  };

  if (filter?.search) {
    where.OR = [
      { documentNumber: { contains: filter.search, mode: "insensitive" } },
      { title: { contains: filter.search, mode: "insensitive" } },
      { submitter: { name: { contains: filter.search, mode: "insensitive" } } },
    ];
  }

  const items = await prisma.eDocument.findMany({
    where,
    include: {
      department: true,
      submitter: true,
      approvals: { orderBy: { stepOrder: "asc" } },
      attachments: true,
      comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
    },
    orderBy: [{ urgency: "desc" }, { createdAt: "asc" }],
  });

  if (isSuperAdmin) {
    return items.map(mapToDto);
  }

  // Filter items where the current step corresponds to this user or role
  const pendingForUser = items.filter((doc) => {
    const currentStepDef = doc.approvals.find((a) => a.stepOrder === doc.currentStep);
    if (!currentStepDef) return false;
    if (currentStepDef.status !== "PENDING") return false;
    if (currentStepDef.approverUserId === userId) return true;
    if (currentStepDef.approverRole && userRoles.includes(currentStepDef.approverRole)) return true;
    // Default staff with permission can review if no specific role is assigned
    return userRoles.includes("STAFF");
  });

  return pendingForUser.map(mapToDto);
}

export async function listAllDocuments(
  tenantId: string,
  filter?: { search?: string; status?: string; docType?: string; departmentId?: string }
): Promise<EDocumentDto[]> {
  const where: Record<string, unknown> = { tenantId };

  if (filter?.status && filter.status !== "ALL") {
    where.status = filter.status as DocStatus;
  }

  if (filter?.docType && filter.docType !== "ALL") {
    where.documentType = filter.docType as DocType;
  }

  if (filter?.departmentId && filter.departmentId !== "ALL") {
    where.departmentId = filter.departmentId;
  }

  if (filter?.search) {
    where.OR = [
      { documentNumber: { contains: filter.search, mode: "insensitive" } },
      { title: { contains: filter.search, mode: "insensitive" } },
      { submitter: { name: { contains: filter.search, mode: "insensitive" } } },
    ];
  }

  const items = await prisma.eDocument.findMany({
    where,
    include: {
      department: true,
      submitter: true,
      approvals: { orderBy: { stepOrder: "asc" } },
      attachments: true,
      comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return items.map(mapToDto);
}

export async function getDocumentById(
  tenantId: string,
  id: string
): Promise<EDocumentDto | null> {
  const item = await prisma.eDocument.findFirst({
    where: { id, tenantId },
    include: {
      department: true,
      submitter: true,
      approvals: { orderBy: { stepOrder: "asc" } },
      attachments: true,
      comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
    },
  });

  return item ? mapToDto(item) : null;
}

function generateDefaultApprovalSteps(docType: DocType): Array<{
  stepOrder: number;
  stepNameTh: string;
  stepNameEn: string;
  approverRole: string;
}> {
  switch (docType) {
    case "PROJECT_PROPOSAL":
      return [
        { stepOrder: 1, stepNameTh: "หัวหน้าภาควิชา / สังกัด", stepNameEn: "Department Head", approverRole: "HEAD_OF_DEPT" },
        { stepOrder: 2, stepNameTh: "รองคณบดีฝ่ายวิชาการและวิจัย", stepNameEn: "Vice Dean (Academic & Research)", approverRole: "VICE_DEAN" },
        { stepOrder: 3, stepNameTh: "คณบดีคณะเทคโนโลยีและการจัดการ", stepNameEn: "Dean", approverRole: "DEAN" },
      ];
    case "OFFICIAL_TRAVEL":
      return [
        { stepOrder: 1, stepNameTh: "หัวหน้าภาควิชา / สังกัด", stepNameEn: "Department Head", approverRole: "HEAD_OF_DEPT" },
        { stepOrder: 2, stepNameTh: "รองคณบดีฝ่ายบริหาร", stepNameEn: "Vice Dean (Administration)", approverRole: "VICE_DEAN" },
        { stepOrder: 3, stepNameTh: "คณบดีคณะเทคโนโลยีและการจัดการ", stepNameEn: "Dean", approverRole: "DEAN" },
      ];
    case "PROCUREMENT_REQ":
      return [
        { stepOrder: 1, stepNameTh: "หัวหน้าภาควิชา / สังกัด", stepNameEn: "Department Head", approverRole: "HEAD_OF_DEPT" },
        { stepOrder: 2, stepNameTh: "หัวหน้างานพัสดุและคลัง", stepNameEn: "Head of Procurement", approverRole: "SECRETARY" },
        { stepOrder: 3, stepNameTh: "คณบดีคณะเทคโนโลยีและการจัดการ", stepNameEn: "Dean", approverRole: "DEAN" },
      ];
    case "GENERAL_REQUEST":
    default:
      return [
        { stepOrder: 1, stepNameTh: "หัวหน้าภาควิชา / สังกัด", stepNameEn: "Department Head", approverRole: "HEAD_OF_DEPT" },
        { stepOrder: 2, stepNameTh: "รองคณบดี", stepNameEn: "Vice Dean", approverRole: "VICE_DEAN" },
      ];
  }
}

export async function createDocument(
  tenantId: string,
  userId: string,
  input: CreateDocumentInput
): Promise<EDocumentDto> {
  const currentYear = new Date().getFullYear();
  const countThisYear = await prisma.eDocument.count({
    where: {
      tenantId,
      createdAt: {
        gte: new Date(currentYear, 0, 1),
        lt: new Date(currentYear + 1, 0, 1),
      },
    },
  });

  const nextSeq = String(countThisYear + 1).padStart(4, "0");
  const docNumber = `DOC-${currentYear}-${nextSeq}`;

  const stepsDef = generateDefaultApprovalSteps(input.documentType as DocType);
  const status: DocStatus = input.submitImmediately ? "SUBMITTED" : "DRAFT";

  const created = await prisma.eDocument.create({
    data: {
      tenantId,
      departmentId: input.departmentId || null,
      documentNumber: docNumber,
      title: input.title,
      documentType: input.documentType as DocType,
      urgency: input.urgency as DocUrgency,
      content: input.content,
      amount: input.amount != null ? input.amount : null,
      submitterId: userId,
      status,
      currentStep: 1,
      totalSteps: stepsDef.length,
      approvals: {
        create: stepsDef.map((s) => ({
          stepOrder: s.stepOrder,
          stepNameTh: s.stepNameTh,
          stepNameEn: s.stepNameEn,
          status: "PENDING" as ApprovalAction,
          approverRole: s.approverRole,
        })),
      },
      attachments: {
        create: input.attachments.map((att: AttachmentItem) => ({
          fileName: att.fileName,
          fileUrl: att.fileUrl,
          fileSize: att.fileSize ?? null,
          fileType: att.fileType ?? null,
        })),
      },
    },
    include: {
      department: true,
      submitter: true,
      approvals: { orderBy: { stepOrder: "asc" } },
      attachments: true,
      comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
    },
  });

  await writeAudit({
    tenantId,
    actorId: userId,
    action: "edocument.create",
    entity: "e_document",
    entityId: created.id,
    after: { docNumber, title: created.title, status },
  });

  return mapToDto(created);
}

export async function processApproval(
  tenantId: string,
  userId: string,
  input: ReviewDocumentInput
): Promise<EDocumentDto> {
  const doc = await prisma.eDocument.findFirst({
    where: { id: input.documentId, tenantId },
    include: { approvals: { orderBy: { stepOrder: "asc" } } },
  });

  if (!doc) {
    throw new Error("Document not found");
  }

  const step = doc.approvals.find((a) => a.id === input.stepId);
  if (!step) {
    throw new Error("Approval step not found");
  }

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    // 1. Update the approval step
    await tx.eDocumentApproval.update({
      where: { id: step.id },
      data: {
        status: input.action as ApprovalAction,
        comment: input.comment || null,
        decidedAt: now,
        decidedByUserId: userId,
      },
    });

    // 2. Determine new document status & step progression
    let newStatus: DocStatus = doc.status;
    let nextStepOrder = doc.currentStep;

    if (input.action === "APPROVED") {
      if (doc.currentStep >= doc.totalSteps) {
        newStatus = "APPROVED";
      } else {
        nextStepOrder = doc.currentStep + 1;
        newStatus = "UNDER_REVIEW";
      }
    } else if (input.action === "REJECTED") {
      newStatus = "REJECTED";
    } else if (input.action === "REVISED_REQUESTED") {
      newStatus = "REVISED_REQUESTED";
    }

    await tx.eDocument.update({
      where: { id: doc.id },
      data: {
        status: newStatus,
        currentStep: nextStepOrder,
      },
    });

    // 3. Write Audit Log
    await writeAudit(
      {
        tenantId,
        actorId: userId,
        action: `edocument.${input.action.toLowerCase()}`,
        entity: "e_document",
        entityId: doc.id,
        before: { status: doc.status, currentStep: doc.currentStep },
        after: {
          status: newStatus,
          currentStep: nextStepOrder,
          stepOrder: step.stepOrder,
          comment: input.comment,
        },
      },
      tx
    );
  });

  const updated = await getDocumentById(tenantId, doc.id);
  if (!updated) throw new Error("Failed to load updated document");
  return updated;
}

export async function addDocumentComment(
  tenantId: string,
  userId: string,
  input: AddCommentInput
): Promise<EDocumentCommentDto> {
  const doc = await prisma.eDocument.findFirst({
    where: { id: input.documentId, tenantId },
  });
  if (!doc) throw new Error("Document not found");

  const created = await prisma.eDocumentComment.create({
    data: {
      documentId: input.documentId,
      userId,
      message: input.message,
    },
    include: { user: true },
  });

  return {
    id: created.id,
    documentId: created.documentId,
    userId: created.userId,
    userName: created.user.name,
    userEmail: created.user.email,
    message: created.message,
    createdAt: created.createdAt.toISOString(),
  };
}

export async function deleteDocument(
  tenantId: string,
  userId: string,
  id: string
): Promise<void> {
  const doc = await prisma.eDocument.findFirst({
    where: { id, tenantId },
  });
  if (!doc) return;

  await prisma.$transaction(async (tx) => {
    await tx.eDocument.delete({ where: { id } });
    await writeAudit(
      {
        tenantId,
        actorId: userId,
        action: "edocument.delete",
        entity: "e_document",
        entityId: id,
        before: { documentNumber: doc.documentNumber, title: doc.title },
      },
      tx
    );
  });
}
