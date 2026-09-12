"use client";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Upload,
  Trash2,
  ImageIcon,
  Loader2,
  Mail,
  Send,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  MapPin,
  Phone,
  Clock,
  Globe,
  Share2,
} from "lucide-react";
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
  testSmtpAction,
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

  const [smtp, setSmtp] = useState({
    enabled: initial.smtp?.enabled ?? false,
    user: initial.smtp?.user ?? "",
    pass: "",
    hasExistingPass: Boolean(initial.smtp?.pass),
    fromName: initial.smtp?.fromName ?? "",
    fromEmail: initial.smtp?.fromEmail ?? "",
    port: (initial.smtp?.port === 587 ? 587 : 465) as 465 | 587,
    secure: initial.smtp?.secure ?? true,
  });

  const [contact, setContact] = useState({
    addressTh: initial.contact?.addressTh ?? "",
    addressEn: initial.contact?.addressEn ?? "",
    phone: initial.contact?.phone ?? "",
    email: initial.contact?.email ?? "",
    workingHoursTh: initial.contact?.workingHoursTh ?? "",
    workingHoursEn: initial.contact?.workingHoursEn ?? "",
    facebookUrl: initial.contact?.facebookUrl ?? "",
    lineId: initial.contact?.lineId ?? "",
    websiteUrl: initial.contact?.websiteUrl ?? "",
    googleMapUrl: initial.contact?.googleMapUrl ?? "",
  });

  const [showPass, setShowPass] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);
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

  async function handleTestEmail() {
    const target = testEmail.trim();
    if (!target || !target.includes("@")) {
      toast.error(
        isEn
          ? "Please enter a valid recipient email"
          : "กรุณาระบุอีเมลผู้รับสำหรับทดสอบ"
      );
      return;
    }
    if (!smtp.user.trim() || !smtp.user.includes("@")) {
      toast.error(
        isEn
          ? "Please enter your Gmail address"
          : "กรุณาระบุอีเมลบัญชี Gmail ของท่าน"
      );
      return;
    }
    if (!smtp.pass.trim() && !smtp.hasExistingPass) {
      toast.error(
        isEn
          ? "Please enter Google App Password (16 characters)"
          : "กรุณาระบุรหัสผ่านสำหรับแอป (Google App Password 16 หลัก)"
      );
      return;
    }

    setTesting(true);
    try {
      const res = await testSmtpAction({
        toEmail: target,
        smtp: {
          enabled: smtp.enabled,
          user: smtp.user.trim(),
          pass: smtp.pass.trim(),
          fromName: smtp.fromName.trim(),
          fromEmail: smtp.fromEmail.trim(),
          port: smtp.port,
          secure: smtp.port === 465,
        },
      });

      if (res.ok) {
        toast.success(res.data.message);
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error(
        isEn
          ? "Failed to connect to SMTP server"
          : "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ SMTP ได้"
      );
    } finally {
      setTesting(false);
    }
  }

  function save() {
    start(async () => {
      const payload = {
        ...form,
        smtp: {
          enabled: smtp.enabled,
          user: smtp.user.trim(),
          pass: smtp.pass.trim(),
          fromName: smtp.fromName.trim(),
          fromEmail: smtp.fromEmail.trim(),
          port: smtp.port,
          secure: smtp.port === 465,
        },
        contact: {
          addressTh: contact.addressTh.trim(),
          addressEn: contact.addressEn.trim(),
          phone: contact.phone.trim(),
          email: contact.email.trim(),
          workingHoursTh: contact.workingHoursTh.trim(),
          workingHoursEn: contact.workingHoursEn.trim(),
          facebookUrl: contact.facebookUrl.trim(),
          lineId: contact.lineId.trim(),
          websiteUrl: contact.websiteUrl.trim(),
          googleMapUrl: contact.googleMapUrl.trim(),
        },
      };
      const r = await updateSettingsAction(payload);
      if (!r.ok) {
        setErrors(r.error.fieldErrors ?? {});
        if (!r.error.fieldErrors) toast.error(t(`error.${r.error.code}`));
        return;
      }
      setErrors({});
      if (smtp.pass.trim()) {
        setSmtp((prev) => ({ ...prev, pass: "", hasExistingPass: true }));
      }
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

        {/* Gmail SMTP Settings Card */}
        <LiyonCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <h2>{t("settings.smtpTitle")}</h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("settings.smtpDesc")}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={smtp.enabled}
                  onChange={(e) =>
                    setSmtp({ ...smtp, enabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/50 space-y-5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  {t("settings.smtpEnable")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("settings.smtpEnableDesc")}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  smtp.enabled
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    smtp.enabled ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                  }`}
                />
                {smtp.enabled
                  ? isEn
                    ? "Enabled"
                    : "เปิดใช้งาน"
                  : isEn
                  ? "Disabled"
                  : "ปิดใช้งาน"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField
                label={t("settings.smtpGmailUser")}
                htmlFor="s-smtp-user"
                error={errors["smtp.user"]?.[0]}
              >
                <input
                  id="s-smtp-user"
                  type="email"
                  value={smtp.user}
                  onChange={(e) => setSmtp({ ...smtp, user: e.target.value })}
                  placeholder={t("settings.smtpGmailUserPh")}
                />
              </LiyonField>

              <div className="space-y-1">
                <label
                  htmlFor="s-smtp-pass"
                  className="text-xs font-semibold text-foreground flex items-center justify-between"
                >
                  <span>{t("settings.smtpGmailPass")}</span>
                  {smtp.hasExistingPass && !smtp.pass && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-normal flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {isEn ? "Configured" : "ตั้งค่าไว้แล้ว"}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    id="s-smtp-pass"
                    type={showPass ? "text" : "password"}
                    value={smtp.pass}
                    onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })}
                    placeholder={
                      smtp.hasExistingPass
                        ? t("settings.smtpGmailPassKeep")
                        : t("settings.smtpGmailPassPh")
                    }
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPass ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors["smtp.pass"]?.[0] && (
                  <p className="text-xs text-destructive">
                    {errors["smtp.pass"][0]}
                  </p>
                )}
              </div>

              <LiyonField
                label={t("settings.smtpFromName")}
                htmlFor="s-smtp-from-name"
                error={errors["smtp.fromName"]?.[0]}
              >
                <input
                  id="s-smtp-from-name"
                  type="text"
                  value={smtp.fromName}
                  onChange={(e) =>
                    setSmtp({ ...smtp, fromName: e.target.value })
                  }
                  placeholder={t("settings.smtpFromNamePh")}
                />
              </LiyonField>

              <LiyonField
                label={t("settings.smtpFromEmail")}
                htmlFor="s-smtp-from-email"
                error={errors["smtp.fromEmail"]?.[0]}
              >
                <input
                  id="s-smtp-from-email"
                  type="email"
                  value={smtp.fromEmail}
                  onChange={(e) =>
                    setSmtp({ ...smtp, fromEmail: e.target.value })
                  }
                  placeholder={t("settings.smtpFromEmailPh")}
                />
              </LiyonField>
            </div>

            {/* Port & Security selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">
                {t("settings.smtpPort")}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    smtp.port === 465
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="smtp-port"
                    checked={smtp.port === 465}
                    onChange={() =>
                      setSmtp({ ...smtp, port: 465, secure: true })
                    }
                    className="text-primary focus:ring-primary"
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">
                      {t("settings.smtpPort465")}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {isEn ? "Direct SSL/TLS Encryption" : "การเข้ารหัสแบบ SSL ตรงทันที"}
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    smtp.port === 587
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="smtp-port"
                    checked={smtp.port === 587}
                    onChange={() =>
                      setSmtp({ ...smtp, port: 587, secure: false })
                    }
                    className="text-primary focus:ring-primary"
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">
                      {t("settings.smtpPort587")}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {isEn ? "STARTTLS Opportunistic Encryption" : "การเข้ารหัสผ่าน STARTTLS"}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Google App Password Guide Note */}
            <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-500/5 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sky-700 dark:text-sky-300">
                <KeyRound className="h-4 w-4" />
                <span>{t("settings.smtpGuideTitle")}</span>
              </div>
              <ul className="list-none space-y-1 text-muted-foreground text-[11px] pl-1">
                <li>{t("settings.smtpGuideStep1")}</li>
                <li>{t("settings.smtpGuideStep2")}</li>
                <li>{t("settings.smtpGuideStep3")}</li>
                <li>{t("settings.smtpGuideStep4")}</li>
              </ul>
            </div>

            {/* Test Email Section */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <div>
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5 text-primary" />
                  {t("settings.smtpTestSection")}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {t("settings.smtpTestDesc")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder={t("settings.smtpTestEmailPh")}
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-background"
                  disabled={testing}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestEmail}
                  disabled={testing || pending}
                  className="gap-2 text-xs shrink-0"
                >
                  {testing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>{t("settings.smtpTesting")}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>{t("settings.smtpTestBtn")}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </LiyonCard>

        {/* Contact Information Card (Public Portal) */}
        <LiyonCard className="p-6 space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold text-foreground">
                  {t("settings.contactTitle")}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("settings.contactDesc")}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Address Thai & English */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("settings.contactAddressTh")} htmlFor="c-addr-th">
                <textarea
                  id="c-addr-th"
                  rows={3}
                  value={contact.addressTh}
                  onChange={(e) => setContact({ ...contact, addressTh: e.target.value })}
                  placeholder={t("settings.contactAddressThPh")}
                  disabled={pending}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </LiyonField>

              <LiyonField label={t("settings.contactAddressEn")} htmlFor="c-addr-en">
                <textarea
                  id="c-addr-en"
                  rows={3}
                  value={contact.addressEn}
                  onChange={(e) => setContact({ ...contact, addressEn: e.target.value })}
                  placeholder={t("settings.contactAddressEnPh")}
                  disabled={pending}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </LiyonField>
            </div>

            {/* Direct Contact: Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("settings.contactPhone")} htmlFor="c-phone">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="c-phone"
                    type="text"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    placeholder={t("settings.contactPhonePh")}
                    disabled={pending}
                    className="pl-9"
                  />
                </div>
              </LiyonField>

              <LiyonField label={t("settings.contactEmail")} htmlFor="c-email">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="c-email"
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    placeholder={t("settings.contactEmailPh")}
                    disabled={pending}
                    className="pl-9"
                  />
                </div>
              </LiyonField>
            </div>

            {/* Operating Hours: Thai & English */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("settings.contactWorkingHoursTh")} htmlFor="c-hours-th">
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="c-hours-th"
                    type="text"
                    value={contact.workingHoursTh}
                    onChange={(e) => setContact({ ...contact, workingHoursTh: e.target.value })}
                    placeholder={t("settings.contactWorkingHoursThPh")}
                    disabled={pending}
                    className="pl-9"
                  />
                </div>
              </LiyonField>

              <LiyonField label={t("settings.contactWorkingHoursEn")} htmlFor="c-hours-en">
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="c-hours-en"
                    type="text"
                    value={contact.workingHoursEn}
                    onChange={(e) => setContact({ ...contact, workingHoursEn: e.target.value })}
                    placeholder={t("settings.contactWorkingHoursEnPh")}
                    disabled={pending}
                    className="pl-9"
                  />
                </div>
              </LiyonField>
            </div>

            {/* Online Links: Website, Facebook, Line, Google Maps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <LiyonField label={t("settings.contactWebsite")} htmlFor="c-website">
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="c-website"
                    type="url"
                    value={contact.websiteUrl}
                    onChange={(e) => setContact({ ...contact, websiteUrl: e.target.value })}
                    placeholder={t("settings.contactWebsitePh")}
                    disabled={pending}
                    className="pl-9"
                  />
                </div>
              </LiyonField>

              <LiyonField label={t("settings.contactFacebook")} htmlFor="c-fb">
                <div className="relative">
                  <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="c-fb"
                    type="url"
                    value={contact.facebookUrl}
                    onChange={(e) => setContact({ ...contact, facebookUrl: e.target.value })}
                    placeholder={t("settings.contactFacebookPh")}
                    disabled={pending}
                    className="pl-9"
                  />
                </div>
              </LiyonField>

              <LiyonField label={t("settings.contactLine")} htmlFor="c-line">
                <input
                  id="c-line"
                  type="text"
                  value={contact.lineId}
                  onChange={(e) => setContact({ ...contact, lineId: e.target.value })}
                  placeholder={t("settings.contactLinePh")}
                  disabled={pending}
                />
              </LiyonField>

              <LiyonField label={t("settings.contactGoogleMap")} htmlFor="c-gmap">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="c-gmap"
                    type="url"
                    value={contact.googleMapUrl}
                    onChange={(e) => setContact({ ...contact, googleMapUrl: e.target.value })}
                    placeholder={t("settings.contactGoogleMapPh")}
                    disabled={pending}
                    className="pl-9"
                  />
                </div>
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
