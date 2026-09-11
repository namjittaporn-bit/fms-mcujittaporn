"use client";

import { useState, useTransition } from "react";
import { XCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import {
  LiyonDialog,
  LiyonDialogCloseButton,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
  StatusPill,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { ResourceReservationDto } from "@/features/reservation";
import { reviewReservationAction } from "@/features/reservation/actions";

interface ReviewDialogProps {
  reservation: ResourceReservationDto | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ReviewDialog({
  reservation,
  onOpenChange,
  onSuccess,
}: ReviewDialogProps) {
  const t = useT();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [reviewNotes, setReviewNotes] = useState("");

  const handleReview = (action: "APPROVE" | "REJECT") => {
    if (!reservation) return;

    startTransition(async () => {
      const res = await reviewReservationAction({
        reservationId: reservation.id,
        action,
        reviewNotes: reviewNotes.trim() || undefined,
      });

      if (res.ok) {
        toast.success(
          action === "APPROVE"
            ? t("reservation.notice.approved")
            : t("reservation.notice.rejected")
        );
        onOpenChange(false);
        setReviewNotes("");
        onSuccess();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  return (
    <LiyonDialog
      open={!!reservation}
      onOpenChange={onOpenChange}
      wide
    >
      {reservation && (
        <>
          <LiyonDialogCloseButton label="Close" />
          <LiyonDialogHeader
            title={t("reservation.dialog.review_title")}
            description={t("reservation.dialog.review_desc")}
          />

          <LiyonDialogBody className="space-y-4 p-6">
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm text-foreground">
                  {reservation.title}
                </span>
                <StatusPill tone="warn">รออนุมัติ</StatusPill>
              </div>
              <div>
                ทรัพยากร: <strong>{reservation.resourceNameTh}</strong> (
                {reservation.resourceCode})
              </div>
              <div>
                ผู้ยื่นจอง: {reservation.userName} ({reservation.userEmail})
              </div>
              <div>
                วัน-เวลา:{" "}
                {formatDate(new Date(reservation.startTime), locale, { time: true })} ถึง{" "}
                {formatDate(new Date(reservation.endTime), locale, { time: true })}
              </div>
              {reservation.destination && (
                <div>จุดหมายปลายทาง: {reservation.destination}</div>
              )}
              {reservation.purpose && (
                <div>วัตถุประสงค์: {reservation.purpose}</div>
              )}
            </div>

            <LiyonField label={t("reservation.field.review_notes")}>
              <textarea
                placeholder="ระบุเหตุผลหรือข้อแนะนำเพิ่มเติม (ถ้ามี)"
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </LiyonField>
          </LiyonDialogBody>

          <LiyonDialogFooter className="p-4 border-t border-border flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ปิด
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleReview("REJECT")}
              disabled={isPending}
              className="gap-1.5"
            >
              <XCircle className="h-4 w-4" />
              <span>{t("reservation.action.reject")}</span>
            </Button>
            <Button
              onClick={() => handleReview("APPROVE")}
              disabled={isPending}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Check className="h-4 w-4" />
              <span>{t("reservation.action.approve")}</span>
            </Button>
          </LiyonDialogFooter>
        </>
      )}
    </LiyonDialog>
  );
}
