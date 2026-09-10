import type { PermissionDef } from "@/shared/lib/permission-def";

export const PERSONNEL_P = {
  personnelRead: "personnel:read",
  personnelCreate: "personnel:create",
  personnelUpdate: "personnel:update",
  personnelDelete: "personnel:delete",
  personnelProfileEdit: "personnel:profile.edit",
} as const;

export const PERSONNEL_PERMISSIONS: readonly PermissionDef[] = [
  { code: PERSONNEL_P.personnelRead, module: "personnel", action: "read", description: "ดูรายการทำเนียบบุคลากรหลังบ้าน" },
  { code: PERSONNEL_P.personnelCreate, module: "personnel", action: "create", description: "เพิ่มข้อมูลบุคลากรใหม่" },
  { code: PERSONNEL_P.personnelUpdate, module: "personnel", action: "update", description: "แก้ไขข้อมูลบุคลากร" },
  { code: PERSONNEL_P.personnelDelete, module: "personnel", action: "delete", description: "ลบข้อมูลบุคลากร" },
  { code: PERSONNEL_P.personnelProfileEdit, module: "personnel", action: "profile.edit", description: "แก้ไขประวัติและผลงานตนเอง" },
];
