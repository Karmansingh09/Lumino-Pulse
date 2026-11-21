"use client";

import React, { useState, useMemo } from "react";
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Warehouse,
  ExternalLink,
} from "lucide-react";
import { SetsData, ParentSetRecord, GodownSetBalance, ChildBreakdown } from "@/types";

interface MatchSetsTabProps {
  setsData: SetsData;
  months: string[];
}

export default function MatchSetsTab({ setsData, months }: MatchSetsTabProps) {
  // Available parent set codes
  const parentCodes = useMemo(() => Object.keys(setsData), [setsData]);

  // State: default to genuine worst bottleneck month index 21 (2024-12) for MRP070060 (93,432 stranded units, 6/6 godowns blocked)
  const [selectedParentCode, setSelectedParentCode] = useState<string>(
    parentCodes[0] || "MRP070060"
  );
  const [ratioMode, setRatioMode] = useState<"calibrated" | "raw">("calibrated");
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(21);
  const [isAnomalyBannerOpen, setIsAnomalyBannerOpen] = useState<boolean>(true);

  // Active parent set data
  const currentSet: ParentSetRecord | undefined = setsData[selectedParentCode];

  // Active month record
  const currentMonthRecord = useMemo(() => {
    if (!currentSet || !currentSet.monthly_records) return null;
    const clamped = Math.max(0, Math.min(selectedMonthIdx, currentSet.monthly_records.length - 1));
    return currentSet.monthly_records[clamped];
  }, [currentSet, selectedMonthIdx]);

  // Active mode data (calibrated or raw)
  const currentModeData = useMemo(() => {
    if (!currentMonthRecord) return null;
    return currentMonthRecord[ratioMode];
  }, [currentMonthRecord, ratioMode]);

  // Function to evaluate if a godown is BLOCKED
  // Rule: parent_stock > 10 AND (stranded / parent_stock > 0.15)
  const isGodownBlocked = (card: GodownSetBalance): boolean => {
    if (card.parent_stock <= 10) return false;
    return card.stranded_parent_stock / card.parent_stock > 0.15;
  };

  // Find the worst bottleneck month for the current set and mode (by total stranded parent units)
  const worstMonthIdx = useMemo(() => {
    if (!currentSet || !currentSet.monthly_records) return 0;
    let maxStranded = -1;
    let worstIdx = 0;
    currentSet.monthly_records.forEach((mRec, idx) => {
      const modeData = mRec[ratioMode];
      if (modeData && modeData.total_stranded_parent > maxStranded) {
        maxStranded = modeData.total_stranded_parent;
        worstIdx = idx;
      }
    });
    return worstIdx;
  }, [currentSet, ratioMode]);

  const jumpToWorstMonth = () => {
    setSelectedMonthIdx(worstMonthIdx);
  };

  // 44-Month heatmap status array: counts blocked godowns per month using the isBlocked condition
  const monthlyBlockedCounts = useMemo(() => {
    if (!currentSet || !currentSet.monthly_records) return [];
    return currentSet.monthly_records.map((mRec) => {
      const modeData = mRec[ratioMode];
      if (!modeData) return 0;
      return modeData.godowns.filter(isGodownBlocked).length;
    });
  }, [currentSet, ratioMode]);

  // Calculate smart cross-godown transfer donor for a blocked godown
  const findDonorForLimitingChild = (
    godownCard: GodownSetBalance,
    allCards: GodownSetBalance[]
  ) => {
    if (!godownCard.limiting_child_code) return null;
    const limitingCode = godownCard.limiting_child_code;

    let bestDonor: { godown: string; surplus: number; unit: string } | null = null;
    let maxSurplus = 0;

    for (const donorCard of allCards) {
      if (donorCard.godown === godownCard.godown) continue;

      const childItem = donorCard.children_breakdown.find(
        (c) => c.child_code === limitingCode
      );
      if (!childItem) continue;

      // Genuine surplus = child on hand - donor's own required child stock for its parent
      const donorOwnNeed = donorCard.parent_stock * childItem.ratio;
      const genuineSurplus = Math.max(0, childItem.child_stock - donorOwnNeed);

      const threshold = childItem.child_unit === "MT" ? 0.005 : 1.0;
      if (genuineSurplus > threshold && genuineSurplus > maxSurplus) {
        maxSurplus = genuineSurplus;
        bestDonor = {
          godown: donorCard.godown,
          surplus: genuineSurplus,
          unit: childItem.child_unit,
        };
      }
    }

    return bestDonor;
  };

  const formatNumber = (val: number | undefined, isMT: boolean = false) => {
    if (val === undefined || val === null || isNaN(val)) return "0";
    return val.toLocaleString(undefined, {
      minimumFractionDigits: isMT ? 3 : 0,
      maximumFractionDigits: isMT ? 4 : 1,
    });
  };

  if (!currentSet || !currentModeData) {
    return (
      <div className="p-8 text-center bg-[#0f172a] rounded-xl border border-[#1e293b]">
        <Boxes className="w-8 h-8 text-amber-400 mx-auto mb-3" />
        <p className="text-gray-300">Assembly sets dataset loading...</p>
      </div>
    );
  }

  const blockedGodownsCount = currentModeData.godowns.filter(isGodownBlocked).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* SECTION A: ERP Data-Quality Anomaly Banner */}
      <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-amber-200">
                  ERP Ratio Anomaly Detected in sets.csv (Auto-Calibrated Against Site Consumption)
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700">
                  Data Quality Guardrail
                </span>
              </div>
              <p className="text-xs text-amber-300/80 mt-1 leading-relaxed">
                Lumino&apos;s raw BOQ ratios in <code>sets.csv</code> contain severe unit mismatches and ratio distortions compared to actual historical site consumption.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAnomalyBannerOpen(!isAnomalyBannerOpen)}
            className="text-amber-400 hover:text-amber-200 text-xs font-semibold flex items-center gap-1 shrink-0 px-2 py-1 rounded bg-amber-950/60 border border-amber-800/50"
          >
            <span>{isAnomalyBannerOpen ? "Hide Evidence" : "Show Evidence"}</span>
            {isAnomalyBannerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isAnomalyBannerOpen && (
          <div className="px-4 pb-4 pt-1 border-t border-amber-900/40 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-amber-200/90">
            <div className="bg-black/30 p-3 rounded-lg border border-amber-900/30">
              <span className="font-bold text-amber-300 block mb-1">
                1. Unit Trap: MNB010174 (G.I. Bolts)
              </span>
              <p className="text-[11px] leading-relaxed text-amber-300/80">
                Tracked in <strong>Metric Tonnes (MT)</strong> with raw ratio <code>1.0</code>, whereas site usage is <strong>~0.00015 MT / Pole Clamp</strong>. Raw ratio overestimates bolt demand by over <strong>6,600×</strong>!
              </p>
            </div>

            <div className="bg-black/30 p-3 rounded-lg border border-amber-900/30">
              <span className="font-bold text-amber-300 block mb-1">
                2. Ratio Mismatch: MLU020008 (Ring Lugs)
              </span>
              <p className="text-[11px] leading-relaxed text-amber-300/80">
                For 3-Phase DB (<code>MRP070065</code>), raw ratio is <code>0.25</code>, whereas site consumption is <strong>5.66 NOS / box</strong> (~23× higher).
              </p>
            </div>

            <div className="bg-black/30 p-3 rounded-lg border border-amber-900/30">
              <span className="font-bold text-amber-300 block mb-1">
                3. Shared Child Component
              </span>
              <p className="text-[11px] leading-relaxed text-amber-300/80">
                <code>MNB010174</code> is required by all 3 parent sets. Calibrated ratios represent empirical historical site estimates, not engineering specs.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SECTION B: Controls Bar */}
      <div className="bg-[#0f172a] p-4 rounded-xl border border-[#1e293b] shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Parent Set Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-blue-400" />
              Parent Assembly Set (3 Official Sets)
            </label>
            <div className="flex flex-wrap gap-2">
              {parentCodes.map((pCode) => {
                const s = setsData[pCode];
                const isActive = selectedParentCode === pCode;
                return (
                  <button
                    key={pCode}
                    onClick={() => setSelectedParentCode(pCode)}
                    className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all text-left ${
                      isActive
                        ? "bg-[#0F5C45] border-[#1b7d5e] text-white shadow-md shadow-[#0F5C45]/30"
                        : "bg-[#1e293b] border-[#334155] text-slate-300 hover:text-white hover:border-slate-500"
                    }`}
                  >
                    <div className="font-mono text-[10px] text-emerald-200">Set {s.set_no} · {pCode}</div>
                    <div className="truncate max-w-[200px]">{s.parent_name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ratio Mode Toggle (Segmented Control) */}
          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Assembly Ratio Evaluation Mode
            </label>
            <div className="inline-flex p-1 rounded-xl bg-[#131d2e] border border-[#1e293b]">
              <button
                onClick={() => setRatioMode("calibrated")}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  ratioMode === "calibrated"
                    ? "bg-[#0F5C45] text-white shadow-md shadow-[#0F5C45]/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Calibrated Site Ratio (Recommended)</span>
              </button>

              <button
                onClick={() => setRatioMode("raw")}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  ratioMode === "raw"
                    ? "bg-[#F28C28] text-white shadow-md shadow-[#F28C28]/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Raw BOQ Ratio (sets.csv)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Summary KPI Strip (for selected Set & Month) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-[#1e293b]">
          <div className="bg-[#131d2e] p-3 rounded-lg border border-[#1e293b]">
            <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider block mb-1">
              Total Parent Stock on Hand
            </span>
            <span className="text-xl font-bold text-white font-mono">
              {formatNumber(currentModeData.total_parent_stock)} {currentSet.parent_unit}
            </span>
          </div>

          <div className="bg-[#131d2e] p-3 rounded-lg border border-emerald-950/60 bg-gradient-to-br from-[#131d2e] to-emerald-950/20">
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Buildable Complete Sets
            </span>
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {formatNumber(currentModeData.total_buildable_sets)} {currentSet.parent_unit}
            </span>
          </div>

          <div className="bg-[#131d2e] p-3 rounded-lg border border-red-950/60 bg-gradient-to-br from-[#131d2e] to-red-950/20">
            <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Total Stranded Parent Units
            </span>
            <span className={`text-xl font-bold font-mono ${currentModeData.total_stranded_parent > 0 ? "text-red-400" : "text-slate-400"}`}>
              {formatNumber(currentModeData.total_stranded_parent)} {currentSet.parent_unit}
            </span>
          </div>

          <div className="bg-[#131d2e] p-3 rounded-lg border border-[#1e293b]">
            <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider block mb-1">
              District Godowns Blocked
            </span>
            <span className={`text-xl font-bold font-mono ${blockedGodownsCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              {blockedGodownsCount} / 6 Stores
            </span>
          </div>
        </div>
      </div>

      {/* SECTION C: 44-Month Imbalance Heatmap Strip */}
      <div className="bg-[#0f172a] p-5 rounded-xl border border-[#1e293b] shadow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-4 border-b border-[#1e293b] gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              44-Month Set Imbalance Timeline Strip (Mar 2023 – Oct 2026)
            </h3>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              Click any month cell to inspect yard stock and component bottlenecks. Mode: <strong className="text-slate-300">{ratioMode}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={jumpToWorstMonth}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800 transition-colors shadow-sm"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Jump to Worst Bottleneck Month ({months[worstMonthIdx]})</span>
            </button>
          </div>
        </div>

        {/* 44-Month Heatmap Grid */}
        <div className="grid grid-cols-11 sm:grid-cols-22 gap-1.5">
          {months.map((m, idx) => {
            const blockedCnt = monthlyBlockedCounts[idx] || 0;
            const isSelected = selectedMonthIdx === idx;
            const isWorst = worstMonthIdx === idx;

            let bgClass = "bg-emerald-500/15 text-emerald-300 border-emerald-900/30 hover:bg-emerald-500/25";
            if (blockedCnt >= 3) {
              bgClass = "bg-red-500/35 text-red-300 border-red-800/50 hover:bg-red-500/45";
            } else if (blockedCnt >= 1) {
              bgClass = "bg-[#F28C28]/25 text-[#F28C28] border-[#F28C28]/40 hover:bg-[#F28C28]/35";
            }

            return (
              <button
                key={m}
                onClick={() => setSelectedMonthIdx(idx)}
                title={`${m}: ${blockedCnt} blocked godowns ${isWorst ? "(Worst bottleneck month)" : ""}`}
                className={`py-2 px-1 text-[10px] font-mono rounded border transition-all text-center relative ${bgClass} ${
                  isSelected ? "ring-2 ring-[#0F5C45] font-bold scale-105 z-10 shadow-lg shadow-[#0F5C45]/30" : ""
                }`}
              >
                <div className="truncate">{m.substring(2)}</div>
                <div className="text-[9px] font-bold opacity-80 mt-0.5">{blockedCnt} blk</div>
                {isWorst && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#1e293b] text-[11px] text-[#94a3b8]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-800 inline-block" />
            0 Blocked (Healthy)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#F28C28]/30 border border-[#F28C28]/60 inline-block" />
            1–2 Blocked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-red-500/50 border border-red-800 inline-block" />
            3+ Blocked (Severe Stranding)
          </span>
          <span className="ml-auto font-mono text-white font-semibold">
            Active: {months[selectedMonthIdx]}
          </span>
        </div>
      </div>

      {/* SECTION D: 6-Godown Bottleneck Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-[#F28C28]" />
            6-District Godown Assembly Balance Status ({months[selectedMonthIdx]})
          </h3>
          <span className="text-xs text-[#94a3b8]">
            Stranded = Parent stock waiting on incomplete child component sets
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentModeData.godowns.map((card) => {
            const blocked = isGodownBlocked(card);
            const donor = blocked ? findDonorForLimitingChild(card, currentModeData.godowns) : null;

            return (
              <div
                key={card.godown}
                className={`bg-[#0f172a] rounded-xl border p-4 shadow-lg flex flex-col justify-between transition-colors ${
                  blocked
                    ? "border-red-950/80 bg-gradient-to-br from-[#0f172a] to-red-950/15"
                    : "border-[#1e293b]"
                }`}
              >
                <div>
                  {/* Card Header: Godown Name + Status Badge */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1e293b]">
                    <span className="font-bold text-sm text-white tracking-tight">
                      {card.godown}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                        blocked
                          ? "bg-red-950 text-red-300 border-red-800"
                          : "bg-emerald-950 text-emerald-300 border-emerald-800"
                      }`}
                    >
                      {blocked ? "BLOCKED" : "BALANCED"}
                    </span>
                  </div>

                  {/* 3-Column Metric Box */}
                  <div className="grid grid-cols-3 gap-2 bg-[#131d2e] p-2.5 rounded-lg border border-[#1e293b] mb-3 text-center">
                    <div>
                      <span className="text-[9px] font-semibold text-[#94a3b8] uppercase block">
                        Parent Stock
                      </span>
                      <span className="text-sm font-bold text-white font-mono">
                        {formatNumber(card.parent_stock)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-semibold text-emerald-400 uppercase block">
                        Buildable
                      </span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">
                        {formatNumber(card.buildable_sets)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-semibold text-red-400 uppercase block">
                        Stranded
                      </span>
                      <span
                        className={`text-sm font-bold font-mono ${
                          card.stranded_parent_stock > 0 ? "text-red-400" : "text-slate-400"
                        }`}
                      >
                        {formatNumber(card.stranded_parent_stock)}
                      </span>
                    </div>
                  </div>

                  {/* Bottleneck Alert & Transfer Hint (when BLOCKED) */}
                  {blocked && card.limiting_child_name && (
                    <div className="mb-3 p-2.5 rounded-lg bg-red-950/40 border border-red-900/60 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-red-300 font-semibold">
                        <XCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                        <span>Limiting: {card.limiting_child_name}</span>
                      </div>

                      {donor ? (
                        <div className="text-[11px] text-amber-300 bg-amber-950/50 p-1.5 rounded border border-amber-900/60 flex items-center gap-1.5">
                          <ArrowRightLeft className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                          <span>
                            Fix: Transfer {formatNumber(donor.surplus, donor.unit === "MT")} {donor.unit} from{" "}
                            <strong>{donor.godown}</strong>
                          </span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 italic">
                          No local godown has surplus {card.limiting_child_name}; factory procurement needed.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Child Component Breakdown Mini-Table */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Required Child Components
                    </span>
                    {card.children_breakdown.map((c) => {
                      const isChildMT = c.child_unit === "MT";
                      const pctAvailable =
                        c.needed_for_all_parent > 0
                          ? Math.min(100, (c.child_stock / c.needed_for_all_parent) * 100)
                          : 100;
                      const isLimiting = card.limiting_child_code === c.child_code && blocked;

                      let progressColor = "bg-emerald-500";
                      if (pctAvailable < 85) progressColor = "bg-red-500";
                      else if (pctAvailable < 100) progressColor = "bg-amber-500";

                      return (
                        <div
                          key={c.child_code}
                          className={`p-2 rounded border text-[11px] space-y-1 ${
                            isLimiting
                              ? "bg-red-950/20 border-red-900/40"
                              : "bg-[#131d2e] border-[#1e293b]"
                          }`}
                        >
                          <div className="flex justify-between items-center text-slate-300">
                            <span className="truncate font-medium max-w-[170px]" title={c.child_name}>
                              {c.child_name}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 shrink-0">
                              {formatNumber(c.child_stock, isChildMT)} / {formatNumber(c.needed_for_all_parent, isChildMT)} {c.child_unit}
                            </span>
                          </div>

                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full ${progressColor} transition-all duration-300`}
                              style={{ width: `${pctAvailable}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#1e293b] text-[10px] text-slate-500 flex justify-between">
                  <span>Capacity: {formatNumber(card.buildable_sets)} sets</span>
                  <span>{ratioMode === "calibrated" ? "Calibrated ratio" : "Raw ratio"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
