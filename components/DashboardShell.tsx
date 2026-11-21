"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  Calendar,
  Package,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  FileSpreadsheet,
  Award,
  ChevronRight,
  ExternalLink,
  Sparkles,
  GitBranch,
  Boxes,
  Database,
} from "lucide-react";
import { MetaData, LedgerData, SetsData } from "@/types";
import SeeItTab from "@/components/SeeItTab";
import PlanItTab from "@/components/PlanItTab";
import MatchSetsTab from "@/components/MatchSetsTab";
import ProjectScorecard from "@/components/ProjectScorecard";
import LuminoAgentPanel from "@/components/LuminoAgentPanel";

interface DashboardShellProps {
  meta: MetaData;
  ledger: LedgerData;
  setsData: SetsData;
}

type TabType = "SEE_IT" | "PLAN_IT" | "MATCH_SETS";

export default function DashboardShell({ meta, ledger, setsData }: DashboardShellProps) {
  const [activeTab, setActiveTab] = useState<TabType>("SEE_IT");
  const [selectedItem, setSelectedItem] = useState<string>("MPO010014"); // Default: PCC Pole 8.5 MTR 180 KG
  const [selectedGodown, setSelectedGodown] = useState<string>("ALL");
  const [isScorecardOpen, setIsScorecardOpen] = useState<boolean>(false);
  const [isAgentOpen, setIsAgentOpen] = useState<boolean>(false);

  // Compute unweighted arithmetic means across all 16 items per Production Guardrail A
  const { unweightedAvgIdleReduction, unweightedAvgServiceLevel, validItemsCount } = useMemo(() => {
    const items = meta.overall_scorecard?.items_scorecard || [];
    const count = items.length;
    if (count === 0) {
      return { unweightedAvgIdleReduction: "0.0", unweightedAvgServiceLevel: "0.0", validItemsCount: 0 };
    }
    const idleMean = (items.reduce((acc, it) => acc + (it.reduction_pct || 0), 0) / count).toFixed(1);
    const serviceMean = (items.reduce((acc, it) => acc + (it.service_level || 0), 0) / count).toFixed(1);
    return {
      unweightedAvgIdleReduction: idleMean,
      unweightedAvgServiceLevel: serviceMean,
      validItemsCount: count,
    };
  }, [meta.overall_scorecard]);

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

              <button
                onClick={() => setIsAgentOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-900/30"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                <span>AI Copilot &amp; Vouchers</span>
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
            </button>
          </div>
        </div>
      </header>

      {/* Milestone 6: Executive Project Summary Strip (Visible across all tabs) */}
      <div className="bg-[#0e1626] border-b border-[#1e293b] px-4 sm:px-6 lg:px-8 py-2.5 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Dataset Scope */}
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex items-center gap-1.5 font-bold text-slate-200">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>Dataset Scope:</span>
            </span>
            <span className="font-mono text-slate-300">
              <strong className="text-white">231,076</strong> contractor moves · <strong className="text-white">2,600</strong> receipts · <strong className="text-white">1,446</strong> transfers · <strong className="text-white">44</strong> months
            </span>
            <span className="text-slate-500 hidden xl:inline">(6 Kanpur Region Godowns)</span>
          </div>

          {/* Metric Badges & Active Guardrails */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Unweighted Mean Idle Reduction */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/70 border border-emerald-800 text-emerald-200"
              title="Unweighted arithmetic mean of idle reduction percentages across all 16 valid materials (Simulated Causal Plan vs. Actual Historical Stock)"
            >
              <span className="text-[10px] uppercase font-bold text-emerald-400">Avg Idle Reduction:</span>
              <span className="font-mono font-extrabold text-emerald-300 text-xs">+{unweightedAvgIdleReduction}%</span>
              <span className="text-[10px] text-emerald-400/80 hidden lg:inline">
                (Unweighted Avg Across {validItemsCount} Items)
              </span>
            </div>

            {/* Unweighted Mean Service Level */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950/70 border border-blue-800 text-blue-200"
              title="Unweighted arithmetic mean of simulated site service level percentages across all 16 valid materials"
            >
              <span className="text-[10px] uppercase font-bold text-blue-400">Site Service Level:</span>
              <span className="font-mono font-extrabold text-blue-300 text-xs">{unweightedAvgServiceLevel}%</span>
              <span className="text-[10px] text-blue-400/80 hidden lg:inline">
                (Unweighted Avg Across {validItemsCount} Items)
              </span>
            </div>

            {/* Active Guardrails Pills */}
            <div className="flex items-center gap-1.5">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800 text-[11px] font-semibold"
                title="Auto-calibrated ratios for MNB010174 (G.I. Bolts in MT vs. Clamps) and MLU020008 (Ring Lugs)"
              >
                <ShieldAlert className="w-3 h-3 text-amber-400" />
                <span>2 BOQ Ratio Anomalies Auto-Calibrated</span>
              </span>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700 text-[11px] font-semibold"
                title="Generates standard CSV files for SAP Business One Data Transfer Workbench (DTW)"
              >
                <FileSpreadsheet className="w-3 h-3 text-slate-400" />
                <span>SAP B1 CSV Export Ready</span>
              </span>
            </div>
          </div>
        </div>
      </div>

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
            onOpenAgent={() => setIsAgentOpen(true)}
          />
        )}

        {activeTab === "MATCH_SETS" && (
          <MatchSetsTab
            setsData={setsData}
            months={meta.months}
          />
        )}
      </main>

      {/* Project Scorecard Modal */}
      <ProjectScorecard
        meta={meta}
        isOpen={isScorecardOpen}
        onClose={() => setIsScorecardOpen(false)}
      />

      {/* Lumino Supply-Chain Agent Drawer */}
      <LuminoAgentPanel
        isOpen={isAgentOpen}
        onClose={() => setIsAgentOpen(false)}
        activeItem={selectedItem}
        activeMonth="2024-06"
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
