"use client";

import { useT } from "@/shared/lib/i18n/client";
import type { EDocumentApprovalDto } from "@/features/edocument";

interface EdocumentApprovalStepperProps {
  approvals: EDocumentApprovalDto[];
  currentStep: number;
  docStatus: string;
  isEn: boolean;
}

export function EdocumentApprovalStepper({
  approvals,
  currentStep,
  docStatus,
  isEn,
}: EdocumentApprovalStepperProps) {
  const t = useT();

  return (
    <div className="space-y-3 border-t border-border/60 pt-4">
      <span className="text-xs font-bold text-foreground block">
        {t("edocument.detail.workflowProgress")}
      </span>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {approvals.map((step) => {
          const isApproved = step.status === "APPROVED";
          const isRejected = step.status === "REJECTED";
          const isChanges = step.status === "REVISED_REQUESTED";
          const isCurrent =
            step.stepOrder === currentStep &&
            (docStatus === "SUBMITTED" || docStatus === "UNDER_REVIEW");

          return (
            <div key={step.id} className="relative space-y-1">
              <div
                className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-white text-[10px] font-bold ${
                  isApproved
                    ? "bg-emerald-600"
                    : isRejected
                    ? "bg-red-600"
                    : isChanges
                    ? "bg-orange-600"
                    : isCurrent
                    ? "bg-primary animate-pulse"
                    : "bg-muted-foreground/40"
                }`}
              >
                {step.stepOrder}
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground">
                  {isEn ? step.stepNameEn : step.stepNameTh}
                </span>
                <span
                  className={`text-[11px] font-semibold ${
                    isApproved
                      ? "text-emerald-600"
                      : isRejected
                      ? "text-destructive"
                      : isChanges
                      ? "text-orange-600"
                      : isCurrent
                      ? "text-primary font-bold"
                      : "text-muted-foreground"
                  }`}
                >
                  {isApproved
                    ? isEn
                      ? "Approved"
                      : "อนุมัติแล้ว"
                    : isRejected
                    ? isEn
                      ? "Rejected"
                      : "ไม่อนุมัติ"
                    : isChanges
                    ? isEn
                      ? "Revision Requested"
                      : "ขอให้แก้ไข"
                    : isCurrent
                    ? isEn
                      ? "Under Review"
                      : "กำลังพิจารณา"
                    : isEn
                    ? "Pending"
                    : "รอการพิจารณา"}
                </span>
              </div>

              {step.comment && (
                <p className="text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-lg italic border border-border/40">
                  &ldquo;{step.comment}&rdquo;
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
