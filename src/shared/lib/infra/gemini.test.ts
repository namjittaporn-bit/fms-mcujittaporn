import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  translateThaiNewsToEnglish,
  testGeminiConnection,
  callGemini,
} from "./gemini";

describe("gemini infrastructure", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("โยนข้อผิดพลาดเมื่อไม่มี apiKey หรือเป็นค่าว่าง", async () => {
    await expect(
      translateThaiNewsToEnglish({
        apiKey: "",
        titleTh: "หัวข้อข่าว",
        contentTh: "เนื้อหาข่าว",
      })
    ).rejects.toThrow("Gemini API Key is missing or empty");
  });

  it("แปลข่าวสารจากภาษาไทยเป็นภาษาอังกฤษสำเร็จเมื่อ Gemini ตอบกลับ JSON", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    titleEn: "Freshmen Admission Academic Year 2026",
                    contentEn: "Applications are now open for TCAS Round 1 Portfolio.",
                  }),
                },
              ],
            },
          },
        ],
      }),
    } as unknown as Response);

    const result = await translateThaiNewsToEnglish({
      apiKey: "test-api-key",
      titleTh: "เปิดรับสมัครนักศึกษาใหม่ ประจำปีการศึกษา 2569",
      contentTh: "เปิดรับสมัครบุคคลเข้าศึกษาผ่านระบบ TCAS รอบ 1",
    });

    expect(result.titleEn).toBe("Freshmen Admission Academic Year 2026");
    expect(result.contentEn).toBe("Applications are now open for TCAS Round 1 Portfolio.");
  });

  it("สามารถ parse JSON แม้ถูกครอบด้วย Markdown code fences", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: "```json\n" + JSON.stringify({
                    titleEn: "Student Scholarship 2026",
                    contentEn: "Scholarship applications open now.",
                  }) + "\n```",
                },
              ],
            },
          },
        ],
      }),
    } as unknown as Response);

    const result = await translateThaiNewsToEnglish({
      apiKey: "test-api-key",
      titleTh: "ทุนการศึกษา 2569",
      contentTh: "เปิดรับสมัครทุน",
    });

    expect(result.titleEn).toBe("Student Scholarship 2026");
    expect(result.contentEn).toBe("Scholarship applications open now.");
  });

  it("testGeminiConnection สำเร็จเมื่อส่งคำร้องและได้รับข้อความตอบกลับ", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: "PONG" }],
            },
          },
        ],
      }),
    } as unknown as Response);

    const res = await testGeminiConnection("valid-key", "gemini-1.5-flash");
    expect(res.success).toBe(true);
    expect(res.model).toBe("gemini-1.5-flash");
  });

  it("ดักจับข้อผิดพลาดเมื่อ Gemini API ตอบกลับ HTTP Error Status", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => ({
        error: {
          message: "API key not valid. Please pass a valid API key.",
        },
      }),
    } as unknown as Response);

    await expect(
      callGemini({
        apiKey: "bad-key",
        prompt: "Hello",
      })
    ).rejects.toThrow("API key not valid. Please pass a valid API key.");
  });
});