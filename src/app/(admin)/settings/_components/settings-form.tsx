"use client";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Trash2, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LiyonCard,
  LiyonField,
  PalettePicker,
} from "@/shared/components/liyon";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import type { PaletteId } from "@/shared/lib/palette";
import type { TenantSettings } from "@/features/identity";
import {
  updateSettingsAction,
  uploadLogoAction,
} from "@/features/identity/actions";

export function SettingsForm({ initial }: { initial: TenantSettings }) {
  const t = useT();
  const locale = useLocale();
  const isEn = locale === "en";
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    nameTh: initial.nameTh,
    nameEn: initial.nameEn,
    logoUrl: initial.logoUrl ?? "",
    palette: initial.palette as PaletteId,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, start] = useTransition();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(
        isEn
          ? "Only image files are allowed (PNG, JPG, WebP, SVG)"
          : "กรุณาเลือกไฟล์รูปภาพ (PNG, JPG, WebP, SVG)"
      );
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error(
        isEn
          ? "File size must not exceed 2MB"
          : "ขนาดไฟล์ต้องไม่เกิน 2MB"
      );
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadLogoAction(fd);
      if (res.ok) {
        setForm((prev) => ({ ...prev, logoUrl: res.data.url }));
        setErrors((prev) => ({ ...prev, logoUrl: [] }));
        toast.success(t("settings.uploadSuccess"));
      } else {
        toast.error(res.error.message || t("settings.uploadError"));
      }
    } catch {
      toast.error(t("settings.uploadError"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function save() {
    start(async () => {
      const r = await updateSettingsAction(form);
      if (!r.ok) {
        setErrors(r.error.fieldErrors ?? {});
        if (!r.error.fieldErrors) toast.error(t(`error.${r.error.code}`));
        return;
      }
      setErrors({});
      toast.success(t("settings.saveOk"));
      router.refresh();
    });
  }

  return (
    <>
      <header className="ph">
        <h1>{t("settings.title")}</h1>
      </header>
      <div className="set-cards">
        <LiyonCard>
          <h2>{t("settings.orgTitle")}</h2>
          <div className="fields">
            <LiyonField
              label={t("settings.nameTh")}
              htmlFor="s-name-th"
              error={errors.nameTh?.[0]}
            >
              <input
                id="s-name-th"
                value={form.nameTh}
                onChange={(e) => setForm({ ...form, nameTh: e.target.value })}
              />
            </LiyonField>
            <LiyonField
              label={t("settings.nameEn")}
              htmlFor="s-name-en"
              error={errors.nameEn?.[0]}
            >
              <input
                id="s-name-en"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              />
            </LiyonField>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-foreground block">
                {t("settings.logoUrl")}{" "}
                <span className="text-muted-foreground font-normal">
                  ({t("common.optional")})
                </span>
              </label>

              <div className="logo-up">
                <div className="prev">
                  {form.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.logoUrl}
                      alt="Logo preview"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      id="s-logo-file"
                      disabled={uploading || pending}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading || pending}
                      className="gap-2 text-xs"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>{t("settings.uploading")}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" />
                          <span>{t("settings.uploadLogo")}</span>
                        </>
                      )}
                    </Button>

                    {form.logoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, logoUrl: "" }))
                        }
                        disabled={uploading || pending}
                        className="text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        <span>{t("settings.removeLogo")}</span>
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {t("settings.logoHint")}
                  </p>
                </div>
              </div>

              <LiyonField
                label=""
                htmlFor="s-logo"
                error={errors.logoUrl?.[0]}
              >
                <input
                  id="s-logo"
                  type="text"
                  value={form.logoUrl}
                  onChange={(e) =>
                    setForm({ ...form, logoUrl: e.target.value })
                  }
                  placeholder={
                    isEn
                      ? "Or enter image URL (https://... or /uploads/...)"
                      : "หรือใส่ URL รูปภาพ (https://... หรือ /uploads/...)"
                  }
                />
              </LiyonField>
            </div>
          </div>
        </LiyonCard>

        <LiyonCard>
          <h2>{t("settings.brandTitle")}</h2>
          <p>{t("settings.brandDesc")}</p>
          <PalettePicker
            value={form.palette}
            onChange={(p) => setForm({ ...form, palette: p })}
            label={t("settings.paletteLabel")}
          />
          {form.palette === "coral" && (
            <p className="warn" role="note">
              {t("settings.coralWarn")}
            </p>
          )}
        </LiyonCard>

        <div className="savebar">
          <Button type="button" onClick={save} disabled={pending || uploading}>
            {t("common.save")}
          </Button>
        </div>
      </div>
    </>
  );
}
