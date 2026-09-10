"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Search,
  AlertCircle,
  Mail,
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
  LiyonSwitchRow,
  RowMenuItem,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type {
  StaffProfileDto,
  DepartmentDto,
  AcademicRankType,
  AdminPositionType,
  PersonnelTypeType,
} from "@/features/personnel";
import {
  createStaffAction,
  updateStaffAction,
  deleteStaffAction,
  getAdminStaffAction,
} from "@/features/personnel/actions";

interface Props {
  initialItems: StaffProfileDto[];
  departments: DepartmentDto[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export function PersonnelClient({
  initialItems,
  departments,
  canCreate,
  canUpdate,
  canDelete,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const isEn = locale === "en";

  const [items, setItems] = useState<StaffProfileDto[]>(initialItems);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Dialogs
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<StaffProfileDto | null>(null);
  const [editingItem, setEditingItem] = useState<StaffProfileDto | null>(null);

  // Form states
  const [prefixTh, setPrefixTh] = useState("");
  const [prefixEn, setPrefixEn] = useState("");
  const [firstNameTh, setFirstNameTh] = useState("");
  const [lastNameTh, setLastNameTh] = useState("");
  const [firstNameEn, setFirstNameEn] = useState("");
  const [lastNameEn, setLastNameEn] = useState("");
  const [academicRank, setAcademicRank] = useState<AcademicRankType>("NONE");
  const [adminPosition, setAdminPosition] = useState<AdminPositionType>("NONE");
  const [personnelType, setPersonnelType] = useState<PersonnelTypeType>("ACADEMIC");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [expertiseStr, setExpertiseStr] = useState("");
  const [researchInterests, setResearchInterests] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const refreshItems = async () => {
    const res = await getAdminStaffAction();
    if (res.ok) setItems(res.data);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setPrefixTh("");
    setPrefixEn("");
    setFirstNameTh("");
    setLastNameTh("");
    setFirstNameEn("");
    setLastNameEn("");
    setAcademicRank("NONE");
    setAdminPosition("NONE");
    setPersonnelType("ACADEMIC");
    setDepartmentId(departments[0]?.id ?? "");
    setEmail("");
    setPhone("");
    setRoomNumber("");
    setAvatarUrl("");
    setExpertiseStr("");
    setResearchInterests("");
    setOrderIndex(items.length + 1);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditDialog = (item: StaffProfileDto) => {
    setEditingItem(item);
    setPrefixTh(item.prefixTh);
    setPrefixEn(item.prefixEn);
    setFirstNameTh(item.firstNameTh);
    setLastNameTh(item.lastNameTh);
    setFirstNameEn(item.firstNameEn);
    setLastNameEn(item.lastNameEn);
    setAcademicRank(item.academicRank as AcademicRankType);
    setAdminPosition(item.adminPosition as AdminPositionType);
    setPersonnelType(item.personnelType as PersonnelTypeType);
    setDepartmentId(item.departmentId ?? "");
    setEmail(item.email);
    setPhone(item.phone ?? "");
    setRoomNumber(item.roomNumber ?? "");
    setAvatarUrl(item.avatarUrl ?? "");
    setExpertiseStr(item.expertise ? item.expertise.join(", ") : "");
    setResearchInterests(item.researchInterests ?? "");
    setOrderIndex(item.orderIndex);
    setIsActive(item.isActive);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!firstNameTh.trim() || !lastNameTh.trim() || !email.trim()) {
      toast.error(t("error.validation"));
      return;
    }

    const expertiseList = expertiseStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      if (editingItem) {
        const res = await updateStaffAction({
          id: editingItem.id,
          prefixTh: prefixTh.trim() || " ",
          prefixEn: prefixEn.trim() || " ",
          firstNameTh: firstNameTh.trim(),
          lastNameTh: lastNameTh.trim(),
          firstNameEn: firstNameEn.trim() || firstNameTh.trim(),
          lastNameEn: lastNameEn.trim() || lastNameTh.trim(),
          academicRank,
          adminPosition,
          personnelType,
          departmentId: departmentId || null,
          email: email.trim(),
          phone: phone.trim() || null,
          roomNumber: roomNumber.trim() || null,
          avatarUrl: avatarUrl.trim() || null,
          expertise: expertiseList,
          researchInterests: researchInterests.trim() || null,
          orderIndex,
          isActive,
        });
        if (res.ok) {
          toast.success(t("personnel.updateSuccess"));
          setModalOpen(false);
          await refreshItems();
        } else {
          toast.error(t("common.error"));
        }
      } else {
        const res = await createStaffAction({
          prefixTh: prefixTh.trim() || " ",
          prefixEn: prefixEn.trim() || " ",
          firstNameTh: firstNameTh.trim(),
          lastNameTh: lastNameTh.trim(),
          firstNameEn: firstNameEn.trim() || firstNameTh.trim(),
          lastNameEn: lastNameEn.trim() || lastNameTh.trim(),
          academicRank,
          adminPosition,
          personnelType,
          departmentId: departmentId || null,
          email: email.trim(),
          phone: phone.trim() || null,
          roomNumber: roomNumber.trim() || null,
          avatarUrl: avatarUrl.trim() || null,
          expertise: expertiseList,
          researchInterests: researchInterests.trim() || null,
          orderIndex,
          isActive,
        });
        if (res.ok) {
          toast.success(t("personnel.createSuccess"));
          setModalOpen(false);
          await refreshItems();
        } else {
          toast.error(t("common.error"));
        }
      }
    });
  };

  const handleDelete = (item: StaffProfileDto) => {
    startTransition(async () => {
      const res = await deleteStaffAction(item.id);
      if (res.ok) {
        toast.success(t("personnel.deleteSuccess"));
        setDeleteConfirmItem(null);
        await refreshItems();
      } else {
        toast.error(t("common.error"));
      }
    });
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchInput.toLowerCase();
      const matchSearch =
        !q ||
        item.fullNameTh.toLowerCase().includes(q) ||
        item.fullNameEn.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        (item.expertise && item.expertise.some((e) => e.toLowerCase().includes(q)));
      const matchDept =
        deptFilter === "ALL" || item.departmentId === deptFilter;
      const matchType =
        typeFilter === "ALL" || item.personnelType === typeFilter;
      return matchSearch && matchDept && matchType;
    });
  }, [items, searchInput, deptFilter, typeFilter]);

  const columns: DataTableColumn<StaffProfileDto>[] = [
    {
      key: "name",
      header: t("personnel.nameThField"),
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.avatarUrl}
              alt=""
              className="h-10 w-10 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
              {row.firstNameTh.charAt(0)}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              {isEn ? row.fullNameEn : row.fullNameTh}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {row.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "academicRank",
      header: t("personnel.academicRankField"),
      render: (row) => {
        const rankKey = `personnel.rank.${row.academicRank}` as const;
        return (
          <span className="text-xs font-medium text-foreground">
            {t(rankKey)}
          </span>
        );
      },
    },
    {
      key: "adminPosition",
      header: t("personnel.adminPositionField"),
      render: (row) => {
        if (row.adminPosition === "NONE") return <span className="text-muted-foreground text-xs">—</span>;
        const posKey = `personnel.pos.${row.adminPosition}` as const;
        return (
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {t(posKey)}
          </span>
        );
      },
    },
    {
      key: "department",
      header: t("personnel.departmentField"),
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {isEn ? row.departmentNameEn ?? "—" : row.departmentNameTh ?? "—"}
        </span>
      ),
    },
    {
      key: "personnelType",
      header: t("personnel.personnelTypeField"),
      render: (row) => {
        const typeKey = `personnel.type.${row.personnelType}` as const;
        return (
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {t(typeKey)}
          </span>
        );
      },
    },
    {
      key: "status",
      header: t("common.colStatus"),
      render: (row) => (
        <StatusPill tone={row.isActive ? "ok" : "off"}>
          {t(row.isActive ? "status.active" : "status.inactive")}
        </StatusPill>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("personnel.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("personnel.subtitle")}
          </p>
        </div>
        {canCreate && (
          <Button onClick={openCreateDialog} className="shrink-0 gap-2">
            <Plus className="h-4 w-4" />
            {t("personnel.create")}
          </Button>
        )}
      </div>

      {/* Main DataTable Card */}
      <LiyonCard>
        <DataTable
          state={filteredItems.length > 0 ? "data" : "empty"}
          columns={columns}
          rows={filteredItems}
          getRowId={(row) => row.id}
          headHeading={t("personnel.title")}
          headMeta={<span>{filteredItems.length} {t("common.items")}</span>}
          toolbar={
            <>
              <span className="tsearch">
                <Search aria-hidden="true" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                  placeholder={t("personnel.searchPlaceholder")}
                  aria-label={t("common.search")}
                />
              </span>
              <LiyonSelect
                aria-label={t("personnel.departmentField")}
                value={deptFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDeptFilter(e.target.value)}
              >
                <option value="ALL">{t("personnel.allDepartments")}</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {isEn ? d.nameEn : d.nameTh}
                  </option>
                ))}
              </LiyonSelect>
              <LiyonSelect
                aria-label={t("personnel.personnelTypeField")}
                value={typeFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)}
              >
                <option value="ALL">{t("personnel.allTypes")}</option>
                <option value="ACADEMIC">{t("personnel.type.ACADEMIC")}</option>
                <option value="SUPPORT">{t("personnel.type.SUPPORT")}</option>
              </LiyonSelect>
            </>
          }
          empty={{
            icon: <Users aria-hidden="true" />,
            title: t("personnel.empty"),
          }}
          error={{
            icon: <AlertCircle aria-hidden="true" />,
            title: t("common.error"),
          }}
          renderRowMenu={(row) => (
            <>
              {canUpdate && (
                <RowMenuItem
                  onSelect={() => openEditDialog(row)}
                  icon={<Pencil aria-hidden="true" />}
                >
                  {t("personnel.edit")}
                </RowMenuItem>
              )}
              {canDelete && (
                <RowMenuItem
                  danger
                  onSelect={() => setDeleteConfirmItem(row)}
                  icon={<Trash2 aria-hidden="true" />}
                >
                  {t("personnel.delete")}
                </RowMenuItem>
              )}
            </>
          )}
          rowMenuLabel={(row) => row.fullNameTh}
        />
      </LiyonCard>

      {/* Create / Edit Dialog */}
      <LiyonDialog open={modalOpen} onOpenChange={setModalOpen} wide>
        <LiyonDialogCloseButton label={t("common.close")} />
        <LiyonDialogHeader
          title={editingItem ? t("personnel.edit") : t("personnel.create")}
          description={t("personnel.subtitle")}
        />
        <LiyonDialogBody className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Thai Name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <LiyonField label={t("personnel.prefixThField")} htmlFor="prefix-th">
              <input
                id="prefix-th"
                value={prefixTh}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrefixTh(e.target.value)}
                placeholder="เช่น ดร., อาจารย์"
              />
            </LiyonField>
            <LiyonField label={t("personnel.firstNameThField")} htmlFor="firstname-th">
              <input
                id="firstname-th"
                value={firstNameTh}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstNameTh(e.target.value)}
                placeholder="ชื่อจริง (ไทย)"
                required
              />
            </LiyonField>
            <LiyonField label={t("personnel.lastNameThField")} htmlFor="lastname-th">
              <input
                id="lastname-th"
                value={lastNameTh}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastNameTh(e.target.value)}
                placeholder="นามสกุล (ไทย)"
                required
              />
            </LiyonField>
          </div>

          {/* English Name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <LiyonField label={t("personnel.prefixEnField")} htmlFor="prefix-en">
              <input
                id="prefix-en"
                value={prefixEn}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrefixEn(e.target.value)}
                placeholder="e.g. Dr., Mr., Ms."
              />
            </LiyonField>
            <LiyonField label={t("personnel.firstNameEnField")} htmlFor="firstname-en">
              <input
                id="firstname-en"
                value={firstNameEn}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstNameEn(e.target.value)}
                placeholder="First name (English)"
              />
            </LiyonField>
            <LiyonField label={t("personnel.lastNameEnField")} htmlFor="lastname-en">
              <input
                id="lastname-en"
                value={lastNameEn}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastNameEn(e.target.value)}
                placeholder="Last name (English)"
              />
            </LiyonField>
          </div>

          {/* Ranks & Position */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <LiyonField label={t("personnel.academicRankField")} htmlFor="academic-rank">
              <LiyonSelect
                id="academic-rank"
                value={academicRank}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAcademicRank(e.target.value as AcademicRankType)}
              >
                <option value="NONE">{t("personnel.rank.NONE")}</option>
                <option value="PROFESSOR">{t("personnel.rank.PROFESSOR")}</option>
                <option value="ASSOC_PROF">{t("personnel.rank.ASSOC_PROF")}</option>
                <option value="ASST_PROF">{t("personnel.rank.ASST_PROF")}</option>
                <option value="LECTURER">{t("personnel.rank.LECTURER")}</option>
              </LiyonSelect>
            </LiyonField>

            <LiyonField label={t("personnel.adminPositionField")} htmlFor="admin-position">
              <LiyonSelect
                id="admin-position"
                value={adminPosition}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAdminPosition(e.target.value as AdminPositionType)}
              >
                <option value="NONE">{t("personnel.pos.NONE")}</option>
                <option value="DEAN">{t("personnel.pos.DEAN")}</option>
                <option value="VICE_DEAN">{t("personnel.pos.VICE_DEAN")}</option>
                <option value="ASST_DEAN">{t("personnel.pos.ASST_DEAN")}</option>
                <option value="HEAD_OF_DEPT">{t("personnel.pos.HEAD_OF_DEPT")}</option>
                <option value="SECRETARY">{t("personnel.pos.SECRETARY")}</option>
              </LiyonSelect>
            </LiyonField>

            <LiyonField label={t("personnel.personnelTypeField")} htmlFor="personnel-type">
              <LiyonSelect
                id="personnel-type"
                value={personnelType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPersonnelType(e.target.value as PersonnelTypeType)}
              >
                <option value="ACADEMIC">{t("personnel.type.ACADEMIC")}</option>
                <option value="SUPPORT">{t("personnel.type.SUPPORT")}</option>
              </LiyonSelect>
            </LiyonField>
          </div>

          {/* Department & Contact */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LiyonField label={t("personnel.departmentField")} htmlFor="department-id">
              <LiyonSelect
                id="department-id"
                value={departmentId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDepartmentId(e.target.value)}
              >
                <option value="">{t("personnel.allDepartments")}</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {isEn ? d.nameEn : d.nameTh}
                  </option>
                ))}
              </LiyonSelect>
            </LiyonField>

            <LiyonField label={t("personnel.emailField")} htmlFor="staff-email">
              <input
                id="staff-email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="name@faculty.ac.th"
                required
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <LiyonField label={t("personnel.phoneField")} htmlFor="staff-phone">
              <input
                id="staff-phone"
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                placeholder="02-123-4567"
              />
            </LiyonField>
            <LiyonField label={t("personnel.roomNumberField")} htmlFor="staff-room">
              <input
                id="staff-room"
                value={roomNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomNumber(e.target.value)}
                placeholder="เช่น ห้อง 401 อาคาร 1"
              />
            </LiyonField>
            <LiyonField label={t("personnel.orderIndexField")} htmlFor="order-index">
              <input
                id="order-index"
                type="number"
                value={orderIndex}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderIndex(parseInt(e.target.value) || 0)}
              />
            </LiyonField>
          </div>

          <LiyonField label={t("personnel.avatarUrlField")} htmlFor="avatar-url">
            <input
              id="avatar-url"
              type="url"
              value={avatarUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
            />
          </LiyonField>

          <LiyonField label={t("personnel.expertiseField")} htmlFor="staff-expertise">
            <input
              id="staff-expertise"
              value={expertiseStr}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpertiseStr(e.target.value)}
              placeholder="เช่น AI, Data Science, Machine Learning, Cloud Computing"
            />
          </LiyonField>

          <LiyonField label={t("personnel.researchInterestsField")} htmlFor="staff-research">
            <textarea
              id="staff-research"
              className="w-full rounded-md border border-input bg-background p-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[90px]"
              value={researchInterests}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResearchInterests(e.target.value)}
              placeholder="รายละเอียดหัวข้อวิจัยที่กำลังดำเนินการ..."
            />
          </LiyonField>

          <LiyonSwitchRow
            id="staff-active-switch"
            label={t("personnel.isActiveField")}
            description="แสดงในทำเนียบบุคลากรบนหน้าบ้านสาธารณะ"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setModalOpen(false)}
            disabled={isPending}
          >
            {t("personnel.cancel")}
          </Button>
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {t("personnel.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Delete Confirmation Dialog */}
      <LiyonDialog
        open={Boolean(deleteConfirmItem)}
        onOpenChange={(open) => !open && setDeleteConfirmItem(null)}
        danger
      >
        <LiyonDialogCloseButton label={t("common.close")} />
        <LiyonDialogHeader
          title={t("personnel.delete")}
          description={
            deleteConfirmItem
              ? `${t("personnel.deleteConfirm")} "${isEn ? deleteConfirmItem.fullNameEn : deleteConfirmItem.fullNameTh}"`
              : t("personnel.deleteConfirm")
          }
        />
        <LiyonDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteConfirmItem(null)}
            disabled={isPending}
          >
            {t("personnel.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => deleteConfirmItem && handleDelete(deleteConfirmItem)}
            disabled={isPending}
          >
            {t("personnel.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
