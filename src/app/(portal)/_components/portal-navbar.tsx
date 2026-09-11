"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import {
  ShieldCheck,
  Menu,
  X,
  GraduationCap,
  LayoutDashboard,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useAppSession } from "@/hooks/use-session";
import { hasPermission, P } from "@/features/identity";
import { cn } from "@/shared/lib/utils";

export interface PortalNavbarProps {
  brandName: string;
  brandTagline: string;
  brandLogo?: string | null;
  locale: "th" | "en";
}

interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
}

export function PortalNavbar({
  brandName,
  brandTagline,
  brandLogo,
  locale,
}: PortalNavbarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { status, user, roles, permissions, isSuperAdmin } = useAppSession();

  const isEn = locale === "en";

  const navItems: NavItem[] = React.useMemo(
    () => [
      {
        href: "/",
        label: isEn ? "Home" : "หน้าหลัก",
        exact: true,
      },
      {
        href: "/news",
        label: isEn ? "News & Events" : "ข่าวสารและกิจกรรม",
        exact: true,
      },
      {
        href: "/curriculum",
        label: isEn ? "Curriculum" : "หลักสูตรการศึกษา",
      },
      {
        href: "/personnel",
        label: isEn ? "Faculty & Staff" : "ทำเนียบบุคลากร",
      },
      {
        href: "/news?category=SCHOLARSHIP",
        label: isEn ? "Scholarships" : "ทุนการศึกษา",
      },
      {
        href: "/news?category=PROCUREMENT",
        label: isEn ? "Procurement" : "จัดซื้อจัดจ้าง",
      },
    ],
    [isEn]
  );

  const isItemActive = (item: NavItem) => {
    if (item.href.includes("?")) {
      const [itemPath, itemQuery] = item.href.split("?");
      const params = new URLSearchParams(itemQuery);
      const category = params.get("category");
      return pathname === itemPath && searchParams?.get("category") === category;
    }

    if (item.exact) {
      if (item.href === "/news") {
        return pathname === "/news" && !searchParams?.get("category");
      }
      return pathname === item.href;
    }

    return pathname?.startsWith(item.href);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const initials = (user?.name ?? "?").trim().charAt(0).toUpperCase() || "?";
  const canManageSettings = hasPermission(
    { roles, permissions, isSuperAdmin },
    P.settingsManage
  );

  return (
    <header className="adm-head sticky top-0 z-40 w-full border-b border-[var(--glass-border)] bg-[var(--glass)] backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Brand Block (Matches AdminShell .brand-blk) */}
        <Link
          href="/"
          className="brand-blk !w-auto max-w-[260px] sm:max-w-md transition hover:opacity-90"
        >
          <i>
            {brandLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brandLogo}
                alt=""
                className="h-full w-full object-contain p-0.5 rounded-[inherit]"
              />
            ) : (
              <GraduationCap className="h-5 w-5" />
            )}
          </i>
          <div className="t">
            <b>{brandName}</b>
            <span>{brandTagline}</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden lg:flex items-center gap-1.5 text-sm"
          aria-label={isEn ? "Main navigation" : "เมนูหลัก"}
        >
          {navItems.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "px-3 py-1.5 rounded-[var(--r-ctl)] text-xs xl:text-sm font-medium transition-all",
                  active
                    ? "bg-[var(--glass-strong)] text-[var(--brand-ink)] font-semibold shadow-xs border border-[var(--glass-border)]"
                    : "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--glass-hover)]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions (Theme, Lang, User Avatar Menu / Login, Mobile Toggle) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            className="icon-btn"
            aria-label={isEn ? "Toggle theme" : "สลับโหมดสี"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <svg className="sun" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4.2" />
              <path d="M12 2v2.3M12 19.7V22M2 12h2.3M19.7 12H22M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" />
            </svg>
            <svg className="moon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.2 14.7A8.3 8.3 0 0 1 9.3 3.8a8.5 8.5 0 1 0 10.9 10.9Z" />
            </svg>
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* User Avatar Menu (Authenticated) or Staff Login Button (Guest) */}
          {status === "loading" ? (
            <div
              aria-hidden="true"
              className="h-8 w-8 rounded-full bg-[var(--glass-strong)] animate-pulse"
            />
          ) : user ? (
            <div className="acct">
              <DropdownMenuPrimitive.Root>
                <DropdownMenuPrimitive.Trigger asChild>
                  <button type="button" aria-label={user.name ?? "User menu"}>
                    <span className="who" aria-hidden="true">
                      {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.image}
                          alt=""
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </span>
                    <span className="nm hidden sm:inline-block max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </DropdownMenuPrimitive.Trigger>
                <DropdownMenuPrimitive.Portal>
                  <DropdownMenuPrimitive.Content
                    className="menu-list"
                    align="end"
                    sideOffset={8}
                    style={{ position: "static" }}
                  >
                    <DropdownMenuPrimitive.Label asChild>
                      <div className="px-2.5 py-2">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuPrimitive.Label>
                    <DropdownMenuPrimitive.Separator asChild>
                      <hr />
                    </DropdownMenuPrimitive.Separator>
                    <DropdownMenuPrimitive.Item asChild>
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>{isEn ? "Admin Console" : "ระบบจัดการข้อมูล"}</span>
                      </Link>
                    </DropdownMenuPrimitive.Item>
                    <DropdownMenuPrimitive.Item asChild>
                      <Link href="/me" className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <span>{isEn ? "Profile" : "โปรไฟล์ของฉัน"}</span>
                      </Link>
                    </DropdownMenuPrimitive.Item>
                    {canManageSettings && (
                      <DropdownMenuPrimitive.Item asChild>
                        <Link href="/settings" className="flex items-center gap-2">
                          <SettingsIcon className="h-4 w-4" />
                          <span>{isEn ? "Settings" : "ตั้งค่าระบบ"}</span>
                        </Link>
                      </DropdownMenuPrimitive.Item>
                    )}
                    <DropdownMenuPrimitive.Separator asChild>
                      <hr />
                    </DropdownMenuPrimitive.Separator>
                    <DropdownMenuPrimitive.Item
                      asChild
                      onSelect={() => signOut({ callbackUrl: "/" })}
                    >
                      <button
                        type="button"
                        className="danger flex items-center gap-2 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{isEn ? "Sign Out" : "ออกจากระบบ"}</span>
                      </button>
                    </DropdownMenuPrimitive.Item>
                  </DropdownMenuPrimitive.Content>
                </DropdownMenuPrimitive.Portal>
              </DropdownMenuPrimitive.Root>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-ctl)] text-xs font-semibold border border-[var(--glass-border)] bg-[var(--glass-strong)] hover:bg-[var(--glass-hover)] text-[var(--text)] hover:border-[var(--brand)] transition-colors shadow-xs"
            >
              <ShieldCheck className="h-4 w-4 text-[var(--brand)]" />
              <span>{isEn ? "Staff Login" : "เข้าสู่ระบบ"}</span>
            </Link>
          )}

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="icon-btn lg:hidden"
            aria-label={isEn ? "Toggle navigation menu" : "เปิด/ปิดเมนู"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--glass-border)] bg-[var(--panel)]/95 backdrop-blur-xl px-4 py-4 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-[var(--r-md)] text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--side-active-bg)] text-[var(--side-active-ink)] font-semibold"
                    : "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--glass-hover)]"
                )}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="pt-3 mt-2 border-t border-[var(--glass-border)]">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2 rounded-[var(--r-md)] bg-[var(--glass-strong)]">
                  <span className="who h-8 w-8 rounded-full bg-[var(--brand)] text-[var(--on-brand)] flex items-center justify-center font-bold text-xs">
                    {initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2 px-3 py-2 rounded-[var(--r-md)] text-sm text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--glass-hover)]"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>{isEn ? "Admin Console" : "ระบบจัดการข้อมูล"}</span>
                </Link>
                <Link
                  href="/me"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2 px-3 py-2 rounded-[var(--r-md)] text-sm text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--glass-hover)]"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>{isEn ? "Profile" : "โปรไฟล์ของฉัน"}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    signOut({ callbackUrl: "/" });
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-[var(--r-md)] text-sm text-destructive hover:bg-destructive/10 text-left font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{isEn ? "Sign Out" : "ออกจากระบบ"}</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-[var(--r-md)] text-xs font-semibold border border-[var(--glass-border)] bg-[var(--glass-strong)] text-[var(--text)] hover:border-[var(--brand)]"
              >
                <ShieldCheck className="h-4 w-4 text-[var(--brand)]" />
                <span>{isEn ? "Staff Login" : "เข้าสู่ระบบบุคลากร"}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
