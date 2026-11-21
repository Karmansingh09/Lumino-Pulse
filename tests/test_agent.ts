import {
  get_godown_stock,
  get_plan_decision,
  get_set_bottlenecks,
  draft_erp_voucher,
  resolveQueryEntities,
  executeAgentQuery,
} from "../lib/agentEngine";

async function runAgentTests() {
  console.log("=================================================");
  console.log("Testing Lumino Supply-Chain Agent (Milestone 5)");
  console.log("=================================================");

  // 1. Test get_godown_stock
  const t0 = performance.now();
  const stockRes = get_godown_stock({ item_code: "MPO010014", month: "2024-06" });
  const durStock = performance.now() - t0;
  console.log(`[PASS] get_godown_stock executed in ${durStock.toFixed(2)}ms`);
  console.log(`       Item: ${stockRes.item_code} (${stockRes.item_name})`);
  console.log(`       Godown Stock: ${stockRes.godown_stock_total} ${stockRes.unit}`);
  console.log(`       Contractor Idle: ${stockRes.contractor_idle_total} ${stockRes.unit}`);
  console.log(`       Godowns Breakdown count: ${stockRes.godowns_breakdown.length}`);
  if (stockRes.godowns_breakdown.length !== 6) {
    console.error(`[FAIL] Expected 6 godowns breakdown, got ${stockRes.godowns_breakdown.length}`);
    process.exit(1);
  }

  // 2. Test get_plan_decision
  const t1 = performance.now();
  const planRes = get_plan_decision({ item_code: "MPO010014", month: "2024-06" });
  const durPlan = performance.now() - t1;
  console.log(`[PASS] get_plan_decision executed in ${durPlan.toFixed(2)}ms`);
  console.log(`       Action: ${planRes.action}`);
  console.log(`       Order Qty: ${planRes.order_qty} ${planRes.unit}`);
  console.log(`       Scorecard Reduction: ${planRes.scorecard.reduction_pct}%`);

  // 3. Test get_set_bottlenecks
  const t2 = performance.now();
  const setRes = get_set_bottlenecks({ parent_code: "MRP070060", month: "2024-11" });
  const durSet = performance.now() - t2;
  console.log(`[PASS] get_set_bottlenecks executed in ${durSet.toFixed(2)}ms`);
  console.log(`       Set: ${setRes.parent_code} (${setRes.parent_name})`);
  console.log(`       Parent Stock: ${setRes.total_parent_stock}`);
  console.log(`       Buildable: ${setRes.total_buildable_sets}`);
  console.log(`       Stranded: ${setRes.total_stranded_parent}`);
  console.log(`       Blocked Godowns: ${setRes.blocked_godowns_count}`);

  // 4. Test draft_erp_voucher
  // 4a. Valid Purchase Order
  const poVoucher = draft_erp_voucher({
    voucher_type: "PURCHASE_ORDER",
    item_code: "MPO010014",
    qty: 1500,
    to_godown: "CENTRAL_RECEIVING_STORE",
    month: "2024-06",
    reason: "Replenishment order for Q3 construction target.",
  });
  console.log(`[PASS] Draft PO Created: ${poVoucher.voucher_id} for ${poVoucher.qty} ${poVoucher.unit}`);
  if (!poVoucher.voucher_id.startsWith("LUM-PO-")) {
    console.error(`[FAIL] Unexpected voucher ID prefix: ${poVoucher.voucher_id}`);
    process.exit(1);
  }

  // 4b. Valid Transfer
  const trfVoucher = draft_erp_voucher({
    voucher_type: "INTER_GODOWN_TRANSFER",
    item_code: "MEH050071",
    qty: 350,
    from_godown: "KANPUR NAGAR",
    to_godown: "KANPUR DEHAT",
    month: "2024-11",
    reason: "Rebalance Eye Hooks to unblock Pole Clamp sets in Dehat.",
  });
  console.log(`[PASS] Draft Transfer Created: ${trfVoucher.voucher_id} from ${trfVoucher.from_godown} to ${trfVoucher.to_godown}`);
  if (!trfVoucher.voucher_id.startsWith("LUM-TRF-")) {
    console.error(`[FAIL] Unexpected voucher ID prefix: ${trfVoucher.voucher_id}`);
    process.exit(1);
  }

  // 4c. Safety Check: Reject same source and destination
  try {
    draft_erp_voucher({
      voucher_type: "INTER_GODOWN_TRANSFER",
      item_code: "MEH050071",
      qty: 100,
      from_godown: "KANPUR NAGAR",
      to_godown: "KANPUR NAGAR",
      month: "2024-11",
      reason: "Self transfer",
    });
    console.error("[FAIL] Failed to catch identical from/to godown!");
    process.exit(1);
  } catch (err: any) {
    console.log(`[PASS] Transfer Validation Guardrail caught identical stores: ${err.message}`);
  }

  // 4d. Safety Check: Reject non-positive quantity
  try {
    draft_erp_voucher({
      voucher_type: "PURCHASE_ORDER",
      item_code: "MPO010014",
      qty: -50,
      to_godown: "STORE",
      month: "2024-11",
      reason: "Negative qty",
    });
    console.error("[FAIL] Failed to catch negative quantity!");
    process.exit(1);
  } catch (err: any) {
    console.log(`[PASS] Quantity Guardrail caught negative quantity: ${err.message}`);
  }

  // 5. Test Entity Resolution
  const q1 = "What is the status of 8.5m PCC Poles in 2024-06 and draft a PO?";
  const ent1 = resolveQueryEntities(q1);
  console.log(`[PASS] Entity Resolution for "${q1}":`);
  console.log(`       Item: ${ent1.itemCode}, Month: ${ent1.month}, Voucher: ${ent1.isVoucherRequested}`);
  if (ent1.itemCode !== "MPO010014" || ent1.month !== "2024-06" || !ent1.isVoucherRequested) {
    console.error("[FAIL] Entity resolution failed on Query 1!");
    process.exit(1);
  }

  const q2 = "Check Pole Clamp RDSS bottlenecks in 2024-11 and transfer surplus";
  const ent2 = resolveQueryEntities(q2);
  console.log(`[PASS] Entity Resolution for "${q2}":`);
  console.log(`       Parent Set: ${ent2.parentSetCode}, Month: ${ent2.month}, Voucher: ${ent2.isVoucherRequested}`);
  if (ent2.parentSetCode !== "MRP070060" || ent2.month !== "2024-11") {
    console.error("[FAIL] Entity resolution failed on Query 2!");
    process.exit(1);
  }

  // 6. Test Full Agent Execution with Deterministic Fallback
  const tFull = performance.now();
  const agentRes = await executeAgentQuery(
    "What is the inventory status of 8.5m PCC Poles in 2024-06 and draft an order?",
    "MPO010014",
    "2024-06"
  );
  const durFull = performance.now() - tFull;
  console.log(`[PASS] executeAgentQuery completed in ${durFull.toFixed(2)}ms`);
  console.log(`       Provider: ${agentRes.provider}`);
  console.log(`       Tool Calls Count: ${agentRes.toolCalls.length}`);
  console.log(`       Draft Voucher Generated: ${agentRes.draftVoucher?.voucher_id || "None"}`);
  console.log("       Synthesized Brief:\n" + agentRes.answer);

  if (!agentRes.answer.includes("Situation") || !agentRes.answer.includes("Recommended Action")) {
    console.error("[FAIL] Brief missing key operational sections!");
    process.exit(1);
  }

  console.log("=================================================");
  console.log("ALL AGENT & ERP VOUCHER TESTS PASSED!");
  console.log("=================================================");
}

runAgentTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
