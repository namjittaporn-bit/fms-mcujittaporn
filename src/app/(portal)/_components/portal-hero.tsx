"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  Compass,
  Zap,
} from "lucide-react";

export interface PortalHeroProps {
  locale: "th" | "en";
}

export function PortalHero({ locale }: PortalHeroProps) {
  const isEn = locale === "en";
  const [activeCard, setActiveCard] = React.useState<number>(1);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <section className="relative overflow-hidden bg-background text-foreground pt-12 pb-24 sm:pt-16 sm:pb-32 border-b border-border/40">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-3xl opacity-60"
        aria-hidden="true"
      />

      <div className="container relative mx-auto max-w-7xl px-4 sm:px-8">
        {/* Top Brand Tag & Subtitle (MotionSites Minimalist Header Style) */}
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="font-serif font-black text-2xl sm:text-3xl tracking-tight text-foreground flex items-center gap-1.5">
              <span className="inline-block h-6 w-6 rounded-md bg-foreground text-background text-center text-sm font-sans font-bold leading-6">
                F
              </span>
              FMS Studio
            </span>
          </div>

          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {isEn
              ? "The digital innovation studio of Faculty of Technology & Management"
              : "ศูนย์กลางการศึกษา วิจัย และนวัตกรรมดิจิทัล คณะเทคโนโลยีและการจัดการ"}
          </p>

          {/* Main Editorial Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-foreground leading-[1.08]">
            {isEn ? (
              <>
                Build the next wave,
                <br />
                <span className="italic font-normal">the bold way.</span>
              </>
            ) : (
              <>
                สร้างสรรค์คลื่นลูกใหม่,
                <br />
                <span className="italic font-normal">ด้วยวิสัยทัศน์ที่ก้าวล้ำ</span>
              </>
            )}
          </h1>

          {/* Narrative Paragraphs */}
          <div className="space-y-3.5 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
            <p>
              {isEn
                ? "Empowering learners, researchers, and innovators through modern curriculum, advanced technology, and high-impact digital solutions designed for tomorrow."
                : "ขับเคลื่อนศักยภาพของนักศึกษาและบุคลากร ด้วยการเรียนรู้สมัยใหม่ งานวิจัยประยุกต์ และเทคโนโลยีดิจิทัลที่ตอบสนองความเปลี่ยนแปลงแห่งอนาคต"}
            </p>
            <p>
              {isEn
                ? "Our faculty is purposefully forward-looking. We guide academic and research excellence across every program, supported by dedicated faculty members who move fast without compromising quality."
                : "คณะของเรามุ่งเน้นการสร้างสรรค์นวัตกรรมอย่างมีทิศทาง ผสานความร่วมมือกับภาคอุตสาหกรรม และสร้างประสบการณ์การเรียนรู้ที่พร้อมสำหรับความสำเร็จในยุคดิจิทัล"}
            </p>
            <p className="font-mono text-xs font-semibold text-foreground pt-1">
              {isEn
                ? "Programs start every semester • 100% digital workflows."
                : "เปิดรับสมัครทุกภาคการศึกษา • ระบบบริหารจัดการดิจิทัล 100%"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/news"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-medium text-sm shadow-sm hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{isEn ? "Start a chat" : "อ่านข่าวประชาสัมพันธ์"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/curriculum"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-border bg-background/80 hover:bg-muted text-foreground font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{isEn ? "View projects" : "ดูหลักสูตรการศึกษา"}</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </Link>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* Showcase Gallery (Curved Horizon 3-Card Carousel with 3D Tilt)    */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative mt-16 sm:mt-24 pt-6 perspective-[1200px]"
        >
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-transform duration-300 ease-out"
            style={{
              transform: `rotateX(${-mousePos.y * 6}deg) rotateY(${mousePos.x * 8}deg)`,
            }}
          >
            {/* Card 1: Left - Cherry Blossom Sky Theme ("Our Sky") */}
            <div
              onClick={() => setActiveCard(0)}
              className={`group relative h-[320px] sm:h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden border border-border/60 bg-card shadow-xl transition-all duration-500 cursor-pointer ${
                activeCard === 0
                  ? "ring-2 ring-foreground/40 scale-[1.02]"
                  : "hover:scale-[1.01] opacity-90 hover:opacity-100"
              }`}
            >
              {/* Sky and clouds backdrop */}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-300 via-sky-400 to-rose-200 dark:from-sky-900 dark:via-indigo-950 dark:to-rose-950">
                {/* Cloud and blossom effect */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_60%)]" />
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-rose-300/40 blur-2xl" />
                <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>

              {/* Card top bar badge */}
              <div className="relative p-5 flex items-center justify-between z-10 text-white">
                <span className="font-mono text-[10px] tracking-wider uppercase bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                  {isEn ? "Voyages • 2026" : "การศึกษา • 2569"}
                </span>
                <span className="text-xs opacity-80 flex items-center gap-1">
                  <Compass className="h-3.5 w-3.5" />
                  <span>{isEn ? "Open View" : "เปิดมุมมอง"}</span>
                </span>
              </div>

              {/* Bottom text */}
              <div className="absolute bottom-5 left-5 right-5 z-10 text-white space-y-1">
                <p className="font-serif italic text-3xl font-light tracking-tight drop-shadow-md">
                  Our Sky
                </p>
                <p className="text-xs text-white/80 line-clamp-1">
                  {isEn
                    ? "Academic Programs & Student Experience"
                    : "หลักสูตรระดับปริญญาและประสบการณ์การเรียนรู้"}
                </p>
              </div>
            </div>

            {/* Card 2: Center - The Flagship Vortex / Cosmic Hub (Main Focus) */}
            <div
              onClick={() => setActiveCard(1)}
              className={`group relative h-[340px] sm:h-[420px] -mt-2 sm:-mt-4 rounded-2xl sm:rounded-3xl overflow-hidden border border-border/80 bg-neutral-950 shadow-2xl transition-all duration-500 cursor-pointer ${
                activeCard === 1
                  ? "ring-2 ring-primary/80 scale-[1.03]"
                  : "hover:scale-[1.02] opacity-95 hover:opacity-100"
              }`}
            >
              {/* Cosmic Vortex Backdrop */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#1e1b4b_0%,#09090b_70%)]" />
                {/* Spiral light rays */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-[conic-gradient(from_0deg,transparent_0_300deg,#38bdf8_360deg)] opacity-20 animate-spin [animation-duration:15s]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full border border-sky-400/30 blur-[1px] animate-ping [animation-duration:4s]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full bg-sky-500/20 blur-2xl" />
              </div>

              {/* Card top mini nav */}
              <div className="relative p-5 flex items-center justify-between z-10 text-white">
                <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[10px] uppercase">
                    {isEn ? "Live System" : "ระบบออนไลน์"}
                  </span>
                </div>
                <span className="text-xs font-mono opacity-60">FMS-2026</span>
              </div>

              {/* The Signature MotionSites Floating Pill over center */}
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div
                  className="inline-flex items-center gap-2 p-1.5 pr-4 rounded-full bg-white/95 dark:bg-black/90 text-neutral-900 dark:text-white shadow-2xl border border-white/40 dark:border-neutral-800 backdrop-blur-xl transition-transform duration-300 group-hover:scale-110"
                  style={{
                    transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 15}px)`,
                  }}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-serif font-black text-sm">
                    V
                  </span>
                  <span className="font-sans font-semibold text-xs tracking-tight">
                    {isEn ? "Start a chat" : "เข้าสู่ระบบศูนย์ข้อมูล"}
                  </span>
                </div>
              </div>

              {/* Bottom text */}
              <div className="absolute bottom-5 left-5 right-5 z-10 text-white space-y-1">
                <p className="font-serif text-2xl font-bold tracking-tight text-white drop-shadow-md">
                  Vortex Interactive Core
                </p>
                <p className="text-xs text-neutral-300 line-clamp-1">
                  {isEn
                    ? "Full Digital Transformation & Integrated E-Services"
                    : "ระบบสารสนเทศและการบริการอิเล็กทรอนิกส์ครบวงจร"}
                </p>
              </div>
            </div>

            {/* Card 3: Right - Deep Celestial Theme ("Velorah / Ignite") */}
            <div
              onClick={() => setActiveCard(2)}
              className={`group relative h-[320px] sm:h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden border border-border/60 bg-card shadow-xl transition-all duration-500 cursor-pointer ${
                activeCard === 2
                  ? "ring-2 ring-foreground/40 scale-[1.02]"
                  : "hover:scale-[1.01] opacity-90 hover:opacity-100"
              }`}
            >
              {/* Deep midnight space backdrop */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-950 via-slate-900 to-indigo-950 text-white">
                <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-teal-500/20 blur-3xl" />
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_bottom_left,#06b6d4_0%,transparent_60%)]" />
                <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              </div>

              {/* Card top bar badge */}
              <div className="relative p-5 flex items-center justify-between z-10 text-white">
                <span className="font-mono text-[10px] tracking-wider uppercase bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                  {isEn ? "Research Lab" : "ศูนย์วิจัย"}
                </span>
                <span className="text-xs opacity-80 flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{isEn ? "Advanced" : "ขั้นสูง"}</span>
                </span>
              </div>

              {/* Bottom text */}
              <div className="absolute bottom-5 left-5 right-5 z-10 text-white space-y-1">
                <p className="font-serif italic text-3xl font-light tracking-tight drop-shadow-md">
                  Where ideas ignite
                </p>
                <p className="text-xs text-white/80 line-clamp-1">
                  {isEn
                    ? "Innovative Research & Community Engagement"
                    : "งานวิจัยและผลงานสร้างสรรค์เพื่อพัฒนาสังคม"}
                </p>
              </div>
            </div>
          </div>

          {/* Micro indicator footer under the carousel */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveCard(idx)}
                aria-label={`Select showcase card ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeCard === idx
                    ? "w-8 bg-foreground"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
