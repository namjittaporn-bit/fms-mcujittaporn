import type { PermissionDef } from "@/shared/lib/permission-def";

export const RESERVATION_P = {
  reservationRead: "reservation:read",
  reservationCreate: "reservation:create",
  reservationCancel: "reservation:cancel",
  reservationApprove: "reservation:approve",
  reservationManage: "reservation:manage",
} as const;

export const RESERVATION_PERMISSIONS: readonly PermissionDef[] = [
  { code: RESERVATION_P.reservationRead, module: "reservation", action: "read", description: "ดูรายการและปฏิทินการจองทรัพยากร" },
  { code: RESERVATION_P.reservationCreate, module: "reservation", action: "create", description: "ทำรายการจองห้องประชุมและยานพาหนะ" },
  { code: RESERVATION_P.reservationCancel, module: "reservation", action: "cancel", description: "ยกเลิกรายการจองของตนเอง" },
  { code: RESERVATION_P.reservationApprove, module: "reservation", action: "approve", description: "ตรวจสอบและอนุมัติการจอง" },
  { code: RESERVATION_P.reservationManage, module: "reservation", action: "manage", description: "จัดการข้อมูลห้องประชุมและยานพาหนะ" },
];
