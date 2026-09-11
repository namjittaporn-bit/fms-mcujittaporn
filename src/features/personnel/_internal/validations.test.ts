import { describe, it, expect } from "vitest";
import {
  createStaffSchema,
  updateStaffSchema,
  academicRankEnum,
  adminPositionEnum,
} from "./validations";

describe("personnel validations", () => {
  const validUUID = "123e4567-e89b-12d3-a456-426614174000";

  const validStaff = {
    prefixTh: "รศ.ดร.",
    prefixEn: "Assoc. Prof. Dr.",
    firstNameTh: "สมชาย",
    lastNameTh: "ใจดี",
    firstNameEn: "Somchai",
    lastNameEn: "Jaidee",
    academicRank: "ASSOC_PROF" as const,
    adminPosition: "DEAN" as const,
    personnelType: "ACADEMIC" as const,
    email: "somchai@fms.ac.th",
    phone: "081-999-8888",
    roomNumber: "FMS-401",
    educationHistory: [
      {
        degree: "Ph.D.",
        field: "Computer Science",
        institution: "Carnegie Mellon University",
        year: "2015",
      },
    ],
    expertise: ["Cloud Computing", "Distributed Systems"],
  };

  it("createStaffSchema ผ่านเมื่อข้อมูลบุคลากรครบถ้วน", () => {
    const result = createStaffSchema.parse(validStaff);
    expect(result.firstNameTh).toBe("สมชาย");
    expect(result.academicRank).toBe("ASSOC_PROF");
    expect(result.adminPosition).toBe("DEAN");
    expect(result.educationHistory).toHaveLength(1);
  });

  it("createStaffSchema ล้มเมื่อรูปแบบ email ไม่ถูกต้อง", () => {
    expect(() => createStaffSchema.parse({ ...validStaff, email: "invalid-email" })).toThrow();
  });

  it("createStaffSchema กำหนด default values เมื่อเว้นว่าง", () => {
    const minimal = {
      prefixTh: "อ.",
      prefixEn: "Lecturer",
      firstNameTh: "สมศรี",
      lastNameTh: "สุขใจ",
      firstNameEn: "Somsri",
      lastNameEn: "Sukjai",
      email: "somsri@fms.ac.th",
    };
    const result = createStaffSchema.parse(minimal);
    expect(result.academicRank).toBe("NONE");
    expect(result.adminPosition).toBe("NONE");
    expect(result.personnelType).toBe("ACADEMIC");
    expect(result.isActive).toBe(true);
    expect(result.orderIndex).toBe(0);
  });

  it("academicRankEnum และ adminPositionEnum มีค่าตรงตามระบบ", () => {
    expect(academicRankEnum.options).toContain("PROFESSOR");
    expect(academicRankEnum.options).toContain("ASSOC_PROF");
    expect(academicRankEnum.options).toContain("ASST_PROF");
    expect(academicRankEnum.options).toContain("LECTURER");
    expect(adminPositionEnum.options).toContain("DEAN");
    expect(adminPositionEnum.options).toContain("VICE_DEAN");
    expect(adminPositionEnum.options).toContain("HEAD_OF_DEPT");
  });

  it("updateStaffSchema ต้องการ id แบบ UUID", () => {
    const updateValid = { ...validStaff, id: validUUID };
    expect(updateStaffSchema.parse(updateValid).id).toBe(validUUID);

    expect(() => updateStaffSchema.parse({ ...validStaff, id: "123" })).toThrow();
  });
});
