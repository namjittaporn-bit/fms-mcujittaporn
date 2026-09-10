import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  PERSONNEL_P,
  listAdminStaff,
  listDepartments,
} from "@/features/personnel/server";
import { PersonnelClient } from "./_components/personnel-client";

export default async function AdminPersonnelPage() {
  const ctx = await requirePermission(PERSONNEL_P.personnelRead);
  const [initialStaff, departments] = await Promise.all([
    listAdminStaff(ctx.tenantId),
    listDepartments(ctx.tenantId),
  ]);

  return (
    <PersonnelClient
      initialItems={initialStaff}
      departments={departments}
      canCreate={hasPermission(ctx, PERSONNEL_P.personnelCreate)}
      canUpdate={hasPermission(ctx, PERSONNEL_P.personnelUpdate)}
      canDelete={hasPermission(ctx, PERSONNEL_P.personnelDelete)}
    />
  );
}
