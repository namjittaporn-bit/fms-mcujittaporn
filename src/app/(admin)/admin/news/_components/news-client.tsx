"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Pin,
  PinOff,
  Eye,
  Newspaper,
  Search,
  AlertCircle,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
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
import type { NewsArticleDto, NewsCategoryType, NewsStatusType } from "@/features/news";
import {
  createNewsAction,
  updateNewsAction,
  togglePinNewsAction,
  deleteNewsAction,
  getAdminNewsAction,
  translateNewsWithGeminiAction,
} from "@/features/news/actions";

interface Props {
  initialItems: NewsArticleDto[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canPin: boolean;
  canPublish: boolean;
}

export function NewsClient({
  initialItems,
  canCreate,
  canUpdate,
  canDelete,
  canPin,
  canPublish,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const [items, setItems] = useState<NewsArticleDto[]>(initialItems);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Dialogs
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<NewsArticleDto | null>(null);
  const [editingItem, setEditingItem] = useState<NewsArticleDto | null>(null);

  // Form
  const [titleTh, setTitleTh] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [contentTh, setContentTh] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [category, setCategory] = useState<NewsCategoryType>("GENERAL");
  const [status, setStatus] = useState<NewsStatusType>("DRAFT");
  const [isPinned, setIsPinned] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const refreshItems = async () => {
    const res = await getAdminNewsAction();
    if (res.ok) setItems(res.data);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setTitleTh("");
    setTitleEn("");
    setSlug("");
    setContentTh("");
    setContentEn("");
    setCategory("GENERAL");
    setStatus("DRAFT");
    setIsPinned(false);
    setCoverImageUrl("");
    setModalOpen(true);
  };

  const openEditDialog = (item: NewsArticleDto) => {
    setEditingItem(item);
    setTitleTh(item.titleTh);
    setTitleEn(item.titleEn);
    setSlug(item.slug);
    setContentTh(item.contentTh);
    setContentEn(item.contentEn);
    setCategory(item.category as NewsCategoryType);
    setStatus(item.status as NewsStatusType);
    setIsPinned(item.isPinned);
    setCoverImageUrl(item.coverImageUrl ?? "");
    setModalOpen(true);
  };

  const handleTitleThChange = (val: string) => {
    setTitleTh(val);
    if (!editingItem && !slug) {
      const gen = val
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u0E00-\u0E7F]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(gen || `news-${Date.now().toString().slice(-4)}`);
    }
  };

  const handleTranslateWithGemini = async () => {
    if (!titleTh.trim() && !contentTh.trim()) {
      toast.error(t("news.translateAiNeedThai"));
      return;
    }

    setIsTranslating(true);
    try {
      const res = await translateNewsWithGeminiAction({
        titleTh: titleTh.trim() || "ประกาศข่าวสาร",
        contentTh: contentTh.trim() || "รายละเอียดข่าวสาร",
      });

      if (res.ok) {
        if (res.data.titleEn) {
          setTitleEn(res.data.titleEn);
          if (!editingItem && (!slug || slug.startsWith("news-") || !/^[a-z0-9-]+$/.test(slug))) {
            const cleanSlug = res.data.titleEn
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "");
            if (cleanSlug) setSlug(cleanSlug.slice(0, 60));
          }
        }
        if (res.data.contentEn) {
          setContentEn(res.data.contentEn);
        }
        toast.success(t("news.translateAiSuccess"));
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    } catch {
      toast.error(t("common.error"));
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = () => {
    if (!titleTh.trim() || !titleEn.trim() || !contentTh.trim() || !contentEn.trim()) {
      toast.error(t("error.validation"));
      return;
    }

    const payloadSlug = slug.trim() || `news-${Date.now().toString().slice(-4)}`;

    startTransition(async () => {
      if (editingItem) {
        const res = await updateNewsAction({
          id: editingItem.id,
          titleTh: titleTh.trim(),
          titleEn: titleEn.trim(),
          slug: payloadSlug,
          contentTh: contentTh.trim(),
          contentEn: contentEn.trim(),
          category,
          status,
          isPinned,
          coverImageUrl: coverImageUrl.trim() || null,
        });
        if (res.ok) {
          toast.success(t("news.updateSuccess"));
          setModalOpen(false);
          await refreshItems();
        } else {
          toast.error(t("common.error"));
        }
      } else {
        const res = await createNewsAction({
          titleTh: titleTh.trim(),
          titleEn: titleEn.trim(),
          slug: payloadSlug,
          contentTh: contentTh.trim(),
          contentEn: contentEn.trim(),
          category,
          status,
          isPinned,
          coverImageUrl: coverImageUrl.trim() || null,
        });
        if (res.ok) {
          toast.success(t("news.createSuccess"));
          setModalOpen(false);
          await refreshItems();
        } else {
          toast.error(t("common.error"));
        }
      }
    });
  };

  const handleTogglePin = (item: NewsArticleDto) => {
    startTransition(async () => {
      const res = await togglePinNewsAction({
        id: item.id,
        isPinned: !item.isPinned,
      });
      if (res.ok) {
        toast.success(t("news.pinSuccess"));
        await refreshItems();
      } else {
        toast.error(t("common.error"));
      }
    });
  };

  const handleDelete = (item: NewsArticleDto) => {
    startTransition(async () => {
      const res = await deleteNewsAction(item.id);
      if (res.ok) {
        toast.success(t("news.deleteSuccess"));
        setDeleteConfirmItem(null);
        await refreshItems();
      } else {
        toast.error(t("common.error"));
      }
    });
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !searchInput ||
        item.titleTh.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.titleEn.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchInput.toLowerCase());
      const matchCategory =
        categoryFilter === "ALL" || item.category === categoryFilter;
      const matchStatus =
        statusFilter === "ALL" || item.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [items, searchInput, categoryFilter, statusFilter]);

  const columns: DataTableColumn<NewsArticleDto>[] = [
    {
      key: "title",
      header: t("news.titleThField"),
      render: (row) => (
        <div>
          <div className="flex items-center gap-2">
            {row.isPinned && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                <Pin className="h-3 w-3 fill-amber-600" />
                {t("news.isPinnedField")}
              </span>
            )}
            <span className="font-semibold text-foreground">
              {locale === "en" ? row.titleEn : row.titleTh}
            </span>
          </div>
          <div className="muted text-xs">/{row.slug}</div>
        </div>
      ),
    },
    {
      key: "category",
      header: t("news.categoryField"),
      render: (row) => {
        const catKey = `news.category.${row.category}` as const;
        return (
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {t(catKey)}
          </span>
        );
      },
    },
    {
      key: "status",
      header: t("news.statusField"),
      render: (row) => {
        const statusTone =
          row.status === "PUBLISHED" ? "ok" : row.status === "DRAFT" ? "warn" : "off";
        const statusKey = `news.status.${row.status}` as const;
        return <StatusPill tone={statusTone}>{t(statusKey)}</StatusPill>;
      },
    },
    {
      key: "publishedAt",
      header: t("news.publishedAtField"),
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.publishedAt ? formatDate(new Date(row.publishedAt), locale) : "-"}
        </span>
      ),
    },
    {
      key: "views",
      header: t("news.views"),
      render: (row) => (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Eye className="h-3.5 w-3.5" />
          <span>{row.viewCount}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("news.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("news.subtitle")}
          </p>
        </div>
        {canCreate && (
          <Button onClick={openCreateDialog} className="shrink-0 gap-2">
            <Plus className="h-4 w-4" />
            {t("news.create")}
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
          headHeading={t("news.title")}
          headMeta={<span>{filteredItems.length} {t("common.items")}</span>}
          toolbar={
            <>
              <span className="tsearch">
                <Search aria-hidden="true" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                  placeholder={t("news.searchPlaceholder")}
                  aria-label={t("common.search")}
                />
              </span>
              <LiyonSelect
                aria-label={t("news.categoryField")}
                value={categoryFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">{t("news.allCategories")}</option>
                <option value="ACADEMIC">{t("news.category.ACADEMIC")}</option>
                <option value="ACTIVITY">{t("news.category.ACTIVITY")}</option>
                <option value="SCHOLARSHIP">{t("news.category.SCHOLARSHIP")}</option>
                <option value="PROCUREMENT">{t("news.category.PROCUREMENT")}</option>
                <option value="GENERAL">{t("news.category.GENERAL")}</option>
              </LiyonSelect>
              <LiyonSelect
                aria-label={t("news.statusField")}
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">{t("news.allStatuses")}</option>
                <option value="DRAFT">{t("news.status.DRAFT")}</option>
                <option value="PUBLISHED">{t("news.status.PUBLISHED")}</option>
                <option value="ARCHIVED">{t("news.status.ARCHIVED")}</option>
              </LiyonSelect>
            </>
          }
          empty={{
            icon: <Newspaper aria-hidden="true" />,
            title: t("news.empty"),
          }}
          error={{
            icon: <AlertCircle aria-hidden="true" />,
            title: t("common.error"),
          }}
          renderRowMenu={(row) => (
            <>
              {canPin && (
                <RowMenuItem
                  onSelect={() => handleTogglePin(row)}
                  icon={row.isPinned ? <PinOff aria-hidden="true" /> : <Pin aria-hidden="true" />}
                >
                  {row.isPinned ? t("news.cancel") : t("news.isPinnedField")}
                </RowMenuItem>
              )}
              {canUpdate && (
                <RowMenuItem
                  onSelect={() => openEditDialog(row)}
                  icon={<Pencil aria-hidden="true" />}
                >
                  {t("news.edit")}
                </RowMenuItem>
              )}
              {canDelete && (
                <RowMenuItem
                  danger
                  onSelect={() => setDeleteConfirmItem(row)}
                  icon={<Trash2 aria-hidden="true" />}
                >
                  {t("news.delete")}
                </RowMenuItem>
              )}
            </>
          )}
          rowMenuLabel={(row) => row.titleTh}
        />
      </LiyonCard>

      {/* Create / Edit Dialog */}
      <LiyonDialog open={modalOpen} onOpenChange={setModalOpen} wide>
        <LiyonDialogCloseButton label={t("common.close")} />
        <LiyonDialogHeader
          title={editingItem ? t("news.edit") : t("news.create")}
          description={t("news.subtitle")}
        />
        <LiyonDialogBody className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* AI Translation Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-500/5 via-fuchsia-500/5 to-transparent">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span>{t("news.translateWithAi")}</span>
                  <span className="rounded bg-purple-100 dark:bg-purple-950/60 px-1.5 py-0.2 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                    Gemini
                  </span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {locale === "en"
                    ? "Fill in Thai title & content, then click to auto-generate English translation with Gemini"
                    : "กรอกข้อมูลภาษาไทย แล้วกดปุ่มนี้เพื่อสร้างภาษาอังกฤษอัตโนมัติด้วย Gemini AI"}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTranslateWithGemini}
              disabled={isTranslating || isPending || (!titleTh.trim() && !contentTh.trim())}
              className="gap-2 text-xs border-purple-500/30 hover:bg-purple-500/10 text-purple-700 dark:text-purple-300 font-medium shrink-0 cursor-pointer"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-600 dark:text-purple-400" />
                  <span>{t("news.translatingWithAi")}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <span>{t("news.translateWithAi")}</span>
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LiyonField label={t("news.titleThField")} htmlFor="news-title-th">
              <input
                id="news-title-th"
                value={titleTh}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTitleThChange(e.target.value)}
                placeholder="เช่น ประกาศรับสมัครทุนการศึกษา ประจำปี 2569"
                required
              />
            </LiyonField>
            <LiyonField label={t("news.titleEnField")} htmlFor="news-title-en">
              <input
                id="news-title-en"
                value={titleEn}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitleEn(e.target.value)}
                placeholder="e.g. Scholarship Announcement Academic Year 2026"
                required
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <LiyonField label={t("news.slugField")} htmlFor="news-slug">
              <input
                id="news-slug"
                value={slug}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)}
                placeholder="scholarship-announcement-2026"
                required
              />
            </LiyonField>
            <LiyonField label={t("news.categoryField")} htmlFor="news-category">
              <LiyonSelect
                id="news-category"
                value={category}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as NewsCategoryType)}
              >
                <option value="GENERAL">{t("news.category.GENERAL")}</option>
                <option value="ACADEMIC">{t("news.category.ACADEMIC")}</option>
                <option value="ACTIVITY">{t("news.category.ACTIVITY")}</option>
                <option value="SCHOLARSHIP">{t("news.category.SCHOLARSHIP")}</option>
                <option value="PROCUREMENT">{t("news.category.PROCUREMENT")}</option>
              </LiyonSelect>
            </LiyonField>
            <LiyonField label={t("news.statusField")} htmlFor="news-status">
              <LiyonSelect
                id="news-status"
                value={status}
                disabled={!canPublish && status === "DRAFT"}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as NewsStatusType)}
              >
                <option value="DRAFT">{t("news.status.DRAFT")}</option>
                <option value="PUBLISHED">{t("news.status.PUBLISHED")}</option>
                <option value="ARCHIVED">{t("news.status.ARCHIVED")}</option>
              </LiyonSelect>
            </LiyonField>
          </div>

          <LiyonField label={t("news.coverImageUrlField")} htmlFor="news-cover">
            <input
              id="news-cover"
              type="url"
              value={coverImageUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoverImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
          </LiyonField>

          {canPin && (
            <LiyonSwitchRow
              id="news-pinned-switch"
              label={t("news.isPinnedField")}
              description="แสดงในส่วนข่าวเด่นบนหน้าหลักของคณะ"
              checked={isPinned}
              onCheckedChange={setIsPinned}
            />
          )}

          <LiyonField label={t("news.contentThField")} htmlFor="news-content-th">
            <textarea
              id="news-content-th"
              className="w-full rounded-md border border-input bg-background p-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[120px]"
              value={contentTh}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContentTh(e.target.value)}
              placeholder="เนื้อหารายละเอียดข่าวสาร (ภาษาไทย)..."
              required
            />
          </LiyonField>

          <LiyonField label={t("news.contentEnField")} htmlFor="news-content-en">
            <textarea
              id="news-content-en"
              className="w-full rounded-md border border-input bg-background p-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[120px]"
              value={contentEn}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContentEn(e.target.value)}
              placeholder="News details and content in English..."
              required
            />
          </LiyonField>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setModalOpen(false)}
            disabled={isPending || isTranslating}
          >
            {t("news.cancel")}
          </Button>
          <Button type="button" onClick={handleSave} disabled={isPending || isTranslating}>
            {t("news.save")}
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
          title={t("news.delete")}
          description={
            deleteConfirmItem
              ? `${t("news.deleteConfirm")} "${locale === "en" ? deleteConfirmItem.titleEn : deleteConfirmItem.titleTh}"`
              : t("news.deleteConfirm")
          }
        />
        <LiyonDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteConfirmItem(null)}
            disabled={isPending}
          >
            {t("news.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => deleteConfirmItem && handleDelete(deleteConfirmItem)}
            disabled={isPending}
          >
            {t("news.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
