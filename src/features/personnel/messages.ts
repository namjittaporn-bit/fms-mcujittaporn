import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  // Navigation & General
  "personnel.nav": { th: "จัดการบุคลากร", en: "Personnel Directory" },
  "personnel.title": { th: "จัดการทำเนียบบุคลากร", en: "Faculty & Staff Directory" },
  "personnel.subtitle": { th: "จัดการรายชื่ออาจารย์ นักวิจัย และเจ้าหน้าที่สายสนับสนุนของคณะ", en: "Manage academic faculty, researchers, and support staff directory" },
  "personnel.create": { th: "เพิ่มบุคลากรใหม่", en: "Add Staff Member" },
  "personnel.edit": { th: "แก้ไขข้อมูลบุคลากร", en: "Edit Staff Profile" },
  "personnel.delete": { th: "ลบข้อมูลบุคลากร", en: "Delete Staff Profile" },
  "personnel.deleteConfirm": { th: "คุณต้องการลบข้อมูลบุคลากรท่านนี้ใช่หรือไม่?", en: "Are you sure you want to delete this staff member?" },
  "personnel.empty": { th: "ยังไม่มีรายชื่อบุคลากรในระบบ", en: "No personnel records found" },
  "personnel.save": { th: "บันทึก", en: "Save" },
  "personnel.cancel": { th: "ยกเลิก", en: "Cancel" },
  "personnel.searchPlaceholder": { th: "ค้นหาตามชื่อ นามสกุล หรือความเชี่ยวชาญ...", en: "Search by name, expertise, or research..." },
  "personnel.allDepartments": { th: "ทุกภาควิชา/หน่วยงาน", en: "All Departments" },
  "personnel.allTypes": { th: "ทุกสายงาน", en: "All Staff Types" },

  // Fields
  "personnel.nameThField": { th: "ชื่อ - นามสกุล (ภาษาไทย)", en: "Full Name (Thai)" },
  "personnel.nameEnField": { th: "ชื่อ - นามสกุล (English)", en: "Full Name (English)" },
  "personnel.prefixThField": { th: "คำนำหน้า (ไทย)", en: "Prefix (Thai)" },
  "personnel.prefixEnField": { th: "คำนำหน้า (English)", en: "Prefix (English)" },
  "personnel.firstNameThField": { th: "ชื่อ (ไทย)", en: "First Name (Thai)" },
  "personnel.lastNameThField": { th: "นามสกุล (ไทย)", en: "Last Name (Thai)" },
  "personnel.firstNameEnField": { th: "ชื่อ (English)", en: "First Name (English)" },
  "personnel.lastNameEnField": { th: "นามสกุล (English)", en: "Last Name (English)" },
  "personnel.academicRankField": { th: "ตำแหน่งทางวิชาการ", en: "Academic Rank" },
  "personnel.adminPositionField": { th: "ตำแหน่งบริหาร", en: "Administrative Position" },
  "personnel.personnelTypeField": { th: "ประเภทบุคลากร", en: "Personnel Type" },
  "personnel.departmentField": { th: "สังกัดภาควิชา/หน่วยงาน", en: "Department / Unit" },
  "personnel.emailField": { th: "อีเมลติดต่อ", en: "Contact Email" },
  "personnel.phoneField": { th: "เบอร์โทรศัพท์", en: "Phone Number" },
  "personnel.roomNumberField": { th: "ห้องพักอาจารย์/ที่ทำงาน", en: "Office / Room" },
  "personnel.avatarUrlField": { th: "ลิงก์รูปถ่ายประจำตัว", en: "Avatar Image URL" },
  "personnel.expertiseField": { th: "ความเชี่ยวชาญ (คั่นด้วยจุลภาค)", en: "Expertise (comma separated)" },
  "personnel.researchInterestsField": { th: "งานวิจัยและหัวข้อที่สนใจ", en: "Research Interests" },
  "personnel.orderIndexField": { th: "ลำดับการแสดงผล", en: "Display Order" },
  "personnel.isActiveField": { th: "สถานะการปฏิบัติงาน", en: "Active Status" },
  "personnel.educationField": { th: "ประวัติการศึกษา", en: "Education History" },

  // Academic Ranks
  "personnel.rank.PROFESSOR": { th: "ศาสตราจารย์ (ศ.)", en: "Professor (Prof.)" },
  "personnel.rank.ASSOC_PROF": { th: "รองศาสตราจารย์ (รศ.)", en: "Associate Professor (Assoc. Prof.)" },
  "personnel.rank.ASST_PROF": { th: "ผู้ช่วยศาสตราจารย์ (ผศ.)", en: "Assistant Professor (Asst. Prof.)" },
  "personnel.rank.LECTURER": { th: "อาจารย์ (อ.)", en: "Lecturer" },
  "personnel.rank.NONE": { th: "ไม่มีตำแหน่งทางวิชาการ", en: "None" },

  // Admin Positions
  "personnel.pos.DEAN": { th: "คณบดี", en: "Dean" },
  "personnel.pos.VICE_DEAN": { th: "รองคณบดี", en: "Vice Dean" },
  "personnel.pos.ASST_DEAN": { th: "ผู้ช่วยคณบดี", en: "Assistant Dean" },
  "personnel.pos.HEAD_OF_DEPT": { th: "หัวหน้าภาควิชา", en: "Head of Department" },
  "personnel.pos.SECRETARY": { th: "เลขานุการคณะ", en: "Faculty Secretary" },
  "personnel.pos.NONE": { th: "ไม่มีตำแหน่งบริหาร", en: "None" },

  // Personnel Types
  "personnel.type.ACADEMIC": { th: "สายวิชาการ (อาจารย์/นักวิจัย)", en: "Academic Faculty" },
  "personnel.type.SUPPORT": { th: "สายสนับสนุน (เจ้าหน้าที่)", en: "Support Staff" },

  // Notifications
  "personnel.createSuccess": { th: "เพิ่มข้อมูลบุคลากรเรียบร้อยแล้ว", en: "Staff member added successfully" },
  "personnel.updateSuccess": { th: "บันทึกการแก้ไขเรียบร้อยแล้ว", en: "Staff profile updated successfully" },
  "personnel.deleteSuccess": { th: "ลบข้อมูลบุคลากรเรียบร้อยแล้ว", en: "Staff member deleted successfully" },

  // Public Portal UI
  "portal.personnel.title": { th: "ทำเนียบบุคลากร", en: "Faculty & Staff Directory" },
  "portal.personnel.subtitle": { th: "ค้นหาข้อมูลคณาจารย์ นักวิจัย และเจ้าหน้าที่ คณะเทคโนโลยีและการจัดการ", en: "Discover faculty members, researchers, and professional staff directory" },
  "portal.personnel.executives": { th: "คณะผู้บริหาร", en: "Executive Board" },
  "portal.personnel.byDept": { th: "บุคลากรแยกตามภาควิชา", en: "Directory by Department" },
  "portal.personnel.viewProfile": { th: "ดูประวัติและผลงาน", en: "View Profile" },
  "portal.personnel.backToList": { th: "กลับหน้ารวมบุคลากร", en: "Back to Directory" },
  "portal.personnel.education": { th: "ประวัติการศึกษา", en: "Education" },
  "portal.personnel.expertise": { th: "ความเชี่ยวชาญพิเศษ", en: "Areas of Expertise" },
  "portal.personnel.research": { th: "งานวิจัยและความสนใจ", en: "Research & Scholarly Work" },
  "portal.personnel.contact": { th: "ข้อมูลติดต่อ", en: "Contact Information" },
  "portal.personnel.noStaffFound": { th: "ไม่พบบุคลากรตามเงื่อนไขที่เลือก", en: "No personnel found matching your criteria" },

  // RBAC Permission labels
  "roles.module.personnel": { th: "จัดการบุคลากร", en: "Personnel Directory" },
  "perm.personnel:read": { th: "ดูรายการทำเนียบบุคลากรหลังบ้าน", en: "View staff directory in admin" },
  "perm.personnel:create": { th: "เพิ่มข้อมูลบุคลากรใหม่", en: "Add new staff members" },
  "perm.personnel:update": { th: "แก้ไขข้อมูลบุคลากร", en: "Update staff profiles" },
  "perm.personnel:delete": { th: "ลบข้อมูลบุคลากร", en: "Delete staff profiles" },
  "perm.personnel:profile.edit": { th: "แก้ไขประวัติและผลงานตนเอง", en: "Edit own staff profile" },
};
