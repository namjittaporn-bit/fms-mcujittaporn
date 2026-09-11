import Link from "next/link";
import { getLocale } from "@/shared/lib/i18n/server";
import { Compass, Home, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function RootNotFound() {
  const locale = await getLocale();
  const isEn = locale === "en";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
          <Compass className="h-12 w-12 stroke-[1.5] animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            404
          </h1>
          <h2 className="text-lg font-semibold text-foreground">
            {isEn ? "Page Not Found" : "ไม่พบหน้าที่คุณต้องการ"}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isEn
              ? "The URL you requested may have been moved, deleted, or does not exist."
              : "หน้าที่คุณกำลังค้นหาอาจถูกย้าย ลบออก หรือไม่เคยมีอยู่ในระบบ"}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button variant="default" size="sm" className="gap-2 text-xs">
              <Home className="h-4 w-4" />
              <span>{isEn ? "Go to Home" : "กลับหน้าหลัก"}</span>
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <LayoutDashboard className="h-4 w-4" />
              <span>{isEn ? "Dashboard" : "แดชบอร์ด"}</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
