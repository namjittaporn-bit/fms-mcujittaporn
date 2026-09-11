"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Paperclip,
  CheckCircle2,
  XCircle,
  RotateCcw,
  MessageSquare,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import {
  LiyonDialog,
  LiyonDialogCloseButton,
  LiyonDialogHeader,
  LiyonDialogBody,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { EdocumentApprovalStepper } from "./edocument-approval-stepper";
import type { EDocumentDto } from "@/features/edocument";
import {
  reviewDocumentAction,
  addDocumentCommentAction,
} from "@/features/edocument";

interface EdocumentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: EDocumentDto | null;
  canApprove: boolean;
  onSuccess: (updatedDoc?: EDocumentDto) => void;
  isEn: boolean;
}

export function EdocumentDetailDialog({
  open,
  onOpenChange,
  document: detailDoc,
  canApprove,
  onSuccess,
  isEn,
}: EdocumentDetailDialogProps) {
  const t = useT();
  const [isPending, startTransition] = useTransition();
  const [reviewComment, setReviewComment] = useState("");
  const [newComment, setNewComment] = useState("");

  const canReviewCurrentDoc = useMemo(() => {
    if (!detailDoc || !canApprove) return false;
    if (detailDoc.status !== "SUBMITTED" && detailDoc.status !== "UNDER_REVIEW")
      return false;
    const currentApproval = detailDoc.approvals.find(
      (a) => a.stepOrder === detailDoc.currentStep
    );
    return currentApproval && currentApproval.status === "PENDING";
  }, [detailDoc, canApprove]);

  const handleReviewAction = (
    action: "APPROVED" | "REJECTED" | "REVISED_REQUESTED"
  ) => {
    if (!detailDoc) return;
    const currentApproval = detailDoc.approvals.find(
      (a) => a.stepOrder === detailDoc.currentStep
    );
    if (!currentApproval) return;

    if (
      (action === "REJECTED" || action === "REVISED_REQUESTED") &&
      !reviewComment.trim()
    ) {
      toast.error(
        isEn
          ? "Please provide a reason or comment"
          : "โปรดระบุเหตุผลหรือความเห็นในการพิจารณา"
      );
      return;
    }

    startTransition(async () => {
      const res = await reviewDocumentAction({
        documentId: detailDoc.id,
        stepId: currentApproval.id,
        action,
        comment: reviewComment,
      });

      if (res.ok) {
        if (action === "APPROVED")
          toast.success(t("edocument.notify.approved"));
        else if (action === "REJECTED")
          toast.success(t("edocument.notify.rejected"));
        else toast.success(t("edocument.notify.changesRequested"));

        setReviewComment("");
        onSuccess(res.data);
      } else {
        toast.error(res.error.message || t("edocument.notify.error"));
      }
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailDoc || !newComment.trim()) return;

    startTransition(async () => {
      const res = await addDocumentCommentAction({
        documentId: detailDoc.id,
        message: newComment,
      });

      if (res.ok) {
        toast.success(t("edocument.notify.commentAdded"));
        setNewComment("");
        onSuccess({
          ...detailDoc,
          comments: [...detailDoc.comments, res.data],
        });
      } else {
        toast.error(res.error.message || t("edocument.notify.error"));
      }
    });
  };

  if (!detailDoc) return null;

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <LiyonDialogCloseButton label={isEn ? "Close" : "ปิด"} />
      <div>
        <LiyonDialogHeader
          title={
            <div className="flex items-center gap-3">
              <span className="text-primary font-mono text-sm">
                {detailDoc.documentNumber}
              </span>
              <span className="text-base font-bold text-foreground truncate">
                {detailDoc.title}
              </span>
            </div>
          }
          description={
            <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
              <span>{detailDoc.submitterName}</span>
              <span>•</span>
              <span>
                {isEn
                  ? detailDoc.departmentNameEn ?? "Faculty Unit"
                  : detailDoc.departmentNameTh ?? "สำนักงานคณะ"}
              </span>
              <span>•</span>
              <span>
                {new Date(detailDoc.createdAt).toLocaleDateString(
                  isEn ? "en-US" : "th-TH"
                )}
              </span>
            </div>
          }
        />

        <LiyonDialogBody className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
          {/* Document Overview & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl bg-muted/40 p-4 text-xs">
            <div>
              <span className="text-muted-foreground block">
                {t("edocument.field.type")}
              </span>
              <span className="font-bold text-foreground">
                {t(`edocument.type.${detailDoc.documentType}` as const)}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block">
                {t("edocument.field.amount")}
              </span>
              <span className="font-bold text-foreground">
                {detailDoc.amount != null
                  ? `฿${detailDoc.amount.toLocaleString()}`
                  : "-"}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block">
                {t("edocument.field.status")}
              </span>
              <span className="font-bold text-foreground">
                {t(`edocument.status.${detailDoc.status}` as const)}
              </span>
            </div>
          </div>

          {/* Purpose & Content */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-foreground block">
              {t("edocument.field.content")}
            </span>
            <div className="rounded-xl border border-border/80 bg-card p-4 text-xs leading-relaxed text-foreground whitespace-pre-line">
              {detailDoc.content}
            </div>
          </div>

          {/* Attachments */}
          {detailDoc.attachments.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground block">
                {t("edocument.field.attachments")}
              </span>
              <div className="space-y-2">
                {detailDoc.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">
                        {att.fileName}
                      </span>
                    </div>
                    <span className="text-primary text-[11px] font-semibold">
                      {isEn ? "Download" : "ดาวน์โหลด"}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Multi-step Approval Stepper Timeline */}
          <EdocumentApprovalStepper
            approvals={detailDoc.approvals}
            currentStep={detailDoc.currentStep}
            docStatus={detailDoc.status}
            isEn={isEn}
          />

          {/* Action Review Box for Approvers */}
          {canReviewCurrentDoc && (
            <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-4 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-foreground block">
                  {isEn ? "Review & Decision" : "ส่วนการพิจารณาและลงนามคำร้อง"}
                </span>
                <p className="text-[11px] text-muted-foreground">
                  {isEn
                    ? "Provide your review notes and select an action"
                    : "กรอกความเห็นประกอบการพิจารณาและเลือกผลการตัดสิน"}
                </p>
              </div>

              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={
                  isEn
                    ? "Add review notes or revision request details..."
                    : "ใส่ความเห็นประกอบการอนุมัติ หรือระบุจุดที่ต้องแก้ไข..."
                }
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus:ring-1 focus:ring-primary"
              />

              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs border-orange-500/40 text-orange-600 hover:bg-orange-500/10"
                  onClick={() => handleReviewAction("REVISED_REQUESTED")}
                  disabled={isPending}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  <span>{t("edocument.action.requestChanges")}</span>
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleReviewAction("REJECTED")}
                  disabled={isPending}
                >
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                  <span>{t("edocument.action.reject")}</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleReviewAction("APPROVED")}
                  disabled={isPending}
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  <span>{t("edocument.action.approve")}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Discussion / Comments Section */}
          <div className="space-y-3 border-t border-border/60 pt-4">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              {t("edocument.detail.commentsHistory")} ({detailDoc.comments.length})
            </span>

            <div className="space-y-3 max-h-48 overflow-y-auto">
              {detailDoc.comments.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  {isEn ? "No comments yet" : "ยังไม่มีบันทึกความคิดเห็น"}
                </p>
              ) : (
                detailDoc.comments.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-border bg-muted/20 p-3 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-foreground">
                        {c.userName}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(c.createdAt).toLocaleTimeString(
                          isEn ? "en-US" : "th-TH"
                        )}
                      </span>
                    </div>
                    <p className="text-foreground/90">{c.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  isEn
                    ? "Add a message or note..."
                    : "พิมพ์ข้อความบันทึกเพิ่มเติม..."
                }
                className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary"
              />
              <Button
                type="submit"
                size="sm"
                className="gap-1.5 text-xs"
                disabled={isPending || !newComment.trim()}
              >
                <Send className="h-3.5 w-3.5" />
                <span>{t("edocument.detail.postComment")}</span>
              </Button>
            </form>
          </div>
        </LiyonDialogBody>
      </div>
    </LiyonDialog>
  );
}
