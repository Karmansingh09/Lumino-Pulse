"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  // Interactive Simulation Mode: "fixed" vs "causal"
  const [simMode, setSimMode] = useState<"fixed" | "causal">("causal");

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc] flex flex-col selection:bg-blue-600/30 selection:text-blue-200 relative overflow-hidden">
      {/* Background Blueprint Grid (Strict Anti-Slop: 1px subtle dark-slate grid) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />
      {/* Subtle radial ambient gradient for contrast (dark slate, no purple/pink neon) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-950/15 blur-[120px] pointer-events-none rounded-full" />

      {/* 1. TOP TELEMETRY NAVIGATION */}
      <header className="relative z-30 border-b border-[#1e293b] bg-[#0c1220]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Operational Status */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-700/60 flex items-center justify-center text-blue-400 group-hover:border-blue-500 transition-colors">
                <Activity className="w-4 h-4" />
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

            {/* Scope Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#131d2e] border border-[#1e293b] text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Kanpur 6-District EPC · Mar 2023–Oct 2026</span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard?agent=open"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#131d2e] hover:bg-[#1e293b] text-slate-200 border border-[#1e293b] hover:border-slate-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>AI Copilot</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-950/50"
            >
              <span>Launch Control Room</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-16 sm:space-y-20">
        
        {/* 2. HERO SECTION (2-COLUMN SPLIT) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Mission Narrative & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-950/60 border border-blue-800/80 text-blue-300 text-xs font-mono font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>LUMINO INDUSTRIES · 1,700 POLES CHALLENGE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight leading-[1.18]">
              Stop ordering on fixed plans.{" "}
              <span className="text-slate-200 block mt-1">
                Run EPC inventory on what the site{" "}
                <span className="text-blue-400 underline decoration-blue-500/40 underline-offset-8">
                  actually uses.
                </span>
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Strictly causal lead-time planning, 44-month ledger reconstruction, and assembly-set bottleneck detection across{" "}
              <strong className="text-white font-semibold">231,076 real Kanpur project records</strong>. Built to eliminate the 1,700-pole idle yard trap without starving field erection.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-900/40 group"
              >
                <span>Launch Control Room</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/dashboard?agent=open"
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#131d2e] hover:bg-[#1e293b] text-slate-200 text-sm font-semibold border border-[#1e293b] hover:border-slate-700 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Open AI Agent Copilot</span>
              </Link>
            </div>

            {/* Live Metrics Proof Badges */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-[#1e293b]/80">
              <div className="p-2.5 rounded-lg bg-[#0f172a] border border-[#1e293b]">
                <span className="block text-[10px] uppercase font-mono text-slate-400">Idle Cut</span>
                <span className="font-mono font-bold text-emerald-400 text-base sm:text-lg">+10.4%</span>
                <span className="block text-[10px] text-slate-500 font-mono">16 Items Unweighted</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0f172a] border border-[#1e293b]">
                <span className="block text-[10px] uppercase font-mono text-slate-400">Service Level</span>
                <span className="font-mono font-bold text-blue-400 text-base sm:text-lg">95.4%</span>
                <span className="block text-[10px] text-slate-500 font-mono">Simulated Site Uptime</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0f172a] border border-[#1e293b]">
                <span className="block text-[10px] uppercase font-mono text-slate-400">Causal Engine</span>
                <span className="font-mono font-bold text-amber-300 text-base sm:text-lg">1.52ms</span>
                <span className="block text-[10px] text-slate-500 font-mono">Zero Future Peeking</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Animated SVG Telemetry Schematic */}
          <div className="lg:col-span-6">
            <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-5 shadow-2xl space-y-4">
              
              {/* Schematic Header & Mode Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e293b]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    EPC Supply Chain Telemetry Network
                  </span>
                </div>

                {/* Segmented Mode Selector */}
                <div className="flex items-center p-0.5 rounded-lg bg-[#0b0f19] border border-[#1e293b] text-[11px] font-mono">
                  <button
                    onClick={() => setSimMode("fixed")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      simMode === "fixed"
                        ? "bg-amber-950/80 text-amber-300 border border-amber-800 font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Fixed Plan (Historical)
                  </button>
                  <button
                    onClick={() => setSimMode("causal")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      simMode === "causal"
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    LuminoFlow (Causal Plan)
                  </button>
                </div>
              </div>

              {/* Animated SVG Schematic */}
              <div className="relative bg-[#090d16] p-4 rounded-lg border border-[#1e293b]/70 overflow-hidden">
                <svg
                  viewBox="0 0 540 200"
                  className="w-full h-auto select-none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Grid overlay lines inside schematic */}
                  <line x1="0" y1="100" x2="540" y2="100" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                  <line x1="180" y1="0" x2="180" y2="200" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                  <line x1="360" y1="0" x2="360" y2="200" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />

                  {/* Flow Path 1: Vendors -> Godowns */}
                  <path
                    d="M 120 100 L 210 100"
                    stroke={simMode === "fixed" ? "#f59e0b" : "#3b82f6"}
                    strokeWidth={simMode === "fixed" ? "3" : "2"}
                    strokeDasharray={simMode === "fixed" ? "none" : "4 4"}
                  />
                  {/* Animated Telemetry Pulse 1 */}
                  <motion.circle
                    cx="120"
                    cy="100"
                    r="4"
                    fill={simMode === "fixed" ? "#f59e0b" : "#60a5fa"}
                    animate={{ cx: [120, 210] }}
                    transition={{
                      duration: simMode === "fixed" ? 1.2 : 2.2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  {/* Flow Path 2: Godowns -> Site Contractors */}
                  <path
                    d="M 330 100 L 420 100"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  {/* Animated Telemetry Pulse 2 */}
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
                    <text x="55" y="46" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
                      Vendors
                    </text>
                    <text x="55" y="62" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">
                      30–150d Lead Time
                    </text>
                    <rect x="15" y="75" width="80" height="22" rx="4" fill="#131d2e" stroke="#1e293b" />
                    <text x="55" y="90" fill={simMode === "fixed" ? "#f59e0b" : "#38bdf8"} fontSize="9.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
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
                      stroke={simMode === "fixed" ? "#ef4444" : "#10b981"}
                      strokeWidth="1.5"
                    />
                    <text x="60" y="22" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                      NODE 02
                    </text>
                    <text x="60" y="40" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">
                      6 Godowns
                    </text>
                    <text x="60" y="54" fill="#64748b" fontSize="8.5" textAnchor="middle" fontFamily="monospace">
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
                      fill={simMode === "fixed" ? "#ef4444" : "#10b981"}
                      animate={{ width: simMode === "fixed" ? 82 : 24 }}
                      transition={{ duration: 0.6 }}
                    />

                    {/* Stock readout */}
                    <rect x="12" y="94" width="96" height="34" rx="4" fill="#131d2e" stroke="#1e293b" />
                    <text x="60" y="108" fill={simMode === "fixed" ? "#f87171" : "#34d399"} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
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
                    <text x="55" y="46" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
                      Contractors
                    </text>
                    <text x="55" y="62" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">
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
                    className="p-3 rounded-lg bg-amber-950/40 border border-amber-900/60 text-xs flex items-start gap-2.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold text-amber-300 font-mono block">
                        Historical Phenomenon: 1,700 Poles Stranded Idle
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
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
                    className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-xs flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold text-emerald-300 font-mono block">
                        LuminoFlow Causal Solution: Site-Paced Reordering
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        Orders evaluate trailing site consumption (<code className="text-emerald-400">t ≤ t</code>), lead times, and volatility. Slashes idle stock by <strong>10.4% unweighted</strong> (+55.7% aggregate units) while keeping site availability at <strong>95.4%</strong>.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* 3. INTERACTIVE 3-MODULE BENTO GRID (STAGGERED ENTRANCE) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#1e293b] pb-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
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
              className="group bg-[#0f172a] rounded-xl border border-[#1e293b] hover:border-blue-500/50 p-6 flex flex-col justify-between shadow-lg transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-950/80 border border-blue-900">
                    MODULE 01
                  </span>
                  <Layers className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
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
                className="mt-6 flex items-center justify-between text-xs font-bold text-blue-400 hover:text-blue-300 pt-3 border-t border-[#1e293b]"
              >
                <span>Audit Physical Ledger</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Card 2: PLAN IT */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group bg-[#0f172a] rounded-xl border border-[#1e293b] hover:border-blue-500/50 p-6 flex flex-col justify-between shadow-lg transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-900">
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
                    <span className="text-blue-400 font-semibold">Strictly Verified (t ≤ t)</span>
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
              className="group bg-[#0f172a] rounded-xl border border-[#1e293b] hover:border-blue-500/50 p-6 flex flex-col justify-between shadow-lg transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-900">
                    MODULE 03
                  </span>
                  <Boxes className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                    <span>MATCH THE SETS</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <span className="text-xs text-slate-400 font-mono block mt-0.5">
                    Assembly Bottleneck Detector &amp; Unit Anomaly
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Catches data traps in <code className="text-amber-300">sets.csv</code>: identifies that <code className="text-amber-300">MNB010174</code> is tracked in MT instead of NOS (~6,600× error) and automatically suggests cross-godown donor transfers.
                </p>

                {/* Micro Telemetry Metric */}
                <div className="p-3 rounded-lg bg-[#0b0f19] border border-[#1e293b] font-mono text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Ratio Anomalies:</span>
                    <span className="text-amber-400 font-semibold">2 Auto-Calibrated</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Heatmap Strip:</span>
                    <span className="text-blue-400 font-semibold">44 Months Monitored</span>
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard?tab=sets"
                className="mt-6 flex items-center justify-between text-xs font-bold text-amber-400 hover:text-amber-300 pt-3 border-t border-[#1e293b]"
              >
                <span>Inspect Bottlenecks</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

          </div>
        </section>

        {/* 4. AI AGENT COPILOT CALLOUT STRIP */}
        <section className="bg-gradient-to-r from-[#0f172a] via-[#111a2e] to-[#0f172a] p-6 sm:p-8 rounded-xl border border-blue-900/50 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[11px] font-mono">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>DETERMINISTIC TOOL-CALLING COPILOT</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Grounded Supply-Chain Agent &amp; Human-in-the-Loop ERP Vouchers
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Executes deterministic server tools (<code className="text-blue-300">get_godown_stock</code>, <code className="text-blue-300">get_plan_decision</code>, <code className="text-blue-300">draft_erp_voucher</code>) in &lt;50ms, shows visible execution traces, and exports signed vouchers directly to SAP B1 CSV.
            </p>
          </div>

          <Link
            href="/dashboard?agent=open"
            className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-950/60"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>Open Copilot Drawer</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

      </main>

      {/* 5. ENGINEERING TRUST STRIP (FOOTER) */}
      <footer className="relative z-20 border-t border-[#1e293b] bg-[#0c1220] py-4 text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-300 font-semibold">LuminoFlow v1.0.0</span>
            <span className="text-slate-600">·</span>
            <span>VCH3 Hackathon Edition</span>
          </div>

          {/* Verification Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-300">
            <span className="px-2 py-0.5 rounded bg-[#131d2e] border border-[#1e293b]">
              231,076 Real Moves
            </span>
            <span className="px-2 py-0.5 rounded bg-[#131d2e] border border-[#1e293b] text-emerald-400">
              Anti-Leakage Verified (t ≤ t)
            </span>
            <span className="px-2 py-0.5 rounded bg-[#131d2e] border border-[#1e293b] text-amber-300">
              2 BOQ Anomalies Auto-Calibrated
            </span>
            <span className="px-2 py-0.5 rounded bg-[#131d2e] border border-[#1e293b] text-blue-300">
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
