import { requirePermission, hasPermission } from "@/features/identity/server";
import { NEWS_P, listAdminNews } from "@/features/news/server";
import { NewsClient } from "./_components/news-client";

export default async function AdminNewsPage() {
  const ctx = await requirePermission(NEWS_P.newsRead);
  const initialNews = await listAdminNews(ctx.tenantId);

  return (
    <NewsClient
      initialItems={initialNews}
      canCreate={hasPermission(ctx, NEWS_P.newsCreate)}
      canUpdate={hasPermission(ctx, NEWS_P.newsUpdate)}
      canDelete={hasPermission(ctx, NEWS_P.newsDelete)}
      canPin={hasPermission(ctx, NEWS_P.newsPin)}
      canPublish={hasPermission(ctx, NEWS_P.newsPublish)}
    />
  );
}
