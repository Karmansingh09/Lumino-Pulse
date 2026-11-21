import { ItemLedger, GodownMonthlyRow } from "@/types";

export interface SimulatorParams {
  safetyMultiplier: number; // 0.5 to 2.5, default 1.0
  smoothingWindow: number; // 2, 3, 4, 6 months, default 3
  leadTimeSlippageDays: number; // 0, 15, 30, 60, default 0
}

export interface RebalanceTransfer {
  from_godown: string;
  to_godown: string;
  qty: number;
  unit: string;
  reason: string;
}

export interface GodownStatus {
  godown: string;
  stock: number;
  trailing_demand: number;
  cover_months: number;
  status: "SURPLUS" | "DEFICIT" | "NORMAL";
}

export interface SimulatedMonth {
  month: string;
  month_idx: number;
  actual_consumption: number;
  actual_godown_stock: number;
  actual_contractor_idle: number;
  plan_stock: number;
  plan_shortage: number;
  plan_demand_met: number;
  forecast_monthly_demand: number;
  volatility_sigma: number;
  safety_stock: number;
  target_position: number;
  inventory_position: number;
  action: "ORDER" | "HOLD" | "TRANSFER" | "ORDER & TRANSFER";
  order_qty: number;
  expected_arrival_month: string;
  transfers: RebalanceTransfer[];
  godowns_status: GodownStatus[];
}

export interface SimulationSummary {
  avgActualIdle: number;
  avgPlanIdle: number;
  peakActualIdle: number;
  peakPlanIdle: number;
  idleReductionPct: number;
  shortageMonths: number;
  serviceLevelPct: number;
  totalDemand: number;
  totalShortage: number;
  effectiveLeadDays: number;
  effectiveLeadMonths: number;
}

export interface SimulationResult {
  item_code: string;
  item_name: string;
  unit: string;
  months: SimulatedMonth[];
  summary: SimulationSummary;
}

function roundToDecimals(val: number, decimals: number): number {
  if (isNaN(val) || !isFinite(val)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((val + Number.EPSILON) * factor) / factor;
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[]): number {
  if (arr.length <= 1) return 0;
  const m = mean(arr);
  const variance = arr.reduce((acc, x) => acc + Math.pow(x - m, 2), 0) / (arr.length - 1);
  return Math.sqrt(Math.max(0, variance));
}

/**
 * Live, strictly causal walk-forward inventory simulator.
 * At month index t, decisions strictly use historical data up to month t.
 * Zero future peeking.
 */
export function runCausalSimulation(
  itemLedger: ItemLedger,
  godowns: string[],
  params: SimulatorParams
): SimulationResult {
  const isMT = itemLedger.unit === "MT";
  const decimals = isMT ? 4 : 1;

  const totalLeadDays = itemLedger.lead_time_days + (params.leadTimeSlippageDays || 0);
  const ltMonths = Math.max(1, Math.ceil(totalLeadDays / 30));

  const projectMonthly = itemLedger.project_monthly;
  const T = projectMonthly.length;
  const monthsList = projectMonthly.map((r) => r.month);

  // Pipeline order deliveries: orders arriving in month t
  const pipeline = new Array(T + ltMonths + 2).fill(0);

  // Pre-existing orders in transit prior to project start arrive during initial ltMonths
  for (let t = 0; t < Math.min(ltMonths, T); t++) {
    pipeline[t] = projectMonthly[t].receipts;
  }

  let simStock = 0;
  const demandHistory: number[] = [];
  const simulatedMonths: SimulatedMonth[] = [];

  const actualGodownStocks: number[] = [];
  const simulatedPlanStocks: number[] = [];
  let totalDemand = 0;
  let totalShortage = 0;
  let shortageMonthsCount = 0;

  for (let t = 0; t < T; t++) {
    const mRow = projectMonthly[t];
    const mStr = mRow.month;

    // 1. Deliveries arrive at start of month t
    const arrivals = pipeline[t];
    simStock += arrivals;

    // 2. Site consumption occurs during month t
    const dActual = mRow.consumed;
    demandHistory.push(dActual);
    totalDemand += dActual;

    let shortage = 0;
    let demandMet = 0;

    if (simStock >= dActual) {
      demandMet = dActual;
      simStock -= dActual;
    } else {
      demandMet = simStock;
      shortage = dActual - simStock;
      simStock = 0;
    }

    if (shortage > (isMT ? 0.001 : 0.5)) {
      shortageMonthsCount++;
    }
    totalShortage += shortage;

    actualGodownStocks.push(mRow.godown_stock);
    simulatedPlanStocks.push(simStock);

    // 3. Strictly Causal Trailing Demand Estimation (known up to month t)
    const windowStart = Math.max(0, t - params.smoothingWindow + 1);
    const recentDemand = demandHistory.slice(windowStart, t + 1);
    let forecastRate = mean(recentDemand);
    let volatilitySigma = stdDev(recentDemand);

    // Early project seeding if site consumption has not started yet
    if (forecastRate <= 1e-5) {
      const pastRecs = projectMonthly.slice(0, t + 1).map((r) => r.receipts);
      const avgRecs = mean(pastRecs);
      forecastRate = avgRecs > 0 ? avgRecs : 1.0;
    }

    // 4. Safety Stock & Target Position
    const safetyStock =
      forecastRate * params.safetyMultiplier + 0.5 * volatilitySigma * Math.sqrt(ltMonths);
    const targetPosition = forecastRate * (ltMonths + 1) + safetyStock;

    // In-flight pipeline orders placed earlier arriving between t+1 and t+ltMonths
    let inFlight = 0;
    for (let k = t + 1; k <= t + ltMonths; k++) {
      inFlight += pipeline[k] || 0;
    }
    const invPosition = simStock + inFlight;

    // 5. Causal Order Placement Decision
    let orderQty = 0;
    let baseAction: "ORDER" | "HOLD" = "HOLD";

    // Place order if inventory position is below target and arrival is within project horizon
    if (invPosition < targetPosition && t + ltMonths < T && forecastRate > 0) {
      orderQty = roundToDecimals(targetPosition - invPosition, decimals);
      if (orderQty > 0) {
        pipeline[t + ltMonths] += orderQty;
        baseAction = "ORDER";
      }
    }

    // 6. Godown Surplus / Deficit & Transfer Recommendations at month t
    const mGodownsStatus: GodownStatus[] = [];
    const surplusGodowns: { godown: string; surplusQty: number; cover: number }[] = [];
    const deficitGodowns: { godown: string; neededQty: number; cover: number }[] = [];

    for (const g of godowns) {
      const gHistory = itemLedger.godowns_monthly[g];
      const gRow = gHistory ? gHistory[t] : null;
      const gStock = gRow ? gRow.godown_stock : 0;

      // Trailing issues from godown g
      const gWindowIssues = gHistory
        ? gHistory.slice(windowStart, t + 1).map((r) => r.issued)
        : [];
      let gDhat = mean(gWindowIssues);
      if (gDhat < 1e-4) {
        gDhat = Math.max(0.1, forecastRate / Math.max(1, godowns.length));
      }

      const cover = gDhat > 0 ? gStock / gDhat : 99;
      let gStatus: "SURPLUS" | "DEFICIT" | "NORMAL" = "NORMAL";

      if (cover > 3.0 && gStock > 3.0 * gDhat) {
        const surplus = gStock - 3.0 * gDhat;
        surplusGodowns.push({ godown: g, surplusQty: surplus, cover });
        gStatus = "SURPLUS";
      } else if (cover < 1.0) {
        const needed = Math.max(0, 2.0 * gDhat - gStock);
        deficitGodowns.push({ godown: g, neededQty: needed, cover });
        gStatus = "DEFICIT";
      }

      mGodownsStatus.push({
        godown: g,
        stock: roundToDecimals(gStock, decimals),
        trailing_demand: roundToDecimals(gDhat, decimals),
        cover_months: roundToDecimals(cover, 1),
        status: gStatus,
      });
    }

    // Match surplus godowns with deficit godowns
    const transfers: RebalanceTransfer[] = [];
    const minThreshold = isMT ? 0.005 : 1.0;

    surplusGodowns.sort((a, b) => b.surplusQty - a.surplusQty);
    deficitGodowns.sort((a, b) => b.neededQty - a.neededQty);

    let sIdx = 0;
    for (const defItem of deficitGodowns) {
      let needed = defItem.neededQty;
      while (needed > minThreshold && sIdx < surplusGodowns.length) {
        const avail = surplusGodowns[sIdx].surplusQty;
        const xferQty = Math.min(avail, needed);
        if (xferQty >= minThreshold) {
          transfers.push({
            from_godown: surplusGodowns[sIdx].godown,
            to_godown: defItem.godown,
            qty: roundToDecimals(xferQty, decimals),
            unit: itemLedger.unit,
            reason: `Rebalance surplus from ${surplusGodowns[sIdx].godown} (${surplusGodowns[sIdx].cover.toFixed(1)}mo cover) to relieve ${defItem.godown} (${defItem.cover.toFixed(1)}mo cover)`,
          });
          needed -= xferQty;
          surplusGodowns[sIdx].surplusQty -= xferQty;
        }

        if (surplusGodowns[sIdx].surplusQty <= minThreshold) {
          sIdx++;
        }
      }
    }

    // Determine final compound action
    let finalAction: "ORDER" | "HOLD" | "TRANSFER" | "ORDER & TRANSFER" = baseAction;
    if (transfers.length > 0 && baseAction === "ORDER") {
      finalAction = "ORDER & TRANSFER";
    } else if (transfers.length > 0) {
      finalAction = "TRANSFER";
    }

    const arrivalIdx = t + ltMonths;
    const expectedArrivalMonth =
      arrivalIdx < T ? monthsList[arrivalIdx] : "Post-Project Horizon";

    simulatedMonths.push({
      month: mStr,
      month_idx: t,
      actual_consumption: roundToDecimals(dActual, decimals),
      actual_godown_stock: roundToDecimals(mRow.godown_stock, decimals),
      actual_contractor_idle: roundToDecimals(mRow.contractor_idle, decimals),
      plan_stock: roundToDecimals(simStock, decimals),
      plan_shortage: roundToDecimals(shortage, decimals),
      plan_demand_met: roundToDecimals(demandMet, decimals),
      forecast_monthly_demand: roundToDecimals(forecastRate, decimals),
      volatility_sigma: roundToDecimals(volatilitySigma, decimals),
      safety_stock: roundToDecimals(safetyStock, decimals),
      target_position: roundToDecimals(targetPosition, decimals),
      inventory_position: roundToDecimals(invPosition, decimals),
      action: finalAction,
      order_qty: roundToDecimals(orderQty, decimals),
      expected_arrival_month: expectedArrivalMonth,
      transfers,
      godowns_status: mGodownsStatus,
    });
  }

  // Summary Metrics
  const avgActual = mean(actualGodownStocks);
  const avgPlan = mean(simulatedPlanStocks);
  const peakActual = Math.max(...actualGodownStocks);
  const peakPlan = Math.max(...simulatedPlanStocks);

  const idleReductionPct =
    avgActual > 0 ? ((avgActual - avgPlan) / avgActual) * 100 : 0;
  const serviceLevelPct =
    totalDemand > 0 ? (1 - totalShortage / totalDemand) * 100 : 100;

  return {
    item_code: itemLedger.item_code,
    item_name: itemLedger.item_name,
    unit: itemLedger.unit,
    months: simulatedMonths,
    summary: {
      avgActualIdle: roundToDecimals(avgActual, decimals),
      avgPlanIdle: roundToDecimals(avgPlan, decimals),
      peakActualIdle: roundToDecimals(peakActual, decimals),
      peakPlanIdle: roundToDecimals(peakPlan, decimals),
      idleReductionPct: roundToDecimals(idleReductionPct, 1),
      shortageMonths: shortageMonthsCount,
      serviceLevelPct: roundToDecimals(serviceLevelPct, 2),
      totalDemand: roundToDecimals(totalDemand, decimals),
      totalShortage: roundToDecimals(totalShortage, decimals),
      effectiveLeadDays: totalLeadDays,
      effectiveLeadMonths: ltMonths,
    },
  };
}
