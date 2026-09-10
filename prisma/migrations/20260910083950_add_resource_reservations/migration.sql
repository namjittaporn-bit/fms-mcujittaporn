-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('ROOM', 'VEHICLE');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "resource_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "type" "ResourceType" NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "location" VARCHAR(255),
    "license_plate" VARCHAR(50),
    "driver_name" VARCHAR(200),
    "driver_phone" VARCHAR(50),
    "amenities" JSONB NOT NULL DEFAULT '[]',
    "image_url" VARCHAR(1000),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "resource_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_reservations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "resource_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "department_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "purpose" TEXT,
    "attendees_count" INTEGER NOT NULL DEFAULT 1,
    "destination" VARCHAR(500),
    "start_time" TIMESTAMPTZ NOT NULL,
    "end_time" TIMESTAMPTZ NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "review_notes" TEXT,
    "reviewed_by_user_id" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "resource_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resource_items_tenant_id_type_idx" ON "resource_items"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "resource_items_tenant_id_is_active_idx" ON "resource_items"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "resource_items_tenant_id_code_key" ON "resource_items"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "resource_reservations_tenant_id_resource_id_start_time_end__idx" ON "resource_reservations"("tenant_id", "resource_id", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "resource_reservations_tenant_id_user_id_idx" ON "resource_reservations"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "resource_reservations_tenant_id_status_idx" ON "resource_reservations"("tenant_id", "status");

-- AddForeignKey
ALTER TABLE "resource_items" ADD CONSTRAINT "resource_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_reservations" ADD CONSTRAINT "resource_reservations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_reservations" ADD CONSTRAINT "resource_reservations_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resource_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_reservations" ADD CONSTRAINT "resource_reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_reservations" ADD CONSTRAINT "resource_reservations_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
