export { EDOCUMENT_P, EDOCUMENT_PERMISSIONS } from "./permissions";
export type {
  DocTypeType,
  DocUrgencyType,
  DocStatusType,
  ApprovalActionType,
  AttachmentItem,
  CreateDocumentInput,
  UpdateDocumentInput,
  ReviewDocumentInput,
  AddCommentInput,
} from "./_internal/validations";
export type {
  EDocumentDto,
  EDocumentApprovalDto,
  EDocumentAttachmentDto,
  EDocumentCommentDto,
  DepartmentDto,
} from "./_internal/services";
export {
  getMyDocumentsAction,
  getPendingApprovalsAction,
  getAllDocumentsAction,
  getDocumentDetailAction,
  getDepartmentsAction,
  createDocumentAction,
  reviewDocumentAction,
  addDocumentCommentAction,
  deleteDocumentAction,
} from "./_internal/actions";
