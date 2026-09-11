"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Plus,
  Trash2,
  FileText,
  Search,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
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
  LiyonSelect,
  RowMenuItem,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { EDocumentDto, DepartmentDto } from "@/features/edocument";
import {
  deleteDocumentAction,
  getMyDocumentsAction,
  getPendingApprovalsAction,
  getAllDocumentsAction,
} from "@/features/edocument";
import { EdocumentStatsBar } from "./edocument-stats-bar";
import { EdocumentNewDialog } from "./edocument-new-dialog";
import { EdocumentDetailDialog } from "./edocument-detail-dialog";

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
  const [pendingDocs, setPendingDocs] =
    useState<EDocumentDto[]>(initialPendingDocs);
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
  const [deleteConfirmDoc, setDeleteConfirmDoc] =
    useState<EDocumentDto | null>(null);

  const refreshData = async () => {
    const [resMy, resPending, resAll] = await Promise.all([
      getMyDocumentsAction(),
      canApprove
        ? getPendingApprovalsAction()
        : Promise.resolve({ ok: true as const, data: [] }),
      canManage
        ? getAllDocumentsAction()
        : Promise.resolve({ ok: true as const, data: [] }),
    ]);

    if (resMy.ok) setMyDocs(resMy.data);
    if (resPending.ok) setPendingDocs(resPending.data);
    if (resAll.ok) setAllDocs(resAll.data);
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
      if (typeFilter !== "ALL" && item.documentType !== typeFilter)
        return false;
      if (urgencyFilter !== "ALL" && item.urgency !== urgencyFilter)
        return false;
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
  const countPending = useMemo(
    () =>
      myDocs.filter(
        (d) => d.status === "SUBMITTED" || d.status === "UNDER_REVIEW"
      ).length,
    [myDocs]
  );
  const countApproved = useMemo(
    () => myDocs.filter((d) => d.status === "APPROVED").length,
    [myDocs]
  );
  const countChanges = useMemo(
    () => myDocs.filter((d) => d.status === "REVISED_REQUESTED").length,
    [myDocs]
  );

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
                  {isVeryUrgent
                    ? t("edocument.urgency.VERY_URGENT")
                    : t("edocument.urgency.URGENT")}
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
            <span
              className="font-bold text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
              onClick={() => setDetailDoc(row)}
            >
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
            {isEn
              ? row.departmentNameEn ?? "Faculty Unit"
              : row.departmentNameTh ?? "สำนักงานคณะ"}
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
        else if (
          row.status === "REVISED_REQUESTED" ||
          row.status === "UNDER_REVIEW"
        )
          tone = "warn";
        else if (row.status === "DRAFT") tone = "off";

        return <StatusPill tone={tone}>{t(statusKey)}</StatusPill>;
      },
      className: "w-32",
    },
    {
      key: "progress",
      header: t("edocument.field.currentStep"),
      render: (row) => {
        const currentApproval = row.approvals.find(
          (a) => a.stepOrder === row.currentStep
        );
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
            {currentApproval &&
              row.status !== "APPROVED" &&
              row.status !== "REJECTED" && (
                <p className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                  {isEn
                    ? currentApproval.stepNameEn
                    : currentApproval.stepNameTh}
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
          <Button
            onClick={() => setCreateOpen(true)}
            size="sm"
            className="gap-2 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>{t("edocument.action.create")}</span>
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <EdocumentStatsBar
        totalCount={myDocs.length}
        pendingCount={countPending}
        approvedCount={countApproved}
        changesCount={countChanges}
      />

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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchInput(e.target.value)
              }
              placeholder={t("edocument.searchPlaceholder")}
              className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <LiyonSelect
            value={typeFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setTypeFilter(e.target.value)
            }
          >
            <option value="ALL">
              {isEn ? "All Types" : "ทุกประเภทคำร้อง"}
            </option>
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

          <LiyonSelect
            value={urgencyFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setUrgencyFilter(e.target.value)
            }
          >
            <option value="ALL">
              {isEn ? "All Urgencies" : "ทุกระดับความเร่งด่วน"}
            </option>
            <option value="NORMAL">{t("edocument.urgency.NORMAL")}</option>
            <option value="URGENT">{t("edocument.urgency.URGENT")}</option>
            <option value="VERY_URGENT">
              {t("edocument.urgency.VERY_URGENT")}
            </option>
          </LiyonSelect>

          <LiyonSelect
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="ALL">{isEn ? "All Statuses" : "ทุกสถานะ"}</option>
            <option value="SUBMITTED">{t("edocument.status.SUBMITTED")}</option>
            <option value="UNDER_REVIEW">
              {t("edocument.status.UNDER_REVIEW")}
            </option>
            <option value="APPROVED">{t("edocument.status.APPROVED")}</option>
            <option value="REJECTED">{t("edocument.status.REJECTED")}</option>
            <option value="REVISED_REQUESTED">
              {t("edocument.status.REVISED_REQUESTED")}
            </option>
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
          headMeta={
            <span>
              {filteredItems.length} {isEn ? "items" : "รายการ"}
            </span>
          }
          renderRowMenu={(row) => (
            <>
              <RowMenuItem onSelect={() => setDetailDoc(row)}>
                <Eye className="mr-2 h-4 w-4 text-primary" />
                <span>{t("edocument.action.viewDetail")}</span>
              </RowMenuItem>
              {row.submitterId === userId &&
                (row.status === "DRAFT" ||
                  row.status === "REVISED_REQUESTED") && (
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
            description: isEn
              ? "No documents match the current filter"
              : "ไม่มีเอกสารคำร้องตรงตามเงื่อนไขที่ระบุ",
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
      <EdocumentNewDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        departments={departments}
        onSuccess={refreshData}
        isEn={isEn}
      />

      {/* Detail & Multi-Step Approval Modal */}
      <EdocumentDetailDialog
        open={Boolean(detailDoc)}
        onOpenChange={(open) => !open && setDetailDoc(null)}
        document={detailDoc}
        canApprove={canApprove}
        onSuccess={(updated) => {
          if (updated) setDetailDoc(updated);
          refreshData();
        }}
        isEn={isEn}
      />

      {/* Delete Confirmation */}
      <LiyonDialog
        open={Boolean(deleteConfirmDoc)}
        onOpenChange={(open) => !open && setDeleteConfirmDoc(null)}
      >
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
            {isPending
              ? isEn
                ? "Deleting..."
                : "กำลังลบ..."
              : t("edocument.action.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
