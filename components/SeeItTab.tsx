"use client";

import React, { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  Warehouse,
  Truck,
  HardHat,
  Clock,
  TrendingDown,
  AlertCircle,
  Layers,
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { ItemMeta, LedgerData, ProjectMonthlyRow, GodownMonthlyRow } from "@/types";

interface SeeItTabProps {
  selectedItem: string;
  onSelectItem: (itemCode: string) => void;
  selectedGodown: string;
  onSelectGodown: (godown: string) => void;
  items: ItemMeta[];
  godowns: string[];
  ledgerData: LedgerData;
}

export default function SeeItTab({
  selectedItem,
  onSelectItem,
  selectedGodown,
  onSelectGodown,
  items,
  godowns,
  ledgerData,
}: SeeItTabProps) {
  const [yearFilter, setYearFilter] = useState<string>("ALL");

  const currentItemMeta = useMemo(() => {
    return items.find((it) => it.item_code === selectedItem) || items[0];
  }, [items, selectedItem]);

  const currentLedger = useMemo(() => {
    return ledgerData[selectedItem];
  }, [ledgerData, selectedItem]);

  const isProjectWide = selectedGodown === "ALL";

  // Filtered monthly rows
  const monthlyRows = useMemo(() => {
    if (!currentLedger) return [];
    let rows: (ProjectMonthlyRow | (GodownMonthlyRow & { consumed?: number; contractor_idle?: number; total_idle?: number }))[] = [];
    if (isProjectWide) {
      rows = currentLedger.project_monthly;
    } else {
      rows = currentLedger.godowns_monthly[selectedGodown] || [];
    }

    if (yearFilter === "ALL") return rows;
    return rows.filter((r) => r.month.startsWith(yearFilter));
  }, [currentLedger, isProjectWide, selectedGodown, yearFilter]);

  // KPI Calculations
  const kpis = useMemo(() => {
    if (!currentLedger) {
      return {
        totalReceived: 0,
        totalConsumed: 0,
        peakGodownIdle: 0,
        currentGodownIdle: 0,
        peakContractorIdle: 0,
        currentContractorIdle: 0,
      };
    }

    if (isProjectWide) {
      return {
        totalReceived: currentLedger.summary.total_received,
        totalConsumed: currentLedger.summary.total_consumed,
        peakGodownIdle: currentLedger.summary.peak_godown_idle,
        currentGodownIdle: currentLedger.summary.current_godown_idle,
        peakContractorIdle: currentLedger.summary.peak_contractor_idle,
        currentContractorIdle: currentLedger.summary.current_contractor_idle,
      };
    } else {
      const gRows = currentLedger.godowns_monthly[selectedGodown] || [];
      const totalRec = gRows.reduce((acc, r) => acc + r.receipts, 0);
      const peakG = gRows.length > 0 ? Math.max(...gRows.map((r) => r.godown_stock)) : 0;
      const currG = gRows.length > 0 ? gRows[gRows.length - 1].godown_stock : 0;
      return {
        totalReceived: totalRec,
        totalConsumed: currentLedger.summary.total_consumed, // project-wide only
        peakGodownIdle: peakG,
        currentGodownIdle: currG,
        peakContractorIdle: 0,
        currentContractorIdle: 0,
      };
    }
  }, [currentLedger, isProjectWide, selectedGodown]);

  const formatNumber = (val: number | undefined, isMT: boolean = false) => {
    if (val === undefined || val === null || isNaN(val)) return "0";
    return val.toLocaleString(undefined, {
      minimumFractionDigits: isMT ? 3 : 0,
      maximumFractionDigits: isMT ? 4 : 1,
    });
  };

  const isMT = currentItemMeta?.unit === "MT";

  const exportLedgerToCSV = () => {
    if (!monthlyRows || monthlyRows.length === 0) return;
    const headers = [
      "Month",
      "ItemCode",
      "ItemName",
      "Scope",
      "Unit",
      "Receipts",
      "TransfersIn",
      "TransfersOut",
      "Issued",
      "Returned",
      "SiteConsumed",
      "GodownStock",
      "ContractorIdleStock",
    ];
    const rows = monthlyRows.map((r) => [
      r.month,
      currentItemMeta.item_code,
      `"${currentItemMeta.item_name.replace(/"/g, '""')}"`,
      isProjectWide ? "ALL_6_GODOWNS" : selectedGodown,
      currentItemMeta.unit,
      r.receipts,
      r.transfers_in,
      r.transfers_out,
      r.issued,
      r.returned,
      isProjectWide ? (r as ProjectMonthlyRow).consumed : "",
      r.godown_stock,
      isProjectWide ? (r as ProjectMonthlyRow).contractor_idle : "",
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Lumino_Ledger_${currentItemMeta.item_code}_${isProjectWide ? "PROJECT_WIDE" : selectedGodown}_${yearFilter}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!currentLedger) {
    return (
      <div className="p-8 text-center bg-[#0f172a] rounded-xl border border-[#1e293b]">
        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
        <p className="text-gray-300">No ledger data available for item {selectedItem}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Control & Filter Bar */}
      <div className="bg-[#0f172a] p-4 rounded-xl border border-[#1e293b] shadow-lg flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          {/* Item Selector */}
          <div className="flex-1 min-w-[280px] w-full">
            <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              Material Item (16 Tracked)
            </label>
            <select
              value={selectedItem}
              onChange={(e) => onSelectItem(e.target.value)}
              className="w-full bg-[#1e293b] text-[#f8fafc] text-sm font-medium rounded-lg border border-[#334155] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F5C45] focus:border-[#0F5C45] hover:border-slate-500 transition-colors"
            >
              {items.map((it) => (
                <option key={it.item_code} value={it.item_code}>
                  {it.item_code} — {it.item_name} ({it.unit}, LT {it.lead_time_days}d)
                </option>
              ))}
            </select>
          </div>

          {/* Godown Selector */}
          <div className="min-w-[240px] w-full sm:w-auto">
            <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Warehouse className="w-3.5 h-3.5 text-[#F28C28]" />
              Godown Store Scope
            </label>
            <select
              value={selectedGodown}
              onChange={(e) => onSelectGodown(e.target.value)}
              className="w-full bg-[#1e293b] text-[#f8fafc] text-sm font-medium rounded-lg border border-[#334155] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F5C45] focus:border-[#0F5C45] hover:border-slate-500 transition-colors"
            >
              <option value="ALL">All 6 Godowns (Project-Wide)</option>
              {godowns.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Item Role & Unit Badges */}
        <div className="flex items-center gap-2 self-start sm:self-auto pt-2 sm:pt-0">
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
              currentItemMeta.role === "Parent"
                ? "bg-[#0F5C45]/20 border-[#0F5C45]/60 text-emerald-300"
                : currentItemMeta.role === "Child"
                ? "bg-[#0F5C45]/15 border-[#0F5C45]/40 text-emerald-200"
                : "bg-slate-800/80 border-slate-700 text-slate-300"
            }`}
          >
            {currentItemMeta.role} Item
          </span>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-800 border border-slate-700 text-slate-300">
            Unit: {currentItemMeta.unit}
          </span>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#F28C28]/15 border border-[#F28C28]/40 text-[#F28C28]">
            LT: {currentItemMeta.lead_time_days} Days
          </span>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Vendor Receipts */}
        <div className="bg-[#0f172a] p-4 rounded-xl border border-[#1e293b] relative overflow-hidden shadow">
          <div className="flex items-center justify-between text-[#94a3b8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
              <Truck className="w-4 h-4 text-emerald-400" />
              Total Vendor Receipts
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#0F5C45]/20 text-emerald-300 border border-[#0F5C45]/50">
              {currentItemMeta.unit}
            </span>
          </div>
          <div className="text-2xl font-bold text-[#f8fafc] tracking-tight">
            {formatNumber(kpis.totalReceived, isMT)}
          </div>
          <div className="mt-2 text-xs text-[#94a3b8]">
            {isProjectWide ? "Total received across 6 godowns" : `Receipts at ${selectedGodown}`}
          </div>
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-[#0F5C45]/10 rounded-full pointer-events-none" />
        </div>

        {/* Card 2: Site Consumption */}
        <div className="bg-[#0f172a] p-4 rounded-xl border border-[#1e293b] relative overflow-hidden shadow">
          <div className="flex items-center justify-between text-[#94a3b8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Total Site Consumption
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800">
              {currentItemMeta.unit}
            </span>
          </div>
          {isProjectWide ? (
            <>
              <div className="text-2xl font-bold text-emerald-400 tracking-tight">
                {formatNumber(kpis.totalConsumed, isMT)}
              </div>
              <div className="mt-2 text-xs text-[#94a3b8]">
                Cumulative actual site usage (2023–2026)
              </div>
            </>
          ) : (
            <>
              <div className="text-lg font-bold text-slate-400 tracking-tight flex items-center gap-1.5">
                <span>Project-Wide Only</span>
              </div>
              <div className="mt-2 text-xs text-[#F28C28] flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Consumption has no godown column</span>
              </div>
            </>
          )}
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-emerald-500/5 rounded-full pointer-events-none" />
        </div>

        {/* Card 3: Peak Godown Idle Stock */}
        <div className="bg-[#0f172a] p-4 rounded-xl border border-[#F28C28]/40 bg-gradient-to-br from-[#0f172a] to-[#F28C28]/10 relative overflow-hidden shadow">
          <div className="flex items-center justify-between text-[#94a3b8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#F28C28] flex items-center gap-1.5">
              <Warehouse className="w-4 h-4 text-[#F28C28]" />
              Peak Godown Idle Stock
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#F28C28]/20 text-[#F28C28] border border-[#F28C28]/40">
              {currentItemMeta.unit}
            </span>
          </div>
          <div className="text-2xl font-bold text-[#F28C28] tracking-tight">
            {formatNumber(kpis.peakGodownIdle, isMT)}
          </div>
          <div className="mt-2 text-xs text-[#94a3b8] flex justify-between items-center">
            <span>Current on hand:</span>
            <span className="font-semibold text-slate-200">
              {formatNumber(kpis.currentGodownIdle, isMT)} {currentItemMeta.unit}
            </span>
          </div>
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-[#F28C28]/10 rounded-full pointer-events-none" />
        </div>

        {/* Card 4: Lead Time & Contractor Idle */}
        <div className="bg-[#0f172a] p-4 rounded-xl border border-[#1e293b] relative overflow-hidden shadow">
          <div className="flex items-center justify-between text-[#94a3b8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
              <Clock className="w-4 h-4 text-emerald-400" />
              Vendor Lead Time
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              ~{currentItemMeta.lead_time_months} Months
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {currentItemMeta.lead_time_days} <span className="text-base font-normal text-slate-400">Days</span>
          </div>
          <div className="mt-2 text-xs text-[#94a3b8]">
            {isProjectWide ? (
              <div className="flex justify-between items-center">
                <span>Peak Contractor Idle:</span>
                <span className="font-semibold text-slate-200">
                  {formatNumber(kpis.peakContractorIdle, isMT)} {currentItemMeta.unit}
                </span>
              </div>
            ) : (
              <span className="text-slate-400">Contractor idle tracked project-wide</span>
            )}
          </div>
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-slate-500/5 rounded-full pointer-events-none" />
        </div>
      </div>

      {/* 3. Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Idle Stock Over Time (Area Chart) */}
        <div className="bg-[#0f172a] p-5 rounded-xl border border-[#1e293b] shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#f8fafc] flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-amber-400" />
                Cumulative Idle Stock Over Time
              </h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                {isProjectWide
                  ? "Yard Godown Idle Stock vs. Contractor-Held Idle Stock"
                  : `Yard Stock in ${selectedGodown} (Contractor idle is project-wide only)`}
              </p>
            </div>
            <div className="text-xs font-semibold px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
              Unit: {currentItemMeta.unit}
            </div>
          </div>

          <div className="h-[280px] min-h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="godownStockGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="contractorIdleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  interval={5}
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
                    `${formatNumber(Number(value), isMT)} ${currentItemMeta.unit}`,
                    name === "godown_stock"
                      ? isProjectWide
                        ? "Godown Yard Idle"
                        : `${selectedGodown} Stock`
                      : "Contractor Held Idle",
                  ]}
                  labelFormatter={(lbl) => `Month: ${lbl}`}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                  formatter={(val) =>
                    val === "godown_stock"
                      ? isProjectWide
                        ? "Godown Yard Stock"
                        : `${selectedGodown} Stock`
                      : "Contractor Idle Stock (Project-Wide)"
                  }
                />
                <Area
                  type="monotone"
                  dataKey="godown_stock"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#godownStockGrad)"
                />
                {isProjectWide && (
                  <Area
                    type="monotone"
                    dataKey="contractor_idle"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#contractorIdleGrad)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Material Flows (Composed Chart) */}
        <div className="bg-[#0f172a] p-5 rounded-xl border border-[#1e293b] shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#f8fafc] flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-400" />
                Monthly Material Movements
              </h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                {isProjectWide
                  ? "Receipts vs. Issues to Contractors vs. Actual Site Usage"
                  : `Receipts, Issues & Transfers for ${selectedGodown}`}
              </p>
            </div>
            <div className="text-xs font-semibold px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
              Unit: {currentItemMeta.unit}
            </div>
          </div>

          <div className="h-[280px] min-h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyRows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  interval={5}
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
                    `${formatNumber(Number(value), isMT)} ${currentItemMeta.unit}`,
                    name === "receipts"
                      ? "Vendor Receipts"
                      : name === "issued"
                      ? "Issued to Contractors"
                      : name === "consumed"
                      ? "Actual Site Consumption"
                      : name === "transfers_in"
                      ? "Transfers IN"
                      : "Transfers OUT",
                  ]}
                  labelFormatter={(lbl) => `Month: ${lbl}`}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar
                  dataKey="receipts"
                  name="Receipts"
                  fill="#3b82f6"
                  opacity={0.85}
                  radius={[3, 3, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="issued"
                  name="Issued"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
                {isProjectWide ? (
                  <Line
                    type="monotone"
                    dataKey="consumed"
                    name="Site Consumed"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                ) : (
                  <>
                    <Line
                      type="monotone"
                      dataKey="transfers_in"
                      name="Trf IN"
                      stroke="#8b5cf6"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="transfers_out"
                      name="Trf OUT"
                      stroke="#ec4899"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Monthly Ledger Audit Table */}
      <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] shadow overflow-hidden">
        <div className="p-4 border-b border-[#1e293b] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#f8fafc] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Monthly Physical Inventory Ledger (44 Months: Mar 2023 – Oct 2026)
            </h3>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              Exact transaction balances based on Lumino&apos;s EPC accounting identity. Initial stock = 0.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Year Filter Buttons */}
            <div className="flex items-center gap-1 bg-[#1e293b] p-1 rounded-lg border border-[#334155]">
              {["ALL", "2023", "2024", "2025", "2026"].map((y) => (
                <button
                  key={y}
                  onClick={() => setYearFilter(y)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                    yearFilter === y
                      ? "bg-[#0F5C45] text-white shadow-sm hover:bg-[#0c4b38]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>

            {/* Export CSV Button */}
            <button
              onClick={exportLedgerToCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
              title="Export filtered monthly physical inventory ledger to CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table Container with Sticky Header */}
        <div className="max-h-[380px] overflow-y-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-[#94a3b8] bg-[#162032] sticky top-0 z-10 shadow-sm border-b border-[#1e293b]">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Month
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold text-slate-200">
                  Receipts
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  Trf IN
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  Trf OUT
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold text-slate-300">
                  Issued
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  Returned
                </th>
                <th
                  scope="col"
                  className={`px-3 py-3 text-right font-semibold ${
                    isProjectWide ? "text-emerald-300" : "text-slate-500"
                  }`}
                >
                  Consumed {isProjectWide ? "" : "(Proj)"}
                </th>
                <th scope="col" className="px-4 py-3 text-right font-bold text-[#F28C28] bg-[#F28C28]/15">
                  Godown Stock
                </th>
                <th
                  scope="col"
                  className={`px-4 py-3 text-right font-bold ${
                    isProjectWide ? "text-emerald-300 bg-[#0F5C45]/15" : "text-slate-500 bg-slate-900/50"
                  }`}
                >
                  Contractor Idle
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60">
              {monthlyRows.map((row, idx) => {
                const hasRawNegative = row.raw_godown_stock < -1e-5;
                return (
                  <tr
                    key={row.month}
                    className={`hover:bg-[#1e293b]/50 transition-colors ${
                      idx % 2 === 0 ? "bg-[#0f172a]" : "bg-[#0c1322]"
                    }`}
                  >
                    <td className="px-4 py-2.5 font-medium text-slate-200 whitespace-nowrap">
                      {row.month}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-200">
                      {row.receipts > 0 ? formatNumber(row.receipts, isMT) : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-300">
                      {row.transfers_in > 0 ? formatNumber(row.transfers_in, isMT) : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-300">
                      {row.transfers_out > 0 ? formatNumber(row.transfers_out, isMT) : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-300">
                      {row.issued > 0 ? formatNumber(row.issued, isMT) : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-300">
                      {row.returned > 0 ? formatNumber(row.returned, isMT) : "—"}
                    </td>
                    <td
                      className={`px-3 py-2.5 text-right font-mono ${
                        isProjectWide
                          ? row.consumed && row.consumed > 0
                            ? "text-emerald-400"
                            : "text-slate-500"
                          : "text-slate-600 italic"
                      }`}
                    >
                      {isProjectWide
                        ? row.consumed && row.consumed > 0
                          ? formatNumber(row.consumed, isMT)
                          : "—"
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-[#F28C28] bg-[#F28C28]/5">
                      <div className="flex items-center justify-end gap-1">
                        {hasRawNegative && (
                          <span
                            title={`Raw un-clamped balance was ${row.raw_godown_stock} (clamped to 0 due to late ERP entry)`}
                            className="text-[10px] text-[#F28C28] cursor-help"
                          >
                            ⚠️
                          </span>
                        )}
                        <span>{formatNumber(row.godown_stock, isMT)}</span>
                      </div>
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-mono font-bold ${
                        isProjectWide
                          ? "text-emerald-300 bg-[#0F5C45]/5"
                          : "text-slate-600 italic bg-slate-900/30"
                      }`}
                    >
                      {isProjectWide
                        ? row.contractor_idle !== undefined
                          ? formatNumber(row.contractor_idle, isMT)
                          : "—"
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-[#131d2e] border-t border-[#1e293b] text-[11px] text-[#94a3b8] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              All quantities in <strong>{currentItemMeta.unit}</strong>. Contractor idle is strictly project-wide.
            </span>
          </div>
          <div className="text-slate-400">
            Showing {monthlyRows.length} of 44 monthly records
          </div>
        </div>
      </div>
    </div>
  );
}
