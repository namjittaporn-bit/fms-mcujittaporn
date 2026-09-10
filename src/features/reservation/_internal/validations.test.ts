import { describe, it, expect } from "vitest";
import {
  createReservationSchema,
  reviewReservationSchema,
  createResourceSchema,
} from "./validations";

describe("reservation validations", () => {
  const validUUID = "123e4567-e89b-12d3-a456-426614174000";

  it("createReservationSchema ผ่านเมื่อข้อมูลและช่วงเวลาถูกต้อง", () => {
    const input = {
      resourceId: validUUID,
      title: "การประชุมผู้บริหาร",
      purpose: "ปรึกษาหารือแผนยุทธศาสตร์",
      attendeesCount: 15,
      startTime: "2026-09-15T09:00:00.000Z",
      endTime: "2026-09-15T12:00:00.000Z",
    };
    const parsed = createReservationSchema.parse(input);
    expect(parsed.title).toBe("การประชุมผู้บริหาร");
    expect(parsed.attendeesCount).toBe(15);
  });

  it("createReservationSchema ล้มเมื่อ endTime อยู่ก่อนหรือเท่ากับ startTime", () => {
    const input = {
      resourceId: validUUID,
      title: "การประชุม",
      startTime: "2026-09-15T12:00:00.000Z",
      endTime: "2026-09-15T09:00:00.000Z",
    };
    expect(() => createReservationSchema.parse(input)).toThrow();
  });

  it("createReservationSchema ล้มเมื่อ resourceId ไม่ใช่ UUID", () => {
    const input = {
      resourceId: "invalid-id",
      title: "การประชุม",
      startTime: "2026-09-15T09:00:00.000Z",
      endTime: "2026-09-15T12:00:00.000Z",
    };
    expect(() => createReservationSchema.parse(input)).toThrow();
  });

  it("reviewReservationSchema ตรวจสอบ action APPROVE และ REJECT", () => {
    const approve = { reservationId: validUUID, action: "APPROVE", reviewNotes: "อนุมัติ" };
    expect(reviewReservationSchema.parse(approve).action).toBe("APPROVE");

    const reject = { reservationId: validUUID, action: "REJECT", reviewNotes: "เวลาไม่เหมาะสม" };
    expect(reviewReservationSchema.parse(reject).action).toBe("REJECT");

    const invalid = { reservationId: validUUID, action: "CANCEL" };
    expect(() => reviewReservationSchema.parse(invalid)).toThrow();
  });

  it("createResourceSchema รองรับทั้ง ROOM และ VEHICLE", () => {
    const room = {
      type: "ROOM",
      code: "RM-101",
      nameTh: "ห้องประชุม 1",
      nameEn: "Meeting Room 1",
      capacity: 20,
      amenities: ["Projector", "WiFi"],
      isActive: true,
    };
    expect(createResourceSchema.parse(room).type).toBe("ROOM");

    const vehicle = {
      type: "VEHICLE",
      code: "VAN-01",
      nameTh: "รถตู้ 1",
      nameEn: "Van 1",
      capacity: 10,
      licensePlate: "กข-1234",
      driverName: "คนขับ",
      amenities: [],
      isActive: true,
    };
    expect(createResourceSchema.parse(vehicle).type).toBe("VEHICLE");
  });
});
