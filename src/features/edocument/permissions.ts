import type { PermissionDef } from "@/shared/lib/permission-def";

export const EDOCUMENT_P = {
  edocumentRead: "edocument:read",
  edocumentCreate: "edocument:create",
  edocumentUpdate: "edocument:update",
  edocumentDelete: "edocument:delete",
  edocumentApprove: "edocument:approve",
  edocumentManage: "edocument:manage",
} as const;

export const EDOCUMENT_PERMISSIONS: readonly PermissionDef[] = [
  { code: EDOCUMENT_P.edocumentRead, module: "edocument", action: "read", description: "ดูรายการคำร้องอิเล็กทรอนิกส์" },
  { code: EDOCUMENT_P.edocumentCreate, module: "edocument", action: "create", description: "ยื่นคำร้องอิเล็กทรอนิกส์ใหม่" },
  { code: EDOCUMENT_P.edocumentUpdate, module: "edocument", action: "update", description: "แก้ไขข้อมูลคำร้องอิเล็กทรอนิกส์" },
  { code: EDOCUMENT_P.edocumentDelete, module: "edocument", action: "delete", description: "ลบคำร้องอิเล็กทรอนิกส์" },
  { code: EDOCUMENT_P.edocumentApprove, module: "edocument", action: "approve", description: "พิจารณาและลงนามอนุมัติคำร้อง" },
  { code: EDOCUMENT_P.edocumentManage, module: "edocument", action: "manage", description: "บริหารจัดการคำร้องทุกรายการในองค์กร" },
];
