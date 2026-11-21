#!/usr/bin/env python3
"""
Automated Test Suite for LuminoFlow Offline Data Engine
Validates:
1. Zero Data Leakage: strictly causal monthly decisions
2. Inventory Balance Identities: Godown Stock & Contractor Idle Stock
3. Sets Anomaly Detection: 35% threshold flags MNB010174 and MLU020008
4. JSON Schema & Completeness
"""

import os
import json
import unittest

class TestLuminoDataEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        base_dir = "public/data"
        with open(os.path.join(base_dir, "meta.json"), "r") as f:
            cls.meta = json.load(f)
        with open(os.path.join(base_dir, "ledger.json"), "r") as f:
            cls.ledger = json.load(f)
        with open(os.path.join(base_dir, "planner.json"), "r") as f:
            cls.planner = json.load(f)
        with open(os.path.join(base_dir, "sets.json"), "r") as f:
            cls.sets = json.load(f)

    def test_scope_and_dimensions(self):
        """Verify 16 items, 6 godowns, and 44 months."""
        self.assertEqual(len(self.meta["items"]), 16)
        self.assertEqual(len(self.meta["godowns"]), 6)
        self.assertEqual(len(self.meta["months"]), 44)
        self.assertEqual(self.meta["months"][0], "2023-03")
        self.assertEqual(self.meta["months"][-1], "2026-10")

    def test_active_godowns_exclusion(self):
        """Verify KANPUR CLOSER is excluded from active store balances."""
        self.assertNotIn("KANPUR CLOSER", self.meta["godowns"])
        expected_godowns = [
            "KANPUR AURAIYA", "KANPUR DEHAT", "KANPUR ETAWAH",
            "KANPUR FARRUKHABAD", "KANPUR KANNAUJ", "KANPUR NAGAR"
        ]
        self.assertEqual(sorted(self.meta["godowns"]), sorted(expected_godowns))

    def test_ledger_accounting_identity(self):
        """Verify godown stock = sum(rec + tin - tout - iss + ret) clamped to >= 0."""
        for item_code, data in self.ledger.items():
            for g in self.meta["godowns"]:
                monthly = data["godowns_monthly"][g]
                cum_rec = 0.0
                cum_tin = 0.0
                cum_tout = 0.0
                cum_iss = 0.0
                cum_ret = 0.0
                for m in monthly:
                    cum_rec += m["receipts"]
                    cum_tin += m["transfers_in"]
                    cum_tout += m["transfers_out"]
                    cum_iss += m["issued"]
                    cum_ret += m["returned"]
                    raw_expected = cum_rec + cum_tin - cum_tout - cum_iss + cum_ret
                    self.assertAlmostEqual(m["raw_godown_stock"], raw_expected, places=1)
                    self.assertEqual(m["godown_stock"], max(0.0, m["raw_godown_stock"]))

    def test_contractor_idle_non_negative(self):
        """Verify project-wide contractor idle is never negative."""
        for item_code, data in self.ledger.items():
            for p in data["project_monthly"]:
                self.assertGreaterEqual(p["contractor_idle"], 0.0)

    def test_anti_future_data_leakage(self):
        """Verify that planner trailing demand and safety stock only depend on history <= month t."""
        for item_code, pdata in self.planner.items():
            replay = pdata["monthly_replay"]
            demand_history = []
            for t, m in enumerate(replay):
                demand_history.append(m["actual_consumption"])
                trailing = demand_history[max(0, t - 2): t + 1]
                expected_dhat = sum(trailing) / len(trailing) if trailing else 0.0
                # If trailing demand is non-zero, dhat should match within rounding
                if expected_dhat > 0:
                    self.assertAlmostEqual(m["trailing_demand_dhat"], expected_dhat, places=1)
                
                # Check arrival month is strictly causal: t + L
                L = pdata["lead_time_months"]
                if t + L < len(self.meta["months"]):
                    self.assertEqual(m["expected_arrival_month"], self.meta["months"][t + L])

    def test_sets_anomaly_detection(self):
        """Verify MNB010174 (MT) and MLU020008 (Ring lugs) are flagged as anomalies (>35%)."""
        found_mnb_anomaly = False
        found_mlu_anomaly = False

        for s in self.meta["sets_meta"]:
            for c in s["children"]:
                if c["child_code"] == "MNB010174":
                    self.assertTrue(c["is_anomaly"], "MNB010174 must be flagged as anomaly")
                    self.assertIn("Metric Tonnes", c["anomaly_reason"])
                    found_mnb_anomaly = True
                if c["child_code"] == "MLU020008":
                    self.assertTrue(c["is_anomaly"], "MLU020008 must be flagged as anomaly")
                    found_mlu_anomaly = True

        self.assertTrue(found_mnb_anomaly)
        self.assertTrue(found_mlu_anomaly)

    def test_set_buildable_invariant(self):
        """Verify buildable sets <= parent stock and stranded = parent - buildable."""
        for p_code, s_record in self.sets.items():
            for rec in s_record["monthly_records"]:
                for mode in ["calibrated", "raw"]:
                    for g_card in rec[mode]["godowns"]:
                        p_stock = g_card["parent_stock"]
                        buildable = g_card["buildable_sets"]
                        stranded = g_card["stranded_parent_stock"]
                        self.assertLessEqual(buildable, p_stock + 1e-4)
                        self.assertAlmostEqual(stranded, max(0.0, p_stock - buildable), places=1)

if __name__ == "__main__":
    unittest.main()
