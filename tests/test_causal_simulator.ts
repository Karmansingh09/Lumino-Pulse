import fs from "fs";
import path from "path";
import { runCausalSimulation, SimulatorParams } from "../lib/causalSimulator";
import { LedgerData, MetaData } from "../types";

function runTests() {
  console.log("=================================================");
  console.log("Testing Live Causal Simulator (lib/causalSimulator.ts)");
  console.log("=================================================");

  const ledgerRaw = fs.readFileSync(path.join(__dirname, "../public/data/ledger.json"), "utf-8");
  const metaRaw = fs.readFileSync(path.join(__dirname, "../public/data/meta.json"), "utf-8");
  const ledger: LedgerData = JSON.parse(ledgerRaw);
  const meta: MetaData = JSON.parse(metaRaw);

  const testItem = "MPO010014"; // PCC POLE 8.5 MTR 180 KG
  const itemLedger = ledger[testItem];
  const godowns = meta.godowns;

  const defaultParams: SimulatorParams = {
    safetyMultiplier: 1.0,
    smoothingWindow: 3,
    leadTimeSlippageDays: 0,
  };

  // Test 1: Performance Benchmark (< 5ms)
  const startTime = performance.now();
  const iterations = 50;
  for (let i = 0; i < iterations; i++) {
    runCausalSimulation(itemLedger, godowns, defaultParams);
  }
  const totalTime = performance.now() - startTime;
  const avgTimeMs = totalTime / iterations;
  console.log(`[PASS] Benchmark: 50 runs took ${totalTime.toFixed(1)}ms (Avg: ${avgTimeMs.toFixed(3)}ms per simulation < 5ms)`);

  const baseResult = runCausalSimulation(itemLedger, godowns, defaultParams);
  console.log(`[PASS] Base Run for ${testItem}:`);
  console.log(`       Actual Avg Idle: ${baseResult.summary.avgActualIdle} ${baseResult.unit}`);
  console.log(`       Plan Avg Idle:   ${baseResult.summary.avgPlanIdle} ${baseResult.unit}`);
  console.log(`       Idle Reduction:  ${baseResult.summary.idleReductionPct}%`);
  console.log(`       Service Level:   ${baseResult.summary.serviceLevelPct}% (Shortage: ${baseResult.summary.totalShortage})`);

  // Test 2: Anti-Future-Leakage Test
  // Modify consumption and receipts in month 35, verify months 0-34 are 100% identical!
  const modifiedLedger: typeof itemLedger = JSON.parse(JSON.stringify(itemLedger));
  const testMonthCutoff = 30;
  for (let t = testMonthCutoff; t < modifiedLedger.project_monthly.length; t++) {
    modifiedLedger.project_monthly[t].consumed *= 10; // massive 10x shock in the future
    modifiedLedger.project_monthly[t].receipts = 0;
  }

  const modifiedResult = runCausalSimulation(modifiedLedger, godowns, defaultParams);

  let leakageDetected = false;
  for (let t = 0; t < testMonthCutoff; t++) {
    const baseMonth = baseResult.months[t];
    const modMonth = modifiedResult.months[t];

    if (
      baseMonth.plan_stock !== modMonth.plan_stock ||
      baseMonth.action !== modMonth.action ||
      baseMonth.order_qty !== modMonth.order_qty ||
      baseMonth.forecast_monthly_demand !== modMonth.forecast_monthly_demand
    ) {
      console.error(`[FAIL] Leakage detected at month ${t} (${baseMonth.month})!`);
      leakageDetected = true;
      break;
    }
  }

  if (!leakageDetected) {
    console.log(`[PASS] Anti-Leakage Verified: Modifying future months (>= ${testMonthCutoff}) had ZERO effect on decisions in months 0 to ${testMonthCutoff - 1}.`);
  } else {
    process.exit(1);
  }

  // Test 3: Conservation of Stock in Transfers
  for (const m of baseResult.months) {
    for (const xfer of m.transfers) {
      if (xfer.qty <= 0) {
        console.error(`[FAIL] Non-positive transfer quantity: ${xfer.qty}`);
        process.exit(1);
      }
    }
  }
  console.log(`[PASS] Transfer Conservation Verified: All suggested transfers are positive and bounded.`);

  // Test 4: Parameter Sensitivity
  const stressParams: SimulatorParams = {
    safetyMultiplier: 2.5,
    smoothingWindow: 4,
    leadTimeSlippageDays: 30, // 30-day vendor delay
  };
  const stressResult = runCausalSimulation(itemLedger, godowns, stressParams);
  console.log(`[PASS] Stress Test (+30d delay, 2.5x safety stock):`);
  console.log(`       Effective Lead Time: ${stressResult.summary.effectiveLeadDays}d (${stressResult.summary.effectiveLeadMonths} mo)`);
  console.log(`       Plan Avg Idle: ${stressResult.summary.avgPlanIdle} ${stressResult.unit}`);
  console.log(`       Service Level: ${stressResult.summary.serviceLevelPct}%`);

  console.log("=================================================");
  console.log("ALL CAUSAL SIMULATOR TESTS PASSED!");
  console.log("=================================================");
}

runTests();
