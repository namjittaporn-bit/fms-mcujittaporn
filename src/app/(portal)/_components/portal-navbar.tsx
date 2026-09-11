"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { ShieldCheck, Menu, X, GraduationCap } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
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

  return (
    <header className="adm-head sticky top-0 z-40 w-full border-b border-[var(--glass-border)] bg-[var(--glass)] backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Brand Block (Matches AdminShell .brand-blk) */}
        <Link
          href="/"
          className="brand-blk !w-auto max-w-[280px] sm:max-w-md transition hover:opacity-90"
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

        {/* Right Actions (Theme, Lang, Login, Mobile Toggle) */}
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

          {/* Staff Login Button */}
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-ctl)] text-xs font-semibold border border-[var(--glass-border)] bg-[var(--glass-strong)] hover:bg-[var(--glass-hover)] text-[var(--text)] hover:border-[var(--brand)] transition-colors shadow-xs"
          >
            <ShieldCheck className="h-4 w-4 text-[var(--brand)]" />
            <span>{isEn ? "Staff Login" : "เข้าสู่ระบบ"}</span>
          </Link>

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
            <Link
              href="/login"
              onClick={closeMobileMenu}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-[var(--r-md)] text-xs font-semibold border border-[var(--glass-border)] bg-[var(--glass-strong)] text-[var(--text)] hover:border-[var(--brand)]"
            >
              <ShieldCheck className="h-4 w-4 text-[var(--brand)]" />
              <span>{isEn ? "Staff Login" : "เข้าสู่ระบบบุคลากร"}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
