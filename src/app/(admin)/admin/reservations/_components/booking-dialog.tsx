"use client";

import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import {
  LiyonDialog,
  LiyonDialogCloseButton,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
  LiyonSelect,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { ResourceItemDto } from "@/features/reservation";
import {
  createReservationAction,
  checkConflictAction,
} from "@/features/reservation/actions";

interface DepartmentOption {
  id: string;
  nameTh: string;
  nameEn: string;
}

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resources: ResourceItemDto[];
  departments: DepartmentOption[];
  preselectedResource: ResourceItemDto | null;
  onSuccess: () => void;
}

export function BookingDialog({
  open,
  onOpenChange,
  resources,
  departments,
  preselectedResource,
  onSuccess,
}: BookingDialogProps) {
  const t = useT();
  const [isPending, startTransition] = useTransition();

  const [selectedResource, setSelectedResource] = useState<ResourceItemDto | null>(
    preselectedResource
  );
  const [bookingResourceId, setBookingResourceId] = useState(
    preselectedResource ? preselectedResource.id : ""
  );
  const [bookingTitle, setBookingTitle] = useState("");
  const [bookingPurpose, setBookingPurpose] = useState("");
  const [bookingAttendees, setBookingAttendees] = useState(1);
  const [bookingDestination, setBookingDestination] = useState("");
  const [bookingDeptId, setBookingDeptId] = useState("");

  const pad = (n: number) => String(n).padStart(2, "0");
  const formatInputDateTime = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const defaultStart = new Date();
  defaultStart.setMinutes(0, 0, 0);
  defaultStart.setHours(defaultStart.getHours() + 1);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setHours(defaultEnd.getHours() + 2);

  const [bookingStartTime, setBookingStartTime] = useState(formatInputDateTime(defaultStart));
  const [bookingEndTime, setBookingEndTime] = useState(formatInputDateTime(defaultEnd));
  const [conflictNotice, setConflictNotice] = useState<{
    hasConflict: boolean;
    message?: string;
  } | null>(null);

  const handleCheckConflict = async () => {
    if (!bookingResourceId || !bookingStartTime || !bookingEndTime) {
      toast.error(t("reservation.validation.invalid_time_range"));
      return;
    }

    const start = new Date(bookingStartTime);
    const end = new Date(bookingEndTime);

    if (end <= start) {
      setConflictNotice({
        hasConflict: true,
        message: t("reservation.validation.invalid_time_range"),
      });
      return;
    }

    const res = await checkConflictAction(bookingResourceId, start.toISOString(), end.toISOString());
    if (res.ok) {
      if (res.data.hasConflict && res.data.conflictingReservation) {
        setConflictNotice({
          hasConflict: true,
          message: `${t("reservation.validation.conflict_detected")} (${res.data.conflictingReservation.title})`,
        });
      } else {
        setConflictNotice({
          hasConflict: false,
          message: t("reservation.validation.available"),
        });
      }
    } else {
      toast.error(res.error.message);
    }
  };

  const handleSubmitReservation = () => {
    if (!bookingResourceId || !bookingTitle.trim() || !bookingStartTime || !bookingEndTime) {
      toast.error(t("common.fillRequired"));
      return;
    }

    startTransition(async () => {
      const res = await createReservationAction({
        resourceId: bookingResourceId,
        title: bookingTitle.trim(),
        purpose: bookingPurpose.trim() || undefined,
        attendeesCount: bookingAttendees,
        destination: bookingDestination.trim() || undefined,
        startTime: new Date(bookingStartTime).toISOString(),
        endTime: new Date(bookingEndTime).toISOString(),
        departmentId: bookingDeptId || undefined,
      });

      if (res.ok) {
        toast.success(t("reservation.notice.created"));
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <LiyonDialogCloseButton label="Close" />
      <LiyonDialogHeader
        title={t("reservation.dialog.new_title")}
        description={t("reservation.dialog.new_desc")}
      />

      <LiyonDialogBody className="space-y-4 max-h-[75vh] overflow-y-auto p-6">
        <LiyonField label={t("reservation.field.resource")}>
          <LiyonSelect
            value={bookingResourceId}
            onChange={(e) => {
              const resId = e.target.value;
              setBookingResourceId(resId);
              const selected = resources.find((r) => r.id === resId) ?? null;
              setSelectedResource(selected);
              setConflictNotice(null);
            }}
          >
            <option value="">-- เลือกห้องประชุมหรือยานพาหนะ --</option>
            {resources
              .filter((r) => r.isActive)
              .map((r) => (
                <option key={r.id} value={r.id}>
                  [{r.type === "ROOM" ? "ห้องประชุม" : "ยานพาหนะ"}] {r.code} - {r.nameTh} (จุ{" "}
                  {r.capacity} คน)
                </option>
              ))}
          </LiyonSelect>
        </LiyonField>

        {selectedResource && (
          <div className="rounded-md bg-muted/40 p-3 text-xs space-y-1">
            <div className="font-semibold text-foreground">
              {selectedResource.nameTh} ({selectedResource.nameEn})
            </div>
            <div>
              {selectedResource.type === "ROOM"
                ? `สถานที่: ${selectedResource.location || "-"}`
                : `ทะเบียน: ${selectedResource.licensePlate || "-"} | คนขับ: ${selectedResource.driverName || "-"} (${selectedResource.driverPhone || "-"})`}
            </div>
            <div>ความจุสูงสุด: {selectedResource.capacity} คน/ที่นั่ง</div>
          </div>
        )}

        <LiyonField label={t("reservation.field.title")}>
          <input
            type="text"
            placeholder="เช่น การประชุมคณะกรรมการประจำคณะ ครั้งที่ 3/2569"
            value={bookingTitle}
            onChange={(e) => setBookingTitle(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </LiyonField>

        <LiyonField label={t("reservation.field.purpose")}>
          <textarea
            placeholder="ระบุวัตถุประสงค์และรายละเอียดการใช้งาน"
            rows={2}
            value={bookingPurpose}
            onChange={(e) => setBookingPurpose(e.target.value)}
            className="w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </LiyonField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <LiyonField label={t("reservation.field.attendees_count")}>
            <input
              type="number"
              min={1}
              max={selectedResource ? selectedResource.capacity : 100}
              value={bookingAttendees}
              onChange={(e) => setBookingAttendees(Number(e.target.value))}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </LiyonField>

          <LiyonField label={t("reservation.field.department")}>
            <LiyonSelect
              value={bookingDeptId}
              onChange={(e) => setBookingDeptId(e.target.value)}
            >
              <option value="">-- ไม่ระบุหน่วยงาน --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameTh}
                </option>
              ))}
            </LiyonSelect>
          </LiyonField>
        </div>

        {selectedResource?.type === "VEHICLE" && (
          <LiyonField label={t("reservation.field.destination")}>
            <input
              type="text"
              placeholder="เช่น สำนักงานคณะกรรมการการอุดมศึกษา กรุงเทพฯ"
              value={bookingDestination}
              onChange={(e) => setBookingDestination(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </LiyonField>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <LiyonField label={t("reservation.field.start_time")}>
            <input
              type="datetime-local"
              value={bookingStartTime}
              onChange={(e) => {
                setBookingStartTime(e.target.value);
                setConflictNotice(null);
              }}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </LiyonField>

          <LiyonField label={t("reservation.field.end_time")}>
            <input
              type="datetime-local"
              value={bookingEndTime}
              onChange={(e) => {
                setBookingEndTime(e.target.value);
                setConflictNotice(null);
              }}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </LiyonField>
        </div>

        <div className="flex items-center justify-between pt-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCheckConflict}
            className="text-xs"
          >
            {t("reservation.action.check_availability")}
          </Button>

          {conflictNotice && (
            <div
              className={`text-xs font-medium flex items-center gap-1.5 ${
                conflictNotice.hasConflict ? "text-destructive" : "text-emerald-600"
              }`}
            >
              {conflictNotice.hasConflict ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>{conflictNotice.message}</span>
            </div>
          )}
        </div>
      </LiyonDialogBody>

      <LiyonDialogFooter className="p-4 border-t border-border flex justify-end gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          ยกเลิก
        </Button>
        <Button
          onClick={handleSubmitReservation}
          disabled={isPending}
          className="bg-primary text-primary-foreground"
        >
          {t("reservation.action.book")}
        </Button>
      </LiyonDialogFooter>
    </LiyonDialog>
  );
}
