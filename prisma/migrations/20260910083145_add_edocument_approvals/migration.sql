-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('PROJECT_PROPOSAL', 'OFFICIAL_TRAVEL', 'PROCUREMENT_REQ', 'GENERAL_REQUEST');

-- CreateEnum
CREATE TYPE "DocUrgency" AS ENUM ('NORMAL', 'URGENT', 'VERY_URGENT');

-- CreateEnum
CREATE TYPE "DocStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REVISED_REQUESTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApprovalAction" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVISED_REQUESTED', 'SKIPPED');

-- CreateTable
CREATE TABLE "e_documents" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "department_id" UUID,
    "document_number" VARCHAR(100) NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "document_type" "DocType" NOT NULL,
    "urgency" "DocUrgency" NOT NULL DEFAULT 'NORMAL',
    "content" TEXT NOT NULL,
    "amount" DECIMAL(12,2),
    "submitter_id" UUID NOT NULL,
    "status" "DocStatus" NOT NULL DEFAULT 'DRAFT',
    "current_step" INTEGER NOT NULL DEFAULT 1,
    "total_steps" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "e_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_document_approvals" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "step_order" INTEGER NOT NULL,
    "step_name_th" VARCHAR(200) NOT NULL,
    "step_name_en" VARCHAR(200) NOT NULL,
    "status" "ApprovalAction" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "approver_role" VARCHAR(100),
    "approver_user_id" UUID,
    "decided_at" TIMESTAMPTZ,
    "decided_by_user_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "e_document_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_document_attachments" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(1000) NOT NULL,
    "file_size" INTEGER,
    "file_type" VARCHAR(100),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_document_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_document_comments" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_document_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "e_documents_tenant_id_submitter_id_idx" ON "e_documents"("tenant_id", "submitter_id");

-- CreateIndex
CREATE INDEX "e_documents_tenant_id_status_idx" ON "e_documents"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "e_documents_tenant_id_document_type_idx" ON "e_documents"("tenant_id", "document_type");

-- CreateIndex
CREATE INDEX "e_documents_tenant_id_department_id_idx" ON "e_documents"("tenant_id", "department_id");

-- CreateIndex
CREATE UNIQUE INDEX "e_documents_tenant_id_document_number_key" ON "e_documents"("tenant_id", "document_number");

-- CreateIndex
CREATE INDEX "e_document_approvals_document_id_step_order_idx" ON "e_document_approvals"("document_id", "step_order");

-- CreateIndex
CREATE INDEX "e_document_approvals_status_idx" ON "e_document_approvals"("status");

-- CreateIndex
CREATE INDEX "e_document_attachments_document_id_idx" ON "e_document_attachments"("document_id");

-- CreateIndex
CREATE INDEX "e_document_comments_document_id_idx" ON "e_document_comments"("document_id");

-- AddForeignKey
ALTER TABLE "e_documents" ADD CONSTRAINT "e_documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_documents" ADD CONSTRAINT "e_documents_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_documents" ADD CONSTRAINT "e_documents_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_document_approvals" ADD CONSTRAINT "e_document_approvals_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "e_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_document_attachments" ADD CONSTRAINT "e_document_attachments_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "e_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_document_comments" ADD CONSTRAINT "e_document_comments_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "e_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_document_comments" ADD CONSTRAINT "e_document_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
