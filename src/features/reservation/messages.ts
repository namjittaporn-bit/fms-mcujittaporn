export const messages = {
  // Permission & Module Labels for Role Dialog
  "roles.module.reservation": { th: "ระบบจองห้องประชุมและยานพาหนะ", en: "Resource Reservation" },
  "perm.reservation:read": { th: "ดูรายการและปฏิทินการจอง", en: "View reservations and calendar" },
  "perm.reservation:create": { th: "ยื่นจองห้องประชุมและยานพาหนะ", en: "Create resource reservation" },
  "perm.reservation:cancel": { th: "ยกเลิกรายการจองของตนเอง", en: "Cancel own reservation" },
  "perm.reservation:approve": { th: "พิจารณาและอนุมัติการจอง", en: "Review and approve reservation" },
  "perm.reservation:manage": { th: "จัดการข้อมูลห้องประชุมและยานพาหนะ", en: "Manage resources and settings" },

  // Navigation & Page Titles
  "reservation.title": { th: "ระบบจองห้องประชุมและยานพาหนะ", en: "Resource Reservation" },
  "reservation.subtitle": { th: "บริการจองห้องประชุมอัจฉริยะและยานพาหนะคณะ พร้อมระบบตรวจสอบการชนของเวลาแบบเรียลไทม์", en: "Smart faculty meeting rooms and vehicle reservation system with real-time conflict checking." },

  // Tabs
  "reservation.tabs.rooms": { th: "ห้องประชุม", en: "Meeting Rooms" },
  "reservation.tabs.vehicles": { th: "ยานพาหนะ", en: "Vehicles" },
  "reservation.tabs.my_reservations": { th: "รายการจองของฉัน", en: "My Reservations" },
  "reservation.tabs.all_reservations": { th: "รายการจองทั้งหมด", en: "All Reservations" },
  "reservation.tabs.manage_resources": { th: "จัดการทรัพยากร", en: "Manage Resources" },

  // Resource Types & Statuses
  "reservation.type.ROOM": { th: "ห้องประชุม", en: "Meeting Room" },
  "reservation.type.VEHICLE": { th: "ยานพาหนะ", en: "Vehicle" },
  "reservation.status.PENDING": { th: "รออนุมัติ", en: "Pending" },
  "reservation.status.APPROVED": { th: "อนุมัติแล้ว", en: "Approved" },
  "reservation.status.REJECTED": { th: "ไม่อนุมัติ", en: "Rejected" },
  "reservation.status.CANCELLED": { th: "ยกเลิกแล้ว", en: "Cancelled" },
  "reservation.status.COMPLETED": { th: "เสร็จสิ้น", en: "Completed" },

  // Actions & Buttons
  "reservation.action.book": { th: "จองใช้งาน", en: "Book Now" },
  "reservation.action.create": { th: "สร้างรายการจองใหม่", en: "New Reservation" },
  "reservation.action.add_resource": { th: "เพิ่มทรัพยากรใหม่", en: "Add Resource" },
  "reservation.action.edit_resource": { th: "แก้ไขทรัพยากร", en: "Edit Resource" },
  "reservation.action.delete_resource": { th: "ลบทรัพยากร", en: "Delete Resource" },
  "reservation.action.cancel": { th: "ยกเลิกการจอง", en: "Cancel Booking" },
  "reservation.action.approve": { th: "อนุมัติการจอง", en: "Approve Booking" },
  "reservation.action.reject": { th: "ปฏิเสธการจอง", en: "Reject Booking" },
  "reservation.action.view_detail": { th: "ดูรายละเอียด", en: "View Details" },
  "reservation.action.filter": { th: "กรองข้อมูล", en: "Filter" },
  "reservation.action.check_availability": { th: "ตรวจสอบเวลาว่าง", en: "Check Availability" },

  // Field Labels
  "reservation.field.resource": { th: "ห้องหรือยานพาหนะ", en: "Resource" },
  "reservation.field.title": { th: "หัวข้อการประชุม / ภารกิจ", en: "Meeting / Mission Title" },
  "reservation.field.purpose": { th: "วัตถุประสงค์การใช้งาน", en: "Purpose / Objective" },
  "reservation.field.attendees_count": { th: "จำนวนผู้เข้าร่วม (คน)", en: "Attendees Count" },
  "reservation.field.destination": { th: "สถานที่ปลายทาง (กรณีรถยนต์)", en: "Destination (Vehicles)" },
  "reservation.field.start_time": { th: "เวลาเริ่มต้น", en: "Start Time" },
  "reservation.field.end_time": { th: "เวลาสิ้นสุด", en: "End Time" },
  "reservation.field.department": { th: "หน่วยงาน / สาขาวิชา", en: "Department" },
  "reservation.field.capacity": { th: "ความจุ (คน/ที่นั่ง)", en: "Capacity" },
  "reservation.field.location": { th: "สถานที่ตั้ง / อาคาร-ชั้น", en: "Location" },
  "reservation.field.license_plate": { th: "หมายเลขทะเบียนรถ", en: "License Plate" },
  "reservation.field.driver_name": { th: "พนักงานขับรถ", en: "Driver Name" },
  "reservation.field.driver_phone": { th: "เบอร์ติดต่อคนขับ", en: "Driver Phone" },
  "reservation.field.amenities": { th: "อุปกรณ์อำนวยความสะดวก", en: "Amenities & Equipment" },
  "reservation.field.status": { th: "สถานะ", en: "Status" },
  "reservation.field.booked_by": { th: "ผู้จอง", en: "Booked By" },
  "reservation.field.created_at": { th: "วันที่ทำรายการ", en: "Booking Date" },
  "reservation.field.review_notes": { th: "เหตุผล / หมายเหตุการพิจารณา", en: "Review Notes / Reason" },
  "reservation.field.code": { th: "รหัสทรัพยากร", en: "Resource Code" },
  "reservation.field.name_th": { th: "ชื่อ (ภาษาไทย)", en: "Name (Thai)" },
  "reservation.field.name_en": { th: "ชื่อ (English)", en: "Name (English)" },
  "reservation.field.description": { th: "รายละเอียดเพิ่มเติม", en: "Description" },

  // Validation & Conflict Notices
  "reservation.validation.conflict_detected": { th: "ช่วงเวลาที่เลือกซ้อนทับกับรายการจองที่มีอยู่แล้ว กรุณาเลือกช่วงเวลาอื่น", en: "The selected time slot conflicts with an existing reservation. Please choose another time." },
  "reservation.validation.invalid_time_range": { th: "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น", en: "End time must be after start time." },
  "reservation.validation.past_time": { th: "ไม่สามารถจองช่วงเวลาย้อนหลังได้", en: "Cannot book a time slot in the past." },
  "reservation.validation.capacity_exceeded": { th: "จำนวนผู้เข้าร่วมเกินความจุที่ทรัพยากรรองรับได้", en: "Attendees count exceeds resource capacity." },
  "reservation.validation.available": { th: "ช่วงเวลานี้ว่าง สามารถทำรายการจองได้", en: "This time slot is available for booking." },

  // Messages & Dialogs
  "reservation.dialog.new_title": { th: "แบบฟอร์มการจองทรัพยากร", en: "New Resource Reservation" },
  "reservation.dialog.new_desc": { th: "กรอกข้อมูลรายละเอียดการใช้งานห้องประชุมหรือยานพาหนะ", en: "Fill in the details for meeting room or vehicle reservation." },
  "reservation.dialog.review_title": { th: "พิจารณาอนุมัติคำขอจอง", en: "Review Reservation Request" },
  "reservation.dialog.review_desc": { th: "ตรวจสอบรายละเอียดและบันทึกผลการอนุมัติคำขอ", en: "Review reservation details and approve or reject." },
  "reservation.dialog.cancel_title": { th: "ยืนยันการยกเลิกการจอง", en: "Confirm Booking Cancellation" },
  "reservation.dialog.cancel_desc": { th: "คุณแน่ใจหรือไม่ว่าต้องการยกเลิกรายการจองนี้? การกระทำนี้ไม่สามารถย้อนกลับได้", en: "Are you sure you want to cancel this booking? This action cannot be undone." },
  "reservation.dialog.resource_title": { th: "ข้อมูลทรัพยากร", en: "Resource Details" },

  // Empty & Notifications
  "reservation.empty": { th: "ไม่พบข้อมูลการจองในระบบ", en: "No reservations found." },
  "reservation.empty_resources": { th: "ยังไม่มีรายการห้องประชุมหรือยานพาหนะในระบบ", en: "No resources found." },
  "reservation.notice.created": { th: "บันทึกการจองเรียบร้อยแล้ว รอเจ้าหน้าที่พิจารณาอนุมัติ", en: "Reservation submitted successfully. Pending staff approval." },
  "reservation.notice.updated": { th: "อัปเดตข้อมูลเรียบร้อยแล้ว", en: "Updated successfully." },
  "reservation.notice.approved": { th: "อนุมัติคำขอจองเรียบร้อยแล้ว", en: "Reservation approved successfully." },
  "reservation.notice.rejected": { th: "ปฏิเสธคำขอจองเรียบร้อยแล้ว", en: "Reservation rejected." },
  "reservation.notice.cancelled": { th: "ยกเลิกรายการจองเรียบร้อยแล้ว", en: "Reservation cancelled successfully." },
  "reservation.notice.resource_saved": { th: "บันทึกข้อมูลทรัพยากรเรียบร้อยแล้ว", en: "Resource saved successfully." },
  "reservation.notice.resource_deleted": { th: "ลบทรัพยากรเรียบร้อยแล้ว", en: "Resource deleted successfully." },
} as const;
