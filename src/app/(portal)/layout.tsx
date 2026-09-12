import { getLocale } from "@/shared/lib/i18n/server";
import { resolveTenantSettings } from "@/features/identity/server";
import { PortalNavbar } from "./_components/portal-navbar";
import { PortalFooter } from "./_components/portal-footer";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, tenant] = await Promise.all([
    getLocale(),
    resolveTenantSettings(),
  ]);
  const isEn = locale === "en";
  const facultyName = tenant
    ? (isEn ? tenant.nameEn : tenant.nameTh)
    : (isEn ? "Faculty of Technology & Management" : "คณะเทคโนโลยีและการจัดการ");
  const brandTagline = isEn
    ? "Excellence in Innovation & Education"
    : "มุ่งสู่ความเป็นเลิศด้านนวัตกรรมและการศึกษา";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Top Bar (Liyon Admin-style Navbar) */}
      <PortalNavbar
        brandName={facultyName}
        brandTagline={brandTagline}
        brandLogo={tenant?.logoUrl}
        locale={locale}
      />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Modern Liyon-styled Footer */}
      <PortalFooter
        brandName={facultyName}
        brandTagline={brandTagline}
        brandLogo={tenant?.logoUrl}
        locale={locale}
        contact={tenant?.contact}
      />
    </div>
  );
}
