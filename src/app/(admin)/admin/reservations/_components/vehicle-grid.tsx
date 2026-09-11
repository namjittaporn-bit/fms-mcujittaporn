"use client";

import { Car, Users, Phone, CalendarDays, Search } from "lucide-react";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { LiyonCard, StatusPill } from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { ResourceItemDto } from "@/features/reservation";

interface VehicleGridProps {
  vehicles: ResourceItemDto[];
  canCreate: boolean;
  onBook: (vehicle: ResourceItemDto) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function VehicleGrid({
  vehicles,
  canCreate,
  onBook,
  searchQuery,
  onSearchChange,
}: VehicleGridProps) {
  const t = useT();
  const locale = useLocale();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("reservation.action.filter")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <LiyonCard
            key={vehicle.id}
            className="overflow-hidden flex flex-col justify-between border hover:shadow-md transition-shadow"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs text-sky-600 font-medium bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded">
                    {vehicle.code}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground mt-1.5">
                    {locale === "en" ? vehicle.nameEn : vehicle.nameTh}
                  </h3>
                  {vehicle.licensePlate && (
                    <div className="flex items-center gap-1 font-mono text-xs font-bold text-foreground mt-1">
                      <Car className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>ทะเบียน: {vehicle.licensePlate}</span>
                    </div>
                  )}
                </div>
                <StatusPill tone={vehicle.isActive ? "ok" : "off"}>
                  {vehicle.isActive ? "พร้อมใช้งาน" : "ปิดปรับปรุง"}
                </StatusPill>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-foreground">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    ความจุผู้โดยสาร: <strong>{vehicle.capacity}</strong> ที่นั่ง
                  </span>
                </div>

                {vehicle.driverName && (
                  <div className="flex items-center gap-2 text-foreground">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>พนักงานขับรถ: {vehicle.driverName}</span>
                  </div>
                )}

                {vehicle.driverPhone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>เบอร์ติดต่อ: {vehicle.driverPhone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-border p-4 bg-muted/20">
              <Button
                onClick={() => onBook(vehicle)}
                disabled={!vehicle.isActive || !canCreate}
                className="w-full gap-2"
              >
                <CalendarDays className="h-4 w-4" />
                <span>{t("reservation.action.book")}</span>
              </Button>
            </div>
          </LiyonCard>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {t("reservation.empty_resources")}
        </div>
      )}
    </div>
  );
}
