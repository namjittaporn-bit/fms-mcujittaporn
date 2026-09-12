"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
  Search,
  AlertCircle,
  BookOpen,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { DepartmentManager } from "./department-manager";
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
  CurriculumProgramDto,
  DepartmentDto,
  DegreeLevelType,
  ProgramPlanType,
  ProgramStatusType,
} from "@/features/curriculum";
import {
  createProgramAction,
  updateProgramAction,
  deleteProgramAction,
  getAdminProgramsAction,
} from "@/features/curriculum";

interface Props {
  initialItems: CurriculumProgramDto[];
  departments: DepartmentDto[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export function CurriculumClient({
  initialItems,
  departments,
  canCreate,
  canUpdate,
  canDelete,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const isEn = locale === "en";

  const [items, setItems] = useState<CurriculumProgramDto[]>(initialItems);
  const [deptList, setDeptList] = useState<DepartmentDto[]>(departments);
  const [activeTab, setActiveTab] = useState<"programs" | "departments">("programs");
  const [isPending, startTransition] = useTransition();

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [degreeFilter, setDegreeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");

  // Dialog states
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<CurriculumProgramDto | null>(null);
  const [editingItem, setEditingItem] = useState<CurriculumProgramDto | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [nameTh, setNameTh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [degreeTitleTh, setDegreeTitleTh] = useState("");
  const [degreeTitleEn, setDegreeTitleEn] = useState("");
  const [degreeAbbrTh, setDegreeAbbrTh] = useState("");
  const [degreeAbbrEn, setDegreeAbbrEn] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [degreeLevel, setDegreeLevel] = useState<DegreeLevelType>("BACHELOR");
  const [programPlan, setProgramPlan] = useState<ProgramPlanType>("REGULAR");
  const [durationYears, setDurationYears] = useState(4);
  const [totalCredits, setTotalCredits] = useState(128);
  const [tuitionFee, setTuitionFee] = useState<string>("");
  const [descriptionTh, setDescriptionTh] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [careerPathsStr, setCareerPathsStr] = useState("");
  const [tqfFileUrl, setTqfFileUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [status, setStatus] = useState<ProgramStatusType>("ACTIVE");
  const [orderIndex, setOrderIndex] = useState(0);

  const refreshItems = async () => {
    const res = await getAdminProgramsAction();
    if (res.ok) setItems(res.data);
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setCode("");
    setNameTh("");
    setNameEn("");
    setDegreeTitleTh("");
    setDegreeTitleEn("");
    setDegreeAbbrTh("");
    setDegreeAbbrEn("");
    setDepartmentId(departments[0]?.id ?? "");
    setDegreeLevel("BACHELOR");
    setProgramPlan("REGULAR");
    setDurationYears(4);
    setTotalCredits(128);
    setTuitionFee("");
    setDescriptionTh("");
    setDescriptionEn("");
    setCareerPathsStr("");
    setTqfFileUrl("");
    setCoverImageUrl("");
    setStatus("ACTIVE");
    setOrderIndex(0);
    setModalOpen(true);
  };

  const handleOpenEdit = (prog: CurriculumProgramDto) => {
    setEditingItem(prog);
    setCode(prog.code);
    setNameTh(prog.nameTh);
    setNameEn(prog.nameEn);
    setDegreeTitleTh(prog.degreeTitleTh);
    setDegreeTitleEn(prog.degreeTitleEn);
    setDegreeAbbrTh(prog.degreeAbbrTh);
    setDegreeAbbrEn(prog.degreeAbbrEn);
    setDepartmentId(prog.departmentId ?? "");
    setDegreeLevel(prog.degreeLevel as DegreeLevelType);
    setProgramPlan(prog.programPlan as ProgramPlanType);
    setDurationYears(prog.durationYears);
    setTotalCredits(prog.totalCredits);
    setTuitionFee(prog.tuitionFeeSemester != null ? String(prog.tuitionFeeSemester) : "");
    setDescriptionTh(prog.descriptionTh ?? "");
    setDescriptionEn(prog.descriptionEn ?? "");
    setCareerPathsStr(prog.careerPaths.join(", "));
    setTqfFileUrl(prog.tqfFileUrl ?? "");
    setCoverImageUrl(prog.coverImageUrl ?? "");
    setStatus(prog.status as ProgramStatusType);
    setOrderIndex(prog.orderIndex);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const careerPaths = careerPathsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      code,
      nameTh,
      nameEn,
      degreeTitleTh,
      degreeTitleEn,
      degreeAbbrTh,
      degreeAbbrEn,
      departmentId: departmentId || null,
      degreeLevel,
      programPlan,
      durationYears: Number(durationYears),
      totalCredits: Number(totalCredits),
      tuitionFeeSemester: tuitionFee ? Number(tuitionFee) : null,
      descriptionTh: descriptionTh || null,
      descriptionEn: descriptionEn || null,
      careerPaths,
      curriculumStructure: [],
      studyPlan: [],
      tqfFileUrl: tqfFileUrl || null,
      coverImageUrl: coverImageUrl || null,
      status,
      orderIndex: Number(orderIndex),
    };

    startTransition(async () => {
      if (editingItem) {
        const res = await updateProgramAction({ ...payload, id: editingItem.id });
        if (res.ok) {
          toast.success(t("curriculum.notify.updated"));
          setModalOpen(false);
          refreshItems();
        } else {
          toast.error(res.error.message || t("curriculum.notify.error"));
        }
      } else {
        const res = await createProgramAction(payload);
        if (res.ok) {
          toast.success(t("curriculum.notify.created"));
          setModalOpen(false);
          refreshItems();
        } else {
          toast.error(res.error.message || t("curriculum.notify.error"));
        }
      }
    });
  };

  const handleDelete = () => {
    if (!deleteConfirmItem) return;
    startTransition(async () => {
      const res = await deleteProgramAction(deleteConfirmItem.id);
      if (res.ok) {
        toast.success(t("curriculum.notify.deleted"));
        setDeleteConfirmItem(null);
        refreshItems();
      } else {
        toast.error(res.error.message || t("curriculum.notify.error"));
      }
    });
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (degreeFilter !== "ALL" && item.degreeLevel !== degreeFilter) return false;
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (deptFilter !== "ALL" && item.departmentId !== deptFilter) return false;
      if (searchInput.trim()) {
        const q = searchInput.toLowerCase();
        const match =
          item.code.toLowerCase().includes(q) ||
          item.nameTh.toLowerCase().includes(q) ||
          item.nameEn.toLowerCase().includes(q) ||
          item.degreeAbbrTh.toLowerCase().includes(q) ||
          item.degreeAbbrEn.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [items, degreeFilter, statusFilter, deptFilter, searchInput]);

  // Counters
  const countBachelor = useMemo(() => items.filter((i) => i.degreeLevel === "BACHELOR").length, [items]);
  const countMaster = useMemo(() => items.filter((i) => i.degreeLevel === "MASTER").length, [items]);
  const countDoctorate = useMemo(() => items.filter((i) => i.degreeLevel === "DOCTORATE").length, [items]);

  const columns: DataTableColumn<CurriculumProgramDto>[] = [
    {
      key: "code",
      header: t("curriculum.field.code"),
      render: (row) => (
        <div className="font-mono text-xs font-semibold text-primary">
          {row.code}
        </div>
      ),
    },
    {
      key: "name",
      header: t("curriculum.field.nameTh"),
      render: (row) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-sm text-foreground">
            {isEn ? row.nameEn : row.nameTh}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.degreeAbbrTh} ({row.degreeAbbrEn})
          </p>
        </div>
      ),
    },
    {
      key: "degreeLevel",
      header: t("curriculum.field.degreeLevel"),
      render: (row) => {
        let label = row.degreeLevel;
        let tone: "info" | "ok" | "warn" | "off" = "info";
        if (row.degreeLevel === "BACHELOR") {
          label = t("curriculum.degree.bachelor");
          tone = "info";
        } else if (row.degreeLevel === "MASTER") {
          label = t("curriculum.degree.master");
          tone = "ok";
        } else if (row.degreeLevel === "DOCTORATE") {
          label = t("curriculum.degree.doctorate");
          tone = "warn";
        }
        return <StatusPill tone={tone}>{label}</StatusPill>;
      },
    },
    {
      key: "department",
      header: t("curriculum.field.department"),
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {isEn ? row.departmentNameEn ?? "-" : row.departmentNameTh ?? "-"}
        </span>
      ),
    },
    {
      key: "credits",
      header: t("curriculum.field.totalCredits"),
      render: (row) => (
        <div className="text-xs">
          <span className="font-bold text-foreground">{row.totalCredits}</span> {isEn ? "cr." : "นก."}
        </div>
      ),
    },
    {
      key: "tuitionFee",
      header: t("curriculum.field.tuitionFee"),
      render: (row) => (
        <div className="text-xs font-medium text-foreground">
          {row.tuitionFeeSemester != null ? `฿${row.tuitionFeeSemester.toLocaleString()}` : "-"}
        </div>
      ),
    },
    {
      key: "status",
      header: t("curriculum.field.status"),
      render: (row) => {
        const isActive = row.status === "ACTIVE";
        return (
          <StatusPill tone={isActive ? "ok" : row.status === "REVISED" ? "warn" : "off"}>
            {isActive ? t("curriculum.status.active") : row.status === "REVISED" ? t("curriculum.status.revised") : t("curriculum.status.inactive")}
          </StatusPill>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("curriculum.manageTitle")}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t("curriculum.subtitle")}
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/50">
          <button
            type="button"
            onClick={() => setActiveTab("programs")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "programs"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <GraduationCap className="h-4 w-4 text-primary" />
            <span>{t("curriculum.tab.programs")}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary/10 text-primary font-bold">
              {items.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("departments")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "departments"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="h-4 w-4 text-primary" />
            <span>{t("curriculum.tab.departments")}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary/10 text-primary font-bold">
              {deptList.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === "departments" ? (
        <DepartmentManager
          departments={deptList}
          onDepartmentsChange={setDeptList}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      ) : (
        <>
          {/* Action Header for Programs */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              {t("curriculum.tab.programs")}
            </h2>
            {canCreate && (
              <Button onClick={handleOpenCreate} size="sm" className="gap-2 text-xs font-semibold">
                <Plus className="h-4 w-4" />
                <span>{t("curriculum.action.create")}</span>
              </Button>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <LiyonCard className="p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>{t("curriculum.stats.total")}</span>
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{items.length}</p>
        </LiyonCard>

        <LiyonCard className="p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>{t("curriculum.stats.bachelor")}</span>
            <GraduationCap className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{countBachelor}</p>
        </LiyonCard>

        <LiyonCard className="p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>{t("curriculum.stats.master")}</span>
            <GraduationCap className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{countMaster}</p>
        </LiyonCard>

        <LiyonCard className="p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>{t("curriculum.stats.doctorate")}</span>
            <GraduationCap className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{countDoctorate}</p>
        </LiyonCard>
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
              placeholder={t("curriculum.searchPlaceholder")}
              className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <LiyonSelect
            value={degreeFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDegreeFilter(e.target.value)}
          >
            <option value="ALL">{t("curriculum.degree.all")}</option>
            <option value="BACHELOR">{t("curriculum.degree.bachelor")}</option>
            <option value="MASTER">{t("curriculum.degree.master")}</option>
            <option value="DOCTORATE">{t("curriculum.degree.doctorate")}</option>
            <option value="DIPLOMA">{t("curriculum.degree.diploma")}</option>
          </LiyonSelect>

          <LiyonSelect
            value={deptFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDeptFilter(e.target.value)}
          >
            <option value="ALL">{isEn ? "All Departments" : "ทุกภาควิชา"}</option>
            {deptList.map((d) => (
              <option key={d.id} value={d.id}>
                {isEn ? d.nameEn : d.nameTh}
              </option>
            ))}
          </LiyonSelect>

          <LiyonSelect
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">{isEn ? "All Statuses" : "ทุกสถานะ"}</option>
            <option value="ACTIVE">{t("curriculum.status.active")}</option>
            <option value="INACTIVE">{t("curriculum.status.inactive")}</option>
            <option value="REVISED">{t("curriculum.status.revised")}</option>
          </LiyonSelect>
        </div>
      </LiyonCard>

      {/* Programs Table */}
      <LiyonCard>
        <DataTable
          state={filteredItems.length > 0 ? "data" : "empty"}
          columns={columns}
          rows={filteredItems}
          getRowId={(row) => row.id}
          headHeading={t("curriculum.title")}
          headMeta={<span>{filteredItems.length} {isEn ? "items" : "รายการ"}</span>}
          renderRowMenu={(row) => (
            <>
              {canUpdate && (
                <RowMenuItem onSelect={() => handleOpenEdit(row)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>{t("curriculum.action.edit")}</span>
                </RowMenuItem>
              )}
              {canDelete && (
                <RowMenuItem danger onSelect={() => setDeleteConfirmItem(row)}>
                  <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                  <span>{t("curriculum.action.delete")}</span>
                </RowMenuItem>
              )}
            </>
          )}
          empty={{
            icon: <GraduationCap aria-hidden="true" />,
            title: isEn ? "No programs found" : "ไม่พบหลักสูตร",
            description: isEn ? "No programs match the specified criteria" : "ไม่มีข้อมูลหลักสูตรที่ตรงกับเงื่อนไขการค้นหา",
          }}
          error={{
            icon: <AlertCircle aria-hidden="true" />,
            title: isEn ? "Error loading programs" : "เกิดข้อผิดพลาดในการโหลดข้อมูล",
            description: isEn ? "Please try again later" : "โปรดลองใหม่อีกครั้ง",
          }}
          rowMenuLabel={(row) => row.nameTh}
        />
      </LiyonCard>

      {/* Create / Edit Dialog */}
      <LiyonDialog open={modalOpen} onOpenChange={setModalOpen} wide>
        <LiyonDialogCloseButton label={isEn ? "Close" : "ปิด"} />
        <LiyonDialogHeader
          title={editingItem ? t("curriculum.action.edit") : t("curriculum.action.create")}
          description={t("curriculum.subtitle")}
        />
        <form onSubmit={handleSubmit}>
          <LiyonDialogBody className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <LiyonField label={t("curriculum.field.code")}>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
                  placeholder="e.g. CS2565"
                />
              </LiyonField>

              <LiyonField label={t("curriculum.field.degreeLevel")}>
                <LiyonSelect
                  value={degreeLevel}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDegreeLevel(e.target.value as DegreeLevelType)}
                >
                  <option value="BACHELOR">{t("curriculum.degree.bachelor")}</option>
                  <option value="MASTER">{t("curriculum.degree.master")}</option>
                  <option value="DOCTORATE">{t("curriculum.degree.doctorate")}</option>
                  <option value="DIPLOMA">{t("curriculum.degree.diploma")}</option>
                </LiyonSelect>
              </LiyonField>

              <LiyonField label={t("curriculum.field.programPlan")}>
                <LiyonSelect
                  value={programPlan}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProgramPlan(e.target.value as ProgramPlanType)}
                >
                  <option value="REGULAR">{t("curriculum.plan.regular")}</option>
                  <option value="SPECIAL">{t("curriculum.plan.special")}</option>
                  <option value="INTERNATIONAL">{t("curriculum.plan.international")}</option>
                  <option value="BILINGUAL">{t("curriculum.plan.bilingual")}</option>
                </LiyonSelect>
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("curriculum.field.nameTh")}>
                <input
                  type="text"
                  required
                  value={nameTh}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNameTh(e.target.value)}
                  placeholder="วิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์"
                />
              </LiyonField>

              <LiyonField label={t("curriculum.field.nameEn")}>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNameEn(e.target.value)}
                  placeholder="Bachelor of Science in Computer Science"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("curriculum.field.degreeTitleTh")}>
                <input
                  type="text"
                  required
                  value={degreeTitleTh}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDegreeTitleTh(e.target.value)}
                  placeholder="วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์)"
                />
              </LiyonField>

              <LiyonField label={t("curriculum.field.degreeTitleEn")}>
                <input
                  type="text"
                  required
                  value={degreeTitleEn}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDegreeTitleEn(e.target.value)}
                  placeholder="Bachelor of Science (Computer Science)"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("curriculum.field.degreeAbbrTh")}>
                <input
                  type="text"
                  required
                  value={degreeAbbrTh}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDegreeAbbrTh(e.target.value)}
                  placeholder="วท.บ. (วิทยาการคอมพิวเตอร์)"
                />
              </LiyonField>

              <LiyonField label={t("curriculum.field.degreeAbbrEn")}>
                <input
                  type="text"
                  required
                  value={degreeAbbrEn}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDegreeAbbrEn(e.target.value)}
                  placeholder="B.Sc. (Computer Science)"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <LiyonField label={t("curriculum.field.department")}>
                <LiyonSelect
                  value={departmentId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDepartmentId(e.target.value)}
                >
                  <option value="">{isEn ? "None / Faculty Center" : "ไม่ระบุ / ศูนย์กลางคณะ"}</option>
                  {deptList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {isEn ? d.nameEn : d.nameTh}
                    </option>
                  ))}
                </LiyonSelect>
              </LiyonField>

              <LiyonField label={t("curriculum.field.durationYears")}>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={durationYears}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDurationYears(Number(e.target.value))}
                />
              </LiyonField>

              <LiyonField label={t("curriculum.field.totalCredits")}>
                <input
                  type="number"
                  min={1}
                  value={totalCredits}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTotalCredits(Number(e.target.value))}
                />
              </LiyonField>

              <LiyonField label={t("curriculum.field.tuitionFee")}>
                <input
                  type="number"
                  min={0}
                  value={tuitionFee}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTuitionFee(e.target.value)}
                  placeholder="25000"
                />
              </LiyonField>
            </div>

            <LiyonField label={t("curriculum.field.careerPaths")}>
              <input
                type="text"
                value={careerPathsStr}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCareerPathsStr(e.target.value)}
                placeholder="Software Engineer, Data Scientist, DevOps Engineer"
              />
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("curriculum.field.tqfFileUrl")}>
                <input
                  type="url"
                  value={tqfFileUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTqfFileUrl(e.target.value)}
                  placeholder="https://..."
                />
              </LiyonField>

              <LiyonField label={t("curriculum.field.coverImageUrl")}>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("curriculum.field.descriptionTh")}>
                <textarea
                  rows={3}
                  value={descriptionTh}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescriptionTh(e.target.value)}
                />
              </LiyonField>

              <LiyonField label={t("curriculum.field.descriptionEn")}>
                <textarea
                  rows={3}
                  value={descriptionEn}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescriptionEn(e.target.value)}
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("curriculum.field.status")}>
                <LiyonSelect
                  value={status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as ProgramStatusType)}
                >
                  <option value="ACTIVE">{t("curriculum.status.active")}</option>
                  <option value="INACTIVE">{t("curriculum.status.inactive")}</option>
                  <option value="REVISED">{t("curriculum.status.revised")}</option>
                </LiyonSelect>
              </LiyonField>

              <LiyonField label={t("curriculum.field.orderIndex")}>
                <input
                  type="number"
                  value={orderIndex}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderIndex(Number(e.target.value))}
                />
              </LiyonField>
            </div>
          </LiyonDialogBody>
          <LiyonDialogFooter className="flex justify-end gap-2 border-t pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
              disabled={isPending}
            >
              {isEn ? "Cancel" : "ยกเลิก"}
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? (isEn ? "Saving..." : "กำลังบันทึก...") : isEn ? "Save Program" : "บันทึกข้อมูล"}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* Delete Confirmation Dialog */}
      <LiyonDialog
        open={Boolean(deleteConfirmItem)}
        onOpenChange={(open) => !open && setDeleteConfirmItem(null)}
      >
        <LiyonDialogCloseButton label={isEn ? "Close" : "ปิด"} />
        <LiyonDialogHeader
          title={
            <div className="flex items-center gap-2 text-destructive font-bold">
              <AlertCircle className="h-5 w-5" />
              <span>{t("curriculum.action.confirmDeleteTitle")}</span>
            </div>
          }
        />
        <LiyonDialogBody className="py-4 text-xs text-muted-foreground space-y-2">
          <p>{t("curriculum.action.confirmDeleteMessage")}</p>
          {deleteConfirmItem && (
            <p className="font-semibold text-foreground">
              {deleteConfirmItem.code} - {isEn ? deleteConfirmItem.nameEn : deleteConfirmItem.nameTh}
            </p>
          )}
        </LiyonDialogBody>
        <LiyonDialogFooter className="flex justify-end gap-2 border-t pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDeleteConfirmItem(null)}
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
            {isPending ? (isEn ? "Deleting..." : "กำลังลบ...") : t("curriculum.action.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
        </>
      )}
    </div>
  );
}
