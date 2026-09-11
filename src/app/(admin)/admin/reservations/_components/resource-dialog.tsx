"use client";

import { useState, useTransition } from "react";
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
import { createResourceAction } from "@/features/reservation/actions";

interface ResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ResourceDialog({
  open,
  onOpenChange,
  onSuccess,
}: ResourceDialogProps) {
  const t = useT();
  const [isPending, startTransition] = useTransition();

  const [resType, setResType] = useState<"ROOM" | "VEHICLE">("ROOM");
  const [resCode, setResCode] = useState("");
  const [resNameTh, setResNameTh] = useState("");
  const [resNameEn, setResNameEn] = useState("");
  const [resDescription, setResDescription] = useState("");
  const [resCapacity, setResCapacity] = useState(10);
  const [resLocation, setResLocation] = useState("");
  const [resLicensePlate, setResLicensePlate] = useState("");
  const [resDriverName, setResDriverName] = useState("");
  const [resDriverPhone, setResDriverPhone] = useState("");
  const [resAmenities, setResAmenities] = useState("");

  const handleCreateResource = () => {
    if (!resCode.trim() || !resNameTh.trim() || !resNameEn.trim()) {
      toast.error(t("common.fillRequired"));
      return;
    }

    startTransition(async () => {
      const amenitiesList = resAmenities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await createResourceAction({
        type: resType,
        code: resCode.trim(),
        nameTh: resNameTh.trim(),
        nameEn: resNameEn.trim(),
        description: resDescription.trim() || undefined,
        capacity: resCapacity,
        location: resLocation.trim() || undefined,
        licensePlate: resLicensePlate.trim() || undefined,
        driverName: resDriverName.trim() || undefined,
        driverPhone: resDriverPhone.trim() || undefined,
        amenities: amenitiesList,
        isActive: true,
      });

      if (res.ok) {
        toast.success(t("reservation.notice.resource_saved"));
        onOpenChange(false);
        setResCode("");
        setResNameTh("");
        setResNameEn("");
        setResDescription("");
        setResLocation("");
        setResLicensePlate("");
        setResDriverName("");
        setResDriverPhone("");
        setResAmenities("");
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
        title={t("reservation.action.add_resource")}
        description="กรอกข้อมูลห้องประชุมหรือยานพาหนะใหม่เพื่อให้บริการในระบบ"
      />

      <LiyonDialogBody className="space-y-4 max-h-[75vh] overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4">
          <LiyonField label="ประเภททรัพยากร">
            <LiyonSelect
              value={resType}
              onChange={(e) => setResType(e.target.value as "ROOM" | "VEHICLE")}
            >
              <option value="ROOM">ห้องประชุม (Room)</option>
              <option value="VEHICLE">ยานพาหนะ (Vehicle)</option>
            </LiyonSelect>
          </LiyonField>

          <LiyonField label={t("reservation.field.code")}>
            <input
              type="text"
              placeholder="เช่น RM-301 หรือ VAN-01"
              value={resCode}
              onChange={(e) => setResCode(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </LiyonField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LiyonField label={t("reservation.field.name_th")}>
            <input
              type="text"
              placeholder="เช่น ห้องประชุมทองกวาว"
              value={resNameTh}
              onChange={(e) => setResNameTh(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </LiyonField>

          <LiyonField label={t("reservation.field.name_en")}>
            <input
              type="text"
              placeholder="e.g. Thongkwaw Conference Room"
              value={resNameEn}
              onChange={(e) => setResNameEn(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </LiyonField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <LiyonField label={t("reservation.field.capacity")}>
            <input
              type="number"
              min={1}
              value={resCapacity}
              onChange={(e) => setResCapacity(Number(e.target.value))}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </LiyonField>

          {resType === "ROOM" ? (
            <LiyonField label={t("reservation.field.location")}>
              <input
                type="text"
                placeholder="เช่น อาคาร 4 ชั้น 3"
                value={resLocation}
                onChange={(e) => setResLocation(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </LiyonField>
          ) : (
            <LiyonField label={t("reservation.field.license_plate")}>
              <input
                type="text"
                placeholder="เช่น นข-4455 เชียงใหม่"
                value={resLicensePlate}
                onChange={(e) => setResLicensePlate(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </LiyonField>
          )}
        </div>

        {resType === "VEHICLE" && (
          <div className="grid grid-cols-2 gap-4">
            <LiyonField label={t("reservation.field.driver_name")}>
              <input
                type="text"
                placeholder="ชื่อ-นามสกุล คนขับ"
                value={resDriverName}
                onChange={(e) => setResDriverName(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </LiyonField>

            <LiyonField label={t("reservation.field.driver_phone")}>
              <input
                type="text"
                placeholder="081-xxx-xxxx"
                value={resDriverPhone}
                onChange={(e) => setResDriverPhone(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </LiyonField>
          </div>
        )}

        <LiyonField label="อุปกรณ์อำนวยความสะดวก (คั่นด้วยเครื่องหมายจุลภาค ,)">
          <input
            type="text"
            placeholder="เช่น โปรเจกเตอร์, ไมโครโฟนไร้สาย, ระบบประชุมทางไกล Zoom"
            value={resAmenities}
            onChange={(e) => setResAmenities(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </LiyonField>

        <LiyonField label={t("reservation.field.description")}>
          <textarea
            placeholder="รายละเอียดเพิ่มเติม"
            rows={2}
            value={resDescription}
            onChange={(e) => setResDescription(e.target.value)}
            className="w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </LiyonField>
      </LiyonDialogBody>

      <LiyonDialogFooter className="p-4 border-t border-border flex justify-end gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          ยกเลิก
        </Button>
        <Button
          onClick={handleCreateResource}
          disabled={isPending}
          className="bg-primary text-primary-foreground"
        >
          บันทึกทรัพยากร
        </Button>
      </LiyonDialogFooter>
    </LiyonDialog>
  );
}
