import Link from "next/link";
import { getLocale } from "@/shared/lib/i18n/server";
import { resolveTenantSettings } from "@/features/identity/server";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { GraduationCap, ShieldCheck, Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm overflow-hidden p-1 border border-border/40">
              {tenant?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tenant.logoUrl}
                  alt={facultyName}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground rounded-lg">
                  <GraduationCap className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight leading-tight text-foreground">
                {facultyName}
              </span>
              <span className="text-xs text-muted-foreground">
                {isEn ? "Excellence in Innovation & Education" : "มุ่งสู่ความเป็นเลิศด้านนวัตกรรมและการศึกษา"}
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/"
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              {isEn ? "Home" : "หน้าหลัก"}
            </Link>
            <Link
              href="/news"
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              {isEn ? "News & Events" : "ข่าวสารและกิจกรรม"}
            </Link>
            <Link
              href="/curriculum"
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              {isEn ? "Curriculum" : "หลักสูตรการศึกษา"}
            </Link>
            <Link
              href="/personnel"
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              {isEn ? "Faculty & Staff" : "ทำเนียบบุคลากร"}
            </Link>
            <Link
              href="/news?category=SCHOLARSHIP"
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              {isEn ? "Scholarships" : "ทุนการศึกษา"}
            </Link>
            <Link
              href="/news?category=PROCUREMENT"
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              {isEn ? "Procurement" : "จัดซื้อจัดจ้าง"}
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold">
                <ShieldCheck className="h-4 w-4" />
                <span>{isEn ? "Staff Login" : "เข้าสู่ระบบ"}</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

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
