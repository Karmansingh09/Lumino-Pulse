"use client";

import React, { useState } from "react";
import {
  Layers,
  Calendar,
  Package,
  TrendingDown,
  ShieldCheck,
  Award,
  ChevronRight,
  ExternalLink,
  Sparkles,
  GitBranch,
  Boxes,
} from "lucide-react";
import { MetaData, LedgerData } from "@/types";
import SeeItTab from "@/components/SeeItTab";
import PlanItTab from "@/components/PlanItTab";
import ProjectScorecard from "@/components/ProjectScorecard";

interface DashboardShellProps {
  meta: MetaData;
  ledger: LedgerData;
}

type TabType = "SEE_IT" | "PLAN_IT" | "MATCH_SETS";

export default function DashboardShell({ meta, ledger }: DashboardShellProps) {
  const [activeTab, setActiveTab] = useState<TabType>("SEE_IT");
  const [selectedItem, setSelectedItem] = useState<string>("MPO010014"); // Default: PCC Pole 8.5 MTR 180 KG
  const [selectedGodown, setSelectedGodown] = useState<string>("ALL");
  const [isScorecardOpen, setIsScorecardOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc] flex flex-col">
      {/* Top Navigation & Header Bar */}
      <header className="border-b border-[#1e293b] bg-[#0c1220]/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
            {/* Title & Scope */}
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  <span>LuminoFlow</span>
                  <span className="text-slate-500 font-normal">|</span>
                  <span className="text-slate-300 font-semibold text-sm">1,700 Poles EPC Planner</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  VCH3 Edition
                </span>
              </div>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                Kanpur 6-District Power Line Project · Mar 2023 – Oct 2026 · 16 Items · 6 Active Godowns
              </p>
            </div>

            {/* Quick Metrics & Scorecard Toggle */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-4 bg-[#131d2e] px-3 py-1.5 rounded-lg border border-[#1e293b] text-xs">
                <div>
                  <span className="text-[#94a3b8]">Overall Idle Cut:</span>{" "}
                  <span className="font-bold text-emerald-400">
                    +{meta.overall_scorecard.idle_reduction_pct}%
                  </span>
                </div>
                <div className="h-3 w-px bg-slate-700" />
                <div>
                  <span className="text-[#94a3b8]">Service Level:</span>{" "}
                  <span className="font-bold text-blue-400">
                    {meta.overall_scorecard.service_level_pct}%
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsScorecardOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/80 text-emerald-300 text-xs font-semibold transition-colors shadow-sm"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Project Scorecard</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 border-t border-[#1e293b]/70 pt-2 -mb-px">
            <button
              onClick={() => setActiveTab("SEE_IT")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === "SEE_IT"
                  ? "border-blue-500 text-blue-400 bg-blue-500/5"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>1. SEE IT (Monthly Stock &amp; Idle Ledger)</span>
            </button>

            <button
              onClick={() => setActiveTab("PLAN_IT")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === "PLAN_IT"
                  ? "border-blue-500 text-blue-400 bg-blue-500/5"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>2. PLAN IT (Causal Replay &amp; &ldquo;The Bar&rdquo;)</span>
            </button>

            <button
              onClick={() => setActiveTab("MATCH_SETS")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === "MATCH_SETS"
                  ? "border-blue-500 text-blue-400 bg-blue-500/5"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>3. MATCH THE SETS (Assembly Bottlenecks)</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Milestone 4
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "SEE_IT" && (
          <SeeItTab
            selectedItem={selectedItem}
            onSelectItem={setSelectedItem}
            selectedGodown={selectedGodown}
            onSelectGodown={setSelectedGodown}
            items={meta.items}
            godowns={meta.godowns}
            ledgerData={ledger}
          />
        )}

        {activeTab === "PLAN_IT" && (
          <PlanItTab
            selectedItem={selectedItem}
            onSelectItem={setSelectedItem}
            items={meta.items}
            godowns={meta.godowns}
            ledgerData={ledger}
            meta={meta}
          />
        )}

        {activeTab === "MATCH_SETS" && (
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-8 text-center max-w-2xl mx-auto my-12 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-4">
              <Boxes className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">
              Tab 3: MATCH THE SETS — Assembly Bottleneck Detector
            </h2>
            <p className="text-xs text-[#94a3b8] leading-relaxed mb-6">
              Milestone 4 will implement the 3 Parent Set detectors, the 6-godown bottleneck grid, limiting child
              component breakdown, and the Calibrated Site Ratio vs. Raw BOQ Ratio toggle with the MT/Lug warning banner.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-800 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Dataset pre-computed in public/data/sets.json (Ready for Milestone 4)</span>
            </div>
          </div>
        )}
      </main>

      {/* Project Scorecard Modal */}
      <ProjectScorecard
        meta={meta}
        isOpen={isScorecardOpen}
        onClose={() => setIsScorecardOpen(false)}
      />

      {/* Industrial Footer */}
      <footer className="border-t border-[#1e293b] bg-[#0c1220] py-4 text-xs text-[#94a3b8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>LuminoFlow</strong> · Built for Lumino Industries &ldquo;1,700 Poles&rdquo; (VCH3 Hackathon)
          </div>
          <div className="text-slate-400">
            235,122 Transactions · Zero Database Overhead · Strictly Causal C++-Speed Simulation
          </div>
        </div>
      </footer>
    </div>
  );
}
