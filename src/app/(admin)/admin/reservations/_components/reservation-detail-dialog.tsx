"use client";

import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import {
  LiyonDialog,
  LiyonDialogCloseButton,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  StatusPill,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { ResourceReservationDto } from "@/features/reservation";

interface ReservationDetailDialogProps {
  reservation: ResourceReservationDto | null;
  onOpenChange: (open: boolean) => void;
}

export function ReservationDetailDialog({
  reservation,
  onOpenChange,
}: ReservationDetailDialogProps) {
  const t = useT();
  const locale = useLocale();

  const getStatusTone = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "ok";
      case "PENDING":
        return "warn";
      case "REJECTED":
        return "bad";
      case "COMPLETED":
        return "info";
      default:
        return "off";
    }
  };

  return (
    <LiyonDialog open={!!reservation} onOpenChange={onOpenChange}>
      {reservation && (
        <>
          <LiyonDialogCloseButton label="Close" />
          <LiyonDialogHeader
            title={reservation.title}
            description={`รหัสการจอง: ${reservation.id}`}
          />

          <LiyonDialogBody className="space-y-4 p-6 text-sm">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-muted-foreground">
                {t("reservation.field.status")}
              </span>
              <StatusPill tone={getStatusTone(reservation.status)}>
                {t(`reservation.status.${reservation.status}` as const)}
              </StatusPill>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground">ทรัพยากร: </span>
                <strong className="text-foreground">
                  {reservation.resourceNameTh} ({reservation.resourceCode})
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground">ผู้จอง: </span>
                <span className="text-foreground">
                  {reservation.userName} ({reservation.userEmail})
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">หน่วยงาน: </span>
                <span className="text-foreground">
                  {reservation.departmentNameTh || "—"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">เวลาเริ่มต้น: </span>
                <span className="text-foreground">
                  {formatDate(new Date(reservation.startTime), locale, { time: true })}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">เวลาสิ้นสุด: </span>
                <span className="text-foreground">
                  {formatDate(new Date(reservation.endTime), locale, { time: true })}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">จำนวนผู้เข้าร่วม: </span>
                <span className="text-foreground">{reservation.attendeesCount} คน</span>
              </div>
              {reservation.destination && (
                <div>
                  <span className="text-muted-foreground">สถานที่ปลายทาง: </span>
                  <span className="text-foreground">{reservation.destination}</span>
                </div>
              )}
              {reservation.purpose && (
                <div className="mt-2 rounded-md bg-muted/40 p-3">
                  <div className="font-medium text-foreground mb-1">วัตถุประสงค์:</div>
                  <div className="text-muted-foreground">{reservation.purpose}</div>
                </div>
              )}
              {reservation.reviewNotes && (
                <div className="mt-2 rounded-md bg-amber-50 dark:bg-amber-950/30 p-3 border border-amber-200 dark:border-amber-800">
                  <div className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                    ผลการพิจารณา:
                  </div>
                  <div className="text-amber-700 dark:text-amber-300">
                    {reservation.reviewNotes}
                  </div>
                </div>
              )}
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter className="p-4 border-t border-border flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ปิด
            </Button>
          </LiyonDialogFooter>
        </>
      )}
    </LiyonDialog>
  );
}
