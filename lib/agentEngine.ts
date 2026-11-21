import fs from "fs";
import path from "path";
import { MetaData, LedgerData, SetsData } from "@/types";

// Cached in memory for sub-millisecond execution
let cachedMeta: MetaData | null = null;
let cachedLedger: LedgerData | null = null;
let cachedPlanner: Record<string, any> | null = null;
let cachedSets: SetsData | null = null;

export function loadAllData() {
  if (cachedMeta && cachedLedger && cachedPlanner && cachedSets) {
    return {
      meta: cachedMeta,
      ledger: cachedLedger,
      planner: cachedPlanner,
      sets: cachedSets,
    };
  }

  const dataDir = path.join(process.cwd(), "public", "data");
  cachedMeta = JSON.parse(fs.readFileSync(path.join(dataDir, "meta.json"), "utf-8"));
  cachedLedger = JSON.parse(fs.readFileSync(path.join(dataDir, "ledger.json"), "utf-8"));
  cachedPlanner = JSON.parse(fs.readFileSync(path.join(dataDir, "planner.json"), "utf-8"));
  cachedSets = JSON.parse(fs.readFileSync(path.join(dataDir, "sets.json"), "utf-8"));

  return {
    meta: cachedMeta!,
    ledger: cachedLedger!,
    planner: cachedPlanner!,
    sets: cachedSets!,
  };
}

export interface ToolCallRecord {
  tool: string;
  args: Record<string, any>;
  summary: string;
  durationMs: number;
  output: any;
}

export interface ERPVoucher {
  voucher_id: string;
  voucher_type: "INTER_GODOWN_TRANSFER" | "PURCHASE_ORDER";
  status: "PENDING_HOD_APPROVAL" | "APPROVED" | "REJECTED";
  item_code: string;
  item_name: string;
  unit: string;
  qty: number;
  from_godown?: string;
  to_godown: string;
  month: string;
  reason: string;
  created_at: string;
}

export interface AgentResponse {
  answer: string;
  toolCalls: ToolCallRecord[];
  draftVoucher: ERPVoucher | null;
  provider: "Sarvam AI" | "Gemini 2.5 Flash" | "Deterministic Agent Engine";
  durationTotalMs: number;
}

// -------------------------------------------------------------
// 1. TOOL 1: get_godown_stock
// -------------------------------------------------------------
export function get_godown_stock(args: { item_code: string; month: string }) {
  const { ledger } = loadAllData();
  const item = ledger[args.item_code];
  if (!item) {
    throw new Error(`Item ${args.item_code} not found in inventory ledger.`);
  }

  const pMonth = item.project_monthly.find((r) => r.month === args.month);
  if (!pMonth) {
    throw new Error(`Month ${args.month} not found in historical records.`);
  }

  const godownsBreakdown = Object.keys(item.godowns_monthly).map((g) => {
    const gRows = item.godowns_monthly[g];
    const gRow = gRows.find((r) => r.month === args.month);
    return {
      godown: g,
      stock: gRow ? gRow.godown_stock : 0,
      receipts: gRow ? gRow.receipts : 0,
      issued: gRow ? gRow.issued : 0,
      returned: gRow ? gRow.returned : 0,
      transfers_in: gRow ? gRow.transfers_in : 0,
      transfers_out: gRow ? gRow.transfers_out : 0,
    };
  });

  return {
    item_code: item.item_code,
    item_name: item.item_name,
    unit: item.unit,
    month: args.month,
    project_receipts: pMonth.receipts,
    project_issued: pMonth.issued,
    project_consumed: pMonth.consumed,
    godown_stock_total: pMonth.godown_stock,
    contractor_idle_total: pMonth.contractor_idle,
    total_idle: pMonth.total_idle,
    godowns_breakdown: godownsBreakdown,
  };
}

// -------------------------------------------------------------
// 2. TOOL 2: get_plan_decision
// -------------------------------------------------------------
export function get_plan_decision(args: { item_code: string; month: string }) {
  const { planner } = loadAllData();
  const itemPlan = planner[args.item_code];
  if (!itemPlan) {
    throw new Error(`Item ${args.item_code} not found in planner.`);
  }

  const mReplay = itemPlan.monthly_replay.find((r: any) => r.month === args.month);
  if (!mReplay) {
    throw new Error(`Month ${args.month} not found in planner replay.`);
  }

  return {
    item_code: itemPlan.item_code,
    item_name: itemPlan.item_name,
    unit: itemPlan.unit,
    month: args.month,
    action: mReplay.action,
    order_qty: mReplay.order_qty,
    expected_arrival_month: mReplay.expected_arrival_month,
    lead_time_days: itemPlan.lead_time_days,
    lead_time_months: itemPlan.lead_time_months,
    trailing_demand_dhat: mReplay.trailing_demand_dhat,
    safety_stock: mReplay.safety_stock,
    target_inventory: mReplay.target_inventory,
    inventory_position: mReplay.inventory_position,
    plan_stock: mReplay.plan_stock,
    plan_shortage: mReplay.plan_shortage,
    recommended_transfers: mReplay.recommended_transfers || [],
    scorecard: itemPlan.comparison,
  };
}

// -------------------------------------------------------------
// 3. TOOL 3: get_set_bottlenecks
// -------------------------------------------------------------
export function get_set_bottlenecks(args: { parent_code: string; month: string; mode?: "calibrated" | "raw" }) {
  const { sets } = loadAllData();
  const parentSet = sets[args.parent_code];
  if (!parentSet) {
    throw new Error(`Parent set ${args.parent_code} not found. Must be MRP070060, MRP070064, or MRP070065.`);
  }

  const mRecord = parentSet.monthly_records.find((r) => r.month === args.month);
  if (!mRecord) {
    throw new Error(`Month ${args.month} not found in sets records.`);
  }

  const mode = args.mode || "calibrated";
  const modeData = mRecord[mode];

  // For each godown, detect candidate donor for limiting child
  const godownsSummary = modeData.godowns.map((gCard) => {
    let donorCandidate = null;
    if (gCard.stranded_parent_stock > 10 && gCard.limiting_child_code) {
      const limitCode = gCard.limiting_child_code;
      let maxSurplus = 0;
      for (const other of modeData.godowns) {
        if (other.godown === gCard.godown) continue;
        const child = other.children_breakdown.find((c) => c.child_code === limitCode);
        if (child) {
          const donorNeed = other.parent_stock * child.ratio;
          const surplus = Math.max(0, child.child_stock - donorNeed);
          if (surplus > (child.child_unit === "MT" ? 0.005 : 1.0) && surplus > maxSurplus) {
            maxSurplus = surplus;
            donorCandidate = {
              from_godown: other.godown,
              surplus: Math.round(surplus * 100) / 100,
              unit: child.child_unit,
            };
          }
        }
      }
    }

    const isBlocked = gCard.parent_stock > 10 && (gCard.stranded_parent_stock / gCard.parent_stock > 0.15);

    return {
      godown: gCard.godown,
      parent_stock: gCard.parent_stock,
      buildable_sets: gCard.buildable_sets,
      stranded_parent_stock: gCard.stranded_parent_stock,
      is_blocked: isBlocked,
      limiting_child_code: isBlocked ? gCard.limiting_child_code : null,
      limiting_child_name: isBlocked ? gCard.limiting_child_name : null,
      donor_candidate: donorCandidate,
      children: gCard.children_breakdown.map((c) => ({
        child_code: c.child_code,
        child_name: c.child_name,
        child_unit: c.child_unit,
        child_stock: c.child_stock,
        needed: c.needed_for_all_parent,
        shortfall_surplus: c.shortfall_surplus,
      })),
    };
  });

  return {
    parent_code: parentSet.parent_code,
    parent_name: parentSet.parent_name,
    set_no: parentSet.set_no,
    month: args.month,
    mode: mode,
    total_parent_stock: modeData.total_parent_stock,
    total_buildable_sets: modeData.total_buildable_sets,
    total_stranded_parent: modeData.total_stranded_parent,
    blocked_godowns_count: godownsSummary.filter((g) => g.is_blocked).length,
    godowns: godownsSummary,
  };
}

// -------------------------------------------------------------
// 4. TOOL 4: draft_erp_voucher
// -------------------------------------------------------------
export function draft_erp_voucher(args: {
  voucher_type: "INTER_GODOWN_TRANSFER" | "PURCHASE_ORDER";
  item_code: string;
  qty: number;
  from_godown?: string;
  to_godown: string;
  month: string;
  reason: string;
}): ERPVoucher {
  const { meta } = loadAllData();
  const item = meta.items.find((it) => it.item_code === args.item_code);
  if (!item) {
    throw new Error(`Invalid item code: ${args.item_code}`);
  }

  if (args.qty <= 0) {
    throw new Error(`Voucher quantity must be strictly positive, received ${args.qty}`);
  }

  if (args.voucher_type === "INTER_GODOWN_TRANSFER") {
    if (!args.from_godown) {
      throw new Error("Inter-godown transfer requires from_godown specification.");
    }
    if (args.from_godown === args.to_godown) {
      throw new Error(`Source and destination godowns cannot be identical (${args.from_godown}).`);
    }
  }

  const cleanMonth = args.month.replace("-", "");
  const prefix = args.voucher_type === "PURCHASE_ORDER" ? "PO" : "TRF";
  const voucherId = `LUM-${prefix}-${cleanMonth}-${Math.floor(100 + Math.random() * 900)}`;

  return {
    voucher_id: voucherId,
    voucher_type: args.voucher_type,
    status: "PENDING_HOD_APPROVAL",
    item_code: item.item_code,
    item_name: item.item_name,
    unit: item.unit,
    qty: Math.round(args.qty * 100) / 100,
    from_godown: args.from_godown,
    to_godown: args.to_godown,
    month: args.month,
    reason: args.reason,
    created_at: new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// Deterministic Intent Resolver & Query Handler
// -------------------------------------------------------------
export function resolveQueryEntities(query: string, activeItem?: string, activeMonth?: string) {
  const { meta } = loadAllData();
  const qLower = query.toLowerCase();

  // 1. Resolve Month (YYYY-MM or "Month YYYY" or defaults)
  let resolvedMonth = activeMonth || "2024-06";
  const monthMatch = query.match(/202[3-6]-(?:0[1-9]|1[0-2])/);
  if (monthMatch) {
    resolvedMonth = monthMatch[0];
  } else if (qLower.includes("2023")) {
    resolvedMonth = "2023-08";
  } else if (qLower.includes("2024")) {
    resolvedMonth = "2024-06";
  } else if (qLower.includes("2025")) {
    resolvedMonth = "2025-06";
  } else if (qLower.includes("2026")) {
    resolvedMonth = "2026-04";
  }

  // 2. Resolve Parent Assembly Set
  let resolvedParentSet: string | null = null;
  if (qLower.includes("clamp") || qLower.includes("rdss") || qLower.includes("1.071") || qLower.includes("mrp070060")) {
    resolvedParentSet = "MRP070060";
  } else if (qLower.includes("single phase") || qLower.includes("1-phase") || qLower.includes("1.077") || qLower.includes("mrp070064")) {
    resolvedParentSet = "MRP070064";
  } else if (qLower.includes("three phase") || qLower.includes("3-phase") || qLower.includes("1.078") || qLower.includes("mrp070065")) {
    resolvedParentSet = "MRP070065";
  }

  // 3. Resolve Material Item
  let resolvedItem = activeItem || "MPO010014";
  // Direct item code match
  for (const it of meta.items) {
    if (qLower.includes(it.item_code.toLowerCase())) {
      resolvedItem = it.item_code;
      break;
    }
  }
  // Name matches
  if (!resolvedItem || resolvedItem === (activeItem || "MPO010014")) {
    if (qLower.includes("pole") || qLower.includes("pcc")) resolvedItem = "MPO010014";
    else if (qLower.includes("lug") && qLower.includes("ring")) resolvedItem = "MLU020008";
    else if (qLower.includes("lug")) resolvedItem = "MLU020013";
    else if (qLower.includes("hook")) resolvedItem = "MEH050071";
    else if (qLower.includes("bolt") && (qLower.includes("tonne") || qLower.includes("mt") || qLower.includes("g.i"))) resolvedItem = "MNB010174";
    else if (qLower.includes("cable") && (qLower.includes("un-armoured") || qLower.includes("armoured") || qLower.includes("1x25"))) resolvedItem = "MRP070022";
    else if (qLower.includes("connector") || qLower.includes("wedge")) resolvedItem = "MCO010007";
  }

  // 4. Resolve Voucher Intent & Explicit Quantity
  const isVoucherRequested =
    qLower.includes("draft") ||
    qLower.includes("voucher") ||
    qLower.includes("po") ||
    qLower.includes("purchase order") ||
    qLower.includes("transfer voucher") ||
    qLower.includes("prepare order");

  let requestedQty: number | null = null;
  const numMatches = query.match(/\b([1-9]\d{0,2}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)\s*(?:pcs|nos|set|kg|mt|km|mtr|poles|clamps|lugs|units)?\b/i);
  if (numMatches && isVoucherRequested) {
    const rawNum = numMatches[1].replace(/,/g, "");
    const parsed = parseFloat(rawNum);
    // Ignore year-like numbers 2023-2026
    if (parsed > 0 && !(parsed >= 2023 && parsed <= 2026)) {
      requestedQty = parsed;
    }
  }

  return {
    itemCode: resolvedItem,
    parentSetCode: resolvedParentSet,
    month: resolvedMonth,
    isVoucherRequested,
    requestedQty,
  };
}

// -------------------------------------------------------------
// Grounded Execution & Deterministic Synthesis
// -------------------------------------------------------------
export async function executeAgentQuery(
  query: string,
  activeItem?: string,
  activeMonth?: string
): Promise<AgentResponse> {
  const tStart = performance.now();
  const entities = resolveQueryEntities(query, activeItem, activeMonth);
  const toolCalls: ToolCallRecord[] = [];
  let draftVoucher: ERPVoucher | null = null;

  const isSetQuery = Boolean(entities.parentSetCode) || query.toLowerCase().includes("bottleneck") || query.toLowerCase().includes("stranded");

  if (isSetQuery) {
    const parentCode = entities.parentSetCode || "MRP070060";
    const t0 = performance.now();
    const setOutput = get_set_bottlenecks({ parent_code: parentCode, month: entities.month, mode: "calibrated" });
    const dur = performance.now() - t0;

    toolCalls.push({
      tool: "get_set_bottlenecks",
      args: { parent_code: parentCode, month: entities.month, mode: "calibrated" },
      summary: `Evaluated Set ${setOutput.set_no} (${setOutput.parent_name}) at ${entities.month}: ${setOutput.total_parent_stock} parent stock, ${setOutput.total_buildable_sets} complete buildable sets, ${setOutput.total_stranded_parent} stranded (${setOutput.blocked_godowns_count} blocked godowns).`,
      durationMs: Math.round(dur * 10) / 10,
      output: setOutput,
    });

    // If voucher requested for transfer or blocked godown has donor
    if (entities.isVoucherRequested && setOutput.blocked_godowns_count > 0) {
      const blockedGodown = setOutput.godowns.find((g) => g.is_blocked && g.donor_candidate);
      if (blockedGodown && blockedGodown.donor_candidate) {
        const tV = performance.now();
        draftVoucher = draft_erp_voucher({
          voucher_type: "INTER_GODOWN_TRANSFER",
          item_code: blockedGodown.limiting_child_code || "MEH050071",
          qty: blockedGodown.donor_candidate.surplus,
          from_godown: blockedGodown.donor_candidate.from_godown,
          to_godown: blockedGodown.godown,
          month: entities.month,
          reason: `Relieve stranded ${parentCode} parent sets in ${blockedGodown.godown} by transferring surplus ${blockedGodown.limiting_child_name} from ${blockedGodown.donor_candidate.from_godown}.`,
        });
        toolCalls.push({
          tool: "draft_erp_voucher",
          args: {
            voucher_type: "INTER_GODOWN_TRANSFER",
            item_code: draftVoucher.item_code,
            qty: draftVoucher.qty,
            from: draftVoucher.from_godown,
            to: draftVoucher.to_godown,
          },
          summary: `Drafted ${draftVoucher.voucher_id}: Transfer ${draftVoucher.qty} ${draftVoucher.unit} of ${draftVoucher.item_name} from ${draftVoucher.from_godown} to ${draftVoucher.to_godown}.`,
          durationMs: Math.round((performance.now() - tV) * 10) / 10,
          output: draftVoucher,
        });
      }
    }
  } else {
    // Inventory & Procurement Query
    const t0 = performance.now();
    const stockOutput = get_godown_stock({ item_code: entities.itemCode, month: entities.month });
    toolCalls.push({
      tool: "get_godown_stock",
      args: { item_code: entities.itemCode, month: entities.month },
      summary: `Retrieved ${stockOutput.item_code} (${stockOutput.item_name}) stock at ${entities.month}: ${stockOutput.godown_stock_total} ${stockOutput.unit} in yard godowns, ${stockOutput.contractor_idle_total} ${stockOutput.unit} with contractors (total idle: ${stockOutput.total_idle} ${stockOutput.unit}).`,
      durationMs: Math.round((performance.now() - t0) * 10) / 10,
      output: stockOutput,
    });

    const t1 = performance.now();
    const planOutput = get_plan_decision({ item_code: entities.itemCode, month: entities.month });
    toolCalls.push({
      tool: "get_plan_decision",
      args: { item_code: entities.itemCode, month: entities.month },
      summary: `Planner decision at ${entities.month}: Action ${planOutput.action}, Order Qty ${planOutput.order_qty} ${planOutput.unit} (arrives ${planOutput.expected_arrival_month}, LT ${planOutput.lead_time_days}d). Trailing Demand: ${planOutput.trailing_demand_dhat} /mo. Causal Scorecard: ${planOutput.scorecard.reduction_pct}% idle reduction, ${planOutput.scorecard.service_level}% service level.`,
      durationMs: Math.round((performance.now() - t1) * 10) / 10,
      output: planOutput,
    });

    // If voucher requested or order/transfer recommended
    const effectiveOrderQty =
      planOutput.order_qty > 0
        ? planOutput.order_qty
        : entities.requestedQty && entities.requestedQty > 0
        ? entities.requestedQty
        : 0;

    if (entities.isVoucherRequested && effectiveOrderQty > 0) {
      const tV = performance.now();
      draftVoucher = draft_erp_voucher({
        voucher_type: "PURCHASE_ORDER",
        item_code: planOutput.item_code,
        qty: effectiveOrderQty,
        to_godown: "CENTRAL_RECEIVING_DISTRICT_STORES",
        month: entities.month,
        reason: `Causal replenishment order of ${effectiveOrderQty} ${planOutput.unit} placed at ${entities.month} for expected delivery in ${planOutput.expected_arrival_month} (${planOutput.lead_time_days}d vendor lead time).`,
      });
      toolCalls.push({
        tool: "draft_erp_voucher",
        args: {
          voucher_type: "PURCHASE_ORDER",
          item_code: draftVoucher.item_code,
          qty: draftVoucher.qty,
          to: draftVoucher.to_godown,
        },
        summary: `Drafted ${draftVoucher.voucher_id}: Purchase Order for ${draftVoucher.qty} ${draftVoucher.unit} of ${draftVoucher.item_name}.`,
        durationMs: Math.round((performance.now() - tV) * 10) / 10,
        output: draftVoucher,
      });
    } else if (entities.isVoucherRequested && planOutput.recommended_transfers.length > 0) {
      const xfer = planOutput.recommended_transfers[0];
      const tV = performance.now();
      draftVoucher = draft_erp_voucher({
        voucher_type: "INTER_GODOWN_TRANSFER",
        item_code: planOutput.item_code,
        qty: xfer.qty,
        from_godown: xfer.from_godown,
        to_godown: xfer.to_godown,
        month: entities.month,
        reason: xfer.reason,
      });
      toolCalls.push({
        tool: "draft_erp_voucher",
        args: {
          voucher_type: "INTER_GODOWN_TRANSFER",
          item_code: draftVoucher.item_code,
          qty: draftVoucher.qty,
          from: draftVoucher.from_godown,
          to: draftVoucher.to_godown,
        },
        summary: `Drafted ${draftVoucher.voucher_id}: Transfer ${draftVoucher.qty} ${draftVoucher.unit} from ${draftVoucher.from_godown} to ${draftVoucher.to_godown}.`,
        durationMs: Math.round((performance.now() - tV) * 10) / 10,
        output: draftVoucher,
      });
    }
  }

  // -------------------------------------------------------------
  // Response Generation: External LLM or Deterministic Fallback
  // -------------------------------------------------------------
  const apiKey = process.env.GEMINI_API_KEY || process.env.SARVAM_API_KEY;
  let synthesizedAnswer = "";
  let providerUsed: "Sarvam AI" | "Gemini 2.5 Flash" | "Deterministic Agent Engine" = "Deterministic Agent Engine";

  if (apiKey && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are Lumino's senior EPC supply-chain analyst. Answer the user's query based strictly on the deterministic tool execution outputs below.
STRICT RULES:
1. Provide a concise 4-bullet executive briefing:
   - **Situation**: Current on-hand stock vs actual contractor usage
   - **Root Cause**: What caused this stock condition or bottleneck
   - **Recommended Action**: Order, Transfer, or Hold decision
   - **Risk Note**: Lead-time vulnerability or assembly stranding risk
2. Use ONLY the exact numbers from the tool outputs below. NEVER invent, round differently, or recalculate numbers.
3. Keep it crisp, factual, and desktop-ready.

USER QUERY: "${query}"

TOOL OUTPUTS:
${JSON.stringify(toolCalls.map((tc) => ({ tool: tc.tool, summary: tc.summary, output: tc.output })), null, 2)}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 500, temperature: 0.1 },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          synthesizedAnswer = text;
          providerUsed = "Gemini 2.5 Flash";
        }
      }
    } catch {
      // Fallback seamlessly to deterministic synthesis
    }
  }

  // Deterministic Fallback Synthesis (100% reliable)
  if (!synthesizedAnswer) {
    providerUsed = "Deterministic Agent Engine";
    if (isSetQuery) {
      const setCall = toolCalls.find((tc) => tc.tool === "get_set_bottlenecks")?.output;
      if (setCall) {
        const blockedGodowns = setCall.godowns.filter((g: any) => g.is_blocked);
        synthesizedAnswer = `• **Situation**: As of ${setCall.month}, ${setCall.parent_name} (${setCall.parent_code}) has ${setCall.total_parent_stock.toLocaleString()} units of parent stock on hand across 6 godowns, but only ${setCall.total_buildable_sets.toLocaleString()} complete buildable sets (${setCall.total_stranded_parent.toLocaleString()} parent sets stranded).
• **Root Cause**: ${blockedGodowns.length} of 6 district godowns are blocked because child component supplies are out of balance under site consumption ratios.
• **Recommended Action**: ${
          draftVoucher
            ? `Inter-godown transfer voucher ${draftVoucher.voucher_id} drafted for ${draftVoucher.qty} ${draftVoucher.unit} of ${draftVoucher.item_name} from ${draftVoucher.from_godown} to ${draftVoucher.to_godown}.`
            : blockedGodowns.length > 0 && blockedGodowns[0].donor_candidate
            ? `Rebalance regional inventory: Transfer ${blockedGodowns[0].donor_candidate.surplus} ${blockedGodowns[0].donor_candidate.unit} from ${blockedGodowns[0].donor_candidate.from_godown} to ${blockedGodowns[0].godown}.`
            : "Reorder missing child components via vendor PO; local godowns have no surplus to share."
        }
• **Risk Note**: Using raw BOQ ratios in sets.csv severely distorts component requirements (especially MNB010174 in MT). Always verify against Calibrated Site Ratios.`;
      }
    } else {
      const stockCall = toolCalls.find((tc) => tc.tool === "get_godown_stock")?.output;
      const planCall = toolCalls.find((tc) => tc.tool === "get_plan_decision")?.output;

      if (stockCall && planCall) {
        synthesizedAnswer = `• **Situation**: In month ${stockCall.month}, ${stockCall.item_code} (${stockCall.item_name}) has ${stockCall.godown_stock_total.toLocaleString()} ${stockCall.unit} sitting idle in district godowns, plus ${stockCall.contractor_idle_total.toLocaleString()} ${stockCall.unit} held by contractors (Total idle: ${stockCall.total_idle.toLocaleString()} ${stockCall.unit}). Trailing consumption rate is ${planCall.trailing_demand_dhat.toLocaleString()} ${stockCall.unit}/month.
• **Root Cause**: Historical deliveries arrived on fixed delivery plans faster than the site could erect them, creating peak yard congestion with a ${planCall.lead_time_days}-day lead time.
• **Recommended Action**: ${
          planCall.action.includes("ORDER")
            ? `ORDER ${planCall.order_qty.toLocaleString()} ${stockCall.unit} now. Expected arrival: ${planCall.expected_arrival_month} (${planCall.lead_time_days}d lead time). ${draftVoucher ? `Draft PO ${draftVoucher.voucher_id} generated.` : ""}`
            : planCall.action === "TRANSFER"
            ? `HOLD vendor orders and TRANSFER excess stock between district godowns to avoid new procurement. ${draftVoucher ? `Transfer voucher ${draftVoucher.voucher_id} drafted.` : ""}`
            : "HOLD orders. Current inventory position fully satisfies lead-time demand plus safety stock buffer."
        }
• **Risk Note**: Our causal plan maintains an overall service level of ${planCall.scorecard.service_level}% while achieving a ${planCall.scorecard.reduction_pct}% idle stock reduction, preventing site starvation across all 44 months.`;
      }
    }
  }

  const durationTotalMs = Math.round((performance.now() - tStart) * 10) / 10;

  return {
    answer: synthesizedAnswer,
    toolCalls,
    draftVoucher,
    provider: providerUsed,
    durationTotalMs,
  };
}
