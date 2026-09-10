import { z } from "zod";

export const resourceTypeSchema = z.enum(["ROOM", "VEHICLE"]);
export const reservationStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED"]);

export const createReservationSchema = z
  .object({
    resourceId: z.string().uuid("Invalid resource ID"),
    title: z.string().trim().min(1, "Title is required").max(255),
    purpose: z.string().trim().optional(),
    attendeesCount: z.coerce.number().int().min(1, "Must have at least 1 attendee").default(1),
    destination: z.string().trim().optional(),
    startTime: z.string().datetime({ message: "Invalid start time" }),
    endTime: z.string().datetime({ message: "Invalid end time" }),
    departmentId: z.string().uuid("Invalid department ID").optional().nullable(),
  })
  .refine(
    (data) => new Date(data.endTime) > new Date(data.startTime),
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

export type CreateReservationInput = z.infer<typeof createReservationSchema>;

export const reviewReservationSchema = z.object({
  reservationId: z.string().uuid("Invalid reservation ID"),
  action: z.enum(["APPROVE", "REJECT"]),
  reviewNotes: z.string().trim().max(1000).optional(),
});

export type ReviewReservationInput = z.infer<typeof reviewReservationSchema>;

export const cancelReservationSchema = z.object({
  reservationId: z.string().uuid("Invalid reservation ID"),
});

export type CancelReservationInput = z.infer<typeof cancelReservationSchema>;

export const createResourceSchema = z.object({
  type: resourceTypeSchema,
  code: z.string().trim().min(1).max(50),
  nameTh: z.string().trim().min(1).max(255),
  nameEn: z.string().trim().min(1).max(255),
  description: z.string().trim().optional().nullable(),
  capacity: z.coerce.number().int().min(1).default(1),
  location: z.string().trim().optional().nullable(),
  licensePlate: z.string().trim().optional().nullable(),
  driverName: z.string().trim().optional().nullable(),
  driverPhone: z.string().trim().optional().nullable(),
  amenities: z.array(z.string()).default([]),
  imageUrl: z.string().trim().url().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
