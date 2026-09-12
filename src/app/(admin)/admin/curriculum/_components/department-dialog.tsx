"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  LiyonDialog,
  LiyonDialogCloseButton,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { useT } from "@/shared/lib/i18n/client";
import type { DepartmentDto } from "@/features/curriculum";
import {
  createDepartmentAction,
  updateDepartmentAction,
} from "@/features/curriculum";

interface DepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: DepartmentDto | null;
  onSuccess: (dept: DepartmentDto) => void;
}

function DepartmentForm({
  item,
  onOpenChange,
  onSuccess,
}: {
  item?: DepartmentDto | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: (dept: DepartmentDto) => void;
}) {
  const t = useT();
  const [isPending, startTransition] = useTransition();

  const [code, setCode] = useState(item?.code || "");
  const [nameTh, setNameTh] = useState(item?.nameTh || "");
  const [nameEn, setNameEn] = useState(item?.nameEn || "");
  const [description, setDescription] = useState(item?.description || "");
  const [orderIndex, setOrderIndex] = useState(item?.orderIndex ?? 0);
  const [isActive, setIsActive] = useState(item?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || !nameTh.trim() || !nameEn.trim()) {
      toast.error(t("curriculum.notify.error"));
      return;
    }

    startTransition(async () => {
      try {
        if (item) {
          const res = await updateDepartmentAction({
            id: item.id,
            code: code.trim().toUpperCase(),
            nameTh: nameTh.trim(),
            nameEn: nameEn.trim(),
            description: description.trim() || null,
            orderIndex,
            isActive,
          });

          if (res.ok) {
            toast.success(t("department.notify.updated"));
            onSuccess(res.data);
            onOpenChange(false);
          } else {
            toast.error(
              res.error.message.includes("department_code_exists")
                ? t("department.notify.codeExists")
                : res.error.message || t("curriculum.notify.error")
            );
          }
        } else {
          const res = await createDepartmentAction({
            code: code.trim().toUpperCase(),
            nameTh: nameTh.trim(),
            nameEn: nameEn.trim(),
            description: description.trim() || null,
            orderIndex,
            isActive,
          });

          if (res.ok) {
            toast.success(t("department.notify.created"));
            onSuccess(res.data);
            onOpenChange(false);
          } else {
            toast.error(
              res.error.message.includes("department_code_exists")
                ? t("department.notify.codeExists")
                : res.error.message || t("curriculum.notify.error")
            );
          }
        }
      } catch {
        toast.error(t("curriculum.notify.error"));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <LiyonDialogBody className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LiyonField label={t("department.field.code")} htmlFor="d-code">
            <input
              id="d-code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="เช่น CS, IT, IM"
              className="font-mono uppercase"
              disabled={isPending}
            />
          </LiyonField>

          <LiyonField label={t("department.field.orderIndex")} htmlFor="d-order">
            <input
              id="d-order"
              type="number"
              min="0"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
              disabled={isPending}
            />
          </LiyonField>
        </div>

        <LiyonField label={t("department.field.nameTh")} htmlFor="d-name-th">
          <input
            id="d-name-th"
            type="text"
            required
            value={nameTh}
            onChange={(e) => setNameTh(e.target.value)}
            placeholder="เช่น ภาควิชาวิทยาการคอมพิวเตอร์"
            disabled={isPending}
          />
        </LiyonField>

        <LiyonField label={t("department.field.nameEn")} htmlFor="d-name-en">
          <input
            id="d-name-en"
            type="text"
            required
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="เช่น Department of Computer Science"
            disabled={isPending}
          />
        </LiyonField>

        <LiyonField label={t("department.field.description")} htmlFor="d-desc">
          <textarea
            id="d-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="รายละเอียด หรือวิสัยทัศน์ของภาควิชา/ส่วนงาน..."
            disabled={isPending}
            className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </LiyonField>

        <div className="flex items-center gap-2 pt-1">
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={isPending}
              className="rounded border-border text-primary focus:ring-primary h-4 w-4"
            />
            <span>{t("department.field.status")}</span>
          </label>
        </div>
      </LiyonDialogBody>

      <LiyonDialogFooter>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
        >
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={isPending} className="gap-2">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{item ? t("common.save") : t("curriculum.action.create")}</span>
        </Button>
      </LiyonDialogFooter>
    </form>
  );
}

export function DepartmentDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: DepartmentDialogProps) {
  const t = useT();

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange}>
      <LiyonDialogCloseButton label={t("common.cancel")} />
      <LiyonDialogHeader
        title={
          item
            ? t("department.dialog.editTitle")
            : t("department.dialog.createTitle")
        }
      />

      {open && (
        <DepartmentForm
          key={item?.id ?? "new"}
          item={item}
          onOpenChange={onOpenChange}
          onSuccess={onSuccess}
        />
      )}
    </LiyonDialog>
  );
}
