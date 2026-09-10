import Link from "next/link";
import { getLocale } from "@/shared/lib/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { getPortalNews } from "@/features/news/server";
import {
  Newspaper,
  Pin,
  Eye,
  Calendar,
  Search,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function PortalNewsPage({ searchParams }: Props) {
  const params = await searchParams;
  const locale = await getLocale();
  const isEn = locale === "en";

  const category = params.category || "ALL";
  const search = params.search || "";

  const newsItems = await getPortalNews({
    category: category !== "ALL" ? category : undefined,
    search: search || undefined,
  });

  const categories = [
    { key: "ALL", th: "ทั้งหมด", en: "All" },
    { key: "ACADEMIC", th: "ข่าววิชาการ", en: "Academic" },
    { key: "ACTIVITY", th: "ข่าวกิจกรรม", en: "Activities" },
    { key: "SCHOLARSHIP", th: "ทุนการศึกษา", en: "Scholarships" },
    { key: "PROCUREMENT", th: "จัดซื้อจัดจ้าง", en: "Procurement" },
    { key: "GENERAL", th: "ข่าวทั่วไป", en: "General" },
  ];

  const getCategoryName = (cat: string) => {
    const found = categories.find((c) => c.key === cat);
    return isEn ? found?.en ?? cat : found?.th ?? cat;
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Newspaper className="h-3.5 w-3.5" />
          <span>{isEn ? "Faculty News & Updates" : "ข่าวสารและประกาศ"}</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          {isEn ? "News & Announcements" : "ข่าวประชาสัมพันธ์และกิจกรรม"}
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          {isEn
            ? "Stay informed with the latest academic achievements, upcoming events, student scholarships, and procurement notices."
            : "ติดตามความเคลื่อนไหว กิจกรรมวิชาการ การประกาศรับสมัครทุนการศึกษา และประกาศจัดซื้อจัดจ้างของคณะ"}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const active = category === cat.key;
            return (
              <Link
                key={cat.key}
                href={cat.key === "ALL" ? "/news" : `/news?category=${cat.key}`}
              >
                <Button
                  variant={active ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-8 rounded-full"
                >
                  {isEn ? cat.en : cat.th}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Search Form */}
        <form method="GET" action="/news" className="relative w-full sm:w-72">
          {category !== "ALL" && <input type="hidden" name="category" value={category} />}
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder={isEn ? "Search news..." : "ค้นหาข่าวสาร..."}
            className="w-full rounded-full border border-input bg-background pl-9 pr-4 py-1.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </form>
      </div>

      {/* News Grid */}
      {newsItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
          <Newspaper className="mb-3 h-12 w-12 stroke-[1.2]" />
          <p className="font-semibold text-base">
            {isEn ? "No news articles found" : "ไม่พบข่าวสารตามเงื่อนไขที่เลือก"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isEn ? "Try changing your search or category filter" : "ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น"}
          </p>
          <Link href="/news" className="mt-4">
            <Button variant="outline" size="sm">
              {isEn ? "Reset Filter" : "ล้างตัวกรอง"}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {newsItems.map((item) => (
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
                  {item.isPinned && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/90 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-xs shadow-xs">
                        <Pin className="h-3 w-3 fill-white" />
                        {isEn ? "Featured" : "ข่าวเด่น"}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative flex h-40 w-full items-center justify-center bg-muted/60 text-muted-foreground">
                  <Newspaper className="h-10 w-10 stroke-[1.2]" />
                  {item.isPinned && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white shadow-xs">
                        <Pin className="h-3 w-3 fill-white" />
                        {isEn ? "Featured" : "ข่าวเด่น"}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-1 flex-col justify-between p-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">
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
    </div>
  );
}
