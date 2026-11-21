"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Activity,
  Layers,
  GitBranch,
  Boxes,
  Sparkles,
  Warehouse,
  Truck,
  HardHat,
  Menu,
  X,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Smooth fade-up animation variants
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: custom * 0.1,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <div className="relative min-h-screen text-[#f8fafc] font-sans antialiased selection:bg-[#0F5C45]/50 selection:text-white overflow-x-hidden bg-transparent">
      
      {/* =========================================================================
          1. GLOBAL PERSISTENT FIXED VIDEO BACKGROUND (Full-Viewport Stationary Canvas)
          ========================================================================= */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#071d16]">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center"
        >
          <source src="/videos/lumino-hero.mp4" type="video/mp4" />
        </video>

        {/* Subtle, crystal-clear global overlay to keep original emerald and glass animation vibrant */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(7, 29, 22, 0.20) 0%, rgba(10, 20, 18, 0.15) 35%, rgba(7, 29, 22, 0.22) 70%, rgba(10, 20, 18, 0.35) 100%)",
          }}
        />

        {/* Soft left-side gradient for headline text contrast without dimming the video */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(7, 29, 22, 0.40) 0%, rgba(7, 29, 22, 0.15) 45%, transparent 80%)",
          }}
        />
      </div>

      {/* =========================================================================
          2. SCROLLABLE PAGE CONTENT (Scrolls smoothly over the stationary video)
          ========================================================================= */}
      <div className="relative z-10 flex flex-col w-full">

        {/* -----------------------------------------------------------------------
            NAVIGATION BAR (Sticky, Luxury Glassmorphism Overlaid Header)
            ----------------------------------------------------------------------- */}
        <header
          className="sticky top-0 z-30 w-full transition-colors"
          style={{
            background: "rgba(7, 29, 22, 0.45)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.14)",
            boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.35), inset 0 -1px 0 0 rgba(255, 255, 255, 0.05)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            
            {/* Brand Logo & Identifier */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-[#0F5C45] border border-[#1b7d5e] flex items-center justify-center text-white shadow-lg shadow-[#0F5C45]/25 group-hover:bg-[#0c4b38] transition-colors">
                <Activity className="w-5 h-5 text-emerald-200" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
                  LuminoFlow
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#0F5C45]/60 text-emerald-200 border border-[#0F5C45] font-semibold">
                    EPC
                  </span>
                </span>
                <span className="text-[10px] text-slate-300 tracking-wider font-mono uppercase">
                  1,700 Poles Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-200">
              <a
                href="#platform"
                className="hover:text-white transition-colors"
              >
                Platform
              </a>
              <a
                href="#problem"
                className="hover:text-white transition-colors"
              >
                The Problem
              </a>
              <a
                href="#impact"
                className="hover:text-white transition-colors"
              >
                Impact
              </a>
              <a
                href="#how-it-works"
                className="hover:text-white transition-colors"
              >
                How It Works
              </a>
              <a
                href="#technology"
                className="hover:text-white transition-colors"
              >
                Technology
              </a>
              <a
                href="https://github.com/Karmansingh09/Lumino-Pulse"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors font-mono text-xs"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </nav>

            {/* Header Right Action Button */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F5C45] hover:bg-[#0c4b38] text-white text-xs font-bold tracking-wide transition-all duration-200 shadow-lg shadow-[#0F5C45]/40 border border-[#1b7d5e] group"
              >
                <span>Launch App</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-[#0c1626]/80 border border-white/10 text-slate-200 hover:text-white backdrop-blur-md"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Navigation Drawer with Matching Glassmorphism */}
          {mobileMenuOpen && (
            <div
              className="md:hidden px-4 pt-2 pb-6 border-b border-white/10 space-y-3"
              style={{
                background: "rgba(12, 22, 38, 0.90)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              <a
                href="#platform"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-slate-200 hover:text-white"
              >
                Platform
              </a>
              <a
                href="#problem"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-slate-200 hover:text-white"
              >
                The Problem
              </a>
              <a
                href="#impact"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-slate-200 hover:text-white"
              >
                Impact
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-slate-200 hover:text-white"
              >
                How It Works
              </a>
              <a
                href="#technology"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-slate-200 hover:text-white"
              >
                Technology
              </a>
              <a
                href="https://github.com/Karmansingh09/Lumino-Pulse"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 py-2 text-sm text-slate-300 hover:text-white font-mono"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#0F5C45] text-white font-bold text-xs shadow-md shadow-[#0F5C45]/30"
                >
                  <span>Launch Control Room</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* -----------------------------------------------------------------------
            HERO SECTION (Transparent, Living Video Canvas Centerpiece)
            ----------------------------------------------------------------------- */}
        <section className="relative w-full min-h-[calc(100vh-80px)] flex flex-col justify-between">
          
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex-1 flex flex-col justify-center">
            <div className="max-w-2xl lg:max-w-3xl space-y-6">
              
              {/* Small Eyebrow Badge (Glass Pill) */}
              <motion.div
                custom={0}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-emerald-300 text-xs font-mono font-medium tracking-wide shadow-lg glass-pill"
              >
                <span className="w-2 h-2 rounded-full bg-[#F28C28] animate-pulse" />
                <span>LUMINO INDUSTRIES · 1,700 POLES EPC CHALLENGE</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                custom={1}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-md"
              >
                Stop Planning Inventory.
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-[#10b981]">
                  Start Thinking Ahead.
                </span>
              </motion.h1>

              {/* Subtitle Description */}
              <motion.p
                custom={2}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="text-base sm:text-lg text-slate-100 leading-relaxed font-normal max-w-xl drop-shadow"
              >
                An intelligent EPC inventory and planning platform that transforms 44 months of operational data into smarter procurement, material transfers and assembly decisions.
              </motion.p>

              {/* Action CTA Buttons */}
              <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="flex flex-wrap items-center gap-4 pt-2"
              >
                <a
                  href="#platform"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#0F5C45] hover:bg-[#0c4b38] text-white text-sm font-semibold transition-all duration-200 shadow-xl shadow-[#0F5C45]/40 border border-[#1b7d5e] group"
                >
                  <span>Explore the Platform</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                {/* Secondary CTA Glass Panel Button */}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-lg text-slate-100 hover:text-white text-sm font-semibold transition-all duration-200 group glass-panel"
                >
                  <span>Launch Control Room</span>
                  <ArrowUpRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </div>

          {/* -----------------------------------------------------------------------
              HERO BOTTOM COMPACT DATA STRIP (Apple-Style Luxury Glass Bar)
              ----------------------------------------------------------------------- */}
          <div className="relative w-full overflow-hidden glass-bar">
            {/* Top Reflection Line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-300">
                
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-8 rounded-full bg-[#0F5C45] shadow-[0_0_12px_#0F5C45]" />
                  <div>
                    <span className="block text-lg sm:text-xl font-bold font-mono text-white tracking-tight drop-shadow-sm">
                      231,076
                    </span>
                    <span className="text-xs text-slate-300 uppercase tracking-wider font-mono">
                      Contractor Moves
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-8 rounded-full bg-emerald-400 shadow-[0_0_12px_#10B981]" />
                  <div>
                    <span className="block text-lg sm:text-xl font-bold font-mono text-white tracking-tight drop-shadow-sm">
                      2,600
                    </span>
                    <span className="text-xs text-slate-300 uppercase tracking-wider font-mono">
                      Receipts
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-8 rounded-full bg-[#F28C28] shadow-[0_0_12px_#F28C28]" />
                  <div>
                    <span className="block text-lg sm:text-xl font-bold font-mono text-white tracking-tight drop-shadow-sm">
                      1,446
                    </span>
                    <span className="text-xs text-slate-300 uppercase tracking-wider font-mono">
                      Transfers
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-8 rounded-full bg-slate-300 shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
                  <div>
                    <span className="block text-lg sm:text-xl font-bold font-mono text-white tracking-tight drop-shadow-sm">
                      44
                    </span>
                    <span className="text-xs text-slate-300 uppercase tracking-wider font-mono">
                      Months of Data
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION A — THE PROBLEM (Luxury Glassmorphic Challenge Panels)
            ========================================================================= */}
        <section id="problem" className="relative w-full py-24 sm:py-32 border-b border-white/10 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            
            {/* Section Header */}
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-[#F28C28]">
                <span className="w-2 h-2 rounded-full bg-[#F28C28]" />
                <span>The Reality of EPC Supply Chains</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                The High Cost of Static Planning
              </h2>
              <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
                Why traditional fixed-plan ordering creates stranded capital, missing assembly parts, and project stalls in power line infrastructure execution.
              </p>
            </div>

            {/* 5 Core Challenges Grid (Translucent Glass Panels) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Challenge 1 */}
              <div className="group relative p-7 rounded-[22px] space-y-4 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between glass-panel">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                <div className="w-11 h-11 rounded-xl glass-icon flex items-center justify-center text-emerald-300">
                  <Warehouse className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Idle Inventory Across Godowns
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  PCC poles and heavy conductors pile up in regional yards for months while adjacent Kanpur districts experience stockouts, locking multi-crore working capital.
                </p>
              </div>

              {/* Challenge 2 */}
              <div className="group relative p-7 rounded-[22px] space-y-4 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between glass-panel">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                <div className="w-11 h-11 rounded-xl glass-icon flex items-center justify-center text-emerald-300">
                  <HardHat className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Materials Held by Contractors
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Materials issued to field contractors sit unerected in local staging areas. Standard ERP ledgers mark them as &ldquo;consumed&rdquo;, blinding planners to real field idle stock.
                </p>
              </div>

              {/* Challenge 3 */}
              <div className="group relative p-7 rounded-[22px] space-y-4 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between glass-panel">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                <div className="w-11 h-11 rounded-xl glass-icon flex items-center justify-center text-emerald-300">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Delayed Procurement Decisions
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  60-to-120 day factory lead times mean orders placed without causal forward planning arrive either months too late to save site schedules or months too early to store safely.
                </p>
              </div>

              {/* Challenge 4 */}
              <div className="group relative p-7 rounded-[22px] space-y-4 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between glass-panel">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                <div className="w-11 h-11 rounded-xl glass-icon flex items-center justify-center text-emerald-300">
                  <Boxes className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Incomplete Assembly Sets
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  A 100 kVA Substation or Pole Top set cannot be commissioned without every single nut, bolt, bracket, and insulator. Stranded parent sets delay milestone sign-offs.
                </p>
              </div>

              {/* Challenge 5 */}
              <div className="group relative p-7 rounded-[22px] space-y-4 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between md:col-span-2 lg:col-span-2 glass-panel">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                <div className="w-11 h-11 rounded-xl glass-icon flex items-center justify-center text-emerald-300">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Lack of Visibility Across Locations
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Six district godowns operated as separate silos. Rather than executing low-cost intra-project transfers between Kanpur South and Fatehpur, procurement re-ordered redundant supplies from factories.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION B — THE LUMINOFLOW PLATFORM (Four Core Pillars in Luxury Glass)
            ========================================================================= */}
        <section id="platform" className="relative w-full py-24 sm:py-32 border-b border-white/10 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            
            {/* Section Header */}
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Core Architecture</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Four Pillars of Operational Grounding
              </h2>
              <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
                Built specifically to solve the 1,700 Poles problem statement with zero future-peeking algorithms and complete ledger fidelity.
              </p>
            </div>

            {/* 4 Feature Cards (Apple-Style Luxury Glass Architecture) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* 1. SEE IT */}
              <div className="group relative p-8 rounded-[24px] space-y-6 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden shadow-2xl glass-panel">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl glass-icon flex items-center justify-center text-emerald-300">
                      <Layers className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded text-emerald-300 glass-pill">
                      01 / SEE IT
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Monthly Stock &amp; Idle Ledger
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Reconstructs the true 44-month inventory timeline across 6 Kanpur godowns. Distinguishes godown stock from contractor-held idle materials to pinpoint exactly where material rests unerected.
                  </p>
                  <ul className="space-y-2 pt-2 text-xs font-mono text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>231,076 move logs reconstructed without synthetic rows</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Contractor idle isolation: Issued vs. Erection verified</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Link
                    href="/dashboard?tab=see"
                    className="inline-flex items-center gap-2 text-xs font-bold font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>Launch Monthly Ledger</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* 2. PLAN IT */}
              <div className="group relative p-8 rounded-[24px] space-y-6 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden shadow-2xl glass-panel">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl glass-icon flex items-center justify-center text-emerald-300">
                      <GitBranch className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded text-emerald-300 glass-pill">
                      02 / PLAN IT
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Causal Simulator &amp; Lead-Time Planner
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    A walk-forward causal simulation engine that recalculates orders and transfers at step t using strictly past consumption. Test vendor delays, safety stock multipliers, and what-if scenarios in under 2ms.
                  </p>
                  <ul className="space-y-2 pt-2 text-xs font-mono text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Zero future peeking: strictly causal trailing windows</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Side-by-side trade-off: Idle Reduction vs. Service Level</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Link
                    href="/dashboard?tab=plan"
                    className="inline-flex items-center gap-2 text-xs font-bold font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>Launch Causal Simulator</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* 3. MATCH THE SETS */}
              <div className="group relative p-8 rounded-[24px] space-y-6 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden shadow-2xl glass-panel">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl glass-icon flex items-center justify-center text-emerald-300">
                      <Boxes className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded text-emerald-300 glass-pill">
                      03 / MATCH THE SETS
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Assembly Bottleneck Detector
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Calculates completed parent sets and uncovers the single missing component stranding full assemblies. Features automated ERP ratio calibration against true site consumption.
                  </p>
                  <ul className="space-y-2 pt-2 text-xs font-mono text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Auto-calibrates 6,600× nut &amp; bolt ERP unit errors</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Donor-godown transfer suggestions to unblock sets</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Link
                    href="/dashboard?tab=sets"
                    className="inline-flex items-center gap-2 text-xs font-bold font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>Launch Bottleneck Detector</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* 4. AI COPILOT */}
              <div className="group relative p-8 rounded-[24px] space-y-6 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden shadow-2xl glass-panel">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl glass-icon flex items-center justify-center text-emerald-300">
                      <Sparkles className="w-6 h-6 text-[#F28C28]" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded text-emerald-300 glass-pill">
                      04 / AI COPILOT
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Tool-Calling Supply-Chain Agent
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    A grounded conversational copilot that queries deterministic tools against the 231,076 move dataset. Displays transparent tool-call traces and drafts human-approved ERP vouchers.
                  </p>
                  <ul className="space-y-2 pt-2 text-xs font-mono text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Drafts SAP B1-compatible PO and Transfer CSV vouchers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Auditable tool-call logs with zero hallucinations</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Link
                    href="/dashboard?agent=open"
                    className="inline-flex items-center gap-2 text-xs font-bold font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>Open AI Agent Copilot</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION C — MEASURABLE INTELLIGENCE (Impact Metrics in Apple Glass)
            ========================================================================= */}
        <section id="impact" className="relative w-full py-24 sm:py-32 border-b border-white/10 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            
            {/* Section Header */}
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-[#F28C28]">
                <span className="w-2 h-2 rounded-full bg-[#F28C28]" />
                <span>Verified Benchmarks</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Measured Impact Across 16 Core Items
              </h2>
              <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
                Derived directly from a 44-month historical walk-forward simulation on Kanpur EPC project data (March 2023 – October 2026).
              </p>
            </div>

            {/* 3 Impact Metric Cards with Apple-Style Luxury Glassmorphism */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Card 1: Idle Stock Reduction */}
              <div className="group relative p-8 rounded-[22px] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden shadow-2xl glass-panel">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

                <div className="space-y-4">
                  <span className="text-xs uppercase font-mono tracking-wider text-slate-300 block font-medium">
                    Average Idle Reduction
                  </span>
                  <div className="text-5xl lg:text-6xl font-extrabold font-mono text-emerald-400 tracking-tight drop-shadow-sm">
                    +10.4%
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans pt-4 border-t border-white/10">
                  Unweighted average across all 16 items compared to historical fixed-plan ordering. High-bulk items like PCC Poles achieve up to +74% reduction.
                </p>
              </div>

              {/* Card 2: Site Service Level */}
              <div className="group relative p-8 rounded-[22px] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden shadow-2xl glass-panel">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

                <div className="space-y-4">
                  <span className="text-xs uppercase font-mono tracking-wider text-slate-300 block font-medium">
                    Site Service Level
                  </span>
                  <div className="text-5xl lg:text-6xl font-extrabold font-mono text-white tracking-tight drop-shadow-sm">
                    95.4%
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans pt-4 border-t border-white/10">
                  Unweighted average simulated field erection availability across all active construction months, maintaining contractor uptime without over-ordering.
                </p>
              </div>

              {/* Card 3: Causal Engine Benchmark */}
              <div className="group relative p-8 rounded-[22px] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden shadow-2xl glass-panel">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

                <div className="space-y-4">
                  <span className="text-xs uppercase font-mono tracking-wider text-slate-300 block font-medium">
                    Causal Engine Benchmark
                  </span>
                  <div className="text-5xl lg:text-6xl font-extrabold font-mono text-[#F28C28] tracking-tight drop-shadow-sm">
                    1.52ms
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans pt-4 border-t border-white/10">
                  Instantaneous in-memory TypeScript causal simulation execution. Zero round-trips to remote databases; strictly instantaneous client-side evaluation.
                </p>
              </div>

            </div>

            {/* Thinner Benchmark Glass Notification Panel */}
            <div className="relative py-4 px-6 rounded-2xl text-xs font-mono text-slate-200 flex items-center gap-3.5 transition-colors duration-200 shadow-xl overflow-hidden glass-notification">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
              <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="leading-relaxed">
                All benchmarks reflect retrospective causal replay across 44 months of Kanpur contractor move logs (Mar 2023 – Oct 2026). They evaluate algorithm trade-offs under zero future peeking rather than guaranteed real-world future savings.
              </span>
            </div>

          </div>
        </section>

        {/* =========================================================================
            SECTION D — HOW IT WORKS (Visual Operational Workflow in Luxury Glass)
            ========================================================================= */}
        <section id="how-it-works" className="relative w-full py-24 sm:py-32 border-b border-white/10 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            
            {/* Section Header */}
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Execution Workflow</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                From Historical Moves to Field Action
              </h2>
              <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
                A four-step closed-loop system connecting ERP records to verified site erection.
              </p>
            </div>

            {/* 4-Step Process Timeline in Apple Glass */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Step 1 */}
              <div className="group relative p-6 rounded-[22px] space-y-4 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between glass-panel">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                <div className="w-9 h-9 rounded-xl glass-icon text-emerald-300 flex items-center justify-center font-mono font-bold text-xs">
                  01
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Historical Data
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ingests 231,076 contractor moves, 2,600 vendor receipts, and 1,446 inter-godown transfers across 44 months without synthetic filler.
                </p>
              </div>

              {/* Step 2 */}
              <div className="group relative p-6 rounded-[22px] space-y-4 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between glass-panel">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                <div className="w-9 h-9 rounded-xl glass-icon text-emerald-300 flex items-center justify-center font-mono font-bold text-xs">
                  02
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Inventory Intelligence
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Separates warehouse physical balance from contractor-held idle materials, exposing unerected yard stock previously marked &ldquo;consumed&rdquo;.
                </p>
              </div>

              {/* Step 3 */}
              <div className="group relative p-6 rounded-[22px] space-y-4 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between glass-panel">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                <div className="w-9 h-9 rounded-xl glass-icon text-emerald-300 flex items-center justify-center font-mono font-bold text-xs">
                  03
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Causal Planning
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Evaluates trailing consumption at each month t under strict lead-time constraints, recommending inter-godown transfers before placing factory POs.
                </p>
              </div>

              {/* Step 4 */}
              <div className="group relative p-6 rounded-[22px] space-y-4 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between glass-panel">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                <div className="w-9 h-9 rounded-xl glass-icon text-emerald-300 flex items-center justify-center font-mono font-bold text-xs">
                  04
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Human-Approved Actions
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Generates audit-ready SAP B1 Purchase Orders and Inter-Godown Transfer Vouchers with human-in-the-loop review and one-click CSV export.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION E — FINAL CTA & TECHNOLOGY SPECIFICATIONS
            ========================================================================= */}
        <section id="technology" className="relative w-full py-24 sm:py-32 bg-transparent">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Ready for Deployment</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-sm">
                Make Every Material Decision Count.
              </h2>
              <p className="text-slate-200 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
                Built for Lumino Industries — 1,700 Poles EPC Challenge. Production-minded, zero-database overhead, 100% reproducible.
              </p>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-[#0F5C45] hover:bg-[#0c4b38] text-white text-base font-bold transition-all duration-200 shadow-xl shadow-[#0F5C45]/40 border border-[#1b7d5e] group"
              >
                <span>Launch Control Room</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Secondary CTA Button in Apple Glass */}
              <a
                href="https://github.com/Karmansingh09/Lumino-Pulse"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-4 rounded-xl text-slate-100 hover:text-white text-base font-semibold transition-all duration-200 glass-panel"
              >
                <span>Explore GitHub</span>
                <ExternalLink className="w-4 h-4 text-slate-300" />
              </a>
            </div>

            {/* Technology Specifications Strip in Glass Badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-300">
              <span className="px-3.5 py-1.5 rounded-lg text-slate-200 glass-pill">
                Next.js 16 (Turbopack)
              </span>
              <span className="px-3.5 py-1.5 rounded-lg text-slate-200 glass-pill">
                React 19
              </span>
              <span className="px-3.5 py-1.5 rounded-lg text-slate-200 glass-pill">
                TypeScript
              </span>
              <span className="px-3.5 py-1.5 rounded-lg text-slate-200 glass-pill">
                Tailwind CSS
              </span>
              <span className="px-3.5 py-1.5 rounded-lg text-slate-200 glass-pill">
                Causal Simulation Engine
              </span>
              <span className="px-3.5 py-1.5 rounded-lg text-slate-200 glass-pill">
                Zero Database Overhead
              </span>
            </div>

          </div>
        </section>

        {/* =========================================================================
            FOOTER (Engineering Trust Strip in Luxury Glass)
            ========================================================================= */}
        <footer
          className="relative w-full py-10 text-xs font-mono text-slate-300"
          style={{
            background: "rgba(7, 29, 22, 0.55)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              
              {/* Brand & Context */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-[#0F5C45] flex items-center justify-center text-white">
                  <Activity className="w-4 h-4 text-emerald-200" />
                </div>
                <span className="text-white font-bold text-sm tracking-tight">
                  LuminoFlow
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-300">
                  1,700 Poles EPC Supply-Chain Platform
                </span>
              </div>

              {/* Quick Navigation Links */}
              <div className="flex items-center gap-6 text-slate-300">
                <a href="#platform" className="hover:text-white transition-colors">Platform</a>
                <a href="#problem" className="hover:text-white transition-colors">Problem</a>
                <a href="#impact" className="hover:text-white transition-colors">Impact</a>
                <a href="#how-it-works" className="hover:text-white transition-colors">Workflow</a>
                <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">
                  Control Room →
                </Link>
              </div>

              {/* Operational Pill */}
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                <span>Kanpur 6-District EPC · Mar 2023 – Oct 2026</span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
              <div>
                © 2026 LuminoFlow. Built for Lumino Industries — Vibe Coders Hackathon Edition 3.
              </div>
              <div>
                16 Items · 6 Godowns · 231,076 Contractor Moves · SAP B1 Vouchers Ready
              </div>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
}
