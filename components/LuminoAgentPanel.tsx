"use client";

import React, { useState } from "react";
import {
  Sparkles,
  X,
  Send,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowRightLeft,
  Truck,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { AgentResponse, ToolCallRecord, ERPVoucher } from "@/lib/agentEngine";

interface LuminoAgentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem: string;
  activeMonth: string;
}

export default function LuminoAgentPanel({
  isOpen,
  onClose,
  activeItem,
  activeMonth,
}: LuminoAgentPanelProps) {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [activeVoucher, setActiveVoucher] = useState<ERPVoucher | null>(null);
  const [isTraceOpen, setIsTraceOpen] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const quickPrompts = [
    {
      label: "8.5m PCC Poles (2024-06) + Draft PO",
      text: `What is the inventory status of 8.5m PCC Poles (MPO010014) in 2024-06, and draft a purchase order voucher for 1,500 PCS?`,
    },
    {
      label: "Pole Clamp Assembly Bottlenecks (2024-11)",
      text: `Check Pole Clamp RDSS (MRP070060) assembly bottlenecks in 2024-11 and draft an inter-godown transfer voucher to fix it.`,
    },
    {
      label: "Scorecard & Idle Reduction",
      text: `Summarize our project-wide Actual vs. Plan scorecard and largest idle stock reductions for ${activeItem} in ${activeMonth}.`,
    },
  ];

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim()) return;

    setLoading(true);
    setResponse(null);
    setActiveVoucher(null);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          activeItem,
          activeMonth,
        }),
      });

      if (!res.ok) {
        throw new Error(`Agent query failed with HTTP ${res.status}`);
      }

      const data: AgentResponse = await res.json();
      setResponse(data);
      if (data.draftVoucher) {
        setActiveVoucher(data.draftVoucher);
      }
    } catch (err: any) {
      console.error("Agent error:", err);
      setResponse({
        answer: `• **Error**: ${err?.message || "Failed to contact agent."}\n• **Fallback**: Please verify network connection or test another query.`,
        toolCalls: [],
        draftVoucher: null,
        provider: "Deterministic Agent Engine",
        durationTotalMs: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (response?.answer) {
      navigator.clipboard.writeText(response.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0b0f19] border-l border-[#1e293b] w-full max-w-2xl h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Panel Header */}
        <div className="p-4 bg-[#0f172a] border-b border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">
                  Lumino Supply-Chain Agent
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  Tool-Calling Copilot
                </span>
              </div>
              <p className="text-[11px] text-[#94a3b8]">
                Context: <strong className="text-slate-300">{activeItem}</strong> · Month: <strong className="text-slate-300">{activeMonth}</strong>
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Prompts */}
          <div>
            <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider block mb-1.5">
              Suggested Operational Queries
            </span>
            <div className="flex flex-col gap-1.5">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(p.text);
                    handleSend(p.text);
                  }}
                  className="p-2 text-left text-xs bg-[#131d2e] hover:bg-[#1a263c] border border-[#1e293b] hover:border-blue-700/60 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center justify-between gap-2"
                >
                  <span className="truncate">{p.label}</span>
                  <span className="text-[10px] text-blue-400 shrink-0 font-medium">Run →</span>
                </button>
              ))}
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="p-6 bg-[#0f172a] rounded-xl border border-[#1e293b] text-center space-y-3 animate-pulse">
              <div className="w-8 h-8 mx-auto rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              </div>
              <div className="text-xs font-semibold text-white">
                Querying 231,076-row ledger &amp; causal simulation engine...
              </div>
              <p className="text-[11px] text-slate-400">
                Running deterministic tools: get_godown_stock, get_plan_decision, draft_erp_voucher
              </p>
            </div>
          )}

          {/* Response Container */}
          {response && (
            <div className="space-y-4 animate-fade-in">
              {/* Tool Execution Trace */}
              {response.toolCalls.length > 0 && (
                <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] overflow-hidden">
                  <button
                    onClick={() => setIsTraceOpen(!isTraceOpen)}
                    className="w-full p-3 bg-[#131d2e] flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      <span>Tool-Call Trace ({response.toolCalls.length} Deterministic Calls)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="font-mono text-[10px] text-emerald-400">
                        {response.durationTotalMs}ms
                      </span>
                      {isTraceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isTraceOpen && (
                    <div className="p-3 space-y-2 border-t border-[#1e293b] text-xs">
                      {response.toolCalls.map((tc, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-[#0b0f19] border border-[#1e293b] space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-blue-400 text-[11px] flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                              {tc.tool}()
                            </span>
                            <span className="font-mono text-[10px] text-slate-500">
                              {tc.durationMs}ms
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {tc.summary}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Synthesized Executive Brief */}
              <div className="bg-[#0f172a] p-4 rounded-xl border border-[#1e293b] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-400" />
                    Executive Operational Brief
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="p-1 text-slate-400 hover:text-white text-xs flex items-center gap-1 rounded bg-[#1e293b] px-2 py-0.5"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line space-y-2 font-sans">
                  {response.answer}
                </div>

                <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-[10px] text-slate-500">
                  <span>Provider: <strong className="text-slate-400">{response.provider}</strong></span>
                  <span>Execution: <strong className="text-emerald-400">{response.durationTotalMs}ms</strong></span>
                </div>
              </div>

              {/* Draft ERP Voucher Preview Card (if generated) */}
              {activeVoucher && (
                <div className="bg-[#0f172a] border border-amber-900/60 rounded-xl overflow-hidden shadow-xl animate-fade-in">
                  {/* Voucher Header */}
                  <div className="p-3 bg-amber-950/40 border-b border-amber-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-900/80 text-amber-200 border border-amber-700 font-mono text-[10px] font-bold">
                        {activeVoucher.voucher_id}
                      </span>
                      <span className="text-xs font-bold text-amber-200">
                        {activeVoucher.voucher_type === "PURCHASE_ORDER"
                          ? "Draft Purchase Order"
                          : "Draft Inter-Godown Transfer Voucher"}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                        activeVoucher.status === "APPROVED"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                          : activeVoucher.status === "REJECTED"
                          ? "bg-red-950 text-red-300 border-red-800"
                          : "bg-amber-950 text-amber-300 border-amber-700"
                      }`}
                    >
                      {activeVoucher.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Voucher Body Grid */}
                  <div className="p-4 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3 bg-[#131d2e] p-3 rounded-lg border border-[#1e293b]">
                      <div>
                        <span className="text-[10px] text-[#94a3b8] uppercase block">Item</span>
                        <span className="font-semibold text-white">
                          {activeVoucher.item_code} — {activeVoucher.item_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#94a3b8] uppercase block">Draft Quantity</span>
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          {activeVoucher.qty.toLocaleString()} {activeVoucher.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#94a3b8] uppercase block">
                          {activeVoucher.voucher_type === "PURCHASE_ORDER" ? "Vendor Delivery" : "From Store"}
                        </span>
                        <span className="font-semibold text-amber-300">
                          {activeVoucher.from_godown || "Central Receiving Store"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#94a3b8] uppercase block">Destination Store</span>
                        <span className="font-semibold text-blue-300">
                          {activeVoucher.to_godown}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#94a3b8] uppercase block mb-1">
                        Operational Justification
                      </span>
                      <p className="text-[11px] text-slate-300 bg-[#0b0f19] p-2 rounded border border-[#1e293b] leading-relaxed">
                        {activeVoucher.reason}
                      </p>
                    </div>

                    {/* Human-In-The-Loop Approval Buttons */}
                    <div className="pt-2 flex items-center justify-end gap-2">
                      {activeVoucher.status === "PENDING_HOD_APPROVAL" ? (
                        <>
                          <button
                            onClick={() =>
                              setActiveVoucher((prev) => (prev ? { ...prev, status: "REJECTED" } : null))
                            }
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800 transition-colors"
                          >
                            Reject Draft
                          </button>
                          <button
                            onClick={() =>
                              setActiveVoucher((prev) => (prev ? { ...prev, status: "APPROVED" } : null))
                            }
                            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-950"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Sign &amp; Approve Voucher (HOD)</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-bold">
                          {activeVoucher.status === "APPROVED" ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              Digitally Signed &amp; Transmitted to ERP
                            </span>
                          ) : (
                            <span className="text-red-400 flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4" />
                              Voucher Rejected
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#0f172a] border-t border-[#1e293b] flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Ask about ${activeItem} in ${activeMonth} or draft an order/transfer...`}
            className="flex-1 bg-[#1e293b] text-white text-xs px-3 py-2.5 rounded-lg border border-[#334155] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !query.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
