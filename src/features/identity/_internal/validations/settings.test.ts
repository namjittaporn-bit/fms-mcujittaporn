import { describe, it, expect } from "vitest";
import { updateSettingsSchema } from "./settings";

describe("updateSettingsSchema", () => {
  const baseValid = {
    nameTh: "คณะเทคโนโลยีและการจัดการ",
    nameEn: "Faculty of Technology and Management",
    palette: "blue" as const,
  };

  it("ยอมรับ URL เต็ม (https)", () => {
    const res = updateSettingsSchema.safeParse({
      ...baseValid,
      logoUrl: "https://example.com/logo.png",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.logoUrl).toBe("https://example.com/logo.png");
    }
  });

  it("ยอมรับ Relative Path ที่เริ่มต้นด้วย / (เช่น /uploads/logos/...)", () => {
    const res = updateSettingsSchema.safeParse({
      ...baseValid,
      logoUrl: "/uploads/logos/logo-tenant-123.png",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.logoUrl).toBe("/uploads/logos/logo-tenant-123.png");
    }
  });

  it("ยอมรับสตริงว่างสำหรับลบโลโก้", () => {
    const res = updateSettingsSchema.safeParse({
      ...baseValid,
      logoUrl: "",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.logoUrl).toBe("");
    }
  });

  it("ปฏิเสธสตริงที่ไม่ใช่ URL และไม่ขึ้นต้นด้วย /", () => {
    const res = updateSettingsSchema.safeParse({
      ...baseValid,
      logoUrl: "invalid-url-or-relative-path",
    });
    expect(res.success).toBe(false);
  });

  it("ตรวจสอบชื่อภาษาไทยและภาษาอังกฤษต้องไม่เป็นค่าว่าง", () => {
    expect(
      updateSettingsSchema.safeParse({ ...baseValid, nameTh: "" }).success
    ).toBe(false);
    expect(
      updateSettingsSchema.safeParse({ ...baseValid, nameEn: "" }).success
    ).toBe(false);
  });

  it("ยอมรับการตั้งค่า SMTP Gmail ที่ถูกต้อง", () => {
    const res = updateSettingsSchema.safeParse({
      ...baseValid,
      smtp: {
        enabled: true,
        user: "admin.faculty@gmail.com",
        pass: "abcd efgh ijkl mnop",
        fromName: "คณะเทคโนโลยีและการจัดการ",
        fromEmail: "admin.faculty@gmail.com",
        port: 465,
        secure: true,
      },
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.smtp?.enabled).toBe(true);
      expect(res.data.smtp?.user).toBe("admin.faculty@gmail.com");
      expect(res.data.smtp?.port).toBe(465);
    }
  });

  it("ยอมรับการปิดใช้งาน SMTP หรือส่งค่า null", () => {
    const resNull = updateSettingsSchema.safeParse({
      ...baseValid,
      smtp: null,
    });
    expect(resNull.success).toBe(true);

    const resDisabled = updateSettingsSchema.safeParse({
      ...baseValid,
      smtp: {
        enabled: false,
        user: "",
        pass: "",
        fromName: "",
        fromEmail: "",
        port: 587,
        secure: false,
      },
    });
    expect(resDisabled.success).toBe(true);
  });

  it("ปฏิเสธอีเมลผู้ใช้ Gmail ที่ผิดรูปแบบ", () => {
    const res = updateSettingsSchema.safeParse({
      ...baseValid,
      smtp: {
        enabled: true,
        user: "not-an-email",
        pass: "123456",
        port: 465,
        secure: true,
      },
    });
    expect(res.success).toBe(false);
  });
});
