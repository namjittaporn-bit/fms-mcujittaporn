-- CreateEnum
CREATE TYPE "DegreeLevel" AS ENUM ('BACHELOR', 'MASTER', 'DOCTORATE', 'DIPLOMA');

-- CreateEnum
CREATE TYPE "ProgramPlan" AS ENUM ('REGULAR', 'SPECIAL', 'INTERNATIONAL', 'BILINGUAL');

-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'REVISED');

-- CreateTable
CREATE TABLE "curriculum_programs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "department_id" UUID,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "degree_title_th" VARCHAR(255) NOT NULL,
    "degree_title_en" VARCHAR(255) NOT NULL,
    "degree_abbr_th" VARCHAR(100) NOT NULL,
    "degree_abbr_en" VARCHAR(100) NOT NULL,
    "degree_level" "DegreeLevel" NOT NULL DEFAULT 'BACHELOR',
    "program_plan" "ProgramPlan" NOT NULL DEFAULT 'REGULAR',
    "duration_years" INTEGER NOT NULL DEFAULT 4,
    "total_credits" INTEGER NOT NULL DEFAULT 120,
    "tuition_fee_semester" DECIMAL(10,2),
    "description_th" TEXT,
    "description_en" TEXT,
    "career_paths" JSONB NOT NULL DEFAULT '[]',
    "curriculum_structure" JSONB NOT NULL DEFAULT '[]',
    "study_plan" JSONB NOT NULL DEFAULT '[]',
    "tqf_file_url" VARCHAR(1000),
    "cover_image_url" VARCHAR(1000),
    "status" "ProgramStatus" NOT NULL DEFAULT 'ACTIVE',
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "curriculum_programs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "curriculum_programs_tenant_id_department_id_idx" ON "curriculum_programs"("tenant_id", "department_id");

-- CreateIndex
CREATE INDEX "curriculum_programs_tenant_id_degree_level_idx" ON "curriculum_programs"("tenant_id", "degree_level");

-- CreateIndex
CREATE INDEX "curriculum_programs_tenant_id_status_idx" ON "curriculum_programs"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "curriculum_programs_tenant_id_order_index_idx" ON "curriculum_programs"("tenant_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_programs_tenant_id_code_key" ON "curriculum_programs"("tenant_id", "code");

-- AddForeignKey
ALTER TABLE "curriculum_programs" ADD CONSTRAINT "curriculum_programs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_programs" ADD CONSTRAINT "curriculum_programs_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
