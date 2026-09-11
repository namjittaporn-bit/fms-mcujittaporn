import Link from "next/link";
import { getLocale } from "@/shared/lib/i18n/server";
import { GraduationCap, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CurriculumNotFound() {
  const locale = await getLocale();
  const isEn = locale === "en";

  return (
    <div className="container mx-auto max-w-2xl px-4 py-24 sm:px-8 text-center space-y-6">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground border border-border">
        <GraduationCap className="h-10 w-10 stroke-[1.5]" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
          {isEn ? "Academic Program Not Found" : "ไม่พบหลักสูตรการศึกษา"}
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {isEn
            ? "The degree program or curriculum syllabus you are searching for does not exist or is no longer offered."
            : "ไม่พบข้อมูลหลักสูตรตามรหัสที่ระบุ หรือหลักสูตรอาจอยู่ระหว่างการปรับปรุงข้อมูล"}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        <Link href="/curriculum">
          <Button variant="default" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="h-4 w-4" />
            <span>{isEn ? "Back to Programs" : "กลับหน้ารวมหลักสูตร"}</span>
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Home className="h-4 w-4" />
            <span>{isEn ? "Go to Home" : "กลับหน้าหลัก"}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
