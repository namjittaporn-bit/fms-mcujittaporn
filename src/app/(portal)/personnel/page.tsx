import Link from "next/link";
import { getLocale } from "@/shared/lib/i18n/server";
import { getPortalStaff, getPortalDepartments } from "@/features/personnel/server";
import {
  Users,
  Search,
  Mail,
  MapPin,
  ArrowRight,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  searchParams: Promise<{ departmentId?: string; search?: string; tab?: string }>;
}

export default async function PortalPersonnelPage({ searchParams }: Props) {
  const params = await searchParams;
  const locale = await getLocale();
  const isEn = locale === "en";

  const departmentId = params.departmentId || "ALL";
  const search = params.search || "";
  const tab = params.tab || "all";

  const [staffList, departments] = await Promise.all([
    getPortalStaff({
      departmentId: departmentId !== "ALL" ? departmentId : undefined,
      search: search || undefined,
      onlyExecutives: tab === "executives",
    }),
    getPortalDepartments(),
  ]);

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
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Users className="h-3.5 w-3.5" />
          <span>{isEn ? "Faculty & Staff Directory" : "ทำเนียบคณาจารย์และบุคลากร"}</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          {isEn ? "Our People & Faculty" : "ทำเนียบคณาจารย์และบุคลากร"}
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          {isEn
            ? "Meet our distinguished professors, innovative researchers, and dedicated staff members advancing technology and education."
            : "ทำเนียบคณาจารย์ผู้ทรงคุณวุฒิ นักวิจัย และเจ้าหน้าที่ผู้เชี่ยวชาญ คณะเทคโนโลยีและการจัดการ"}
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-4 border-b border-border/60 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Main Mode Tabs */}
          <div className="flex items-center gap-2">
            <Link href="/personnel">
              <Button
                variant={tab === "all" ? "default" : "outline"}
                size="sm"
                className="text-xs rounded-full"
              >
                {isEn ? "All Personnel" : "บุคลากรทั้งหมด"}
              </Button>
            </Link>
            <Link href="/personnel?tab=executives">
              <Button
                variant={tab === "executives" ? "default" : "outline"}
                size="sm"
                className="text-xs rounded-full gap-1.5"
              >
                <Award className="h-3.5 w-3.5" />
                {isEn ? "Executive Board" : "คณะผู้บริหาร"}
              </Button>
            </Link>
          </div>

          {/* Search Form */}
          <form method="GET" action="/personnel" className="relative w-full sm:w-80">
            {tab !== "all" && <input type="hidden" name="tab" value={tab} />}
            {departmentId !== "ALL" && <input type="hidden" name="departmentId" value={departmentId} />}
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder={isEn ? "Search by name or expertise..." : "ค้นหาชื่อ หรือสาขาความเชี่ยวชาญ..."}
              className="w-full rounded-full border border-input bg-background pl-9 pr-4 py-1.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </form>
        </div>

        {/* Department Filters (When in All tab) */}
        {tab === "all" && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Link href="/personnel">
              <Button
                variant={departmentId === "ALL" ? "secondary" : "ghost"}
                size="sm"
                className="text-xs h-7 rounded-md"
              >
                {isEn ? "All Departments" : "ทุกภาควิชา"}
              </Button>
            </Link>
            {departments.map((dept) => (
              <Link key={dept.id} href={`/personnel?departmentId=${dept.id}`}>
                <Button
                  variant={departmentId === dept.id ? "secondary" : "ghost"}
                  size="sm"
                  className="text-xs h-7 rounded-md"
                >
                  {isEn ? dept.nameEn : dept.nameTh}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Staff Grid */}
      {staffList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
          <Users className="mb-3 h-12 w-12 stroke-[1.2]" />
          <p className="font-semibold text-base">
            {isEn ? "No personnel found" : "ไม่พบบุคลากรตามเงื่อนไขที่ระบุ"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isEn ? "Try changing your search terms or department filter" : "ลองเปลี่ยนคำค้นหาหรือเลือกภาควิชาอื่น"}
          </p>
          <Link href="/personnel" className="mt-4">
            <Button variant="outline" size="sm">
              {isEn ? "Reset Filter" : "ล้างตัวกรอง"}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {staffList.map((staff) => (
            <div
              key={staff.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition hover:-translate-y-1 hover:shadow-md"
            >
              {/* Avatar Top */}
              <div className="relative flex h-52 w-full items-center justify-center overflow-hidden bg-muted/40">
                {staff.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={staff.avatarUrl}
                    alt={isEn ? staff.fullNameEn : staff.fullNameTh}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">
                    {staff.firstNameTh.charAt(0)}
                  </div>
                )}

                {staff.adminPosition !== "NONE" && (
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-primary/95 px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-xs">
                      {getPositionName(staff.adminPosition)}
                    </span>
                  </div>
                )}
              </div>

              {/* Information */}
              <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                <div className="space-y-2">
                  <div>
                    {staff.academicRank !== "NONE" && (
                      <span className="text-xs font-semibold text-primary block">
                        {getRankName(staff.academicRank)}
                      </span>
                    )}
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                      {isEn ? staff.fullNameEn : staff.fullNameTh}
                    </h3>
                  </div>

                  <p className="text-xs text-muted-foreground font-medium">
                    {isEn ? staff.departmentNameEn ?? "Faculty Unit" : staff.departmentNameTh ?? "สำนักงานคณบดี"}
                  </p>

                  {/* Expertise Tags */}
                  {staff.expertise && staff.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {staff.expertise.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                      {staff.expertise.length > 3 && (
                        <span className="text-[10px] text-muted-foreground self-center">
                          +{staff.expertise.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Contact & Profile Link */}
                <div className="space-y-2 border-t border-border/40 pt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate">{staff.email}</span>
                  </div>
                  {staff.roomNumber && (
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate">{staff.roomNumber}</span>
                    </div>
                  )}

                  <Link href={`/personnel/${staff.id}`} className="block pt-2">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                      <span>{isEn ? "View Profile" : "ดูประวัติและผลงาน"}</span>
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
