import Link from "next/link";
import { getLocale } from "@/shared/lib/i18n/server";
import { UserX, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function PersonnelNotFound() {
  const locale = await getLocale();
  const isEn = locale === "en";

  return (
    <div className="container mx-auto max-w-2xl px-4 py-24 sm:px-8 text-center space-y-6">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground border border-border">
        <UserX className="h-10 w-10 stroke-[1.5]" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
          {isEn ? "Personnel Profile Not Found" : "ไม่พบข้อมูลประวัติบุคลากร"}
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {isEn
            ? "The faculty member or staff profile you are looking for could not be found or has been deactivated."
            : "ไม่พบบุคลากรตามรหัสที่ระบุ หรือข้อมูลอาจถูกปิดการเข้าถึงชั่วคราว"}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        <Link href="/personnel">
          <Button variant="default" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="h-4 w-4" />
            <span>{isEn ? "Back to Faculty Directory" : "กลับทำเนียบบุคลากร"}</span>
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
