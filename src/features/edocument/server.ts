import "server-only";

import {
  listUserDocuments,
  listPendingApprovals,
  listAllDocuments,
  getDocumentById,
  listDepartments,
  type EDocumentDto,
  type EDocumentApprovalDto,
  type EDocumentAttachmentDto,
  type EDocumentCommentDto,
  type DepartmentDto,
} from "./_internal/services";
import { EDOCUMENT_P, EDOCUMENT_PERMISSIONS } from "./permissions";

export {
  listUserDocuments,
  listPendingApprovals,
  listAllDocuments,
  getDocumentById,
  listDepartments,
  EDOCUMENT_P,
  EDOCUMENT_PERMISSIONS,
  type EDocumentDto,
  type EDocumentApprovalDto,
  type EDocumentAttachmentDto,
  type EDocumentCommentDto,
  type DepartmentDto,
};
