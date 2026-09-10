import Link from "next/link";
import { getLocale } from "@/shared/lib/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { getPortalNews } from "@/features/news/server";
import { Button } from "@/components/ui/button";
import {
  Newspaper,
  Pin,
  ArrowRight,
  Eye,
  Calendar,
  Sparkles,
  BookOpen,
  Users,
  Building,
} from "lucide-react";

export default async function PortalHomePage() {
  const locale = await getLocale();
  const isEn = locale === "en";

  const allNews = await getPortalNews({ limit: 10 });
  const pinnedNews = allNews.filter((item) => item.isPinned);
  const latestNews = allNews.filter((item) => !item.isPinned).slice(0, 6);

  const getCategoryName = (category: string) => {
    switch (category) {
      case "ACADEMIC":
        return isEn ? "Academic" : "วิชาการ";
      case "ACTIVITY":
        return isEn ? "Activities" : "กิจกรรม";
      case "SCHOLARSHIP":
        return isEn ? "Scholarships" : "ทุนการศึกษา";
      case "PROCUREMENT":
        return isEn ? "Procurement" : "จัดซื้อจัดจ้าง";
      default:
        return isEn ? "General" : "ทั่วไป";
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-20 px-4 sm:px-8 border-b border-border/40">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isEn ? "Faculty Web Platform" : "แพลตฟอร์มสารสนเทศคณะ"}</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
              {isEn
                ? "Connecting Education, Research & Innovation"
                : "เชื่อมต่อการศึกษา วิจัย และนวัตกรรมเพื่ออนาคต"}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {isEn
                ? "Welcome to the Faculty of Technology and Management portal. Discover our latest academic programs, news announcements, faculty directory, and digital services."
                : "ยินดีต้อนรับสู่ศูนย์กลางข้อมูลและบริการออนไลน์ คณะเทคโนโลยีและการจัดการ ติดตามข่าวสาร ทุนการศึกษา กิจกรรม และเข้าถึงบริการสำหรับบุคลากรและนักศึกษา"}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/news">
                <Button size="lg" className="gap-2">
                  <Newspaper className="h-4 w-4" />
                  <span>{isEn ? "Explore News" : "อ่านข่าวประชาสัมพันธ์"}</span>
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="gap-2">
                  <span>{isEn ? "Internal Portal" : "สำหรับบุคลากรภายใน"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-primary/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Newspaper className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">
              {isEn ? "News & Events" : "ข่าวสารและกิจกรรม"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isEn ? "Latest updates & scholarships" : "ประกาศและทุนการศึกษาล่าสุด"}
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-primary/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">
              {isEn ? "Faculty Directory" : "ทำเนียบบุคลากร"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isEn ? "Academic & support staff" : "อาจารย์และเจ้าหน้าที่คณะ"}
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-primary/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">
              {isEn ? "Curriculum" : "หลักสูตรการศึกษา"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isEn ? "Undergraduate & Graduate" : "ระดับปริญญาตรีและบัณฑิตศึกษา"}
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-primary/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Building className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">
              {isEn ? "E-Services" : "บริการออนไลน์"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isEn ? "Tracking & reservations" : "ติดตามเอกสารและจองห้อง/รถ"}
            </p>
          </div>
        </div>
      </section>

      {/* Pinned News Section */}
      {pinnedNews.length > 0 && (
        <section className="container mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Pin className="h-4 w-4 fill-amber-500" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {isEn ? "Featured Announcements" : "ข่าวประชาสัมพันธ์เด่น"}
              </h2>
            </div>
            <Link
              href="/news"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              <span>{isEn ? "View all" : "ดูทั้งหมด"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pinnedNews.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition hover:-translate-y-1 hover:shadow-md"
              >
                {item.coverImageUrl ? (
                  <div className="relative h-48 w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.coverImageUrl}
                      alt={isEn ? item.titleEn : item.titleTh}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-xs shadow-xs">
                        <Pin className="h-3 w-3 fill-white" />
                        {isEn ? "Featured" : "ข่าวเด่น"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
                    <Newspaper className="h-12 w-12 stroke-[1.2]" />
                  </div>
                )}

                <div className="flex flex-1 flex-col justify-between p-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium text-primary">
                        {getCategoryName(item.category)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {item.publishedAt
                            ? formatDate(new Date(item.publishedAt), locale)
                            : "-"}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-bold text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {isEn ? item.titleEn : item.titleTh}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {isEn ? item.contentEn : item.contentTh}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{item.viewCount} {isEn ? "views" : "ครั้ง"}</span>
                    </div>
                    <span className="font-semibold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      {isEn ? "Read more" : "อ่านต่อ"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest News Section */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Newspaper className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {isEn ? "Latest News & Announcements" : "ข่าวสารล่าสุด"}
            </h2>
          </div>
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <span>{isEn ? "View all news" : "ดูข่าวทั้งหมด"}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {latestNews.length === 0 && pinnedNews.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <Newspaper className="mb-3 h-12 w-12 stroke-[1.2]" />
            <p className="font-medium text-base">
              {isEn ? "No news announcements yet" : "ยังไม่มีข่าวสารประชาสัมพันธ์ในขณะนี้"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isEn
                ? "Please check back later or login to admin console to create articles."
                : "กรุณากลับมาติดตามใหม่ หรือเข้าสู่ระบบหลังบ้านเพื่อสร้างข่าวสาร"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestNews.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition hover:-translate-y-1 hover:shadow-md"
              >
                {item.coverImageUrl ? (
                  <div className="relative h-44 w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.coverImageUrl}
                      alt={isEn ? item.titleEn : item.titleTh}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex h-36 w-full items-center justify-center bg-muted/60 text-muted-foreground">
                    <Newspaper className="h-10 w-10 stroke-[1.2]" />
                  </div>
                )}

                <div className="flex flex-1 flex-col justify-between p-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium text-primary">
                        {getCategoryName(item.category)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {item.publishedAt
                            ? formatDate(new Date(item.publishedAt), locale)
                            : "-"}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-bold text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {isEn ? item.titleEn : item.titleTh}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {isEn ? item.contentEn : item.contentTh}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{item.viewCount} {isEn ? "views" : "ครั้ง"}</span>
                    </div>
                    <span className="font-semibold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      {isEn ? "Read more" : "อ่านต่อ"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
