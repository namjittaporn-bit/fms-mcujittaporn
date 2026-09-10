export const messages = {
  // RBAC Roles & Permissions labels
  "roles.module.edocument": { th: "สารบรรณและอนุมัติคำร้อง", en: "E-Documents & Approvals" },
  "perm.edocument:read": { th: "ดูรายการคำร้อง", en: "View requests" },
  "perm.edocument:create": { th: "ยื่นคำร้องใหม่", en: "Create request" },
  "perm.edocument:update": { th: "แก้ไขข้อมูลคำร้อง", en: "Update request" },
  "perm.edocument:delete": { th: "ลบคำร้อง", en: "Delete request" },
  "perm.edocument:approve": { th: "พิจารณาและอนุมัติคำร้อง", en: "Review and approve requests" },
  "perm.edocument:manage": { th: "บริหารจัดการคำร้องทั้งหมด", en: "Manage all documents" },

  // General & Navigation
  "edocument.title": { th: "ระบบสารบรรณและอนุมัติคำร้อง", en: "E-Document & Approval System" },
  "edocument.subtitle": { th: "ยื่นและติดตามคำร้องอิเล็กทรอนิกส์ พร้อมระบบพิจารณาอนุมัติตามลำดับขั้น", en: "Submit and track electronic requests with multi-step approval workflow." },
  "edocument.searchPlaceholder": { th: "ค้นหาเลขที่เอกสาร, หัวข้อคำร้อง, หรือชื่อผู้ยื่น...", en: "Search document no., title, or submitter..." },

  // Navigation Tabs
  "edocument.tab.myRequests": { th: "คำร้องของฉัน", en: "My Requests" },
  "edocument.tab.pendingApproval": { th: "รอฉันพิจารณา", en: "Pending My Approval" },
  "edocument.tab.allDocuments": { th: "คำร้องทั้งหมด", en: "All Documents" },

  // Document Types
  "edocument.type.PROJECT_PROPOSAL": { th: "ขออนุมัติจัดโครงการ / กิจกรรม", en: "Project / Event Proposal" },
  "edocument.type.OFFICIAL_TRAVEL": { th: "ขออนุมัติไปราชการ / ประชุมสัมมนา", en: "Official Travel & Conference" },
  "edocument.type.PROCUREMENT_REQ": { th: "ขอจัดซื้อจัดจ้าง / จัดหาพัสดุ", en: "Procurement Requisition" },
  "edocument.type.GENERAL_REQUEST": { th: "คำร้องทั่วไป / บันทึกข้อความ", en: "General Request / Memo" },

  // Urgency Levels
  "edocument.urgency.NORMAL": { th: "ปกติ", en: "Normal" },
  "edocument.urgency.URGENT": { th: "ด่วน", en: "Urgent" },
  "edocument.urgency.VERY_URGENT": { th: "ด่วนที่สุด", en: "Very Urgent" },

  // Document Statuses
  "edocument.status.DRAFT": { th: "แบบร่าง", en: "Draft" },
  "edocument.status.SUBMITTED": { th: "ยื่นคำร้องแล้ว", en: "Submitted" },
  "edocument.status.UNDER_REVIEW": { th: "อยู่ระหว่างพิจารณา", en: "Under Review" },
  "edocument.status.APPROVED": { th: "อนุมัติเรียบร้อย", en: "Approved" },
  "edocument.status.REJECTED": { th: "ไม่อนุมัติ", en: "Rejected" },
  "edocument.status.REVISED_REQUESTED": { th: "ส่งกลับให้แก้ไข", en: "Changes Requested" },
  "edocument.status.CANCELLED": { th: "ยกเลิกคำร้อง", en: "Cancelled" },

  // Approval Step Statuses
  "edocument.step.PENDING": { th: "รอพิจารณา", en: "Pending" },
  "edocument.step.APPROVED": { th: "อนุมัติแล้ว", en: "Approved" },
  "edocument.step.REJECTED": { th: "ไม่อนุมัติ", en: "Rejected" },
  "edocument.step.REVISED_REQUESTED": { th: "ส่งกลับแก้ไข", en: "Changes Requested" },
  "edocument.step.SKIPPED": { th: "ข้ามขั้นตอน", en: "Skipped" },

  // Form & Table Fields
  "edocument.field.docNumber": { th: "เลขที่คำร้อง", en: "Document No." },
  "edocument.field.title": { th: "หัวข้อคำร้อง", en: "Title / Subject" },
  "edocument.field.type": { th: "ประเภทเอกสาร", en: "Document Type" },
  "edocument.field.urgency": { th: "ระดับความเร่งด่วน", en: "Urgency" },
  "edocument.field.submitter": { th: "ผู้ยื่นคำร้อง", en: "Submitter" },
  "edocument.field.department": { th: "ภาควิชา / สังกัด", en: "Department" },
  "edocument.field.amount": { th: "งบประมาณที่ขออนุมัติ (บาท)", en: "Requested Budget (THB)" },
  "edocument.field.content": { th: "วัตถุประสงค์และรายละเอียด", en: "Purpose & Description" },
  "edocument.field.status": { th: "สถานะคำร้อง", en: "Status" },
  "edocument.field.currentStep": { th: "ขั้นตอนปัจจุบัน", en: "Current Step" },
  "edocument.field.createdAt": { th: "วันที่ยื่น", en: "Submitted Date" },
  "edocument.field.attachments": { th: "เอกสารแนบประกอบ", en: "Attachments" },
  "edocument.field.attachmentUrl": { th: "ลิงก์ไฟล์เอกสารแนบ (URL)", en: "Attachment URL" },
  "edocument.field.attachmentName": { th: "ชื่อไฟล์เอกสารแนบ", en: "Attachment File Name" },
  "edocument.field.comment": { th: "ความเห็นประกอบการพิจารณา", en: "Review Comment" },

  // Detail Modal & Stepper
  "edocument.detail.title": { th: "รายละเอียดและขั้นตอนการพิจารณาคำร้อง", en: "Request Details & Approval Workflow" },
  "edocument.detail.workflowProgress": { th: "เส้นทางการพิจารณาคำร้อง (Approval Routing)", en: "Approval Routing Progress" },
  "edocument.detail.step": { th: "ขั้นตอนที่", en: "Step" },
  "edocument.detail.approver": { th: "ผู้พิจารณา", en: "Approver" },
  "edocument.detail.decisionDate": { th: "ลงความเห็นเมื่อ", en: "Decided at" },
  "edocument.detail.commentsHistory": { th: "บันทึกความคิดเห็น / บันทึกข้อความ", en: "Comments & Discussion History" },
  "edocument.detail.addComment": { th: "เพิ่มความคิดเห็น", en: "Add Comment" },
  "edocument.detail.postComment": { th: "บันทึกความคิดเห็น", en: "Post Comment" },

  // Actions
  "edocument.action.create": { th: "ยื่นคำร้องใหม่", en: "New Request" },
  "edocument.action.edit": { th: "แก้ไขคำร้อง", en: "Edit Request" },
  "edocument.action.delete": { th: "ลบคำร้อง", en: "Delete Request" },
  "edocument.action.viewDetail": { th: "ดูรายละเอียด / พิจารณา", en: "View / Review" },
  "edocument.action.approve": { th: "อนุมัติคำร้อง", en: "Approve Request" },
  "edocument.action.reject": { th: "ไม่อนุมัติ", en: "Reject Request" },
  "edocument.action.requestChanges": { th: "ส่งกลับให้แก้ไข", en: "Request Changes" },
  "edocument.action.confirmDeleteTitle": { th: "ยืนยันการลบคำร้อง", en: "Confirm Deletion" },
  "edocument.action.confirmDeleteMessage": { th: "คุณต้องการลบคำร้องนี้ใช่หรือไม่ ข้อมูลและประวัติการพิจารณาจะถูกลบออกจากระบบ", en: "Are you sure you want to delete this request? The request and its history will be removed." },

  // Notifications
  "edocument.notify.created": { th: "ยื่นคำร้องใหม่เรียบร้อยแล้ว", en: "Request submitted successfully" },
  "edocument.notify.updated": { th: "บันทึกการแก้ไขเรียบร้อยแล้ว", en: "Request updated successfully" },
  "edocument.notify.deleted": { th: "ลบคำร้องเรียบร้อยแล้ว", en: "Request deleted successfully" },
  "edocument.notify.approved": { th: "บันทึกผลการอนุมัติเรียบร้อยแล้ว", en: "Approved successfully" },
  "edocument.notify.rejected": { th: "บันทึกผลการไม่อนุมัติเรียบร้อยแล้ว", en: "Rejected successfully" },
  "edocument.notify.changesRequested": { th: "ส่งกลับให้ผู้ยื่นแก้ไขคำร้องเรียบร้อยแล้ว", en: "Changes requested successfully" },
  "edocument.notify.commentAdded": { th: "บันทึกความคิดเห็นเรียบร้อยแล้ว", en: "Comment added successfully" },
  "edocument.notify.error": { th: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", en: "An error occurred. Please try again." },

  // Counters
  "edocument.stats.total": { th: "คำร้องทั้งหมด", en: "Total Requests" },
  "edocument.stats.pending": { th: "รอการพิจารณา", en: "Pending Review" },
  "edocument.stats.approved": { th: "อนุมัติแล้ว", en: "Approved" },
  "edocument.stats.changes": { th: "ส่งกลับแก้ไข", en: "Need Changes" },
} as const;
