-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('ACADEMIC', 'ACTIVITY', 'SCHOLARSHIP', 'PROCUREMENT', 'GENERAL');

-- CreateEnum
CREATE TYPE "NewsStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "sample_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sample_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_articles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title_th" VARCHAR(500) NOT NULL,
    "title_en" VARCHAR(500) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "content_th" TEXT NOT NULL,
    "content_en" TEXT NOT NULL,
    "cover_image_url" VARCHAR(1000),
    "category" "NewsCategory" NOT NULL DEFAULT 'GENERAL',
    "status" "NewsStatus" NOT NULL DEFAULT 'DRAFT',
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMPTZ,
    "expires_at" TIMESTAMPTZ,
    "author_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_attachments" (
    "id" UUID NOT NULL,
    "news_id" UUID NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(1000) NOT NULL,
    "file_size" INTEGER,
    "mime_type" VARCHAR(100),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sample_items_tenant_id_idx" ON "sample_items"("tenant_id");

-- CreateIndex
CREATE INDEX "departments_tenant_id_idx" ON "departments"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "departments_tenant_id_code_key" ON "departments"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "news_articles_tenant_id_status_published_at_idx" ON "news_articles"("tenant_id", "status", "published_at");

-- CreateIndex
CREATE INDEX "news_articles_tenant_id_category_idx" ON "news_articles"("tenant_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "news_articles_tenant_id_slug_key" ON "news_articles"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "news_attachments_news_id_idx" ON "news_attachments"("news_id");

-- AddForeignKey
ALTER TABLE "sample_items" ADD CONSTRAINT "sample_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_attachments" ADD CONSTRAINT "news_attachments_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "news_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
