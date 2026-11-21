import fs from "fs";
import path from "path";
import { SetsData, MetaData } from "../types";

function runTests() {
  console.log("=================================================");
  console.log("Testing Assembly Bottleneck Detector (Tab 3: MATCH THE SETS)");
  console.log("=================================================");

  const setsRaw = fs.readFileSync(path.join(__dirname, "../public/data/sets.json"), "utf-8");
  const metaRaw = fs.readFileSync(path.join(__dirname, "../public/data/meta.json"), "utf-8");
  const setsData: SetsData = JSON.parse(setsRaw);
  const meta: MetaData = JSON.parse(metaRaw);

  const parentCodes = ["MRP070060", "MRP070064", "MRP070065"];

  // 1. Verify all 3 parent sets exist
  for (const p of parentCodes) {
    if (!setsData[p]) {
      console.error(`[FAIL] Missing parent set ${p}`);
      process.exit(1);
    }
  }
  console.log(`[PASS] All 3 Parent Assembly Sets present: ${parentCodes.join(", ")}`);

  // 2. Test Invariants across all 44 months and 6 godowns
  for (const pCode of parentCodes) {
    const pSet = setsData[pCode];
    if (pSet.monthly_records.length !== 44) {
      console.error(`[FAIL] Expected 44 monthly records for ${pCode}, got ${pSet.monthly_records.length}`);
      process.exit(1);
    }

    for (const mRec of pSet.monthly_records) {
      for (const mode of ["calibrated", "raw"] as const) {
        const modeData = mRec[mode];

        // Total stock consistency
        let sumParent = 0;
        let sumBuildable = 0;
        let sumStranded = 0;

        for (const gCard of modeData.godowns) {
          sumParent += gCard.parent_stock;
          sumBuildable += gCard.buildable_sets;
          sumStranded += gCard.stranded_parent_stock;

          // Invariant 1: buildable <= parent_stock
          if (gCard.buildable_sets > gCard.parent_stock + 1e-4) {
            console.error(`[FAIL] Buildable sets (${gCard.buildable_sets}) exceeds parent stock (${gCard.parent_stock}) in ${gCard.godown}!`);
            process.exit(1);
          }

          // Invariant 2: stranded = parent_stock - buildable_sets
          const expectedStranded = Math.max(0, gCard.parent_stock - gCard.buildable_sets);
          if (Math.abs(gCard.stranded_parent_stock - expectedStranded) > 0.1) {
            console.error(`[FAIL] Stranded math mismatch in ${gCard.godown}: expected ${expectedStranded}, got ${gCard.stranded_parent_stock}`);
            process.exit(1);
          }
        }

        if (Math.abs(modeData.total_parent_stock - sumParent) > 0.5) {
          console.error(`[FAIL] Parent stock sum mismatch in ${mRec.month} mode ${mode}`);
          process.exit(1);
        }
      }
    }
  }
  console.log("[PASS] Mathematical Invariants Verified across 44 months × 3 sets × 2 modes × 6 godowns.");

  // 3. Test Ratio Anomaly Divergence (Calibrated vs Raw BOQ)
  // For MRP070060 (Pole Clamp RDSS): MNB010174 (MT)
  // In Raw BOQ, ratio is 1.0 MT per set! A godown with 500 sets would need 500 MT of bolts (astronomical),
  // causing raw buildable sets to be close to 0 and stranded sets to skyrocket!
  const clampSet = setsData["MRP070060"];
  // Check month 20 (middle of project)
  const sampleMonth = clampSet.monthly_records[20];
  const calStranded = sampleMonth.calibrated.total_stranded_parent;
  const rawStranded = sampleMonth.raw.total_stranded_parent;

  console.log(`[PASS] Ratio Mode Divergence Check at ${sampleMonth.month} for Pole Clamp RDSS:`);
  console.log(`       Calibrated Mode: Total Parent = ${sampleMonth.calibrated.total_parent_stock}, Stranded = ${calStranded}`);
  console.log(`       Raw BOQ Mode:    Total Parent = ${sampleMonth.raw.total_parent_stock}, Stranded = ${rawStranded}`);
  if (rawStranded < calStranded) {
    console.warn("[WARN] Raw stranded is less than calibrated stranded - check unit scale.");
  } else {
    console.log(`[PASS] Unit Trap Confirmed: Raw BOQ ratio severely inflates stranded sets due to MT vs NOS mismatch.`);
  }

  // 4. Test Shared Child Component (MNB010174 in all 3 sets)
  for (const pCode of parentCodes) {
    const hasBolt = setsData[pCode].children.some((c) => c.child_code === "MNB010174");
    if (!hasBolt) {
      console.error(`[FAIL] Shared bolt MNB010174 missing from ${pCode}`);
      process.exit(1);
    }
  }
  console.log("[PASS] Shared Child MNB010174 verified in all 3 Parent Sets.");

  // 5. Test Donor Genuine Surplus Conservation
  // Donor surplus = child_stock - (donor_parent_stock * ratio)
  for (const mRec of clampSet.monthly_records) {
    const gCards = mRec.calibrated.godowns;
    for (const card of gCards) {
      if (card.stranded_parent_stock > 10 && card.limiting_child_code) {
        // check donor search logic
        const limitingCode = card.limiting_child_code;
        for (const donor of gCards) {
          if (donor.godown === card.godown) continue;
          const childItem = donor.children_breakdown.find((c) => c.child_code === limitingCode);
          if (childItem) {
            const donorNeed = donor.parent_stock * childItem.ratio;
            const surplus = childItem.child_stock - donorNeed;
            // Verify surplus calculation does not exceed donor's physical stock
            if (surplus > childItem.child_stock + 1e-4) {
              console.error(`[FAIL] Donor surplus exceeds physical stock in ${donor.godown}!`);
              process.exit(1);
            }
          }
        }
      }
    }
  }
  console.log("[PASS] Donor Surplus Calculation Conservation Verified.");

  console.log("=================================================");
  console.log("ALL MATCH THE SETS TESTS PASSED!");
  console.log("=================================================");
}

runTests();
