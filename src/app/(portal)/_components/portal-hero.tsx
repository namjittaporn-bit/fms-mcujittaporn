"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Newspaper,
  ArrowRight,
  GraduationCap,
  Award,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PortalHeroProps {
  locale: "th" | "en";
  mascotSrc?: string;
}

export function PortalHero({
  locale,
  mascotSrc = "/images/hero-mascot.jpg",
}: PortalHeroProps) {
  const isEn = locale === "en";
  const [meowCount, setMeowCount] = React.useState(0);
  const [showHeart, setShowHeart] = React.useState(false);

  const handleMascotClick = () => {
    setMeowCount((prev) => prev + 1);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1200);
  };

  return (
    <section className="relative overflow-hidden border-b border-[var(--glass-border)] bg-gradient-to-b from-[var(--brand)]/10 via-background to-background py-16 sm:py-20 px-4 sm:px-8">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[var(--brand-glow)] blur-3xl opacity-20"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 -right-32 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl opacity-20"
        aria-hidden="true"
      />

      <div className="container relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Headline & Action Buttons (7 Cols) */}
          <div className="space-y-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-strong)] px-3.5 py-1.5 text-xs font-semibold text-[var(--brand-ink)] shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-[var(--brand)]" />
              <span>
                {isEn
                  ? "Faculty Web Platform • Next-Gen Portal"
                  : "แพลตฟอร์มสารสนเทศคณะ • ระบบบริการดิจิทัล"}
              </span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-[var(--text)] leading-[1.15]">
              {isEn ? (
                <>
                  Connecting Education,{" "}
                  <span className="bg-gradient-to-r from-[var(--brand)] via-amber-500 to-[var(--brand-light)] bg-clip-text text-transparent">
                    Research & Innovation
                  </span>
                </>
              ) : (
                <>
                  เชื่อมต่อการศึกษา วิจัย{" "}
                  <span className="bg-gradient-to-r from-[var(--brand)] via-amber-500 to-[var(--brand-light)] bg-clip-text text-transparent">
                    และนวัตกรรมเพื่ออนาคต
                  </span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-2)] leading-relaxed max-w-2xl">
              {isEn
                ? "Welcome to the Faculty of Technology and Management portal. Discover our latest academic programs, news announcements, faculty directory, and digital services."
                : "ยินดีต้อนรับสู่ศูนย์กลางข้อมูลและบริการออนไลน์ คณะเทคโนโลยีและการจัดการ ติดตามข่าวสาร ทุนการศึกษา กิจกรรม และเข้าถึงบริการสำหรับบุคลากรและนักศึกษาอย่างสะดวกรวดเร็ว"}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/news">
                <Button size="lg" className="gap-2 shadow-sm font-semibold">
                  <Newspaper className="h-4 w-4" />
                  <span>{isEn ? "Explore News" : "อ่านข่าวประชาสัมพันธ์"}</span>
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 border-[var(--glass-border)] bg-[var(--glass-strong)] font-semibold hover:border-[var(--brand)]"
                >
                  <span>{isEn ? "Internal Portal" : "สำหรับบุคลากรภายใน"}</span>
                  <ArrowRight className="h-4 w-4 text-[var(--brand)]" />
                </Button>
              </Link>
            </div>

            {/* Quick Metrics Ribbon */}
            <div className="pt-6 border-t border-[var(--glass-border)] grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-[var(--text)]">5+</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {isEn ? "Academic Programs" : "หลักสูตรระดับปริญญา"}
                </p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-[var(--text)]">100%</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {isEn ? "Digital Services" : "บริการออนไลน์เต็มรูปแบบ"}
                </p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-[var(--text)]">24/7</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {isEn ? "Information Access" : "เข้าถึงข้อมูลได้ตลอดเวลา"}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Animated Mascot (5 Cols) */}
          <div className="relative flex items-center justify-center lg:col-span-5">
            {/* Glowing Aura Background */}
            <div
              className="animate-hero-glow absolute h-72 w-72 sm:h-80 sm:w-80 rounded-full bg-gradient-to-tr from-[var(--brand)]/40 via-amber-400/30 to-rose-400/20 blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            {/* Orbital Rings Background */}
            <div
              className="pointer-events-none absolute h-[340px] w-[340px] rounded-full border border-[var(--glass-border)] border-dashed opacity-40 animate-spin [animation-duration:40s]"
              aria-hidden="true"
            />

            {/* Floating Mascot Card */}
            <div
              className="animate-hero-float relative z-10 flex flex-col items-center cursor-pointer group"
              onClick={handleMascotClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleMascotClick();
                }
              }}
              aria-label={isEn ? "Click mascot for a fun surprise" : "คลิกที่มาสคอตเพื่อทักทาย"}
            >
              {/* Cute Speech Bubble above mascot */}
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--panel)]/90 px-3.5 py-1 text-xs font-semibold text-[var(--text)] shadow-md backdrop-blur-md transition-transform group-hover:scale-105">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>
                  {meowCount > 0
                    ? isEn
                      ? `Meow! x${meowCount} 🐾`
                      : `เหมียว! ครั้งที่ ${meowCount} 🐾`
                    : isEn
                    ? "Welcome to Faculty Portal! ✨"
                    : "ยินดีต้อนรับสู่ คณะเทคโนโลยีและการจัดการ! ✨"}
                </span>
              </div>

              {/* Mascot Container Frame */}
              <div className="relative overflow-hidden rounded-3xl border-4 border-white/80 dark:border-white/20 bg-white shadow-2xl p-4 sm:p-6 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] group-active:scale-95">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mascotSrc}
                  alt={isEn ? "Faculty Mascot" : "มาสคอตคณะเทคโนโลยีและการจัดการ"}
                  className="h-60 w-60 sm:h-72 sm:w-72 object-contain transition-transform duration-300 group-hover:rotate-1"
                />

                {/* Heart Pop animation on click */}
                {showHeart && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in zoom-in-50 fade-in duration-300">
                    <Heart className="h-20 w-20 fill-rose-500 text-rose-500 drop-shadow-lg" />
                  </div>
                )}
              </div>

              {/* Floating Badge 1: Top Left */}
              <div className="animate-hero-badge absolute -top-4 -left-6 hidden sm:flex items-center gap-2 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-strong)]/90 px-3 py-2 text-xs font-semibold text-[var(--text)] shadow-lg backdrop-blur-md">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--brand)] text-[var(--on-brand)]">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-[11px] leading-tight">Smart Campus</p>
                  <p className="text-[10px] text-[var(--text-muted)]">2026 Ready</p>
                </div>
              </div>

              {/* Floating Badge 2: Bottom Right */}
              <div className="animate-hero-badge-delayed absolute -bottom-4 -right-6 hidden sm:flex items-center gap-2 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-strong)]/90 px-3 py-2 text-xs font-semibold text-[var(--text)] shadow-lg backdrop-blur-md">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-[11px] leading-tight">Innovate & Excel</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Excellence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
