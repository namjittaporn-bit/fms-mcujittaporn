"use client";

import { useState, useTransition } from "react";
import { Paperclip } from "lucide-react";
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
import type {
  DepartmentDto,
  DocTypeType,
  DocUrgencyType,
} from "@/features/edocument";
import { createDocumentAction } from "@/features/edocument";

interface EdocumentNewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: DepartmentDto[];
  onSuccess: () => void;
  isEn: boolean;
}

export function EdocumentNewDialog({
  open,
  onOpenChange,
  departments,
  onSuccess,
  isEn,
}: EdocumentNewDialogProps) {
  const t = useT();
  const [isPending, startTransition] = useTransition();

  const [newTitle, setNewTitle] = useState("");
  const [newDocType, setNewDocType] = useState<DocTypeType>("PROJECT_PROPOSAL");
  const [newUrgency, setNewUrgency] = useState<DocUrgencyType>("NORMAL");
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newAmount, setNewAmount] = useState<string>("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [submitImmediately, setSubmitImmediately] = useState(true);

  const resetForm = () => {
    setNewTitle("");
    setNewDocType("PROJECT_PROPOSAL");
    setNewUrgency("NORMAL");
    setNewDepartmentId("");
    setNewContent("");
    setNewAmount("");
    setAttachmentName("");
    setAttachmentUrl("");
    setSubmitImmediately(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const attachments =
        attachmentName.trim() && attachmentUrl.trim()
          ? [{ fileName: attachmentName.trim(), fileUrl: attachmentUrl.trim() }]
          : [];

      const payload = {
        title: newTitle.trim(),
        documentType: newDocType,
        urgency: newUrgency,
        departmentId: newDepartmentId || null,
        content: newContent.trim(),
        amount: newAmount ? Number(newAmount) : null,
        attachments,
        submitImmediately,
      };

      const res = await createDocumentAction(payload);
      if (!res.ok) {
        toast.error(res.error.message);
        return;
      }

      toast.success(
        submitImmediately
          ? t("edocument.notice.submitted")
          : t("edocument.notice.savedDraft")
      );
      onOpenChange(false);
      resetForm();
      onSuccess();
    });
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <LiyonDialogCloseButton label={isEn ? "Close" : "ปิด"} />
      <LiyonDialogHeader
        title={t("edocument.action.create")}
        description={t("edocument.subtitle")}
      />
      <form onSubmit={handleCreateSubmit}>
        <LiyonDialogBody className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={t("edocument.field.type")}>
              <LiyonSelect
                value={newDocType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setNewDocType(e.target.value as DocTypeType)
                }
              >
                <option value="PROJECT_PROPOSAL">
                  {t("edocument.type.PROJECT_PROPOSAL")}
                </option>
                <option value="OFFICIAL_TRAVEL">
                  {t("edocument.type.OFFICIAL_TRAVEL")}
                </option>
                <option value="PROCUREMENT_REQ">
                  {t("edocument.type.PROCUREMENT_REQ")}
                </option>
                <option value="GENERAL_REQUEST">
                  {t("edocument.type.GENERAL_REQUEST")}
                </option>
              </LiyonSelect>
            </LiyonField>

            <LiyonField label={t("edocument.field.urgency")}>
              <LiyonSelect
                value={newUrgency}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setNewUrgency(e.target.value as DocUrgencyType)
                }
              >
                <option value="NORMAL">{t("edocument.urgency.NORMAL")}</option>
                <option value="URGENT">{t("edocument.urgency.URGENT")}</option>
                <option value="VERY_URGENT">
                  {t("edocument.urgency.VERY_URGENT")}
                </option>
              </LiyonSelect>
            </LiyonField>
          </div>

          <LiyonField label={t("edocument.field.title")}>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewTitle(e.target.value)
              }
              placeholder="เช่น ขออนุมัติจัดโครงการสัมมนาเชิงปฏิบัติการ..."
            />
          </LiyonField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={t("edocument.field.department")}>
              <LiyonSelect
                value={newDepartmentId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setNewDepartmentId(e.target.value)
                }
              >
                <option value="">
                  {isEn ? "None / Central Office" : "ไม่ระบุ / สำนักงานคณะ"}
                </option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {isEn ? d.nameEn : d.nameTh}
                  </option>
                ))}
              </LiyonSelect>
            </LiyonField>

            <LiyonField label={t("edocument.field.amount")}>
              <input
                type="number"
                min={0}
                value={newAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewAmount(e.target.value)
                }
                placeholder="50000"
              />
            </LiyonField>
          </div>

          <LiyonField label={t("edocument.field.content")}>
            <textarea
              rows={4}
              required
              value={newContent}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNewContent(e.target.value)
              }
              placeholder="ระบุวัตถุประสงค์ เหตุผลความจำเป็น และรายละเอียดการดำเนินงาน..."
            />
          </LiyonField>

          <div className="border-t border-border/60 pt-3 space-y-3">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Paperclip className="h-3.5 w-3.5" />
              {t("edocument.field.attachments")}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("edocument.field.attachmentName")}>
                <input
                  type="text"
                  value={attachmentName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAttachmentName(e.target.value)
                  }
                  placeholder="เช่น โครงการ_ฉบับสมบูรณ์.pdf"
                />
              </LiyonField>

              <LiyonField label={t("edocument.field.attachmentUrl")}>
                <input
                  type="url"
                  value={attachmentUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAttachmentUrl(e.target.value)
                  }
                  placeholder="https://..."
                />
              </LiyonField>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="submit-now"
              checked={submitImmediately}
              onChange={(e) => setSubmitImmediately(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary h-4 w-4"
            />
            <label
              htmlFor="submit-now"
              className="text-xs text-foreground font-medium"
            >
              {isEn
                ? "Submit immediately for review"
                : "ยื่นคำร้องทันทีเข้าสู่สายการพิจารณา (หากไม่เลือกจะบันทึกเป็นแบบร่าง)"}
            </label>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter className="flex justify-end gap-2 border-t pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {isEn ? "Cancel" : "ยกเลิก"}
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending
              ? isEn
                ? "Submitting..."
                : "กำลังบันทึก..."
              : isEn
              ? "Submit Document"
              : "ยื่นคำร้อง"}
          </Button>
        </LiyonDialogFooter>
      </form>
    </LiyonDialog>
  );
}
