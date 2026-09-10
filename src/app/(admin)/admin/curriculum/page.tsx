import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  CURRICULUM_P,
  listAdminPrograms,
  listDepartments,
} from "@/features/curriculum/server";
import { CurriculumClient } from "./_components/curriculum-client";

export default async function AdminCurriculumPage() {
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
  const [initialPrograms, departments] = await Promise.all([
    listAdminPrograms(ctx.tenantId),
    listDepartments(ctx.tenantId),
  ]);

  return (
    <CurriculumClient
      initialItems={initialPrograms}
      departments={departments}
      canCreate={hasPermission(ctx, CURRICULUM_P.curriculumCreate)}
      canUpdate={hasPermission(ctx, CURRICULUM_P.curriculumUpdate)}
      canDelete={hasPermission(ctx, CURRICULUM_P.curriculumDelete)}
    />
  );
}
