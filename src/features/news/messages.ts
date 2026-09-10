import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  // Navigation & General
  "news.nav": { th: "ข่าวประชาสัมพันธ์", en: "News & Announcements" },
  "news.title": { th: "จัดการข่าวสารประชาสัมพันธ์", en: "News & Announcements" },
  "news.subtitle": { th: "จัดการข่าวสาร กิจกรรม ทุนการศึกษา และประกาศจัดซื้อจัดจ้างของคณะ", en: "Manage faculty news, activities, scholarships, and procurement announcements" },
  "news.create": { th: "สร้างข่าวใหม่", en: "Create News" },
  "news.edit": { th: "แก้ไขข่าว", en: "Edit News" },
  "news.delete": { th: "ลบข่าว", en: "Delete News" },
  "news.deleteConfirm": { th: "คุณต้องการลบข่าวนี้ใช่หรือไม่?", en: "Are you sure you want to delete this news article?" },
  "news.empty": { th: "ยังไม่มีข่าวสารในระบบ", en: "No news articles found" },
  "news.save": { th: "บันทึก", en: "Save" },
  "news.cancel": { th: "ยกเลิก", en: "Cancel" },
  "news.searchPlaceholder": { th: "ค้นหาตามหัวข้อข่าว...", en: "Search news by title..." },
  "news.allCategories": { th: "ทุกหมวดหมู่", en: "All Categories" },
  "news.allStatuses": { th: "ทุกสถานะ", en: "All Statuses" },

  // Fields
  "news.titleThField": { th: "หัวข้อข่าว (ภาษาไทย)", en: "Title (Thai)" },
  "news.titleEnField": { th: "หัวข้อข่าว (English)", en: "Title (English)" },
  "news.slugField": { th: "Slug (สำหรับ URL)", en: "Slug (URL friendly)" },
  "news.contentThField": { th: "เนื้อหาข่าว (ภาษาไทย)", en: "Content (Thai)" },
  "news.contentEnField": { th: "เนื้อหาข่าว (English)", en: "Content (English)" },
  "news.categoryField": { th: "หมวดหมู่", en: "Category" },
  "news.statusField": { th: "สถานะ", en: "Status" },
  "news.coverImageUrlField": { th: "ลิงก์รูปภาพหน้าปก", en: "Cover Image URL" },
  "news.isPinnedField": { th: "ปักหมุดข่าวเด่น", en: "Pin to Top" },
  "news.publishedAtField": { th: "วันที่เผยแพร่", en: "Publish Date" },
  "news.expiresAtField": { th: "วันที่หมดอายุประกาศ", en: "Expiration Date" },
  "news.views": { th: "ยอดผู้เข้าชม", en: "Views" },
  "news.actions": { th: "การดำเนินการ", en: "Actions" },

  // Categories
  "news.category.ACADEMIC": { th: "ข่าววิชาการ", en: "Academic" },
  "news.category.ACTIVITY": { th: "ข่าวกิจกรรม", en: "Activities" },
  "news.category.SCHOLARSHIP": { th: "ทุนการศึกษา", en: "Scholarships" },
  "news.category.PROCUREMENT": { th: "จัดซื้อจัดจ้าง", en: "Procurement" },
  "news.category.GENERAL": { th: "ข่าวทั่วไป", en: "General" },

  // Statuses
  "news.status.DRAFT": { th: "ฉบับร่าง", en: "Draft" },
  "news.status.PUBLISHED": { th: "เผยแพร่แล้ว", en: "Published" },
  "news.status.ARCHIVED": { th: "ปิดประกาศ", en: "Archived" },

  // Notifications
  "news.createSuccess": { th: "สร้างข่าวสารใหม่เรียบร้อยแล้ว", en: "News article created successfully" },
  "news.updateSuccess": { th: "บันทึกการแก้ไขเรียบร้อยแล้ว", en: "News article updated successfully" },
  "news.deleteSuccess": { th: "ลบข่าวสารเรียบร้อยแล้ว", en: "News article deleted successfully" },
  "news.pinSuccess": { th: "อัปเดตการปักหมุดเรียบร้อยแล้ว", en: "Pin status updated successfully" },

  // Public Portal UI
  "portal.news.title": { th: "ข่าวสารและกิจกรรม", en: "News & Activities" },
  "portal.news.subtitle": { th: "ติดตามข่าวสาร การประกาศรับสมัคร กิจกรรม และผลงานล่าสุดของคณะ", en: "Stay updated with latest announcements, activities, and faculty achievements" },
  "portal.news.latest": { th: "ข่าวสารล่าสุด", en: "Latest News" },
  "portal.news.pinned": { th: "ข่าวประชาสัมพันธ์เด่น", en: "Featured News" },
  "portal.news.viewAll": { th: "ดูข่าวทั้งหมด", en: "View All News" },
  "portal.news.readMore": { th: "อ่านต่อ", en: "Read More" },
  "portal.news.backToList": { th: "กลับหน้ารายการข่าว", en: "Back to News List" },
  "portal.news.publishedOn": { th: "เผยแพร่เมื่อ", en: "Published on" },
  "portal.news.attachments": { th: "เอกสารแนบ", en: "Attachments" },
  "portal.news.download": { th: "ดาวน์โหลด", en: "Download" },
  "portal.news.share": { th: "แชร์ข่าวนี้", en: "Share" },
  "portal.news.noNewsInCategory": { th: "ไม่พบข่าวสารในหมวดหมู่นี้", en: "No news articles found in this category" },

  // RBAC Permission labels
  "roles.module.news": { th: "ข่าวสารประชาสัมพันธ์", en: "News & Announcements" },
  "perm.news:read": { th: "ดูรายการข่าวสารหลังบ้าน", en: "View news in admin" },
  "perm.news:create": { th: "สร้างและเสนอร่างข่าว", en: "Create news drafts" },
  "perm.news:update": { th: "แก้ไขข่าวสาร", en: "Update news articles" },
  "perm.news:delete": { th: "ลบข่าวสาร", en: "Delete news articles" },
  "perm.news:publish": { th: "อนุมัติและเผยแพร่ข่าวสาร", en: "Publish news articles" },
  "perm.news:pin": { th: "ปักหมุดข่าวเด่น", en: "Pin featured news" },
};
