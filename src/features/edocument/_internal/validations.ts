import { z } from "zod";

export const docTypeEnum = z.enum([
  "PROJECT_PROPOSAL",
  "OFFICIAL_TRAVEL",
  "PROCUREMENT_REQ",
  "GENERAL_REQUEST",
]);

export const docUrgencyEnum = z.enum([
  "NORMAL",
  "URGENT",
  "VERY_URGENT",
]);

export const docStatusEnum = z.enum([
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "REVISED_REQUESTED",
  "CANCELLED",
]);

export const approvalActionEnum = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "REVISED_REQUESTED",
  "SKIPPED",
]);

export const attachmentItemSchema = z.object({
  fileName: z.string().min(1),
  fileUrl: z.string().min(1),
  fileSize: z.number().optional(),
  fileType: z.string().optional(),
});

export const createDocumentSchema = z.object({
  title: z.string().min(1, "title_required").max(500),
  documentType: docTypeEnum.default("GENERAL_REQUEST"),
  urgency: docUrgencyEnum.default("NORMAL"),
  departmentId: z.string().uuid().optional().nullable(),
  content: z.string().min(1, "content_required"),
  amount: z.coerce.number().min(0).optional().nullable(),
  attachments: z.array(attachmentItemSchema).optional().default([]),
  submitImmediately: z.boolean().default(true),
});

export const updateDocumentSchema = createDocumentSchema.extend({
  id: z.string().uuid(),
});

export const reviewDocumentSchema = z.object({
  documentId: z.string().uuid(),
  stepId: z.string().uuid(),
  action: z.enum(["APPROVED", "REJECTED", "REVISED_REQUESTED"]),
  comment: z.string().optional(),
});

export const addCommentSchema = z.object({
  documentId: z.string().uuid(),
  message: z.string().min(1, "message_required"),
});

export type DocTypeType = z.infer<typeof docTypeEnum>;
export type DocUrgencyType = z.infer<typeof docUrgencyEnum>;
export type DocStatusType = z.infer<typeof docStatusEnum>;
export type ApprovalActionType = z.infer<typeof approvalActionEnum>;
export type AttachmentItem = z.infer<typeof attachmentItemSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type ReviewDocumentInput = z.infer<typeof reviewDocumentSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
