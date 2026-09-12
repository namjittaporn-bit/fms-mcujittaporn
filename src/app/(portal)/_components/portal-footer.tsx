import Link from "next/link";
import {
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  BookOpen,
  Users,
  Award,
  FileText,
  Globe,
} from "lucide-react";
import type { ContactSettings } from "@/features/identity";

export interface PortalFooterProps {
  brandName: string;
  brandTagline: string;
  brandLogo?: string | null;
  locale: "th" | "en";
  contact?: ContactSettings | null;
}

export function PortalFooter({
  brandName,
  brandTagline,
  brandLogo,
  locale,
  contact,
}: PortalFooterProps) {
  const isEn = locale === "en";
  const currentYear = new Date().getFullYear();
  const thaiYear = currentYear + 543;

  return (
    <footer className="relative mt-auto border-t border-[var(--glass-border)] bg-gradient-to-b from-[var(--glass)] via-[var(--glass-strong)] to-[var(--panel)] backdrop-blur-xl text-[var(--text-2)] overflow-hidden">
      {/* Decorative ambient background glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--brand)] to-transparent opacity-40"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[var(--brand-glow)] blur-3xl opacity-10"
        aria-hidden="true"
      />

      {/* Main Footer Content */}
      <div className="container relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Col 1 & 2: Brand Information & Mission */}
          <div className="space-y-4 lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-3 transition hover:opacity-90"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand)] text-[var(--on-brand)] shadow-md overflow-hidden p-1 border border-[var(--glass-border)]">
                {brandLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brandLogo}
                    alt={brandName}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <GraduationCap className="h-6 w-6" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-[var(--text)]">
                  {brandName}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {brandTagline}
                </span>
              </div>
            </Link>

            <p className="text-xs leading-relaxed text-[var(--text-2)] max-w-md">
              {isEn
                ? "Empowering students, researchers, and community through academic excellence, innovative technology integration, and modern educational management."
                : "มุ่งมั่นผลิตบัณฑิตและผลงานวิจัยที่มีคุณภาพ พร้อมก้าวสู่การเป็นผู้นำทางวิชาการและการจัดการนวัตกรรมเพื่อการพัฒนาสังคมอย่างยั่งยืน"}
            </p>

            <div className="pt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--glass-strong)] border border-[var(--glass-border)] text-[var(--text)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)] animate-pulse" />
                {isEn ? "Open Educational Platform" : "ระบบบริการการศึกษาแบบเปิด"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--glass-strong)] border border-[var(--glass-border)] text-[var(--text)]">
                <ShieldCheck className="h-3 w-3 text-[var(--brand)]" />
                {isEn ? "Verified Security" : "ระบบความปลอดภัยมาตรฐาน"}
              </span>
            </div>
          </div>

          {/* Col 3: Academic & Services */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
              {isEn ? "Academic & Services" : "บริการวิชาการและข้อมูล"}
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 hover:text-[var(--text)] hover:translate-x-0.5 transition-all"
                >
                  <FileText className="h-3.5 w-3.5 text-[var(--brand)]" />
                  <span>{isEn ? "News & Events" : "ข่าวสารและกิจกรรม"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/curriculum"
                  className="inline-flex items-center gap-2 hover:text-[var(--text)] hover:translate-x-0.5 transition-all"
                >
                  <BookOpen className="h-3.5 w-3.5 text-[var(--brand)]" />
                  <span>{isEn ? "Curriculum" : "หลักสูตรการศึกษา"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/personnel"
                  className="inline-flex items-center gap-2 hover:text-[var(--text)] hover:translate-x-0.5 transition-all"
                >
                  <Users className="h-3.5 w-3.5 text-[var(--brand)]" />
                  <span>{isEn ? "Faculty & Staff" : "ทำเนียบบุคลากร"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/news?category=SCHOLARSHIP"
                  className="inline-flex items-center gap-2 hover:text-[var(--text)] hover:translate-x-0.5 transition-all"
                >
                  <Award className="h-3.5 w-3.5 text-[var(--brand)]" />
                  <span>{isEn ? "Scholarships" : "ทุนการศึกษา"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/news?category=PROCUREMENT"
                  className="inline-flex items-center gap-2 hover:text-[var(--text)] hover:translate-x-0.5 transition-all"
                >
                  <FileText className="h-3.5 w-3.5 text-[var(--brand)]" />
                  <span>{isEn ? "Procurement" : "ประกาศจัดซื้อจัดจ้าง"}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Internal Systems */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
              {isEn ? "Internal Systems" : "ระบบบริการภายใน"}
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 font-medium text-[var(--text)] hover:text-[var(--brand-ink)] transition-colors group"
                >
                  <span>{isEn ? "Admin Console" : "ระบบจัดการข้อมูลสำหรับบุคลากร"}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </Link>
              </li>
              <li>
                <Link
                  href="/me"
                  className="inline-flex items-center gap-1.5 hover:text-[var(--text)] transition-colors"
                >
                  <span>{isEn ? "Staff Profile" : "ระบบประวัติบุคลากร"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/news"
                  className="inline-flex items-center gap-1.5 hover:text-[var(--text)] transition-colors"
                >
                  <span>{isEn ? "News Management" : "ระบบบริหารจัดการข่าวสาร"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 hover:text-[var(--text)] transition-colors"
                >
                  <span>{isEn ? "Staff Sign In" : "เข้าสู่ระบบบุคลากร"}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact Information */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
              {isEn ? "Contact Us" : "ติดต่อสอบถาม"}
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-[var(--brand)] mt-0.5" />
                {contact?.googleMapUrl ? (
                  <a
                    href={contact.googleMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="leading-snug hover:text-[var(--text)] hover:underline transition-colors"
                  >
                    {isEn
                      ? contact.addressEn || contact.addressTh || "Faculty of Technology and Management Building, University Main Campus"
                      : contact.addressTh || contact.addressEn || "อาคารคณะเทคโนโลยีและการจัดการ มหาวิทยาลัย"}
                  </a>
                ) : (
                  <span className="leading-snug">
                    {isEn
                      ? contact?.addressEn || contact?.addressTh || "Faculty of Technology and Management Building, University Main Campus"
                      : contact?.addressTh || contact?.addressEn || "อาคารคณะเทคโนโลยีและการจัดการ มหาวิทยาลัย"}
                  </span>
                )}
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-[var(--brand)]" />
                <a
                  href={`tel:${(contact?.phone || "02-123-4567").replace(/\s+/g, "")}`}
                  className="hover:text-[var(--text)] hover:underline transition-colors"
                >
                  {contact?.phone || "02-123-4567"}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-[var(--brand)]" />
                <a
                  href={`mailto:${contact?.email || "info@faculty.ac.th"}`}
                  className="hover:text-[var(--text)] hover:underline transition-colors"
                >
                  {contact?.email || "info@faculty.ac.th"}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-[var(--brand)]" />
                <span>
                  {isEn
                    ? contact?.workingHoursEn || contact?.workingHoursTh || "Mon - Fri: 8:30 - 16:30"
                    : contact?.workingHoursTh || contact?.workingHoursEn || "จันทร์ - ศุกร์: 08:30 - 16:30 น."}
                </span>
              </li>
            </ul>

            {/* Social / External Links */}
            {(contact?.facebookUrl || contact?.websiteUrl || contact?.lineId) && (
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                {contact.websiteUrl && (
                  <a
                    href={contact.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors"
                    title={isEn ? "Official Website" : "เว็บไซต์หลัก"}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>{isEn ? "Website" : "เว็บไซต์"}</span>
                  </a>
                )}
                {contact.facebookUrl && (
                  <a
                    href={contact.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors"
                    title="Facebook Page"
                  >
                    <span>Facebook</span>
                  </a>
                )}
                {contact.lineId && (
                  <span className="inline-flex items-center gap-1 text-[var(--text-muted)]">
                    <span>Line: {contact.lineId}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="mt-12 pt-6 border-t border-[var(--glass-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>
            &copy; {isEn ? currentYear : `${thaiYear} (${currentYear})`} {brandName}.
            {" "}{isEn ? "All rights reserved." : "สงวนลิขสิทธิ์ทุกประการ"}
          </p>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/news" className="hover:text-[var(--text)] transition">
              {isEn ? "Announcements" : "ประกาศ"}
            </Link>
            <span>&bull;</span>
            <Link href="/curriculum" className="hover:text-[var(--text)] transition">
              {isEn ? "Curriculum" : "หลักสูตร"}
            </Link>
            <span>&bull;</span>
            <Link href="/login" className="hover:text-[var(--text)] transition">
              {isEn ? "Admin Console" : "ระบบจัดการ"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
