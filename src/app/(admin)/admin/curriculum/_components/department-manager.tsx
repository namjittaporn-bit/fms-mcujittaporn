"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  Search,
  AlertCircle,
  GraduationCap,
  ToggleLeft,
  ToggleRight,
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
  RowMenuItem,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { DepartmentDto } from "@/features/curriculum";
import {
  deleteDepartmentAction,
  toggleDepartmentStatusAction,
  listAdminDepartmentsAction,
} from "@/features/curriculum";
import { DepartmentDialog } from "./department-dialog";

interface DepartmentManagerProps {
  departments: DepartmentDto[];
  onDepartmentsChange: (depts: DepartmentDto[]) => void;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export function DepartmentManager({
  departments,
  onDepartmentsChange,
  canCreate,
  canUpdate,
  canDelete,
}: DepartmentManagerProps) {
  const t = useT();
  const locale = useLocale();
  const isEn = locale === "en";

  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DepartmentDto | null>(null);
  const [deleteItem, setDeleteItem] = useState<DepartmentDto | null>(null);

  // Statistics
  const totalCount = departments.length;
  const activeCount = departments.filter((d) => d.isActive).length;
  const totalPrograms = departments.reduce(
    (acc, cur) => acc + (cur.programCount ?? 0),
    0
  );

  // Filtered list
  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      const q = searchInput.trim().toLowerCase();
      if (!q) return true;
      return (
        d.code.toLowerCase().includes(q) ||
        d.nameTh.toLowerCase().includes(q) ||
        d.nameEn.toLowerCase().includes(q)
      );
    });
  }, [departments, searchInput]);

  const refreshList = async () => {
    const res = await listAdminDepartmentsAction();
    if (res.ok) {
      onDepartmentsChange(res.data);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: DepartmentDto) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleToggleActive = (item: DepartmentDto) => {
    startTransition(async () => {
      const newStatus = !item.isActive;
      const res = await toggleDepartmentStatusAction({
        id: item.id,
        isActive: newStatus,
      });
      if (res.ok) {
        toast.success(t("department.notify.updated"));
        await refreshList();
      } else {
        toast.error(res.error.message || t("curriculum.notify.error"));
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteItem) return;
    if ((deleteItem.programCount ?? 0) > 0) {
      toast.error(t("department.notify.hasPrograms"));
      return;
    }

    startTransition(async () => {
      const res = await deleteDepartmentAction(deleteItem.id);
      if (res.ok) {
        toast.success(t("department.notify.deleted"));
        setDeleteItem(null);
        await refreshList();
      } else {
        toast.error(
          res.error.message.includes("department_has_programs")
            ? t("department.notify.hasPrograms")
            : res.error.message || t("curriculum.notify.error")
        );
      }
    });
  };

  const columns: DataTableColumn<DepartmentDto>[] = [
    {
      key: "code",
      header: t("department.field.code"),
      render: (item) => (
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/50">
          {item.code}
        </span>
      ),
    },
    {
      key: "name",
      header: isEn ? "Department Name" : "ชื่อภาควิชา / ส่วนงาน",
      render: (item) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-sm text-foreground">
            {isEn ? item.nameEn : item.nameTh}
          </p>
          <p className="text-xs text-muted-foreground">
            {isEn ? item.nameTh : item.nameEn}
          </p>
        </div>
      ),
    },
    {
      key: "programs",
      header: t("department.field.programCount"),
      render: (item) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          <GraduationCap className="h-3 w-3" />
          <span>
            {item.programCount ?? 0} {isEn ? "programs" : "หลักสูตร"}
          </span>
        </span>
      ),
    },
    {
      key: "order",
      header: t("department.field.orderIndex"),
      render: (item) => (
        <span className="font-mono text-xs text-muted-foreground">
          #{item.orderIndex ?? 0}
        </span>
      ),
    },
    {
      key: "status",
      header: t("department.field.status"),
      render: (item) => (
        <StatusPill tone={item.isActive ? "ok" : "off"}>
          {item.isActive
            ? isEn
              ? "Active"
              : "เปิดใช้งาน"
            : isEn
            ? "Inactive"
            : "ปิดใช้งาน"}
        </StatusPill>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <LiyonCard className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {t("department.stats.total")}
            </p>
            <p className="text-xl font-bold text-foreground">{totalCount}</p>
          </div>
        </LiyonCard>

        <LiyonCard className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {t("department.stats.active")}
            </p>
            <p className="text-xl font-bold text-foreground">{activeCount}</p>
          </div>
        </LiyonCard>

        <LiyonCard className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {t("department.stats.programs")}
            </p>
            <p className="text-xl font-bold text-foreground">{totalPrograms}</p>
          </div>
        </LiyonCard>
      </div>

      {/* Control Bar: Search & Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("department.searchPlaceholder")}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {canCreate && (
          <Button
            type="button"
            onClick={handleOpenCreate}
            className="gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>{t("department.action.create")}</span>
          </Button>
        )}
      </div>

      {/* DataTable List */}
      <LiyonCard className="p-0 overflow-hidden">
        <DataTable<DepartmentDto>
          state={filteredDepartments.length > 0 ? "data" : "empty"}
          columns={columns}
          rows={filteredDepartments}
          getRowId={(item) => item.id}
          headHeading={t("department.title")}
          headMeta={
            <span>
              {filteredDepartments.length} {isEn ? "items" : "รายการ"}
            </span>
          }
          renderRowMenu={
            canUpdate || canDelete
              ? (item) => (
                  <>
                    {canUpdate && (
                      <>
                        <RowMenuItem onSelect={() => handleOpenEdit(item)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>{t("department.action.edit")}</span>
                        </RowMenuItem>
                        <RowMenuItem onSelect={() => handleToggleActive(item)}>
                          {item.isActive ? (
                            <ToggleLeft className="mr-2 h-4 w-4" />
                          ) : (
                            <ToggleRight className="mr-2 h-4 w-4" />
                          )}
                          <span>
                            {item.isActive
                              ? isEn
                                ? "Disable"
                                : "ปิดใช้งาน"
                              : isEn
                              ? "Enable"
                              : "เปิดใช้งาน"}
                          </span>
                        </RowMenuItem>
                      </>
                    )}
                    {canDelete && (
                      <RowMenuItem
                        danger
                        onSelect={() => setDeleteItem(item)}
                      >
                        <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                        <span>{t("department.action.delete")}</span>
                      </RowMenuItem>
                    )}
                  </>
                )
              : undefined
          }
          empty={{
            icon: <Building2 aria-hidden="true" />,
            title: isEn
              ? "No departments found."
              : "ไม่พบข้อมูลภาควิชาหรือส่วนงาน",
            description: isEn
              ? "No department records match your search."
              : "ไม่มีข้อมูลภาควิชาที่ตรงกับคำค้นหา",
          }}
          error={{
            icon: <AlertCircle aria-hidden="true" />,
            title: isEn ? "Error" : "เกิดข้อผิดพลาด",
            description: isEn
              ? "Please try again later"
              : "โปรดลองใหม่อีกครั้ง",
          }}
          rowMenuLabel={(item) => (isEn ? item.nameEn : item.nameTh)}
        />
      </LiyonCard>

      {/* Department Create / Edit Dialog */}
      <DepartmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        onSuccess={refreshList}
      />

      {/* Delete Confirmation Dialog */}
      <LiyonDialog
        open={Boolean(deleteItem)}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        danger
      >
        <LiyonDialogCloseButton label={isEn ? "Close" : "ปิด"} />
        <LiyonDialogHeader
          title={t("department.deleteConfirmTitle")}
          description={t("department.deleteConfirmDesc")}
        />

        <LiyonDialogBody className="space-y-3">
          {deleteItem && (
            <div className="p-3 rounded-xl bg-muted/60 text-xs space-y-1">
              <p>
                <strong>{isEn ? "Department:" : "ภาควิชา:"}</strong>{" "}
                {deleteItem.nameTh} ({deleteItem.code})
              </p>
              <p>
                <strong>{isEn ? "Linked Programs:" : "หลักสูตรที่สังกัด:"}</strong>{" "}
                {deleteItem.programCount ?? 0} {isEn ? "programs" : "หลักสูตร"}
              </p>
            </div>
          )}
          {deleteItem && (deleteItem.programCount ?? 0) > 0 && (
            <p className="text-xs text-destructive font-semibold">
              ⚠️ {t("department.notify.hasPrograms")}
            </p>
          )}
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setDeleteItem(null)}
            disabled={isPending}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeleteConfirm}
            disabled={
              isPending ||
              (deleteItem ? (deleteItem.programCount ?? 0) > 0 : false)
            }
          >
            {t("department.action.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
