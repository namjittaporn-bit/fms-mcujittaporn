import { resolveTenantSettings } from "@/features/identity/server";
import { AdminLayoutClient } from "./_components/admin-layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await resolveTenantSettings();

  return (
    <AdminLayoutClient
      brandLogo={tenant?.logoUrl}
      brandNameTh={tenant?.nameTh}
      brandNameEn={tenant?.nameEn}
    >
      {children}
    </AdminLayoutClient>
  );
}
