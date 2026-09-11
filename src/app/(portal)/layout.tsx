import Link from "next/link";
import { getLocale } from "@/shared/lib/i18n/server";
import { resolveTenantSettings } from "@/features/identity/server";
import { PortalNavbar } from "./_components/portal-navbar";
import { GraduationCap, Phone, Mail, MapPin, ExternalLink } from "lucide-react";

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

      {/* Footer */}
      <footer className="border-t border-border bg-muted/40 text-muted-foreground">
        <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Col 1: About */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary overflow-hidden p-0.5 border border-border/40">
                  {tenant?.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={tenant.logoUrl}
                      alt={facultyName}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground rounded-md">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <span className="font-bold text-foreground">
                  {facultyName}
                </span>
              </div>
              <p className="text-xs leading-relaxed">
                {isEn
                  ? "Empowering students, faculty, and society through academic excellence, research innovation, and quality management."
                  : "สร้างสรรค์บัณฑิตและผลงานวิจัยที่มีคุณภาพ พร้อมก้าวสู่การเป็นผู้นำทางวิชาการและนวัตกรรมเพื่อสังคม"}
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {isEn ? "Public Services" : "บริการสาธารณะ"}
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/news" className="hover:text-foreground transition">
                    {isEn ? "News & Announcements" : "ข่าวสารและประกาศ"}
                  </Link>
                </li>
                <li>
                  <Link href="/news?category=SCHOLARSHIP" className="hover:text-foreground transition">
                    {isEn ? "Student Scholarships" : "ทุนการศึกษานักศึกษา"}
                  </Link>
                </li>
                <li>
                  <Link href="/news?category=PROCUREMENT" className="hover:text-foreground transition">
                    {isEn ? "Procurement Announcements" : "ประกาศจัดซื้อจัดจ้าง"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Academic Programs */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {isEn ? "Internal Systems" : "ระบบบริการภายใน"}
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/login" className="hover:text-foreground transition flex items-center gap-1">
                    <span>{isEn ? "Admin Console" : "ระบบหลังบ้านสำหรับบุคลากร"}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </li>
                <li>
                  <Link href="/admin/news" className="hover:text-foreground transition flex items-center gap-1">
                    <span>{isEn ? "News Management" : "ระบบจัดการข่าวประชาสัมพันธ์"}</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Contact */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {isEn ? "Contact Information" : "ติดต่อสอบถาม"}
              </h3>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                  <span>
                    {isEn
                      ? "Building 1, Faculty of Technology and Management, University Campus"
                      : "อาคาร 1 คณะเทคโนโลยีและการจัดการ มหาวิทยาลัย"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <span>02-123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <span>info@faculty.ac.th</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} Faculty Web Platform. Built with VibeCore Framework.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
