"use client";

import React from "react";
import { X, Award, TrendingDown, CheckCircle2, ShieldCheck, AlertTriangle } from "lucide-react";
import { MetaData } from "@/types";

interface ProjectScorecardProps {
  meta: MetaData;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectScorecard({ meta, isOpen, onClose }: ProjectScorecardProps) {
  if (!isOpen) return null;

  const { overall_scorecard, stats } = meta;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f172a] border border-[#334155] rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#1e293b] flex items-center justify-between bg-[#162032]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#f8fafc]">
                Project Overview & &ldquo;The Bar&rdquo; Scorecard
              </h2>
              <p className="text-xs text-[#94a3b8]">
                Lumino Industries — 1,700 Poles · Kanpur 6-District Power Line (Mar 2023 – Oct 2026)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1e293b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Headline Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#131d2e] p-4 rounded-xl border border-[#1e293b]">
              <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider block mb-1">
                Total Transactions
              </span>
              <span className="text-2xl font-bold text-white tracking-tight">
                {stats.total_transactions.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                231k contractor + 2.6k receipts
              </span>
            </div>

            <div className="bg-[#131d2e] p-4 rounded-xl border border-emerald-950/60 bg-gradient-to-br from-[#131d2e] to-emerald-950/20">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                Avg Idle Reduction
              </span>
              <span className="text-2xl font-bold text-emerald-400 tracking-tight">
                {overall_scorecard.idle_reduction_pct}%
              </span>
              <span className="text-[11px] text-emerald-400/80 block mt-1">
                Idle stock cut by over half
              </span>
            </div>

            <div className="bg-[#131d2e] p-4 rounded-xl border border-blue-950/60 bg-gradient-to-br from-[#131d2e] to-blue-950/20">
              <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Site Service Level
              </span>
              <span className="text-2xl font-bold text-blue-400 tracking-tight">
                {overall_scorecard.service_level_pct}%
              </span>
              <span className="text-[11px] text-blue-400/80 block mt-1">
                Proving site was not starved
              </span>
            </div>

            <div className="bg-[#131d2e] p-4 rounded-xl border border-[#1e293b]">
              <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider block mb-1">
                Late Entry Dips
              </span>
              <span className="text-2xl font-bold text-amber-400 tracking-tight">
                {stats.raw_negative_dips_count}{" "}
                <span className="text-xs text-slate-400 font-normal">(&lt; 0.5%)</span>
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                Clamped for UI, raw preserved
              </span>
            </div>
          </div>

          {/* 16-Item Scorecard Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Full 16-Item Performance Table (Actual Lumino vs. Causal Plan)
              </h3>
              <span className="text-[11px] text-slate-400">Strictly causal trailing 3-month forecast</span>
            </div>

            <div className="border border-[#1e293b] rounded-xl overflow-hidden max-h-[360px] overflow-y-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="text-[11px] uppercase tracking-wider text-[#94a3b8] bg-[#162032] sticky top-0 z-10 border-b border-[#1e293b]">
                  <tr>
                    <th scope="col" className="px-3 py-2.5 font-semibold">
                      Item Code
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">
                      Item Name
                    </th>
                    <th scope="col" className="px-2 py-2.5 font-semibold text-center">
                      Unit
                    </th>
                    <th scope="col" className="px-2 py-2.5 font-semibold text-center">
                      LT (mo)
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">
                      Actual Avg
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">
                      Plan Avg
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold text-emerald-400">
                      Idle Red %
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold text-blue-400">
                      Service Lvl %
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">
                      Shortage M
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]/60">
                  {overall_scorecard.items_scorecard.map((item, idx) => (
                    <tr
                      key={item.item_code}
                      className={`hover:bg-[#1e293b]/50 transition-colors ${
                        idx % 2 === 0 ? "bg-[#0f172a]" : "bg-[#0c1322]"
                      }`}
                    >
                      <td className="px-3 py-2 font-mono font-medium text-slate-200 whitespace-nowrap">
                        {item.item_code}
                      </td>
                      <td className="px-3 py-2 text-slate-300 max-w-[220px] truncate" title={item.item_name}>
                        {item.item_name}
                      </td>
                      <td className="px-2 py-2 text-center font-mono text-slate-400">{item.unit}</td>
                      <td className="px-2 py-2 text-center font-mono text-amber-300">
                        {item.lead_time_months}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#162032] border-t border-[#1e293b] flex items-center justify-between">
          <p className="text-xs text-[#94a3b8]">
            Zero data leakage: all causal forecasts generated using trailing 3-month actual site demand.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
}
