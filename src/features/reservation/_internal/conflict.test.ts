import { describe, it, expect } from "vitest";

/**
 * อัลกอริทึมตรวจสอบการชนของช่วงเวลาการจอง (Time Overlap Conflict Detection)
 * ตามมาตรฐาน Interval Overlap Logic:
 * Conflict เกิดขึ้นเมื่อ (startA < endB) AND (endA > startB)
 */
function isTimeConflict(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return startA < endB && endA > startB;
}

describe("reservation time conflict detection algorithm", () => {
  // Existing booking: 09:00 - 12:00
  const existingStart = new Date("2026-09-15T09:00:00Z");
  const existingEnd = new Date("2026-09-15T12:00:00Z");

  it("ตรวจพบ Conflict เมื่อเวลาตรงกันพอดี (Exact match)", () => {
    const newStart = new Date("2026-09-15T09:00:00Z");
    const newEnd = new Date("2026-09-15T12:00:00Z");
    expect(isTimeConflict(newStart, newEnd, existingStart, existingEnd)).toBe(true);
  });

  it("ตรวจพบ Conflict เมื่อเวลาเริ่มก่อนและคาบเกี่ยวช่วงต้น (Overlap start)", () => {
    const newStart = new Date("2026-09-15T08:00:00Z");
    const newEnd = new Date("2026-09-15T10:00:00Z");
    expect(isTimeConflict(newStart, newEnd, existingStart, existingEnd)).toBe(true);
  });

  it("ตรวจพบ Conflict เมื่อเวลาเริ่มภายในและคาบเกี่ยวช่วงท้าย (Overlap end)", () => {
    const newStart = new Date("2026-09-15T11:00:00Z");
    const newEnd = new Date("2026-09-15T13:00:00Z");
    expect(isTimeConflict(newStart, newEnd, existingStart, existingEnd)).toBe(true);
  });

  it("ตรวจพบ Conflict เมื่อเวลาอยู่ภายในช่วงเดิมทั้งหมด (Enclosed inside)", () => {
    const newStart = new Date("2026-09-15T09:30:00Z");
    const newEnd = new Date("2026-09-15T11:30:00Z");
    expect(isTimeConflict(newStart, newEnd, existingStart, existingEnd)).toBe(true);
  });

  it("ตรวจพบ Conflict เมื่อเวลาครอบคลุมช่วงเดิมทั้งหมด (Enclosing around)", () => {
    const newStart = new Date("2026-09-15T08:00:00Z");
    const newEnd = new Date("2026-09-15T13:00:00Z");
    expect(isTimeConflict(newStart, newEnd, existingStart, existingEnd)).toBe(true);
  });

  it("ไม่มี Conflict เมื่อเวลาสิ้นสุดติดกับเวลาเริ่มต้นพอดี (Adjacent before)", () => {
    const newStart = new Date("2026-09-15T07:00:00Z");
    const newEnd = new Date("2026-09-15T09:00:00Z");
    expect(isTimeConflict(newStart, newEnd, existingStart, existingEnd)).toBe(false);
  });

  it("ไม่มี Conflict เมื่อเวลาเริ่มต้นติดกับเวลาสิ้นสุดพอดี (Adjacent after)", () => {
    const newStart = new Date("2026-09-15T12:00:00Z");
    const newEnd = new Date("2026-09-15T14:00:00Z");
    expect(isTimeConflict(newStart, newEnd, existingStart, existingEnd)).toBe(false);
  });

  it("ไม่มี Conflict เมื่อเวลาอยู่ก่อนหน้าช่วงเดิมโดยสมบูรณ์ (Completely before)", () => {
    const newStart = new Date("2026-09-15T06:00:00Z");
    const newEnd = new Date("2026-09-15T08:00:00Z");
    expect(isTimeConflict(newStart, newEnd, existingStart, existingEnd)).toBe(false);
  });

  it("ไม่มี Conflict เมื่อเวลาอยู่หลังช่วงเดิมโดยสมบูรณ์ (Completely after)", () => {
    const newStart = new Date("2026-09-15T13:00:00Z");
    const newEnd = new Date("2026-09-15T15:00:00Z");
    expect(isTimeConflict(newStart, newEnd, existingStart, existingEnd)).toBe(false);
  });
});
