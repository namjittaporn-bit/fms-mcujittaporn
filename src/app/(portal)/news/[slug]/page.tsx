import { notFound } from "next/navigation";
import Link from "next/link";
import { getLocale } from "@/shared/lib/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { getPortalNewsBySlug } from "@/features/news/server";
import {
  ArrowLeft,
  Calendar,
  Eye,
  User,
  Pin,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const isEn = locale === "en";

  const news = await getPortalNewsBySlug(slug);
  if (!news) notFound();

  const title = isEn ? news.titleEn : news.titleTh;
  const content = isEn ? news.contentEn : news.contentTh;

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
    <article className="container mx-auto max-w-4xl px-4 py-12 sm:px-8 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/news">
          <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>{isEn ? "Back to all news" : "กลับหน้ารวมข่าว"}</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {news.isPinned && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              <Pin className="h-3 w-3 fill-amber-600" />
              {isEn ? "Featured" : "ข่าวเด่น"}
            </span>
          )}
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {getCategoryName(news.category)}
          </span>
        </div>
      </div>

      {/* Article Header */}
      <div className="space-y-4 border-b border-border/60 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground leading-tight">
          {title}
        </h1>

        {/* Metadata Bar */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-primary" />
            <span>
              {news.publishedAt ? formatDate(new Date(news.publishedAt), locale) : "-"}
            </span>
          </div>
          {news.authorName && (
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary" />
              <span>{news.authorName}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-primary" />
            <span>{news.viewCount} {isEn ? "views" : "ครั้ง"}</span>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {news.coverImageUrl && (
        <div className="overflow-hidden rounded-2xl border border-border shadow-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={news.coverImageUrl}
            alt={title}
            className="w-full max-h-[500px] object-cover"
          />
        </div>
      )}

      {/* Content Body */}
      <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground leading-relaxed space-y-4">
        {content.split("\n").map((para, idx) => {
          if (!para.trim()) return null;
          return (
            <p key={idx} className="text-base text-foreground/90">
              {para}
            </p>
          );
        })}
      </div>

      {/* Attachments Section */}
      {news.attachments && news.attachments.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-base text-foreground">
              {isEn ? "Attachments & Documents" : "เอกสารแนบที่เกี่ยวข้อง"}
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {news.attachments.map((att) => (
              <a
                key={att.id}
                href={att.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-border/80 bg-background p-3.5 transition hover:border-primary/50 hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileDown className="h-4 w-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-medium text-xs text-foreground truncate">
                      {att.fileName}
                    </p>
                    {att.fileSize && (
                      <p className="text-[10px] text-muted-foreground">
                        {(att.fileSize / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0 h-7 text-xs">
                  {isEn ? "Download" : "ดาวน์โหลด"}
                </Button>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Footer Actions */}
      <div className="flex items-center justify-between border-t border-border/60 pt-6">
        <Link href="/news">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>{isEn ? "Back to News" : "ย้อนกลับหน้ารวมข่าว"}</span>
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm">
            {isEn ? "Faculty Home" : "หน้าหลักคณะ"}
          </Button>
        </Link>
      </div>
    </article>
  );
}
