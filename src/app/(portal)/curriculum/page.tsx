import Link from "next/link";
import { getLocale } from "@/shared/lib/i18n/server";
import { getPortalPrograms, getPortalDepartments } from "@/features/curriculum/server";
import {
  GraduationCap,
  Search,
  Clock,
  BookOpen,
  Coins,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  searchParams: Promise<{ degreeLevel?: string; departmentId?: string; search?: string }>;
}

export default async function PortalCurriculumPage({ searchParams }: Props) {
  const params = await searchParams;
  const locale = await getLocale();
  const isEn = locale === "en";

  const degreeLevel = params.degreeLevel || "ALL";
  const departmentId = params.departmentId || "ALL";
  const search = params.search || "";

  const [programs, departments] = await Promise.all([
    getPortalPrograms({
      degreeLevel: degreeLevel !== "ALL" ? degreeLevel : undefined,
      departmentId: departmentId !== "ALL" ? departmentId : undefined,
      search: search || undefined,
    }),
    getPortalDepartments(),
  ]);

  const getDegreeLevelLabel = (level: string) => {
    switch (level) {
      case "BACHELOR":
        return isEn ? "Bachelor's Degree" : "ปริญญาตรี";
      case "MASTER":
        return isEn ? "Master's Degree" : "ปริญญาโท";
      case "DOCTORATE":
        return isEn ? "Doctoral Degree" : "ปริญญาเอก";
      case "DIPLOMA":
        return isEn ? "Graduate Diploma" : "ประกาศนียบัตรบัณฑิต";
      default:
        return level;
    }
  };

  const getDegreeBadgeClass = (level: string) => {
    switch (level) {
      case "BACHELOR":
        return "bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-300 dark:border-blue-900";
      case "MASTER":
        return "bg-purple-500/10 text-purple-700 border-purple-200 dark:text-purple-300 dark:border-purple-900";
      case "DOCTORATE":
        return "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-300 dark:border-amber-900";
      default:
        return "bg-slate-500/10 text-slate-700 border-slate-200 dark:text-slate-300 dark:border-slate-800";
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-8 space-y-10">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <GraduationCap className="h-3.5 w-3.5" />
          <span>{isEn ? "Academic Programs" : "หลักสูตรการศึกษา"}</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          {isEn ? "Undergraduate & Graduate Programs" : "หลักสูตรระดับปริญญาตรี โท และเอก"}
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          {isEn
            ? "Explore our modern curriculum designed to meet modern industry demands, equipped with hands-on labs and expert faculty members."
            : "หลักสูตรทันสมัยที่ตอบโจทย์ความต้องการของอุตสาหกรรมดิจิทัล บูรณาการภาคทฤษฎีและการปฏิบัติจริง พร้อมเครือข่ายความร่วมมือกับภาคธุรกิจชั้นนำ"}
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-4 border-b border-border/60 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Degree Level Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "ALL", labelTh: "ทุกระดับการศึกษา", labelEn: "All Programs" },
              { id: "BACHELOR", labelTh: "ปริญญาตรี", labelEn: "Bachelor's" },
              { id: "MASTER", labelTh: "ปริญญาโท", labelEn: "Master's" },
              { id: "DOCTORATE", labelTh: "ปริญญาเอก", labelEn: "Doctoral" },
            ].map((tab) => {
              const isActive = degreeLevel === tab.id;
              const href = tab.id === "ALL" ? "/curriculum" : `/curriculum?degreeLevel=${tab.id}`;
              return (
                <Link key={tab.id} href={href}>
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="text-xs rounded-full"
                  >
                    {isEn ? tab.labelEn : tab.labelTh}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Search Input */}
          <form method="GET" action="/curriculum" className="relative w-full sm:w-80">
            {degreeLevel !== "ALL" && <input type="hidden" name="degreeLevel" value={degreeLevel} />}
            {departmentId !== "ALL" && <input type="hidden" name="departmentId" value={departmentId} />}
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder={isEn ? "Search by program or career..." : "ค้นหาหลักสูตร หรือสายอาชีพ..."}
              className="w-full rounded-full border border-input bg-background pl-9 pr-4 py-1.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </form>
        </div>

        {/* Department Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Link href={degreeLevel !== "ALL" ? `/curriculum?degreeLevel=${degreeLevel}` : "/curriculum"}>
            <Button
              variant={departmentId === "ALL" ? "secondary" : "ghost"}
              size="sm"
              className="text-xs h-7 rounded-md"
            >
              {isEn ? "All Departments" : "ทุกภาควิชา"}
            </Button>
          </Link>
          {departments.map((dept) => {
            const query = new URLSearchParams();
            if (degreeLevel !== "ALL") query.set("degreeLevel", degreeLevel);
            query.set("departmentId", dept.id);
            return (
              <Link key={dept.id} href={`/curriculum?${query.toString()}`}>
                <Button
                  variant={departmentId === dept.id ? "secondary" : "ghost"}
                  size="sm"
                  className="text-xs h-7 rounded-md"
                >
                  {isEn ? dept.nameEn : dept.nameTh}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Programs Grid */}
      {programs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
          <GraduationCap className="mb-3 h-12 w-12 stroke-[1.2]" />
          <p className="font-semibold text-base">
            {isEn ? "No programs found" : "ไม่พบหลักสูตรตามเงื่อนไขที่ระบุ"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isEn ? "Try changing your search terms or filters" : "ลองเปลี่ยนคำค้นหาหรือระดับการศึกษา"}
          </p>
          <Link href="/curriculum" className="mt-4">
            <Button variant="outline" size="sm">
              {isEn ? "Reset Filter" : "ล้างตัวกรอง"}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((prog) => (
            <div
              key={prog.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition hover:-translate-y-1 hover:shadow-md"
            >
              {/* Cover Image & Badges */}
              <div className="relative flex h-48 w-full items-center justify-center overflow-hidden bg-muted/40">
                {prog.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={prog.coverImageUrl}
                    alt={isEn ? prog.nameEn : prog.nameTh}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary text-3xl font-bold">
                    <GraduationCap className="h-10 w-10" />
                  </div>
                )}

                <div className="absolute top-3 left-3">
                  <span
                    className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold backdrop-blur-md ${getDegreeBadgeClass(
                      prog.degreeLevel
                    )}`}
                  >
                    {getDegreeLevelLabel(prog.degreeLevel)}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center rounded-md bg-background/90 px-2 py-0.5 text-[11px] font-bold text-foreground shadow-xs">
                    {isEn ? prog.degreeAbbrEn : prog.degreeAbbrTh}
                  </span>
                </div>
              </div>

              {/* Information Body */}
              <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span>{prog.code}</span>
                    <span>{isEn ? prog.departmentNameEn : prog.departmentNameTh}</span>
                  </div>

                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-snug">
                    {isEn ? prog.nameEn : prog.nameTh}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {isEn ? prog.descriptionEn || prog.descriptionTh : prog.descriptionTh || prog.descriptionEn}
                  </p>

                  {/* Highlights: Duration, Credits, Tuition */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/40 text-xs">
                    <div className="flex flex-col items-center text-center p-1.5 rounded-lg bg-muted/40">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground mb-1" />
                      <span className="font-semibold text-foreground">{prog.durationYears} {isEn ? "Years" : "ปี"}</span>
                      <span className="text-[10px] text-muted-foreground">{isEn ? "Duration" : "ระยะเวลา"}</span>
                    </div>

                    <div className="flex flex-col items-center text-center p-1.5 rounded-lg bg-muted/40">
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground mb-1" />
                      <span className="font-semibold text-foreground">{prog.totalCredits}</span>
                      <span className="text-[10px] text-muted-foreground">{isEn ? "Credits" : "หน่วยกิต"}</span>
                    </div>

                    <div className="flex flex-col items-center text-center p-1.5 rounded-lg bg-muted/40">
                      <Coins className="h-3.5 w-3.5 text-muted-foreground mb-1" />
                      <span className="font-semibold text-foreground">
                        {prog.tuitionFeeSemester ? `฿${prog.tuitionFeeSemester.toLocaleString()}` : "-"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{isEn ? "/Sem" : "/เทอม"}</span>
                    </div>
                  </div>

                  {/* Career Highlights */}
                  {prog.careerPaths && prog.careerPaths.length > 0 && (
                    <div className="pt-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-1.5">
                        <Briefcase className="h-3 w-3 text-primary" />
                        <span>{isEn ? "Career Opportunities" : "อาชีพที่รองรับ"}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {prog.careerPaths.slice(0, 3).map((career, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                          >
                            {career}
                          </span>
                        ))}
                        {prog.careerPaths.length > 3 && (
                          <span className="text-[10px] text-muted-foreground self-center">
                            +{prog.careerPaths.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="border-t border-border/40 pt-3">
                  <Link href={`/curriculum/${prog.id}`} className="block">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                      <span>{isEn ? "View Curriculum" : "ดูโครงสร้างหลักสูตร"}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
