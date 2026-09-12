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

  it("ยอมรับข้อมูลการติดต่อที่ถูกต้อง", () => {
    const res = updateSettingsSchema.safeParse({
      ...baseValid,
      contact: {
        addressTh: "79 หมู่ 3 วังน้อย พระนครศรีอยุธยา",
        addressEn: "79 Moo 3 Wang Noi Ayutthaya",
        phone: "035-248-000",
        email: "info@mcu.ac.th",
        workingHoursTh: "จันทร์ - ศุกร์: 08:30 - 16:30 น.",
        workingHoursEn: "Mon - Fri: 8:30 - 16:30",
        facebookUrl: "https://facebook.com/mcu.official",
        lineId: "@mcu",
        websiteUrl: "https://www.mcu.ac.th",
        googleMapUrl: "https://maps.google.com/?cid=12345",
      },
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.contact?.email).toBe("info@mcu.ac.th");
      expect(res.data.contact?.phone).toBe("035-248-000");
    }
  });

  it("ยอมรับ contact เป็น null หรือสตริงว่าง", () => {
    const resNull = updateSettingsSchema.safeParse({
      ...baseValid,
      contact: null,
    });
    expect(resNull.success).toBe(true);

    const resEmpty = updateSettingsSchema.safeParse({
      ...baseValid,
      contact: {
        addressTh: "",
        addressEn: "",
        phone: "",
        email: "",
        workingHoursTh: "",
        workingHoursEn: "",
        facebookUrl: "",
        lineId: "",
        websiteUrl: "",
        googleMapUrl: "",
      },
    });
    expect(resEmpty.success).toBe(true);
  });

  it("ปฏิเสธอีเมลติดต่อหรือ URL ที่ผิดรูปแบบ", () => {
    const resBadEmail = updateSettingsSchema.safeParse({
      ...baseValid,
      contact: {
        email: "not-an-email",
      },
    });
    expect(resBadEmail.success).toBe(false);

    const resBadUrl = updateSettingsSchema.safeParse({
      ...baseValid,
      contact: {
        facebookUrl: "invalid-url",
      },
    });
    expect(resBadUrl.success).toBe(false);
  });

  it("ยอมรับการตั้งค่า Google Gemini AI ที่ถูกต้อง", () => {
    const res = updateSettingsSchema.safeParse({
      ...baseValid,
      gemini: {
        enabled: true,
        apiKey: "AIzaSyD-1234567890abcdef",
        model: "gemini-1.5-flash",
      },
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.gemini?.enabled).toBe(true);
      expect(res.data.gemini?.apiKey).toBe("AIzaSyD-1234567890abcdef");
      expect(res.data.gemini?.model).toBe("gemini-1.5-flash");
    }
  });

  it("ยอมรับ gemini เป็น null หรือค่าว่าง", () => {
    const resNull = updateSettingsSchema.safeParse({
      ...baseValid,
      gemini: null,
    });
    expect(resNull.success).toBe(true);

    const resEmpty = updateSettingsSchema.safeParse({
      ...baseValid,
      gemini: {
        enabled: false,
        apiKey: "",
        model: "gemini-1.5-flash",
      },
    });
    expect(resEmpty.success).toBe(true);
  });
});

