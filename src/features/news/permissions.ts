import type { PermissionDef } from "@/shared/lib/permission-def";

export const NEWS_P = {
  newsRead: "news:read",
  newsCreate: "news:create",
  newsUpdate: "news:update",
  newsDelete: "news:delete",
  newsPublish: "news:publish",
  newsPin: "news:pin",
} as const;

export const NEWS_PERMISSIONS: readonly PermissionDef[] = [
  { code: NEWS_P.newsRead, module: "news", action: "read", description: "ดูรายการและรายละเอียดข่าวสารหลังบ้าน" },
  { code: NEWS_P.newsCreate, module: "news", action: "create", description: "สร้างและเสนอร่างข่าวสาร" },
  { code: NEWS_P.newsUpdate, module: "news", action: "update", description: "แก้ไขข่าวสาร" },
  { code: NEWS_P.newsDelete, module: "news", action: "delete", description: "ลบข่าวสาร" },
  { code: NEWS_P.newsPublish, module: "news", action: "publish", description: "อนุมัติและเผยแพร่ข่าวสารสู่สาธารณะ" },
  { code: NEWS_P.newsPin, module: "news", action: "pin", description: "ปักหมุดข่าวเด่นบนหน้าหลัก" },
];
