import { describe, it, expect } from "vitest";
import {
  createNewsSchema,
  updateNewsSchema,
  togglePinNewsSchema,
} from "./validations";

describe("news validations", () => {
  const validUUID = "123e4567-e89b-12d3-a456-426614174000";

  const validNews = {
    titleTh: "เปิดรับสมัครนักศึกษาใหม่ ประจำปีการศึกษา 2569",
    titleEn: "Freshmen Admission for Academic Year 2026",
    slug: "freshmen-admission-2026",
    contentTh: "รายละเอียดการรับสมัครนักศึกษาใหม่...",
    contentEn: "Details for freshmen admission...",
    category: "ACADEMIC" as const,
    status: "PUBLISHED" as const,
    isPinned: true,
  };

  it("createNewsSchema ผ่านเมื่อข้อมูลครบถ้วนถูกต้อง", () => {
    const result = createNewsSchema.parse(validNews);
    expect(result.titleTh).toBe(validNews.titleTh);
    expect(result.category).toBe("ACADEMIC");
    expect(result.isPinned).toBe(true);
    expect(result.attachments).toEqual([]);
  });

  it("createNewsSchema ล้มเมื่อไม่มี titleTh หรือ slug", () => {
    expect(() => createNewsSchema.parse({ ...validNews, titleTh: "" })).toThrow();
    expect(() => createNewsSchema.parse({ ...validNews, slug: "" })).toThrow();
  });

  it("createNewsSchema ให้ค่า default ของ category และ status เมื่อไม่ระบุ", () => {
    const minimal = {
      titleTh: "ข่าวทั่วไป",
      titleEn: "General News",
      slug: "general-news",
      contentTh: "เนื้อหา",
      contentEn: "Content",
    };
    const result = createNewsSchema.parse(minimal);
    expect(result.category).toBe("GENERAL");
    expect(result.status).toBe("DRAFT");
    expect(result.isPinned).toBe(false);
  });

  it("updateNewsSchema ต้องการ id แบบ UUID", () => {
    const validUpdate = { ...validNews, id: validUUID };
    expect(updateNewsSchema.parse(validUpdate).id).toBe(validUUID);

    const invalidUpdate = { ...validNews, id: "invalid-id" };
    expect(() => updateNewsSchema.parse(invalidUpdate)).toThrow();
  });

  it("togglePinNewsSchema ตรวจสอบความถูกต้องของ id และ isPinned", () => {
    const valid = { id: validUUID, isPinned: true };
    expect(togglePinNewsSchema.parse(valid)).toEqual(valid);

    expect(() => togglePinNewsSchema.parse({ id: "invalid-id", isPinned: true })).toThrow();
  });

  it("createNewsSchema ปฏิเสธ URL ที่เป็นอันตราย (XSS schemes เช่น javascript:)", () => {
    const malicious = {
      ...validNews,
      coverImageUrl: "javascript:alert('XSS')",
    };
    expect(() => createNewsSchema.parse(malicious)).toThrow();

    const maliciousAttachment = {
      ...validNews,
      attachments: [
        {
          fileName: "malicious.pdf",
          fileUrl: "javascript:evil()",
        },
      ],
    };
    expect(() => createNewsSchema.parse(maliciousAttachment)).toThrow();
  });
});
