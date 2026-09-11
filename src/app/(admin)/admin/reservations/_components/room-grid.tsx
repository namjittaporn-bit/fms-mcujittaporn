"use client";

import { MapPin, Users, CalendarDays, Search } from "lucide-react";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { LiyonCard, StatusPill } from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { ResourceItemDto } from "@/features/reservation";

interface RoomGridProps {
  rooms: ResourceItemDto[];
  canCreate: boolean;
  onBook: (room: ResourceItemDto) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function RoomGrid({
  rooms,
  canCreate,
  onBook,
  searchQuery,
  onSearchChange,
}: RoomGridProps) {
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
        {rooms.map((room) => (
          <LiyonCard
            key={room.id}
            className="overflow-hidden flex flex-col justify-between border hover:shadow-md transition-shadow"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded">
                    {room.code}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground mt-1.5">
                    {locale === "en" ? room.nameEn : room.nameTh}
                  </h3>
                  {room.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{room.location}</span>
                    </div>
                  )}
                </div>
                <StatusPill tone={room.isActive ? "ok" : "off"}>
                  {room.isActive ? "ว่าง/พร้อมใช้" : "ปิดปรับปรุง"}
                </StatusPill>
              </div>

              {room.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {room.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-sm text-foreground">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  รองรับความจุ: <strong>{room.capacity}</strong> ที่นั่ง
                </span>
              </div>

              {room.amenities.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("reservation.field.amenities")}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {room.amenities.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-md bg-secondary/60 px-2 py-0.5 text-xs text-secondary-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border p-4 bg-muted/20">
              <Button
                onClick={() => onBook(room)}
                disabled={!room.isActive || !canCreate}
                className="w-full gap-2"
              >
                <CalendarDays className="h-4 w-4" />
                <span>{t("reservation.action.book")}</span>
              </Button>
            </div>
          </LiyonCard>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {t("reservation.empty_resources")}
        </div>
      )}
    </div>
  );
}
