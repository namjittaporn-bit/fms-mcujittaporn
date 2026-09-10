import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  EDOCUMENT_P,
  listUserDocuments,
  listPendingApprovals,
  listAllDocuments,
  listDepartments,
} from "@/features/edocument/server";
import { EDocumentClient } from "./_components/edocument-client";

export default async function AdminEDocumentsPage() {
  const ctx = await requirePermission(EDOCUMENT_P.edocumentRead);
  const roleCodes = ctx.roles.map((r) => r.code);
  if (ctx.isSuperAdmin) roleCodes.push("SUPER_ADMIN");

  const canApprove = hasPermission(ctx, EDOCUMENT_P.edocumentApprove);
  const canManage = hasPermission(ctx, EDOCUMENT_P.edocumentManage);

  const [myDocuments, pendingApprovals, allDocuments, departments] = await Promise.all([
    listUserDocuments(ctx.tenantId, ctx.userId),
    canApprove ? listPendingApprovals(ctx.tenantId, ctx.userId, roleCodes) : Promise.resolve([]),
    canManage ? listAllDocuments(ctx.tenantId) : Promise.resolve([]),
    listDepartments(ctx.tenantId),
  ]);

  return (
    <EDocumentClient
      userId={ctx.userId}
      userName={ctx.userName}
      initialMyDocs={myDocuments}
      initialPendingDocs={pendingApprovals}
      initialAllDocs={allDocuments}
      departments={departments}
      canCreate={hasPermission(ctx, EDOCUMENT_P.edocumentCreate)}
      canApprove={canApprove}
      canManage={canManage}
    />
  );
}
