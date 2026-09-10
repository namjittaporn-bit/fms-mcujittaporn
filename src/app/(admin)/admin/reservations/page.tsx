import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  RESERVATION_P,
  listResources,
  listReservations,
} from "@/features/reservation/server";
import { prisma } from "@/shared/lib/infra/prisma";
import { ReservationClient } from "./_components/reservation-client";

export default async function AdminReservationsPage() {
  const ctx = await requirePermission(RESERVATION_P.reservationRead);

  const canCreate = hasPermission(ctx, RESERVATION_P.reservationCreate);
  const canApprove = hasPermission(ctx, RESERVATION_P.reservationApprove);
  const canManage = hasPermission(ctx, RESERVATION_P.reservationManage);

  const [resources, myReservations, allReservations, departments] = await Promise.all([
    listResources(ctx.tenantId),
    listReservations(ctx.tenantId, { userId: ctx.userId }),
    canApprove || canManage ? listReservations(ctx.tenantId) : Promise.resolve([]),
    prisma.department.findMany({
      where: { tenantId: ctx.tenantId, isActive: true },
      select: { id: true, nameTh: true, nameEn: true },
      orderBy: { orderIndex: "asc" },
    }),
  ]);

  return (
    <ReservationClient
      userId={ctx.userId}
      userName={ctx.userName}
      initialResources={resources}
      initialMyReservations={myReservations}
      initialAllReservations={allReservations}
      departments={departments}
      canCreate={canCreate}
      canApprove={canApprove}
      canManage={canManage}
    />
  );
}
