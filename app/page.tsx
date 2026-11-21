"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  ArrowRight,
  Layers,
  GitBranch,
  Boxes,
  Sparkles,
  ShieldCheck,
  Activity,
  Warehouse,
  Truck,
  HardHat,
  Cpu,
  ChevronRight,
  Database,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function LandingPage() {
  // Interactive Simulation Mode in Hero: "fixed" vs "causal"
  const [simMode, setSimMode] = useState<"fixed" | "causal">("causal");

  // Video fallback and accessibility state
  const [videoError, setVideoError] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check prefers-reduced-motion and screen size on mount
  useEffect(() => {
    // Check reduced motion preference
    if (typeof window !== "undefined") {
      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(motionQuery.matches);

      const motionHandler = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
        if (e.matches && videoRef.current) {
          videoRef.current.pause();
        }
      };
      motionQuery.addEventListener("change", motionHandler);

      // Check mobile viewport for video optimization
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);

      return () => {
        motionQuery.removeEventListener("change", motionHandler);
        window.removeEventListener("resize", checkMobile);
      };
    }
  }, []);

  // Motion animation variants respecting reduced motion
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 18 },
    visible: (custom: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.01 : 0.55,
        delay: prefersReducedMotion ? 0 : custom * 0.1,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc] flex flex-col selection:bg-[#0F5C45]/40 selection:text-white relative overflow-hidden">
      
      {/* 1. TOP TELEMETRY NAVIGATION (Above Video) */}
      <header className="relative z-30 border-b border-[#1e293b]/80 bg-[#0c1220]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Operational Status */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#0F5C45] border border-[#16785c] flex items-center justify-center text-white shadow-sm shadow-[#0F5C45]/30 group-hover:bg-[#0c4b38] transition-colors">
                <Activity className="w-4 h-4 text-emerald-200" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  LuminoFlow
                  <span className="text-slate-500 font-normal">|</span>
                  <span className="text-xs text-slate-300 font-mono font-medium">EPC Planner</span>
                </span>
              </div>
            </Link>

            <div className="h-4 w-px bg-slate-800 hidden sm:block" />

            {/* Scope Status Pill with Emerald Identity */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0a1813] border border-[#0F5C45]/40 text-xs font-mono text-slate-200">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span>Kanpur 6-District EPC · Mar 2023–Oct 2026</span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard?agent=open"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0f172a] hover:bg-[#13221b] text-slate-200 border border-[#1e293b] hover:border-[#0F5C45]/60 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>AI Copilot</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-[#0F5C45] hover:bg-[#0c4b38] text-white transition-all shadow-md shadow-[#0F5C45]/30 border border-[#1b7d5e] group"
            >
              <span>Launch Control Room</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:text-[#F28C28] group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. FULL-WIDTH CINEMATIC HERO SECTION WITH EMERALD BACKGROUND VIDEO */}
      <section className="relative w-full overflow-hidden border-b border-[#1e293b]/70 min-h-[660px] lg:min-h-[720px] flex flex-col justify-center">
        
        {/* Layer A: Static Emerald-Themed Fallback Background (Always rendered behind video) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 25%, #0F5C45 0%, #071d16 45%, #0b0f19 90%)`,
          }}
        />

        {/* Layer B: Full-Width Cinematic Background Video */}
        {!prefersReducedMotion && !videoError && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload={isMobile ? "metadata" : "auto"}
            onError={() => setVideoError(true)}
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-1000 opacity-45"
            style={{
              filter: "brightness(0.9) contrast(1.1)",
            }}
          >
            <source src="/videos/lumino-hero.mp4" type="video/mp4" />
          </video>
        )}

        {/* Layer C: Subtle Dark Emerald Gradient Overlay (Preserves 100% Text Readability) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, rgba(7, 29, 22, 0.82) 0%, rgba(10, 26, 20, 0.85) 45%, rgba(11, 15, 25, 0.97) 95%, #0b0f19 100%)`,
          }}
        />

        {/* Layer D: Radial Vignette Overlay for Crisp Typography Contrast */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background: `radial-gradient(circle at 50% 35%, transparent 20%, rgba(7, 24, 18, 0.75) 75%, #0b0f19 100%)`,
          }}
        />

        {/* Layer E: Fine Blueprint Grid Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #0F5C45 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Hero Interactive Content (Z-Index 10: Positioned securely above video & overlays) */}
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column: Mission Narrative, Typography & CTAs */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Eyebrow Badge with Tangerine Accent */}
              <motion.div
                custom={0}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#F28C28]/10 border border-[#F28C28]/40 text-[#F28C28] text-xs font-mono font-semibold tracking-wide"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28]" />
                <span>LUMINO INDUSTRIES · 1,700 POLES CHALLENGE</span>
              </motion.div>

              {/* Primary Headline in Pure White with Emerald Highlight */}
              <motion.h1
                custom={1}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight leading-[1.18]"
              >
                Stop ordering on fixed plans.{" "}
                <span className="text-white block mt-1">
                  Run EPC inventory on what the site{" "}
                  <span className="text-emerald-400 underline decoration-[#0F5C45] underline-offset-8">
                    actually uses.
                  </span>
                </span>
              </motion.h1>

              {/* Subtitle Description */}
              <motion.p
                custom={2}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl font-normal"
              >
                Strictly causal lead-time planning, 44-month ledger reconstruction, and assembly-set bottleneck detection across{" "}
                <strong className="text-white font-semibold">231,076 real Kanpur project records</strong>. Built to eliminate the 1,700-pole idle yard trap without starving field erection.
              </motion.p>

              {/* CTA Action Buttons */}
              <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="flex flex-wrap items-center gap-3 pt-2"
              >
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#0F5C45] hover:bg-[#0c4b38] text-white text-sm font-bold transition-all shadow-lg shadow-[#0F5C45]/30 border border-[#1b7d5e] group"
                >
                  <span>Launch Control Room</span>
                  <ArrowRight className="w-4 h-4 group-hover:text-[#F28C28] group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  href="/dashboard?agent=open"
                  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#0f172a]/90 hover:bg-[#13221b] text-white text-sm font-semibold border border-[#1e293b] hover:border-[#0F5C45]/60 transition-colors shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-[#F28C28]" />
                  <span>Open AI Agent Copilot</span>
                </Link>
              </motion.div>

              {/* Live Operational Scorecard Strip */}
              <motion.div
                custom={4}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="pt-4 grid grid-cols-3 gap-3 border-t border-[#1e293b]/90"
              >
                <div className="p-2.5 rounded-lg bg-[#0f172a]/95 border border-[#1e293b] backdrop-blur-sm">
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Idle Cut</span>
                  <span className="font-mono font-bold text-emerald-400 text-base sm:text-lg">+10.4%</span>
                  <span className="block text-[10px] text-slate-400 font-mono">16 Items Unweighted</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0f172a]/95 border border-[#1e293b] backdrop-blur-sm">
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Service Level</span>
                  <span className="font-mono font-bold text-white text-base sm:text-lg">95.4%</span>
                  <span className="block text-[10px] text-slate-400 font-mono">Simulated Site Uptime</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0f172a]/95 border border-[#1e293b] backdrop-blur-sm">
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Causal Engine</span>
                  <span className="font-mono font-bold text-[#F28C28] text-base sm:text-lg">1.52ms</span>
                  <span className="block text-[10px] text-slate-400 font-mono">Zero Future Peeking</span>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Interactive Animated SVG Telemetry Schematic */}
            <motion.div
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="lg:col-span-6"
            >
              <div className="bg-[#0f172a]/95 rounded-xl border border-[#1e293b] p-5 shadow-2xl space-y-4 backdrop-blur-md">
                
                {/* Schematic Header & Interactive Mode Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e293b]">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      EPC Supply Chain Telemetry Network
                    </span>
                  </div>

                  {/* Segmented Mode Selector */}
                  <div className="flex items-center p-0.5 rounded-lg bg-[#0b0f19] border border-[#1e293b] text-[11px] font-mono">
                    <button
                      onClick={() => setSimMode("fixed")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        simMode === "fixed"
                          ? "bg-[#F28C28]/20 text-[#F28C28] border border-[#F28C28]/50 font-semibold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Fixed Plan (Historical)
                    </button>
                    <button
                      onClick={() => setSimMode("causal")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        simMode === "causal"
                          ? "bg-[#0F5C45] text-white border border-[#1b7d5e] font-semibold shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      LuminoFlow (Causal Plan)
                    </button>
                  </div>
                </div>

                {/* Animated SVG Schematic */}
                <div className="relative bg-[#090d16] p-4 rounded-lg border border-[#1e293b]/80 overflow-hidden">
                  <svg
                    viewBox="0 0 540 200"
                    className="w-full h-auto select-none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Grid overlay lines */}
                    <line x1="0" y1="100" x2="540" y2="100" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                    <line x1="180" y1="0" x2="180" y2="200" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                    <line x1="360" y1="0" x2="360" y2="200" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />

                    {/* Flow Path 1: Vendors -> Godowns */}
                    <path
                      d="M 120 100 L 210 100"
                      stroke={simMode === "fixed" ? "#F28C28" : "#10b981"}
                      strokeWidth={simMode === "fixed" ? "3" : "2"}
                      strokeDasharray={simMode === "fixed" ? "none" : "4 4"}
                    />
                    {/* Animated Telemetry Pulse 1 */}
                    {!prefersReducedMotion && (
                      <motion.circle
                        cx="120"
                        cy="100"
                        r="4"
                        fill={simMode === "fixed" ? "#F28C28" : "#34d399"}
                        animate={{ cx: [120, 210] }}
                        transition={{
                          duration: simMode === "fixed" ? 1.2 : 2.2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    )}

                    {/* Flow Path 2: Godowns -> Site Contractors */}
                    <path
                      d="M 330 100 L 420 100"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    {/* Animated Telemetry Pulse 2 */}
                    {!prefersReducedMotion && (
                      <motion.circle
                        cx="330"
                        cy="100"
                        r="4"
                        fill="#34d399"
                        animate={{ cx: [330, 420] }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    )}

                    {/* NODE 1: VENDORS */}
                    <g transform="translate(10, 45)">
                      <rect
                        width="110"
                        height="110"
                        rx="8"
                        fill="#0f172a"
                        stroke={simMode === "fixed" ? "#b45309" : "#1e293b"}
                        strokeWidth="1.5"
                      />
                      <text x="55" y="28" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        NODE 01
                      </text>
                      <text x="55" y="46" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
                        Vendors
                      </text>
                      <text x="55" y="62" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                        30–150d Lead Time
                      </text>
                      <rect x="15" y="75" width="80" height="22" rx="4" fill="#131d2e" stroke="#1e293b" />
                      <text x="55" y="90" fill={simMode === "fixed" ? "#F28C28" : "#34d399"} fontSize="9.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        {simMode === "fixed" ? "Fixed Dispatch" : "Causal JIT"}
                      </text>
                    </g>

                    {/* NODE 2: 6 KANPUR GODOWNS (CENTRAL BUFFER) */}
                    <g transform="translate(210, 30)">
                      <rect
                        width="120"
                        height="140"
                        rx="8"
                        fill="#0f172a"
                        stroke={simMode === "fixed" ? "#F28C28" : "#0F5C45"}
                        strokeWidth="1.5"
                      />
                      <text x="60" y="22" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        NODE 02
                      </text>
                      <text x="60" y="40" fill="#FFFFFF" fontSize="12" fontWeight="bold" textAnchor="middle">
                        6 Godowns
                      </text>
                      <text x="60" y="54" fill="#94a3b8" fontSize="8.5" textAnchor="middle" fontFamily="monospace">
                        Kanpur Region
                      </text>

                      {/* Dynamic Congestion Bar */}
                      <text x="15" y="72" fill="#94a3b8" fontSize="8.5" fontFamily="monospace">
                        Yard Congestion
                      </text>
                      <rect x="15" y="78" width="90" height="8" rx="3" fill="#1e293b" />
                      <motion.rect
                        x="15"
                        y="78"
                        height="8"
                        rx="3"
                        fill={simMode === "fixed" ? "#F28C28" : "#10b981"}
                        animate={{ width: simMode === "fixed" ? 82 : 24 }}
                        transition={{ duration: 0.6 }}
                      />

                      {/* Stock readout */}
                      <rect x="12" y="94" width="96" height="34" rx="4" fill="#131d2e" stroke="#1e293b" />
                      <text x="60" y="108" fill={simMode === "fixed" ? "#F28C28" : "#34d399"} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        {simMode === "fixed" ? "1,700 Idle Poles" : "Paced Buffer"}
                      </text>
                      <text x="60" y="122" fill="#94a3b8" fontSize="8.5" textAnchor="middle" fontFamily="monospace">
                        {simMode === "fixed" ? "Peak: 27,323 PCS" : "Zero Yard Spill"}
                      </text>
                    </g>

                    {/* NODE 3: CONTRACTORS */}
                    <g transform="translate(420, 45)">
                      <rect width="110" height="110" rx="8" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
                      <text x="55" y="28" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        NODE 03
                      </text>
                      <text x="55" y="46" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
                        Contractors
                      </text>
                      <text x="55" y="62" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                        Line Erection
                      </text>
                      <rect x="15" y="75" width="80" height="22" rx="4" fill="#131d2e" stroke="#1e293b" />
                      <text x="55" y="90" fill="#10b981" fontSize="9.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        Site Erection
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Mode Comparison Telemetry Callout */}
                <AnimatePresence mode="wait">
                  {simMode === "fixed" ? (
                    <motion.div
                      key="fixed"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="p-3 rounded-lg bg-[#F28C28]/10 border border-[#F28C28]/40 text-xs flex items-start gap-2.5"
                    >
                      <AlertTriangle className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-bold text-[#F28C28] font-mono block">
                          Historical Phenomenon: 1,700 Poles Stranded Idle
                        </span>
                        <p className="text-slate-200 text-[11px] leading-relaxed">
                          Under tender delivery schedules, 1,000 poles arrived every month while field contractors only erected 400. Within 3 months, 1,700 poles locked up yard space and working capital.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="causal"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="p-3 rounded-lg bg-[#0F5C45]/20 border border-[#0F5C45]/60 text-xs flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-bold text-emerald-300 font-mono block">
                          LuminoFlow Causal Solution: Site-Paced Reordering
                        </span>
                        <p className="text-slate-200 text-[11px] leading-relaxed">
                          Orders evaluate trailing site consumption (<code className="text-emerald-400">t ≤ t</code>), lead times, and volatility. Slashes idle stock by <strong>10.4% unweighted</strong> (+55.7% aggregate units) while keeping site availability at <strong>95.4%</strong>.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE 3-MODULE BENTO GRID (Main Page Content) */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-14 sm:space-y-18">
        
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#1e293b] pb-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                Core Architecture
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                Three Integrated EPC Control Modules
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Zero Database Overhead · Sub-10ms JSON Delivery · Pure TypeScript Simulation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: SEE IT */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group bg-[#0f172a] rounded-xl border border-[#1e293b] hover:border-[#0F5C45]/80 p-6 flex flex-col justify-between shadow-lg transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-300 px-2 py-0.5 rounded bg-[#0F5C45]/30 border border-[#0F5C45]/50">
                    MODULE 01
                  </span>
                  <Layers className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                    <span>SEE IT</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <span className="text-xs text-slate-400 font-mono block mt-0.5">
                    44-Month Physical Ledger &amp; Dual Idle Isolation
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Separates <strong className="text-white">Godown Yard Stock</strong> (per godown) from <strong className="text-white">Contractor-Held Idle Stock</strong> (project-wide only, adhering to data rules). Complete with interactive year filters and SAP B1 CSV export.
                </p>

                {/* Micro Telemetry Metric */}
                <div className="p-3 rounded-lg bg-[#0b0f19] border border-[#1e293b] font-mono text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Transaction Scope:</span>
                    <span className="text-slate-200">231,076 Rows</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Godowns Tracked:</span>
                    <span className="text-emerald-400 font-semibold">6 Regional Stores</span>
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard?tab=see"
                className="mt-6 flex items-center justify-between text-xs font-bold text-emerald-400 hover:text-emerald-300 pt-3 border-t border-[#1e293b]"
              >
                <span>Audit Physical Ledger</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Card 2: PLAN IT */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group bg-[#0f172a] rounded-xl border border-[#1e293b] hover:border-[#0F5C45]/80 p-6 flex flex-col justify-between shadow-lg transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-300 px-2 py-0.5 rounded bg-[#0F5C45]/30 border border-[#0F5C45]/50">
                    MODULE 02
                  </span>
                  <GitBranch className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                    <span>PLAN IT</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <span className="text-xs text-slate-400 font-mono block mt-0.5">
                    Causal Time-Travel Replay &amp; &ldquo;The Bar&rdquo;
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Live walk-forward simulator running in <strong className="text-white">1.52ms</strong>. Adjust safety buffers, trailing lookback windows, and vendor slippage delays live. Directly compares simulated curves against Lumino actuals.
                </p>

                {/* Micro Telemetry Metric */}
                <div className="p-3 rounded-lg bg-[#0b0f19] border border-[#1e293b] font-mono text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Sim Speed:</span>
                    <span className="text-emerald-400 font-semibold">&lt;2ms Client Engine</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Anti-Leakage:</span>
                    <span className="text-white font-semibold">Strictly Verified (t ≤ t)</span>
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard?tab=plan"
                className="mt-6 flex items-center justify-between text-xs font-bold text-emerald-400 hover:text-emerald-300 pt-3 border-t border-[#1e293b]"
              >
                <span>Launch Causal Simulator</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Card 3: MATCH THE SETS */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group bg-[#0f172a] rounded-xl border border-[#1e293b] hover:border-[#F28C28]/60 p-6 flex flex-col justify-between shadow-lg transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#F28C28] px-2 py-0.5 rounded bg-[#F28C28]/10 border border-[#F28C28]/40">
                    MODULE 03
                  </span>
                  <Boxes className="w-5 h-5 text-slate-400 group-hover:text-[#F28C28] transition-colors" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-200 transition-colors flex items-center gap-1.5">
                    <span>MATCH THE SETS</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <span className="text-xs text-slate-400 font-mono block mt-0.5">
                    Assembly Bottleneck Detector &amp; Unit Anomaly
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Catches data traps in <code className="text-[#F28C28]">sets.csv</code>: identifies that <code className="text-[#F28C28]">MNB010174</code> is tracked in MT instead of NOS (~6,600× error) and automatically suggests cross-godown donor transfers.
                </p>

                {/* Micro Telemetry Metric */}
                <div className="p-3 rounded-lg bg-[#0b0f19] border border-[#1e293b] font-mono text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Ratio Anomalies:</span>
                    <span className="text-[#F28C28] font-semibold">2 Auto-Calibrated</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Heatmap Strip:</span>
                    <span className="text-white font-semibold">44 Months Monitored</span>
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard?tab=sets"
                className="mt-6 flex items-center justify-between text-xs font-bold text-[#F28C28] hover:text-amber-300 pt-3 border-t border-[#1e293b]"
              >
                <span>Inspect Bottlenecks</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

          </div>
        </section>

        {/* 4. GROUNDED SUPPLY-CHAIN AGENT COPILOT CALLOUT STRIP */}
        <section className="bg-gradient-to-r from-[#071d16] via-[#0b1c16] to-[#0f172a] p-6 sm:p-8 rounded-xl border border-[#0F5C45]/50 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#0F5C45]/40 text-emerald-200 border border-[#0F5C45] text-[11px] font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>DETERMINISTIC TOOL-CALLING COPILOT</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Grounded Supply-Chain Agent &amp; Human-in-the-Loop ERP Vouchers
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Executes deterministic server tools (<code className="text-emerald-300">get_godown_stock</code>, <code className="text-emerald-300">get_plan_decision</code>, <code className="text-emerald-300">draft_erp_voucher</code>) in &lt;50ms, shows visible execution traces, and exports signed vouchers directly to SAP B1 CSV.
            </p>
          </div>

          <Link
            href="/dashboard?agent=open"
            className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-lg bg-[#0F5C45] hover:bg-[#0c4b38] text-white text-xs font-bold transition-all shadow-md shadow-[#0F5C45]/40 border border-[#1b7d5e] group"
          >
            <Sparkles className="w-4 h-4 text-[#F28C28]" />
            <span>Open Copilot Drawer</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>

      </main>

      {/* 5. ENGINEERING TRUST STRIP (FOOTER) */}
      <footer className="relative z-20 border-t border-[#1e293b] bg-[#0c1220] py-4 text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span className="text-white font-semibold">LuminoFlow v1.0.0</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">VCH3 Hackathon Edition</span>
          </div>

          {/* Verification Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-300">
            <span className="px-2 py-0.5 rounded bg-[#131d2e] border border-[#1e293b]">
              231,076 Real Moves
            </span>
            <span className="px-2 py-0.5 rounded bg-[#0a1813] border border-[#0F5C45]/60 text-emerald-400">
              Anti-Leakage Verified (t ≤ t)
            </span>
            <span className="px-2 py-0.5 rounded bg-[#1f170f] border border-[#F28C28]/40 text-[#F28C28]">
              2 BOQ Anomalies Auto-Calibrated
            </span>
            <span className="px-2 py-0.5 rounded bg-[#131d2e] border border-[#1e293b] text-white">
              SAP Business One CSV Ready
            </span>
          </div>

          <div className="text-slate-500 text-[11px]">
            Lumino Industries Limited · 1,700 Poles
          </div>
        </div>
      </footer>
    </div>
  );
}
