"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  GitBranch,
  TrendingDown,
  ShieldCheck,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ArrowRightLeft,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Package,
  Layers,
  Sparkles,
} from "lucide-react";
import { ItemMeta, LedgerData, MetaData } from "@/types";
import { runCausalSimulation, SimulatorParams, SimulationResult } from "@/lib/causalSimulator";

interface PlanItTabProps {
  selectedItem: string;
  onSelectItem: (itemCode: string) => void;
  items: ItemMeta[];
  godowns: string[];
  ledgerData: LedgerData;
  meta: MetaData;
}

export default function PlanItTab({
  selectedItem,
  onSelectItem,
  items,
  godowns,
  ledgerData,
  meta,
}: PlanItTabProps) {
  // Live Simulator Parameters
  const [params, setParams] = useState<SimulatorParams>({
    safetyMultiplier: 1.0,
    smoothingWindow: 3,
    leadTimeSlippageDays: 0,
  });

  // Time-Travel Replay State
  const [timeIndex, setTimeIndex] = useState<number>(12); // Default to month 12 (approx 1 year in)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showAllItemsTable, setShowAllItemsTable] = useState<boolean>(false);

  const currentItemMeta = useMemo(() => {
    return items.find((it) => it.item_code === selectedItem) || items[0];
  }, [items, selectedItem]);

  const currentLedger = useMemo(() => {
    return ledgerData[selectedItem];
  }, [ledgerData, selectedItem]);

  const isMT = currentItemMeta?.unit === "MT";

  // Run live causal simulation instantaneously (<2ms)
  const simResult: SimulationResult = useMemo(() => {
    if (!currentLedger) {
      return {
        item_code: selectedItem,
        item_name: currentItemMeta?.item_name || "",
        unit: currentItemMeta?.unit || "",
        months: [],
        summary: {
          avgActualIdle: 0,
          avgPlanIdle: 0,
          peakActualIdle: 0,
          peakPlanIdle: 0,
          idleReductionPct: 0,
          shortageMonths: 0,
          serviceLevelPct: 100,
          totalDemand: 0,
          totalShortage: 0,
          effectiveLeadDays: currentItemMeta?.lead_time_days || 0,
          effectiveLeadMonths: currentItemMeta?.lead_time_months || 1,
        },
      };
    }
    return runCausalSimulation(currentLedger, godowns, params);
  }, [currentLedger, godowns, params, selectedItem, currentItemMeta]);

  // Active month record for Time Travel Slider
  const activeMonthRecord = useMemo(() => {
    if (!simResult.months || simResult.months.length === 0) return null;
    const clampedIdx = Math.max(0, Math.min(timeIndex, simResult.months.length - 1));
    return simResult.months[clampedIdx];
  }, [simResult.months, timeIndex]);

  // Autoplay loop for time travel slider
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeIndex((prev) => {
          if (prev >= 43) {
            setIsPlaying(false);
            return 43;
          }
          return prev + 1;
        });
      }, 600);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const resetToOptimal = () => {
    setParams({
      safetyMultiplier: 1.0,
      smoothingWindow: 3,
      leadTimeSlippageDays: 0,
    });
  };

  const formatNumber = (val: number | undefined) => {
    if (val === undefined || val === null || isNaN(val)) return "0";
    return val.toLocaleString(undefined, {
      minimumFractionDigits: isMT ? 3 : 0,
      maximumFractionDigits: isMT ? 4 : 1,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* SECTION A: "The Bar" Scorecard + Item Selector */}
      <div className="bg-[#0f172a] p-4 rounded-xl border border-[#1e293b] shadow-lg flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex-1 min-w-[280px]">
          <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-blue-400" />
            Material Item Under Simulation
          </label>
          <select
            value={selectedItem}
            onChange={(e) => onSelectItem(e.target.value)}
            className="w-full bg-[#1e293b] text-[#f8fafc] text-sm font-medium rounded-lg border border-[#334155] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-slate-500 transition-colors"
          >
            {items.map((it) => (
              <option key={it.item_code} value={it.item_code}>
                {it.item_code} — {it.item_name} ({it.unit}, Base LT: {it.lead_time_days}d)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto pt-2 sm:pt-0">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-950/60 border border-emerald-800 text-emerald-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Live Walk-Forward Engine (<span className="text-white">~2ms</span>)
          </span>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-800 border border-slate-700 text-slate-300">
            Unit: {currentItemMeta.unit}
          </span>
        </div>
      </div>

      {/* 4 Headline Scorecard Cards ("The Bar") */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Idle Stock Reduction */}
        <div className="bg-[#0f172a] p-4 rounded-xl border border-emerald-950/60 bg-gradient-to-br from-[#0f172a] to-emerald-950/20 relative overflow-hidden shadow">
          <div className="flex items-center justify-between text-[#94a3b8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              Idle Stock Reduction
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded border ${
                simResult.summary.idleReductionPct >= 0
                  ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                  : "bg-red-950 text-red-300 border-red-800"
              }`}
            >
              {simResult.summary.idleReductionPct >= 0
                ? `+${simResult.summary.idleReductionPct}%`
                : `${simResult.summary.idleReductionPct}%`}
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatNumber(simResult.summary.avgPlanIdle)}{" "}
            <span className="text-xs font-normal text-slate-400">{currentItemMeta.unit} (Plan Avg)</span>
          </div>
          <div className="mt-2 text-xs text-[#94a3b8] flex justify-between items-center">
            <span>Actual Lumino History:</span>
            <span className="font-semibold text-slate-300">
              {formatNumber(simResult.summary.avgActualIdle)} {currentItemMeta.unit}
            </span>
          </div>
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-emerald-500/10 rounded-full pointer-events-none" />
        </div>

        {/* Card 2: Site Service Level */}
        <div className="bg-[#0f172a] p-4 rounded-xl border border-blue-950/60 bg-gradient-to-br from-[#0f172a] to-blue-950/20 relative overflow-hidden shadow">
          <div className="flex items-center justify-between text-[#94a3b8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Site Service Level
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded border ${
                simResult.summary.serviceLevelPct >= 90
                  ? "bg-blue-950 text-blue-300 border-blue-800"
                  : simResult.summary.serviceLevelPct >= 80
                  ? "bg-amber-950 text-amber-300 border-amber-800"
                  : "bg-red-950 text-red-300 border-red-800"
              }`}
            >
              {simResult.summary.serviceLevelPct}%
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {simResult.summary.serviceLevelPct}%{" "}
            <span className="text-xs font-normal text-slate-400">Demand Met On Time</span>
          </div>
          <div className="mt-2 text-xs text-[#94a3b8] flex justify-between items-center">
            <span>Shortage Months:</span>
            <span
              className={`font-semibold ${
                simResult.summary.shortageMonths === 0 ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {simResult.summary.shortageMonths} / 44 months
            </span>
          </div>
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-blue-500/10 rounded-full pointer-events-none" />
        </div>

        {/* Card 3: Peak Yard Congestion */}
        <div className="bg-[#0f172a] p-4 rounded-xl border border-[#1e293b] relative overflow-hidden shadow">
          <div className="flex items-center justify-between text-[#94a3b8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              Peak Yard Congestion
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Peak Month
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-400 tracking-tight">
            {formatNumber(simResult.summary.peakPlanIdle)}{" "}
            <span className="text-xs font-normal text-slate-400">{currentItemMeta.unit} (Plan)</span>
          </div>
          <div className="mt-2 text-xs text-[#94a3b8] flex justify-between items-center">
            <span>Actual Peak Congestion:</span>
            <span className="font-semibold text-slate-300">
              {formatNumber(simResult.summary.peakActualIdle)} {currentItemMeta.unit}
            </span>
          </div>
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-amber-500/5 rounded-full pointer-events-none" />
        </div>

        {/* Card 4: Effective Lead Time */}
        <div className="bg-[#0f172a] p-4 rounded-xl border border-[#1e293b] relative overflow-hidden shadow">
          <div className="flex items-center justify-between text-[#94a3b8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" />
              Effective Lead Time
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
              ~{simResult.summary.effectiveLeadMonths} mo
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-400 tracking-tight">
            {simResult.summary.effectiveLeadDays}{" "}
            <span className="text-base font-normal text-slate-400">Days</span>
          </div>
          <div className="mt-2 text-xs text-[#94a3b8] flex justify-between items-center">
            <span>Base + Delay:</span>
            <span className="font-semibold text-slate-300">
              {currentItemMeta.lead_time_days}d + {params.leadTimeSlippageDays}d stress
            </span>
          </div>
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-blue-500/5 rounded-full pointer-events-none" />
        </div>
      </div>

      {/* SECTION B: Live "What-If" Policy Controls */}
      <div className="bg-[#0f172a] p-5 rounded-xl border border-[#1e293b] shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-4 border-b border-[#1e293b] gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Live &ldquo;What-If&rdquo; Replenishment Policy Controls
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#94a3b8] hidden md:inline">
              Simulates live trade-off between idle stock and site shortages
            </span>
            <button
              onClick={resetToOptimal}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white transition-colors border border-slate-700"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Optimal</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slider 1: Safety Stock Buffer */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Safety Stock Multiplier</span>
              <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                {params.safetyMultiplier.toFixed(2)}×
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.5}
              step={0.25}
              value={params.safetyMultiplier}
              onChange={(e) =>
                setParams((prev) => ({ ...prev, safetyMultiplier: parseFloat(e.target.value) }))
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.5× (Ultra-Lean)</span>
              <span>1.0× (Optimal)</span>
              <span>2.5× (Conservative)</span>
            </div>
          </div>

          {/* Slider 2: Demand Smoothing Window */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Demand Lookback Window</span>
              <span className="font-mono font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                {params.smoothingWindow} Months
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 6].map((w) => (
                <button
                  key={w}
                  onClick={() => setParams((prev) => ({ ...prev, smoothingWindow: w }))}
                  className={`py-1.5 text-xs font-semibold rounded border transition-colors ${
                    params.smoothingWindow === w
                      ? "bg-blue-600 border-blue-500 text-white shadow-sm"
                      : "bg-[#1e293b] border-[#334155] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {w} mo
                </button>
              ))}
            </div>
            <div className="text-[10px] text-slate-500">
              Trailing moving average of actual contractor consumption
            </div>
          </div>

          {/* Slider 3: Vendor Lead-Time Stress Test */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Vendor Lead-Time Stress Delay</span>
              <span className="font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                +{params.leadTimeSlippageDays} Days
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 15, 30, 60].map((d) => (
                <button
                  key={d}
                  onClick={() => setParams((prev) => ({ ...prev, leadTimeSlippageDays: d }))}
                  className={`py-1.5 text-xs font-semibold rounded border transition-colors ${
                    params.leadTimeSlippageDays === d
                      ? "bg-amber-600 border-amber-500 text-white shadow-sm"
                      : "bg-[#1e293b] border-[#334155] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  +{d}d
                </button>
              ))}
            </div>
            <div className="text-[10px] text-slate-500">
              Tests factory delays &amp; supply chain disruptions
            </div>
          </div>
        </div>
      </div>

      {/* SECTION C: "The Bar" Dual-Line Chart (Recharts) */}
      <div className="bg-[#0f172a] p-5 rounded-xl border border-[#1e293b] shadow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-4 border-b border-[#1e293b] gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#f8fafc] flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              &ldquo;The Bar&rdquo; Comparison: Actual Lumino History vs. Our Causal Plan
            </h3>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              Notice how the green plan curve hugs site demand tightly, cutting the yellow idle stock mountain.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-800">
              <span className="w-2.5 h-0.5 bg-[#f59e0b] inline-block" /> Actual Lumino Stock
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-800">
              <span className="w-2.5 h-0.5 bg-[#10b981] inline-block" /> Our Causal Plan
            </span>
          </div>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={simResult.months} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                interval={4}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) =>
                  val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(isMT ? 2 : 0)
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "0.5rem",
                  color: "#f8fafc",
                  fontSize: "0.75rem",
                }}
                formatter={(value: any, name: any) => [
                  `${formatNumber(Number(value))} ${currentItemMeta.unit}`,
                  name === "actual_godown_stock"
                    ? "Actual Lumino Stock"
                    : name === "plan_stock"
                    ? "Our Causal Plan Stock"
                    : "Plan Shortage",
                ]}
                labelFormatter={(lbl) => `Month: ${lbl}`}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />

              {/* Reference line synced to current time-travel slider month */}
              {activeMonthRecord && (
                <ReferenceLine
                  x={activeMonthRecord.month}
                  stroke="#3b82f6"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: `As of ${activeMonthRecord.month}`,
                    fill: "#60a5fa",
                    fontSize: 10,
                    position: "insideTopRight",
                  }}
                />
              )}

              {/* Actual Lumino Stock */}
              <Line
                type="monotone"
                dataKey="actual_godown_stock"
                name="Actual Lumino Stock"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />

              {/* Our Causal Plan Stock */}
              <Line
                type="monotone"
                dataKey="plan_stock"
                name="Our Causal Plan Stock"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
              />

              {/* Subtle Red Bar for Shortages */}
              <Bar
                dataKey="plan_shortage"
                name="Plan Shortage"
                fill="#ef4444"
                opacity={0.8}
                radius={[2, 2, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION D: Interactive Time-Travel Replay Panel */}
      <div className="bg-[#0f172a] p-5 rounded-xl border border-[#1e293b] shadow-lg space-y-4">
        {/* Slider Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                isPlaying
                  ? "bg-amber-600 hover:bg-amber-500 text-white"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
              title={isPlaying ? "Pause simulation replay" : "Play step-by-step replay"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Month {timeIndex + 1} of 44:</span>
                <span className="font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                  {activeMonthRecord?.month}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Drag slider to view strictly causal procurement decisions at that exact point in time
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400">
            {timeIndex < 43 ? "March 2023 → October 2026" : "Project End Reached"}
          </div>
        </div>

        {/* Range Slider */}
        <div className="px-1">
          <input
            type="range"
            min={0}
            max={43}
            value={timeIndex}
            onChange={(e) => {
              setTimeIndex(parseInt(e.target.value));
              if (isPlaying) setIsPlaying(false);
            }}
            className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>2023-03 (Kickoff)</span>
            <span>2024-03 (Year 1)</span>
            <span>2025-03 (Year 2)</span>
            <span>2026-03 (Wind-down)</span>
            <span>2026-10 (Finish)</span>
          </div>
        </div>

        {/* 3 Active Decision Cards for the As-Of Month */}
        {activeMonthRecord && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Card 1: Causal Action Badge & Order Details */}
            <div className="bg-[#131d2e] p-4 rounded-xl border border-[#1e293b] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider block mb-2">
                  Action at {activeMonthRecord.month}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                      activeMonthRecord.action.includes("ORDER")
                        ? "bg-blue-950 text-blue-300 border-blue-700"
                        : activeMonthRecord.action === "TRANSFER"
                        ? "bg-amber-950 text-amber-300 border-amber-700"
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                  >
                    {activeMonthRecord.action}
                  </span>
                  {activeMonthRecord.order_qty > 0 && (
                    <span className="text-sm font-bold text-white font-mono">
                      {formatNumber(activeMonthRecord.order_qty)} {currentItemMeta.unit}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1e293b] text-xs text-slate-400">
                <div className="flex justify-between items-center mb-1">
                  <span>Expected Arrival:</span>
                  <span className="font-semibold text-slate-200">
                    {activeMonthRecord.expected_arrival_month}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span>Lead Time Window:</span>
                  <span className="font-mono text-slate-400">
                    +{simResult.summary.effectiveLeadMonths} months ({simResult.summary.effectiveLeadDays}d)
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Month Telemetry */}
            <div className="bg-[#131d2e] p-4 rounded-xl border border-[#1e293b] space-y-2 text-xs">
              <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider block mb-1">
                Month {activeMonthRecord.month} Telemetry
              </span>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Site Consumed:</span>
                <span className="font-mono font-semibold text-emerald-400">
                  {formatNumber(activeMonthRecord.actual_consumption)} {currentItemMeta.unit}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Trailing Demand Rate:</span>
                <span className="font-mono font-semibold text-blue-300">
                  {formatNumber(activeMonthRecord.forecast_monthly_demand)} /mo
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Actual Lumino Stock:</span>
                <span className="font-mono font-semibold text-amber-400">
                  {formatNumber(activeMonthRecord.actual_godown_stock)} {currentItemMeta.unit}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Plan Stock on Hand:</span>
                <span className="font-mono font-semibold text-slate-200">
                  {formatNumber(activeMonthRecord.plan_stock)} {currentItemMeta.unit}
                </span>
              </div>

              {activeMonthRecord.plan_shortage > 0 && (
                <div className="flex justify-between items-center text-red-400 font-bold bg-red-950/40 p-1 rounded border border-red-900/60">
                  <span>Site Shortage:</span>
                  <span className="font-mono">
                    {formatNumber(activeMonthRecord.plan_shortage)} {currentItemMeta.unit}
                  </span>
                </div>
              )}
            </div>

            {/* Card 3: Inter-Godown Rebalancing */}
            <div className="bg-[#131d2e] p-4 rounded-xl border border-[#1e293b] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                  Inter-Godown Rebalancing ({activeMonthRecord.transfers.length})
                </span>

                {activeMonthRecord.transfers.length === 0 ? (
                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>All 6 district godowns balanced within safety stock thresholds.</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                    {activeMonthRecord.transfers.map((xfer, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-[#0f172a] border border-[#1e293b] text-[11px] flex items-center justify-between gap-1"
                      >
                        <div className="truncate">
                          <span className="text-amber-300 font-semibold">{xfer.from_godown}</span>
                          <span className="text-slate-500 mx-1">→</span>
                          <span className="text-blue-300 font-semibold">{xfer.to_godown}</span>
                        </div>
                        <span className="font-mono font-bold text-white shrink-0">
                          {formatNumber(xfer.qty)} {xfer.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 text-[10px] text-slate-500 italic">
                Transfers conserve total inventory; moves excess cover (&gt;3mo) to deficit yards (&lt;1mo).
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION E: Collapsible "All 16 Items" Benchmark Table */}
      <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] shadow overflow-hidden">
        <button
          onClick={() => setShowAllItemsTable(!showAllItemsTable)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#131d2e] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-white">
              Benchmark Table: All 16 Items Across the Project
            </span>
            <span className="text-xs text-[#94a3b8] hidden sm:inline">
              (Click any item row to simulate it live)
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>{showAllItemsTable ? "Collapse" : "Expand All 16 Items"}</span>
            {showAllItemsTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showAllItemsTable && (
          <div className="border-t border-[#1e293b] overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-[#94a3b8] bg-[#162032] border-b border-[#1e293b]">
                <tr>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Item Code
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Item Name
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-center font-semibold">
                    Unit
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-center font-semibold">
                    Lead Days
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold">
                    Actual Avg Idle
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold">
                    Plan Avg Idle
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold text-emerald-400">
                    Idle Red. %
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold text-blue-400">
                    Service Level %
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold">
                    Shortage Months
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/60">
                {meta.overall_scorecard.items_scorecard.map((item, idx) => {
                  const isCurrent = item.item_code === selectedItem;
                  return (
                    <tr
                      key={item.item_code}
                      onClick={() => onSelectItem(item.item_code)}
                      className={`cursor-pointer transition-colors ${
                        isCurrent
                          ? "bg-blue-950/40 border-l-2 border-blue-500"
                          : idx % 2 === 0
                          ? "bg-[#0f172a] hover:bg-[#1e293b]/60"
                          : "bg-[#0c1322] hover:bg-[#1e293b]/60"
                      }`}
                    >
                      <td className="px-3 py-2 font-mono font-medium text-slate-200 whitespace-nowrap">
                        {item.item_code} {isCurrent && "★"}
                      </td>
                      <td className="px-3 py-2 text-slate-300 max-w-[220px] truncate" title={item.item_name}>
                        {item.item_name}
                      </td>
                      <td className="px-2 py-2 text-center font-mono text-slate-400">{item.unit}</td>
                      <td className="px-2 py-2 text-center font-mono text-amber-300">
                        {item.lead_time_days}d
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-slate-400">
                        {item.actual_avg.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-slate-200">
                        {item.plan_avg.toLocaleString()}
                      </td>
                      <td
                        className={`px-3 py-2 text-right font-mono font-bold ${
                          item.reduction_pct > 0 ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {item.reduction_pct > 0 ? `+${item.reduction_pct}%` : `${item.reduction_pct}%`}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-blue-400">
                        {item.service_level}%
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-slate-400">
                        {item.shortage_months}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
