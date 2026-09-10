"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Plus,
  Trash2,
  FileText,
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  MessageSquare,
  Paperclip,
  Eye,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import {
  LiyonCard,
  DataTable,
  StatusPill,
  LiyonDialog,
  LiyonDialogCloseButton,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
  LiyonSelect,
  RowMenuItem,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type {
  EDocumentDto,
  DepartmentDto,
  DocTypeType,
  DocUrgencyType,
} from "@/features/edocument";
import {
  createDocumentAction,
  reviewDocumentAction,
  addDocumentCommentAction,
  deleteDocumentAction,
  getMyDocumentsAction,
  getPendingApprovalsAction,
  getAllDocumentsAction,
} from "@/features/edocument";

interface Props {
  userId: string;
  userName: string;
  initialMyDocs: EDocumentDto[];
  initialPendingDocs: EDocumentDto[];
  initialAllDocs: EDocumentDto[];
  departments: DepartmentDto[];
  canCreate: boolean;
  canApprove: boolean;
  canManage: boolean;
}

export function EDocumentClient({
  userId,
  initialMyDocs,
  initialPendingDocs,
  initialAllDocs,
  departments,
  canCreate,
  canApprove,
  canManage,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const isEn = locale === "en";

  const [activeTab, setActiveTab] = useState<"my" | "pending" | "all">(
    initialPendingDocs.length > 0 && canApprove ? "pending" : "my"
  );

  const [myDocs, setMyDocs] = useState<EDocumentDto[]>(initialMyDocs);
  const [pendingDocs, setPendingDocs] = useState<EDocumentDto[]>(initialPendingDocs);
  const [allDocs, setAllDocs] = useState<EDocumentDto[]>(initialAllDocs);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [detailDoc, setDetailDoc] = useState<EDocumentDto | null>(null);
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<EDocumentDto | null>(null);

  // Review Form
  const [reviewComment, setReviewComment] = useState("");
  const [newComment, setNewComment] = useState("");

  // Create Form
  const [newTitle, setNewTitle] = useState("");
  const [newDocType, setNewDocType] = useState<DocTypeType>("PROJECT_PROPOSAL");
  const [newUrgency, setNewUrgency] = useState<DocUrgencyType>("NORMAL");
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newAmount, setNewAmount] = useState<string>("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [submitImmediately, setSubmitImmediately] = useState(true);

  const refreshData = async () => {
    const [resMy, resPending, resAll] = await Promise.all([
      getMyDocumentsAction(),
      canApprove ? getPendingApprovalsAction() : Promise.resolve({ ok: true as const, data: [] }),
      canManage ? getAllDocumentsAction() : Promise.resolve({ ok: true as const, data: [] }),
    ]);

    if (resMy.ok) setMyDocs(resMy.data);
    if (resPending.ok) setPendingDocs(resPending.data);
    if (resAll.ok) setAllDocs(resAll.data);
  };

  const handleOpenCreate = () => {
    setNewTitle("");
    setNewDocType("PROJECT_PROPOSAL");
    setNewUrgency("NORMAL");
    setNewDepartmentId(departments[0]?.id ?? "");
    setNewContent("");
    setNewAmount("");
    setAttachmentName("");
    setAttachmentUrl("");
    setSubmitImmediately(true);
    setCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const attachments = attachmentUrl
      ? [{ fileName: attachmentName || "Attachment File", fileUrl: attachmentUrl }]
      : [];

    const payload = {
      title: newTitle,
      documentType: newDocType,
      urgency: newUrgency,
      departmentId: newDepartmentId || null,
      content: newContent,
      amount: newAmount ? Number(newAmount) : null,
      attachments,
      submitImmediately,
    };

    startTransition(async () => {
      const res = await createDocumentAction(payload);
      if (res.ok) {
        toast.success(t("edocument.notify.created"));
        setCreateOpen(false);
        refreshData();
      } else {
        toast.error(res.error.message || t("edocument.notify.error"));
      }
    });
  };

  const handleReviewAction = (action: "APPROVED" | "REJECTED" | "REVISED_REQUESTED") => {
    if (!detailDoc) return;
    const currentApproval = detailDoc.approvals.find((a) => a.stepOrder === detailDoc.currentStep);
    if (!currentApproval) return;

    if ((action === "REJECTED" || action === "REVISED_REQUESTED") && !reviewComment.trim()) {
      toast.error(isEn ? "Please provide a reason or comment" : "โปรดระบุเหตุผลหรือความเห็นในการพิจารณา");
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
        if (action === "APPROVED") toast.success(t("edocument.notify.approved"));
        else if (action === "REJECTED") toast.success(t("edocument.notify.rejected"));
        else toast.success(t("edocument.notify.changesRequested"));

        setReviewComment("");
        setDetailDoc(res.data);
        refreshData();
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
        setDetailDoc({
          ...detailDoc,
          comments: [...detailDoc.comments, res.data],
        });
        refreshData();
      } else {
        toast.error(res.error.message || t("edocument.notify.error"));
      }
    });
  };

  const handleDelete = () => {
    if (!deleteConfirmDoc) return;
    startTransition(async () => {
      const res = await deleteDocumentAction(deleteConfirmDoc.id);
      if (res.ok) {
        toast.success(t("edocument.notify.deleted"));
        setDeleteConfirmDoc(null);
        if (detailDoc?.id === deleteConfirmDoc.id) setDetailDoc(null);
        refreshData();
      } else {
        toast.error(res.error.message || t("edocument.notify.error"));
      }
    });
  };

  // Active items based on tab
  const currentTabItems = useMemo(() => {
    if (activeTab === "pending") return pendingDocs;
    if (activeTab === "all") return allDocs;
    return myDocs;
  }, [activeTab, myDocs, pendingDocs, allDocs]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return currentTabItems.filter((item) => {
      if (typeFilter !== "ALL" && item.documentType !== typeFilter) return false;
      if (urgencyFilter !== "ALL" && item.urgency !== urgencyFilter) return false;
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (searchInput.trim()) {
        const q = searchInput.toLowerCase();
        const match =
          item.documentNumber.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.submitterName.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [currentTabItems, typeFilter, urgencyFilter, statusFilter, searchInput]);

  // Counters
  const countPending = useMemo(() => myDocs.filter((d) => d.status === "SUBMITTED" || d.status === "UNDER_REVIEW").length, [myDocs]);
  const countApproved = useMemo(() => myDocs.filter((d) => d.status === "APPROVED").length, [myDocs]);
  const countChanges = useMemo(() => myDocs.filter((d) => d.status === "REVISED_REQUESTED").length, [myDocs]);

  // Check if detailDoc is actionable by current user
  const canReviewCurrentDoc = useMemo(() => {
    if (!detailDoc || !canApprove) return false;
    if (detailDoc.status !== "SUBMITTED" && detailDoc.status !== "UNDER_REVIEW") return false;
    const currentApproval = detailDoc.approvals.find((a) => a.stepOrder === detailDoc.currentStep);
    return currentApproval && currentApproval.status === "PENDING";
  }, [detailDoc, canApprove]);

  const columns: DataTableColumn<EDocumentDto>[] = [
    {
      key: "docNumber",
      header: t("edocument.field.docNumber"),
      render: (row) => {
        const isUrgent = row.urgency === "URGENT";
        const isVeryUrgent = row.urgency === "VERY_URGENT";
        return (
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-primary">
              {row.documentNumber}
            </span>
            {(isUrgent || isVeryUrgent) && (
              <div>
                <span
                  className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                    isVeryUrgent
                      ? "bg-red-500/10 text-red-600 border border-red-200 dark:border-red-900"
                      : "bg-amber-500/10 text-amber-600 border border-amber-200 dark:border-amber-900"
                  }`}
                >
                  {isVeryUrgent ? t("edocument.urgency.VERY_URGENT") : t("edocument.urgency.URGENT")}
                </span>
              </div>
            )}
          </div>
        );
      },
      className: "w-36",
    },
    {
      key: "title",
      header: t("edocument.field.title"),
      render: (row) => {
        const typeKey = `edocument.type.${row.documentType}` as const;
        return (
          <div className="space-y-0.5">
            <span className="font-bold text-sm text-foreground hover:text-primary transition-colors cursor-pointer" onClick={() => setDetailDoc(row)}>
              {row.title}
            </span>
            <p className="text-xs text-muted-foreground">{t(typeKey)}</p>
          </div>
        );
      },
    },
    {
      key: "submitter",
      header: t("edocument.field.submitter"),
      render: (row) => (
        <div className="text-xs">
          <p className="font-semibold text-foreground">{row.submitterName}</p>
          <p className="text-muted-foreground">
            {isEn ? row.departmentNameEn ?? "Faculty Unit" : row.departmentNameTh ?? "สำนักงานคณะ"}
          </p>
        </div>
      ),
      className: "w-44",
    },
    {
      key: "amount",
      header: t("edocument.field.amount"),
      render: (row) => (
        <span className="text-xs font-medium text-foreground">
          {row.amount != null ? `฿${row.amount.toLocaleString()}` : "-"}
        </span>
      ),
      className: "w-28",
    },
    {
      key: "status",
      header: t("edocument.field.status"),
      render: (row) => {
        const statusKey = `edocument.status.${row.status}` as const;
        let tone: "ok" | "warn" | "bad" | "info" | "off" = "info";
        if (row.status === "APPROVED") tone = "ok";
        else if (row.status === "REJECTED") tone = "bad";
        else if (row.status === "REVISED_REQUESTED" || row.status === "UNDER_REVIEW") tone = "warn";
        else if (row.status === "DRAFT") tone = "off";

        return <StatusPill tone={tone}>{t(statusKey)}</StatusPill>;
      },
      className: "w-32",
    },
    {
      key: "progress",
      header: t("edocument.field.currentStep"),
      render: (row) => {
        const currentApproval = row.approvals.find((a) => a.stepOrder === row.currentStep);
        return (
          <div className="text-xs space-y-0.5">
            <span className="font-semibold text-foreground">
              {row.status === "APPROVED" ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {isEn ? "Complete" : "เสร็จสิ้น"}
                </span>
              ) : row.status === "REJECTED" ? (
                <span className="text-destructive font-bold flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" />
                  {isEn ? "Rejected" : "ไม่อนุมัติ"}
                </span>
              ) : (
                `${row.currentStep} / ${row.totalSteps}`
              )}
            </span>
            {currentApproval && row.status !== "APPROVED" && row.status !== "REJECTED" && (
              <p className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                {isEn ? currentApproval.stepNameEn : currentApproval.stepNameTh}
              </p>
            )}
          </div>
        );
      },
      className: "w-32",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("edocument.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t("edocument.subtitle")}
          </p>
        </div>
        {canCreate && (
          <Button onClick={handleOpenCreate} size="sm" className="gap-2 text-xs font-semibold">
            <Plus className="h-4 w-4" />
            <span>{t("edocument.action.create")}</span>
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <LiyonCard className="p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>{t("edocument.stats.total")}</span>
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{myDocs.length}</p>
        </LiyonCard>

        <LiyonCard className="p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>{t("edocument.stats.pending")}</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{countPending}</p>
        </LiyonCard>

        <LiyonCard className="p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>{t("edocument.stats.approved")}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{countApproved}</p>
        </LiyonCard>

        <LiyonCard className="p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>{t("edocument.stats.changes")}</span>
            <RotateCcw className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{countChanges}</p>
        </LiyonCard>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <Button
          variant={activeTab === "my" ? "default" : "outline"}
          size="sm"
          className="text-xs rounded-full"
          onClick={() => setActiveTab("my")}
        >
          {t("edocument.tab.myRequests")} ({myDocs.length})
        </Button>

        {canApprove && (
          <Button
            variant={activeTab === "pending" ? "default" : "outline"}
            size="sm"
            className="text-xs rounded-full gap-2 relative"
            onClick={() => setActiveTab("pending")}
          >
            <span>{t("edocument.tab.pendingApproval")}</span>
            {pendingDocs.length > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-red-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                {pendingDocs.length}
              </span>
            )}
          </Button>
        )}

        {canManage && (
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            size="sm"
            className="text-xs rounded-full"
            onClick={() => setActiveTab("all")}
          >
            {t("edocument.tab.allDocuments")} ({allDocs.length})
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <LiyonCard className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
              placeholder={t("edocument.searchPlaceholder")}
              className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <LiyonSelect
            value={typeFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">{isEn ? "All Types" : "ทุกประเภทคำร้อง"}</option>
            <option value="PROJECT_PROPOSAL">{t("edocument.type.PROJECT_PROPOSAL")}</option>
            <option value="OFFICIAL_TRAVEL">{t("edocument.type.OFFICIAL_TRAVEL")}</option>
            <option value="PROCUREMENT_REQ">{t("edocument.type.PROCUREMENT_REQ")}</option>
            <option value="GENERAL_REQUEST">{t("edocument.type.GENERAL_REQUEST")}</option>
          </LiyonSelect>

          <LiyonSelect
            value={urgencyFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUrgencyFilter(e.target.value)}
          >
            <option value="ALL">{isEn ? "All Urgencies" : "ทุกระดับความเร่งด่วน"}</option>
            <option value="NORMAL">{t("edocument.urgency.NORMAL")}</option>
            <option value="URGENT">{t("edocument.urgency.URGENT")}</option>
            <option value="VERY_URGENT">{t("edocument.urgency.VERY_URGENT")}</option>
          </LiyonSelect>

          <LiyonSelect
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">{isEn ? "All Statuses" : "ทุกสถานะ"}</option>
            <option value="SUBMITTED">{t("edocument.status.SUBMITTED")}</option>
            <option value="UNDER_REVIEW">{t("edocument.status.UNDER_REVIEW")}</option>
            <option value="APPROVED">{t("edocument.status.APPROVED")}</option>
            <option value="REJECTED">{t("edocument.status.REJECTED")}</option>
            <option value="REVISED_REQUESTED">{t("edocument.status.REVISED_REQUESTED")}</option>
            <option value="DRAFT">{t("edocument.status.DRAFT")}</option>
          </LiyonSelect>
        </div>
      </LiyonCard>

      {/* Table */}
      <LiyonCard>
        <DataTable
          state={filteredItems.length > 0 ? "data" : "empty"}
          columns={columns}
          rows={filteredItems}
          getRowId={(row) => row.id}
          headHeading={t("edocument.title")}
          headMeta={<span>{filteredItems.length} {isEn ? "items" : "รายการ"}</span>}
          renderRowMenu={(row) => (
            <>
              <RowMenuItem onSelect={() => setDetailDoc(row)}>
                <Eye className="mr-2 h-4 w-4 text-primary" />
                <span>{t("edocument.action.viewDetail")}</span>
              </RowMenuItem>
              {row.submitterId === userId && (row.status === "DRAFT" || row.status === "REVISED_REQUESTED") && (
                <RowMenuItem danger onSelect={() => setDeleteConfirmDoc(row)}>
                  <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                  <span>{t("edocument.action.delete")}</span>
                </RowMenuItem>
              )}
            </>
          )}
          empty={{
            icon: <FileText aria-hidden="true" />,
            title: isEn ? "No documents found" : "ไม่พบเอกสารคำร้อง",
            description: isEn ? "No documents match the current filter" : "ไม่มีเอกสารคำร้องตรงตามเงื่อนไขที่ระบุ",
          }}
          error={{
            icon: <AlertCircle aria-hidden="true" />,
            title: isEn ? "Error loading" : "เกิดข้อผิดพลาดในการโหลดข้อมูล",
            description: isEn ? "Please try again later" : "โปรดลองใหม่อีกครั้ง",
          }}
          rowMenuLabel={(row) => row.documentNumber}
        />
      </LiyonCard>

      {/* Create Dialog */}
      <LiyonDialog open={createOpen} onOpenChange={setCreateOpen} wide>
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
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewDocType(e.target.value as DocTypeType)}
                >
                  <option value="PROJECT_PROPOSAL">{t("edocument.type.PROJECT_PROPOSAL")}</option>
                  <option value="OFFICIAL_TRAVEL">{t("edocument.type.OFFICIAL_TRAVEL")}</option>
                  <option value="PROCUREMENT_REQ">{t("edocument.type.PROCUREMENT_REQ")}</option>
                  <option value="GENERAL_REQUEST">{t("edocument.type.GENERAL_REQUEST")}</option>
                </LiyonSelect>
              </LiyonField>

              <LiyonField label={t("edocument.field.urgency")}>
                <LiyonSelect
                  value={newUrgency}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewUrgency(e.target.value as DocUrgencyType)}
                >
                  <option value="NORMAL">{t("edocument.urgency.NORMAL")}</option>
                  <option value="URGENT">{t("edocument.urgency.URGENT")}</option>
                  <option value="VERY_URGENT">{t("edocument.urgency.VERY_URGENT")}</option>
                </LiyonSelect>
              </LiyonField>
            </div>

            <LiyonField label={t("edocument.field.title")}>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
                placeholder="เช่น ขออนุมัติจัดโครงการสัมมนาเชิงปฏิบัติการ..."
              />
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("edocument.field.department")}>
                <LiyonSelect
                  value={newDepartmentId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewDepartmentId(e.target.value)}
                >
                  <option value="">{isEn ? "None / Central Office" : "ไม่ระบุ / สำนักงานคณะ"}</option>
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAmount(e.target.value)}
                  placeholder="50000"
                />
              </LiyonField>
            </div>

            <LiyonField label={t("edocument.field.content")}>
              <textarea
                rows={4}
                required
                value={newContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewContent(e.target.value)}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAttachmentName(e.target.value)}
                    placeholder="เช่น โครงการ_ฉบับสมบูรณ์.pdf"
                  />
                </LiyonField>

                <LiyonField label={t("edocument.field.attachmentUrl")}>
                  <input
                    type="url"
                    value={attachmentUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAttachmentUrl(e.target.value)}
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
              <label htmlFor="submit-now" className="text-xs text-foreground font-medium">
                {isEn ? "Submit immediately for review" : "ยื่นคำร้องทันทีเข้าสู่สายการพิจารณา (หากไม่เลือกจะบันทึกเป็นแบบร่าง)"}
              </label>
            </div>
          </LiyonDialogBody>
          <LiyonDialogFooter className="flex justify-end gap-2 border-t pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreateOpen(false)}
              disabled={isPending}
            >
              {isEn ? "Cancel" : "ยกเลิก"}
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? (isEn ? "Submitting..." : "กำลังบันทึก...") : isEn ? "Submit Document" : "ยื่นคำร้อง"}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* Detail & Multi-Step Approval Modal */}
      <LiyonDialog open={Boolean(detailDoc)} onOpenChange={(open) => !open && setDetailDoc(null)} wide>
        <LiyonDialogCloseButton label={isEn ? "Close" : "ปิด"} />
        {detailDoc && (
          <div>
            <LiyonDialogHeader
              title={
                <div className="flex items-center gap-3">
                  <span className="text-primary font-mono text-sm">{detailDoc.documentNumber}</span>
                  <span className="text-base font-bold text-foreground truncate">{detailDoc.title}</span>
                </div>
              }
              description={
                <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                  <span>{detailDoc.submitterName}</span>
                  <span>•</span>
                  <span>{isEn ? detailDoc.departmentNameEn ?? "Faculty Unit" : detailDoc.departmentNameTh ?? "สำนักงานคณะ"}</span>
                  <span>•</span>
                  <span>{new Date(detailDoc.createdAt).toLocaleDateString(isEn ? "en-US" : "th-TH")}</span>
                </div>
              }
            />

            <LiyonDialogBody className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
              {/* Document Overview & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl bg-muted/40 p-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">{t("edocument.field.type")}</span>
                  <span className="font-bold text-foreground">
                    {t(`edocument.type.${detailDoc.documentType}` as const)}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block">{t("edocument.field.amount")}</span>
                  <span className="font-bold text-foreground">
                    {detailDoc.amount != null ? `฿${detailDoc.amount.toLocaleString()}` : "-"}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block">{t("edocument.field.status")}</span>
                  <span className="font-bold text-foreground">
                    {t(`edocument.status.${detailDoc.status}` as const)}
                  </span>
                </div>
              </div>

              {/* Purpose & Content */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground block">{t("edocument.field.content")}</span>
                <div className="rounded-xl border border-border/80 bg-card p-4 text-xs leading-relaxed text-foreground whitespace-pre-line">
                  {detailDoc.content}
                </div>
              </div>

              {/* Attachments */}
              {detailDoc.attachments.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-foreground block">{t("edocument.field.attachments")}</span>
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
                          <span className="font-medium text-foreground">{att.fileName}</span>
                        </div>
                        <span className="text-primary text-[11px] font-semibold">{isEn ? "Download" : "ดาวน์โหลด"}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Multi-step Approval Stepper Timeline */}
              <div className="space-y-3 border-t border-border/60 pt-4">
                <span className="text-xs font-bold text-foreground block">
                  {t("edocument.detail.workflowProgress")}
                </span>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {detailDoc.approvals.map((step) => {
                    const isApproved = step.status === "APPROVED";
                    const isRejected = step.status === "REJECTED";
                    const isChanges = step.status === "REVISED_REQUESTED";
                    const isCurrent = step.stepOrder === detailDoc.currentStep && (detailDoc.status === "SUBMITTED" || detailDoc.status === "UNDER_REVIEW");

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
                            {isCurrent && !isApproved
                              ? isEn ? "Current Review" : "กำลังรอพิจารณา"
                              : t(`edocument.step.${step.status}` as const)}
                          </span>
                        </div>

                        {step.decidedAt && (
                          <p className="text-[10px] text-muted-foreground">
                            {t("edocument.detail.decisionDate")}: {new Date(step.decidedAt).toLocaleString(isEn ? "en-US" : "th-TH")}
                          </p>
                        )}

                        {step.comment && (
                          <div className="mt-1 rounded-lg bg-muted/60 p-2 text-xs text-foreground italic border-l-2 border-primary/60">
                            &ldquo;{step.comment}&rdquo;
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Review Box for Approvers */}
              {canReviewCurrentDoc && (
                <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-4 space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-foreground block">
                      {isEn ? "Review & Decision" : "ส่วนการพิจารณาและลงนามคำร้อง"}
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      {isEn ? "Provide your review notes and select an action" : "กรอกความเห็นประกอบการพิจารณาและเลือกผลการตัดสิน"}
                    </p>
                  </div>

                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder={isEn ? "Add review notes or revision request details..." : "ใส่ความเห็นประกอบการอนุมัติ หรือระบุจุดที่ต้องแก้ไข..."}
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
                      <div key={c.id} className="rounded-xl border border-border bg-muted/20 p-3 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-foreground">{c.userName}</span>
                          <span className="text-muted-foreground">{new Date(c.createdAt).toLocaleTimeString(isEn ? "en-US" : "th-TH")}</span>
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
                    placeholder={isEn ? "Add a message or note..." : "พิมพ์ข้อความบันทึกเพิ่มเติม..."}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary"
                  />
                  <Button type="submit" size="sm" className="gap-1.5 text-xs" disabled={isPending || !newComment.trim()}>
                    <Send className="h-3.5 w-3.5" />
                    <span>{t("edocument.detail.postComment")}</span>
                  </Button>
                </form>
              </div>
            </LiyonDialogBody>
          </div>
        )}
      </LiyonDialog>

      {/* Delete Confirmation */}
      <LiyonDialog open={Boolean(deleteConfirmDoc)} onOpenChange={(open) => !open && setDeleteConfirmDoc(null)}>
        <LiyonDialogCloseButton label={isEn ? "Close" : "ปิด"} />
        <LiyonDialogHeader
          title={
            <div className="flex items-center gap-2 text-destructive font-bold">
              <AlertCircle className="h-5 w-5" />
              <span>{t("edocument.action.confirmDeleteTitle")}</span>
            </div>
          }
        />
        <LiyonDialogBody className="py-4 text-xs text-muted-foreground space-y-2">
          <p>{t("edocument.action.confirmDeleteMessage")}</p>
          {deleteConfirmDoc && (
            <p className="font-semibold text-foreground">
              {deleteConfirmDoc.documentNumber} - {deleteConfirmDoc.title}
            </p>
          )}
        </LiyonDialogBody>
        <LiyonDialogFooter className="flex justify-end gap-2 border-t pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDeleteConfirmDoc(null)}
            disabled={isPending}
          >
            {isEn ? "Cancel" : "ยกเลิก"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (isEn ? "Deleting..." : "กำลังลบ...") : t("edocument.action.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
