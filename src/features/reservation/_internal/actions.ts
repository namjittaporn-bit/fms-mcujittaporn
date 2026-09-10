"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { RESERVATION_P } from "../permissions";
import {
  createReservationSchema,
  reviewReservationSchema,
  cancelReservationSchema,
  createResourceSchema,
} from "./validations";
import {
  listResources,
  listReservations,
  checkResourceConflict,
  createReservation,
  reviewReservation,
  cancelReservation,
  createResource,
  toggleResourceActive,
  type ResourceItemDto,
  type ResourceReservationDto,
} from "./services";
import type { ResourceType, ReservationStatus } from "@/generated/prisma";

export async function getResourcesAction(
  options?: { type?: ResourceType; isActive?: boolean }
): Promise<ActionResult<ResourceItemDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATION_P.reservationRead);
    return listResources(ctx.tenantId, options);
  });
}

export async function getReservationsAction(
  options?: {
    resourceId?: string;
    userId?: string;
    status?: ReservationStatus;
    type?: ResourceType;
  }
): Promise<ActionResult<ResourceReservationDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATION_P.reservationRead);
    return listReservations(ctx.tenantId, options);
  });
}

export async function getMyReservationsAction(): Promise<ActionResult<ResourceReservationDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATION_P.reservationRead);
    return listReservations(ctx.tenantId, { userId: ctx.userId });
  });
}

export async function checkConflictAction(
  resourceId: string,
  startTime: string,
  endTime: string,
  excludeReservationId?: string
): Promise<ActionResult<{ hasConflict: boolean; conflictingReservation?: { id: string; title: string; startTime: string; endTime: string } }>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATION_P.reservationRead);
    return checkResourceConflict(
      ctx.tenantId,
      resourceId,
      new Date(startTime),
      new Date(endTime),
      excludeReservationId
    );
  });
}

export async function createReservationAction(
  input: unknown
): Promise<ActionResult<ResourceReservationDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATION_P.reservationCreate);
    const locale = await getLocale();
    const parsed = createReservationSchema.parse(input, { error: zodErrorMap(locale) });
    const result = await createReservation(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/admin/reservations");
    return result;
  });
}

export async function reviewReservationAction(
  input: unknown
): Promise<ActionResult<ResourceReservationDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATION_P.reservationApprove);
    const locale = await getLocale();
    const parsed = reviewReservationSchema.parse(input, { error: zodErrorMap(locale) });
    const result = await reviewReservation(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/admin/reservations");
    return result;
  });
}

export async function cancelReservationAction(
  input: unknown
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATION_P.reservationCancel);
    const locale = await getLocale();
    const parsed = cancelReservationSchema.parse(input, { error: zodErrorMap(locale) });
    await cancelReservation(ctx.tenantId, ctx.userId, parsed.reservationId, ctx.isSuperAdmin);
    revalidatePath("/admin/reservations");
  });
}

export async function createResourceAction(
  input: unknown
): Promise<ActionResult<ResourceItemDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATION_P.reservationManage);
    const locale = await getLocale();
    const parsed = createResourceSchema.parse(input, { error: zodErrorMap(locale) });
    const result = await createResource(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/admin/reservations");
    return result;
  });
}

export async function toggleResourceActiveAction(
  resourceId: string,
  isActive: boolean
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATION_P.reservationManage);
    await toggleResourceActive(ctx.tenantId, ctx.userId, resourceId, isActive);
    revalidatePath("/admin/reservations");
  });
}
