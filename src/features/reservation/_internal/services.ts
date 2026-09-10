import { prisma } from "@/shared/lib/infra/prisma";
import { writeAudit } from "@/features/identity/server";
import type { ResourceType, ReservationStatus } from "@/generated/prisma";
import type {
  CreateReservationInput,
  ReviewReservationInput,
  CreateResourceInput,
} from "./validations";

export interface ResourceItemDto {
  id: string;
  type: ResourceType;
  code: string;
  nameTh: string;
  nameEn: string;
  description: string | null;
  capacity: number;
  location: string | null;
  licensePlate: string | null;
  driverName: string | null;
  driverPhone: string | null;
  amenities: string[];
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ResourceReservationDto {
  id: string;
  resourceId: string;
  resourceCode: string;
  resourceNameTh: string;
  resourceNameEn: string;
  resourceType: ResourceType;
  resourceLocation: string | null;
  licensePlate: string | null;
  capacity: number;
  userId: string;
  userName: string;
  userEmail: string;
  departmentId: string | null;
  departmentNameTh: string | null;
  title: string;
  purpose: string | null;
  attendeesCount: number;
  destination: string | null;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  reviewNotes: string | null;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

function mapResourceToDto(r: {
  id: string;
  type: ResourceType;
  code: string;
  nameTh: string;
  nameEn: string;
  description: string | null;
  capacity: number;
  location: string | null;
  licensePlate: string | null;
  driverName: string | null;
  driverPhone: string | null;
  amenities: unknown;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
}): ResourceItemDto {
  let amenitiesList: string[] = [];
  if (Array.isArray(r.amenities)) {
    amenitiesList = r.amenities.map(String);
  }
  return {
    id: r.id,
    type: r.type,
    code: r.code,
    nameTh: r.nameTh,
    nameEn: r.nameEn,
    description: r.description,
    capacity: r.capacity,
    location: r.location,
    licensePlate: r.licensePlate,
    driverName: r.driverName,
    driverPhone: r.driverPhone,
    amenities: amenitiesList,
    imageUrl: r.imageUrl,
    isActive: r.isActive,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function listResources(
  tenantId: string,
  options?: { type?: ResourceType; isActive?: boolean }
): Promise<ResourceItemDto[]> {
  const items = await prisma.resourceItem.findMany({
    where: {
      tenantId,
      ...(options?.type ? { type: options.type } : {}),
      ...(typeof options?.isActive === "boolean" ? { isActive: options.isActive } : {}),
    },
    orderBy: [{ type: "asc" }, { code: "asc" }],
  });
  return items.map(mapResourceToDto);
}

export async function getResourceById(
  tenantId: string,
  id: string
): Promise<ResourceItemDto | null> {
  const item = await prisma.resourceItem.findFirst({
    where: { id, tenantId },
  });
  return item ? mapResourceToDto(item) : null;
}

export async function checkResourceConflict(
  tenantId: string,
  resourceId: string,
  startTime: Date,
  endTime: Date,
  excludeReservationId?: string
): Promise<{ hasConflict: boolean; conflictingReservation?: { id: string; title: string; startTime: string; endTime: string } }> {
  const conflicting = await prisma.resourceReservation.findFirst({
    where: {
      tenantId,
      resourceId,
      status: { in: ["PENDING", "APPROVED"] },
      ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
      // Overlap condition: existing.startTime < input.endTime AND existing.endTime > input.startTime
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
    },
  });

  if (conflicting) {
    return {
      hasConflict: true,
      conflictingReservation: {
        id: conflicting.id,
        title: conflicting.title,
        startTime: conflicting.startTime.toISOString(),
        endTime: conflicting.endTime.toISOString(),
      },
    };
  }

  return { hasConflict: false };
}

export async function listReservations(
  tenantId: string,
  options?: {
    resourceId?: string;
    userId?: string;
    status?: ReservationStatus;
    type?: ResourceType;
  }
): Promise<ResourceReservationDto[]> {
  const reservations = await prisma.resourceReservation.findMany({
    where: {
      tenantId,
      ...(options?.resourceId ? { resourceId: options.resourceId } : {}),
      ...(options?.userId ? { userId: options.userId } : {}),
      ...(options?.status ? { status: options.status } : {}),
      ...(options?.type ? { resource: { type: options.type } } : {}),
    },
    include: {
      resource: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      department: {
        select: {
          id: true,
          nameTh: true,
        },
      },
    },
    orderBy: { startTime: "desc" },
  });

  return reservations.map((r) => ({
    id: r.id,
    resourceId: r.resourceId,
    resourceCode: r.resource.code,
    resourceNameTh: r.resource.nameTh,
    resourceNameEn: r.resource.nameEn,
    resourceType: r.resource.type,
    resourceLocation: r.resource.location,
    licensePlate: r.resource.licensePlate,
    capacity: r.resource.capacity,
    userId: r.userId,
    userName: r.user.name,
    userEmail: r.user.email,
    departmentId: r.departmentId,
    departmentNameTh: r.department?.nameTh ?? null,
    title: r.title,
    purpose: r.purpose,
    attendeesCount: r.attendeesCount,
    destination: r.destination,
    startTime: r.startTime.toISOString(),
    endTime: r.endTime.toISOString(),
    status: r.status,
    reviewNotes: r.reviewNotes,
    reviewedByUserId: r.reviewedByUserId,
    reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function createReservation(
  tenantId: string,
  userId: string,
  input: CreateReservationInput
): Promise<ResourceReservationDto> {
  const start = new Date(input.startTime);
  const end = new Date(input.endTime);

  if (end <= start) {
    throw new Error("End time must be after start time");
  }

  // Check resource exists and is active
  const resource = await prisma.resourceItem.findFirst({
    where: { id: input.resourceId, tenantId, isActive: true },
  });
  if (!resource) {
    throw new Error("Resource not found or unavailable");
  }

  if (input.attendeesCount > resource.capacity) {
    throw new Error(`Attendees count (${input.attendeesCount}) exceeds capacity (${resource.capacity})`);
  }

  // Check conflict
  const conflict = await checkResourceConflict(tenantId, input.resourceId, start, end);
  if (conflict.hasConflict) {
    throw new Error("The selected time slot conflicts with an existing reservation.");
  }

  const reservation = await prisma.resourceReservation.create({
    data: {
      tenantId,
      resourceId: input.resourceId,
      userId,
      departmentId: input.departmentId ?? null,
      title: input.title,
      purpose: input.purpose ?? null,
      attendeesCount: input.attendeesCount,
      destination: input.destination ?? null,
      startTime: start,
      endTime: end,
      status: "PENDING",
    },
    include: {
      resource: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      department: {
        select: {
          id: true,
          nameTh: true,
        },
      },
    },
  });

  await writeAudit({
    tenantId,
    actorId: userId,
    action: "reservation.create",
    entity: "reservation",
    entityId: reservation.id,
    after: {
      resourceId: reservation.resourceId,
      title: reservation.title,
      startTime: reservation.startTime.toISOString(),
      endTime: reservation.endTime.toISOString(),
    },
  });

  return {
    id: reservation.id,
    resourceId: reservation.resourceId,
    resourceCode: reservation.resource.code,
    resourceNameTh: reservation.resource.nameTh,
    resourceNameEn: reservation.resource.nameEn,
    resourceType: reservation.resource.type,
    resourceLocation: reservation.resource.location,
    licensePlate: reservation.resource.licensePlate,
    capacity: reservation.resource.capacity,
    userId: reservation.userId,
    userName: reservation.user.name,
    userEmail: reservation.user.email,
    departmentId: reservation.departmentId,
    departmentNameTh: reservation.department?.nameTh ?? null,
    title: reservation.title,
    purpose: reservation.purpose,
    attendeesCount: reservation.attendeesCount,
    destination: reservation.destination,
    startTime: reservation.startTime.toISOString(),
    endTime: reservation.endTime.toISOString(),
    status: reservation.status,
    reviewNotes: reservation.reviewNotes,
    reviewedByUserId: reservation.reviewedByUserId,
    reviewedAt: reservation.reviewedAt ? reservation.reviewedAt.toISOString() : null,
    createdAt: reservation.createdAt.toISOString(),
  };
}

export async function reviewReservation(
  tenantId: string,
  reviewerUserId: string,
  input: ReviewReservationInput
): Promise<ResourceReservationDto> {
  const reservation = await prisma.resourceReservation.findFirst({
    where: { id: input.reservationId, tenantId },
    include: { resource: true },
  });

  if (!reservation) {
    throw new Error("Reservation not found");
  }

  if (reservation.status !== "PENDING") {
    throw new Error(`Cannot review reservation with status ${reservation.status}`);
  }

  const newStatus: ReservationStatus = input.action === "APPROVE" ? "APPROVED" : "REJECTED";

  // If approving, re-check conflict
  if (newStatus === "APPROVED") {
    const conflict = await checkResourceConflict(
      tenantId,
      reservation.resourceId,
      reservation.startTime,
      reservation.endTime,
      reservation.id
    );
    if (conflict.hasConflict) {
      throw new Error("Cannot approve: time slot conflicts with another reservation.");
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.resourceReservation.update({
      where: { id: input.reservationId },
      data: {
        status: newStatus,
        reviewNotes: input.reviewNotes ?? null,
        reviewedByUserId: reviewerUserId,
        reviewedAt: new Date(),
      },
      include: {
        resource: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        department: {
          select: {
            id: true,
            nameTh: true,
          },
        },
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId: reviewerUserId,
        action: `reservation.${newStatus.toLowerCase()}`,
        entity: "reservation",
        entityId: res.id,
        before: { status: reservation.status },
        after: { status: newStatus, reviewNotes: input.reviewNotes },
      },
      tx
    );

    return res;
  });

  return {
    id: updated.id,
    resourceId: updated.resourceId,
    resourceCode: updated.resource.code,
    resourceNameTh: updated.resource.nameTh,
    resourceNameEn: updated.resource.nameEn,
    resourceType: updated.resource.type,
    resourceLocation: updated.resource.location,
    licensePlate: updated.resource.licensePlate,
    capacity: updated.resource.capacity,
    userId: updated.userId,
    userName: updated.user.name,
    userEmail: updated.user.email,
    departmentId: updated.departmentId,
    departmentNameTh: updated.department?.nameTh ?? null,
    title: updated.title,
    purpose: updated.purpose,
    attendeesCount: updated.attendeesCount,
    destination: updated.destination,
    startTime: updated.startTime.toISOString(),
    endTime: updated.endTime.toISOString(),
    status: updated.status,
    reviewNotes: updated.reviewNotes,
    reviewedByUserId: updated.reviewedByUserId,
    reviewedAt: updated.reviewedAt ? updated.reviewedAt.toISOString() : null,
    createdAt: updated.createdAt.toISOString(),
  };
}

export async function cancelReservation(
  tenantId: string,
  userId: string,
  reservationId: string,
  isAdmin = false
): Promise<void> {
  const reservation = await prisma.resourceReservation.findFirst({
    where: {
      id: reservationId,
      tenantId,
      ...(isAdmin ? {} : { userId }),
    },
  });

  if (!reservation) {
    throw new Error("Reservation not found or you do not have permission to cancel");
  }

  if (reservation.status === "CANCELLED" || reservation.status === "COMPLETED") {
    throw new Error(`Cannot cancel reservation in ${reservation.status} status`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.resourceReservation.update({
      where: { id: reservationId },
      data: {
        status: "CANCELLED",
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId: userId,
        action: "reservation.cancel",
        entity: "reservation",
        entityId: reservationId,
        before: { status: reservation.status },
        after: { status: "CANCELLED" },
      },
      tx
    );
  });
}

export async function createResource(
  tenantId: string,
  userId: string,
  input: CreateResourceInput
): Promise<ResourceItemDto> {
  const existing = await prisma.resourceItem.findFirst({
    where: { tenantId, code: input.code },
  });
  if (existing) {
    throw new Error(`Resource with code '${input.code}' already exists`);
  }

  const item = await prisma.resourceItem.create({
    data: {
      tenantId,
      type: input.type,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      description: input.description ?? null,
      capacity: input.capacity,
      location: input.location ?? null,
      licensePlate: input.licensePlate ?? null,
      driverName: input.driverName ?? null,
      driverPhone: input.driverPhone ?? null,
      amenities: input.amenities,
      imageUrl: input.imageUrl ?? null,
      isActive: input.isActive,
    },
  });

  await writeAudit({
    tenantId,
    actorId: userId,
    action: "resource.create",
    entity: "resource_item",
    entityId: item.id,
    after: { code: item.code, nameTh: item.nameTh, type: item.type },
  });

  return mapResourceToDto(item);
}

export async function toggleResourceActive(
  tenantId: string,
  userId: string,
  resourceId: string,
  isActive: boolean
): Promise<void> {
  await prisma.resourceItem.update({
    where: { id: resourceId, tenantId },
    data: { isActive },
  });

  await writeAudit({
    tenantId,
    actorId: userId,
    action: isActive ? "resource.activate" : "resource.deactivate",
    entity: "resource_item",
    entityId: resourceId,
    after: { isActive },
  });
}
