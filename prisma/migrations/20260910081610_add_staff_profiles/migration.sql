-- CreateEnum
CREATE TYPE "AcademicRank" AS ENUM ('PROFESSOR', 'ASSOC_PROF', 'ASST_PROF', 'LECTURER', 'NONE');

-- CreateEnum
CREATE TYPE "AdminPosition" AS ENUM ('DEAN', 'VICE_DEAN', 'ASST_DEAN', 'HEAD_OF_DEPT', 'SECRETARY', 'NONE');

-- CreateEnum
CREATE TYPE "PersonnelType" AS ENUM ('ACADEMIC', 'SUPPORT');

-- CreateTable
CREATE TABLE "staff_profiles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "department_id" UUID,
    "user_id" UUID,
    "prefix_th" VARCHAR(50) NOT NULL,
    "prefix_en" VARCHAR(50) NOT NULL,
    "first_name_th" VARCHAR(100) NOT NULL,
    "last_name_th" VARCHAR(100) NOT NULL,
    "first_name_en" VARCHAR(100) NOT NULL,
    "last_name_en" VARCHAR(100) NOT NULL,
    "academic_rank" "AcademicRank" NOT NULL DEFAULT 'NONE',
    "admin_position" "AdminPosition" NOT NULL DEFAULT 'NONE',
    "personnel_type" "PersonnelType" NOT NULL DEFAULT 'ACADEMIC',
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "room_number" VARCHAR(50),
    "avatar_url" VARCHAR(1000),
    "education_history" JSONB NOT NULL DEFAULT '[]',
    "expertise" JSONB NOT NULL DEFAULT '[]',
    "research_interests" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "staff_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_user_id_key" ON "staff_profiles"("user_id");

-- CreateIndex
CREATE INDEX "staff_profiles_tenant_id_department_id_idx" ON "staff_profiles"("tenant_id", "department_id");

-- CreateIndex
CREATE INDEX "staff_profiles_tenant_id_personnel_type_idx" ON "staff_profiles"("tenant_id", "personnel_type");

-- CreateIndex
CREATE INDEX "staff_profiles_tenant_id_order_index_idx" ON "staff_profiles"("tenant_id", "order_index");

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
