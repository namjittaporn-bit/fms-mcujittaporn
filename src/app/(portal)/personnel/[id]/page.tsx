import { notFound } from "next/navigation";
import Link from "next/link";
import { getLocale } from "@/shared/lib/i18n/server";
import { getPortalStaffById } from "@/features/personnel/server";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Sparkles,
  Award,
  BookOpen,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StaffProfileDetailPage({ params }: Props) {
  const { id } = await params;
  const locale = await getLocale();
  const isEn = locale === "en";

  const staff = await getPortalStaffById(id);
  if (!staff) notFound();

  const getRankName = (rank: string) => {
    switch (rank) {
      case "PROFESSOR": return isEn ? "Professor (Prof.)" : "ศาสตราจารย์ (ศ.)";
      case "ASSOC_PROF": return isEn ? "Associate Professor (Assoc. Prof.)" : "รองศาสตราจารย์ (รศ.)";
      case "ASST_PROF": return isEn ? "Assistant Professor (Asst. Prof.)" : "ผู้ช่วยศาสตราจารย์ (ผศ.)";
      case "LECTURER": return isEn ? "Lecturer" : "อาจารย์ (อ.)";
      default: return "";
    }
  };

  const getPositionName = (pos: string) => {
    switch (pos) {
      case "DEAN": return isEn ? "Dean" : "คณบดี";
      case "VICE_DEAN": return isEn ? "Vice Dean" : "รองคณบดี";
      case "ASST_DEAN": return isEn ? "Assistant Dean" : "ผู้ช่วยคณบดี";
      case "HEAD_OF_DEPT": return isEn ? "Head of Department" : "หัวหน้าภาควิชา";
      case "SECRETARY": return isEn ? "Faculty Secretary" : "เลขานุการคณะ";
      default: return "";
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-8 space-y-10">
      {/* Navigation */}
      <div>
        <Link href="/personnel">
          <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>{isEn ? "Back to Directory" : "กลับหน้ารวมทำเนียบบุคลากร"}</span>
          </Button>
        </Link>
      </div>

      {/* Main Profile Card */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xs">
        <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-background p-8 sm:p-10 border-b border-border/40">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border-2 border-background shadow-md bg-muted">
              {staff.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={staff.avatarUrl}
                  alt={isEn ? staff.fullNameEn : staff.fullNameTh}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary text-4xl font-bold">
                  {staff.firstNameTh.charAt(0)}
                </div>
              )}
            </div>

            {/* Name and Badges */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {staff.adminPosition !== "NONE" && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-xs">
                    <Award className="h-3.5 w-3.5" />
                    {getPositionName(staff.adminPosition)}
                  </span>
                )}
                {staff.academicRank !== "NONE" && (
                  <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {getRankName(staff.academicRank)}
                  </span>
                )}
                <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {staff.personnelType === "ACADEMIC" ? (isEn ? "Faculty Member" : "สายวิชาการ") : (isEn ? "Support Staff" : "สายสนับสนุน")}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {isEn ? staff.fullNameEn : staff.fullNameTh}
              </h1>

              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-primary" />
                <span>
                  {isEn ? staff.departmentNameEn ?? "Faculty of Technology and Management" : staff.departmentNameTh ?? "คณะเทคโนโลยีและการจัดการ"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 gap-4 border-b border-border/60 bg-muted/20 px-8 py-4 sm:grid-cols-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">{staff.email}</span>
          </div>
          {staff.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <span>{staff.phone}</span>
            </div>
          )}
          {staff.roomNumber && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span>{staff.roomNumber}</span>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="p-8 sm:p-10 space-y-8">
          {/* Expertise */}
          {staff.expertise && staff.expertise.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">
                  {isEn ? "Areas of Expertise" : "ความเชี่ยวชาญพิเศษ"}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {staff.expertise.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-xl bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {staff.educationHistory && staff.educationHistory.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">
                  {isEn ? "Education Background" : "ประวัติการศึกษา"}
                </h2>
              </div>
              <div className="space-y-3">
                {staff.educationHistory.map((edu, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border border-border/80 bg-background p-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">
                        {edu.degree} ({edu.field})
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {edu.institution} {edu.year && `• ${edu.year}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Research Interests */}
          {staff.researchInterests && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">
                  {isEn ? "Research & Scholarly Work" : "งานวิจัยและผลงานที่สนใจ"}
                </h2>
              </div>
              <div className="rounded-xl border border-border/80 bg-background p-5 text-sm leading-relaxed text-foreground/90">
                {staff.researchInterests}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
