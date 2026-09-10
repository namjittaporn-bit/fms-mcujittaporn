import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "@/shared/lib/i18n/server";
import { getPortalProgramById } from "@/features/curriculum/server";
import {
  GraduationCap,
  ArrowLeft,
  Download,
  Clock,
  BookOpen,
  Coins,
  CheckCircle2,
  Building,
  Briefcase,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PortalCurriculumDetailPage({ params }: Props) {
  const { id } = await params;
  const locale = await getLocale();
  const isEn = locale === "en";

  const program = await getPortalProgramById(id);
  if (!program) {
    notFound();
  }

  const getDegreeLevelLabel = (level: string) => {
    switch (level) {
      case "BACHELOR":
        return isEn ? "Bachelor's Degree" : "ระดับปริญญาตรี";
      case "MASTER":
        return isEn ? "Master's Degree" : "ระดับปริญญาโท";
      case "DOCTORATE":
        return isEn ? "Doctoral Degree" : "ระดับปริญญาเอก";
      case "DIPLOMA":
        return isEn ? "Graduate Diploma" : "ระดับประกาศนียบัตรบัณฑิต";
      default:
        return level;
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case "REGULAR":
        return isEn ? "Regular Program" : "ภาคปกติ";
      case "SPECIAL":
        return isEn ? "Special Program" : "ภาคพิเศษ";
      case "INTERNATIONAL":
        return isEn ? "International Program" : "หลักสูตรนานาชาติ";
      case "BILINGUAL":
        return isEn ? "Bilingual Program" : "หลักสูตรสองภาษา";
      default:
        return plan;
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-8 space-y-10">
      {/* Back Button */}
      <Link
        href="/curriculum"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{isEn ? "Back to Programs" : "ย้อนกลับหน้ารายการหลักสูตร"}</span>
      </Link>

      {/* Main Header / Hero */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>{getDegreeLevelLabel(program.degreeLevel)}</span>
              </span>
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {program.code}
              </span>
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {getPlanLabel(program.programPlan)}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold sm:text-3xl text-foreground tracking-tight">
              {isEn ? program.nameEn : program.nameTh}
            </h1>
            <p className="text-sm font-medium text-muted-foreground">
              {isEn ? program.nameTh : program.nameEn}
            </p>
          </div>

          {program.tqfFileUrl && (
            <div className="shrink-0">
              <a href={program.tqfFileUrl} target="_blank" rel="noopener noreferrer">
                <Button className="gap-2 text-xs font-semibold shadow-xs">
                  <Download className="h-4 w-4" />
                  <span>{isEn ? "Download TQF 2 (PDF)" : "ดาวน์โหลดเล่ม มคอ.2"}</span>
                </Button>
              </a>
            </div>
          )}
        </div>

        {/* Degree Titles Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl bg-muted/40 p-5 text-xs">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {isEn ? "Degree Title (Thai)" : "ชื่อปริญญา (ภาษาไทย)"}
            </span>
            <p className="font-bold text-sm text-foreground">{program.degreeTitleTh}</p>
            <p className="text-muted-foreground font-medium">{program.degreeAbbrTh}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {isEn ? "Degree Title (English)" : "ชื่อปริญญา (ภาษาอังกฤษ)"}
            </span>
            <p className="font-bold text-sm text-foreground">{program.degreeTitleEn}</p>
            <p className="text-muted-foreground font-medium">{program.degreeAbbrEn}</p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-border/80 bg-background text-center shadow-2xs">
            <Clock className="h-5 w-5 text-primary mb-1.5" />
            <span className="text-xl font-extrabold text-foreground">{program.durationYears} {isEn ? "Years" : "ปี"}</span>
            <span className="text-xs text-muted-foreground">{isEn ? "Duration" : "ระยะเวลาศึกษา"}</span>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-border/80 bg-background text-center shadow-2xs">
            <BookOpen className="h-5 w-5 text-primary mb-1.5" />
            <span className="text-xl font-extrabold text-foreground">{program.totalCredits}</span>
            <span className="text-xs text-muted-foreground">{isEn ? "Total Credits" : "หน่วยกิตรวม"}</span>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-border/80 bg-background text-center shadow-2xs">
            <Coins className="h-5 w-5 text-primary mb-1.5" />
            <span className="text-xl font-extrabold text-foreground">
              {program.tuitionFeeSemester ? `฿${program.tuitionFeeSemester.toLocaleString()}` : "-"}
            </span>
            <span className="text-xs text-muted-foreground">{isEn ? "Fee / Semester" : "ค่าธรรมเนียม / เทอม"}</span>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-border/80 bg-background text-center shadow-2xs">
            <Building className="h-5 w-5 text-primary mb-1.5" />
            <span className="text-sm font-bold text-foreground truncate max-w-full px-2">
              {isEn ? program.departmentNameEn ?? "Faculty Unit" : program.departmentNameTh ?? "คณะเทคโนโลยีและการจัดการ"}
            </span>
            <span className="text-xs text-muted-foreground">{isEn ? "Department" : "ภาควิชาผู้รับผิดชอบ"}</span>
          </div>
        </div>
      </div>

      {/* Description & Objectives */}
      {(program.descriptionTh || program.descriptionEn) && (
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              {isEn ? "Philosophy & Objectives" : "ปรัชญาและวัตถุประสงค์ของหลักสูตร"}
            </h2>
          </div>
          <div className="prose prose-neutral dark:prose-invert max-w-none text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
            {isEn ? program.descriptionEn || program.descriptionTh : program.descriptionTh || program.descriptionEn}
          </div>
        </div>
      )}

      {/* Curriculum Structure */}
      {program.curriculumStructure && program.curriculumStructure.length > 0 && (
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Layers className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold text-foreground">
                {isEn ? "Curriculum Structure" : "โครงสร้างหลักสูตร"}
              </h2>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {isEn ? `Total ${program.totalCredits} Credits` : `รวมตลอดหลักสูตร ${program.totalCredits} หน่วยกิต`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {program.curriculumStructure.map((cat, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-3"
              >
                <div>
                  <h3 className="font-bold text-sm text-foreground">{cat.category}</h3>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{cat.description}</p>
                  )}
                </div>
                <div className="flex items-baseline justify-between border-t border-border/40 pt-2 text-xs">
                  <span className="text-muted-foreground">{isEn ? "Credits" : "จำนวน"}</span>
                  <span className="text-base font-extrabold text-primary">
                    {cat.credits} <span className="text-xs font-normal text-muted-foreground">{isEn ? "credits" : "หน่วยกิต"}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Career Opportunities */}
      {program.careerPaths && program.careerPaths.length > 0 && (
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Briefcase className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              {isEn ? "Career Opportunities" : "อาชีพที่สามารถประกอบได้หลังสำเร็จการศึกษา"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {program.careerPaths.map((career, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 text-xs font-medium text-foreground"
              >
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span>{career}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
