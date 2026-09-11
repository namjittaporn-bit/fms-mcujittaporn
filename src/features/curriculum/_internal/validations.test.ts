import { describe, it, expect } from "vitest";
import {
  createProgramSchema,
  updateProgramSchema,
  toggleProgramStatusSchema,
  degreeLevelEnum,
} from "./validations";

describe("curriculum validations", () => {
  const validUUID = "123e4567-e89b-12d3-a456-426614174000";

  const validProgram = {
    code: "CS-2569",
    nameTh: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์",
    nameEn: "Bachelor of Science in Computer Science",
    degreeTitleTh: "วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์)",
    degreeTitleEn: "Bachelor of Science (Computer Science)",
    degreeAbbrTh: "วท.บ. (วิทยาการคอมพิวเตอร์)",
    degreeAbbrEn: "B.Sc. (Computer Science)",
    degreeLevel: "BACHELOR" as const,
    programPlan: "REGULAR" as const,
    durationYears: 4,
    totalCredits: 128,
    careerPaths: ["Software Engineer", "AI Developer", "Data Scientist"],
    curriculumStructure: [
      { category: "หมวดวิชาศึกษาทั่วไป", credits: 30 },
      { category: "หมวดวิชาเฉพาะ", credits: 92 },
      { category: "หมวดวิชาเลือกเสรี", credits: 6 },
    ],
    studyPlan: [
      {
        year: 1,
        semester: 1,
        courses: [
          { code: "CS101", name: "Computer Programming", credits: 3 },
          { code: "MA101", name: "Calculus I", credits: 3 },
        ],
      },
    ],
  };

  it("createProgramSchema ผ่านเมื่อข้อมูลหลักสูตรถูกต้อง", () => {
    const result = createProgramSchema.parse(validProgram);
    expect(result.code).toBe("CS-2569");
    expect(result.degreeLevel).toBe("BACHELOR");
    expect(result.totalCredits).toBe(128);
    expect(result.careerPaths).toHaveLength(3);
    expect(result.curriculumStructure).toHaveLength(3);
    expect(result.studyPlan).toHaveLength(1);
  });

  it("createProgramSchema ล้มเมื่อไม่มี code หรือ nameTh", () => {
    expect(() => createProgramSchema.parse({ ...validProgram, code: "" })).toThrow();
    expect(() => createProgramSchema.parse({ ...validProgram, nameTh: "" })).toThrow();
  });

  it("degreeLevelEnum รองรับระดับปริญญาตรี โท เอก และประกาศนียบัตร", () => {
    expect(degreeLevelEnum.options).toContain("BACHELOR");
    expect(degreeLevelEnum.options).toContain("MASTER");
    expect(degreeLevelEnum.options).toContain("DOCTORATE");
    expect(degreeLevelEnum.options).toContain("DIPLOMA");
  });

  it("updateProgramSchema ต้องการ id แบบ UUID", () => {
    const validUpdate = { ...validProgram, id: validUUID };
    expect(updateProgramSchema.parse(validUpdate).id).toBe(validUUID);

    expect(() => updateProgramSchema.parse({ ...validProgram, id: "invalid" })).toThrow();
  });

  it("toggleProgramStatusSchema ตรวจสอบสถานะ ACTIVE, INACTIVE, REVISED", () => {
    const active = { id: validUUID, status: "ACTIVE" as const };
    expect(toggleProgramStatusSchema.parse(active)).toEqual(active);

    const revised = { id: validUUID, status: "REVISED" as const };
    expect(toggleProgramStatusSchema.parse(revised)).toEqual(revised);

    expect(() => toggleProgramStatusSchema.parse({ id: validUUID, status: "DELETED" })).toThrow();
  });
});
