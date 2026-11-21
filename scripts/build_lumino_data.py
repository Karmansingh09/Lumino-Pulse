#!/usr/bin/env python3
"""
LuminoFlow Offline Data Engine
Processes raw CSVs from data/csv/ and generates 4 compact JSON datasets:
  - public/data/meta.json
  - public/data/ledger.json
  - public/data/planner.json
  - public/data/sets.json

Execution: python3 scripts/build_lumino_data.py
"""

import os
import sys
import json
import math
import pandas as pd
import numpy as np

def round_num(val, decimals=2):
    if val is None or math.isnan(val):
        return 0.0
    return round(float(val), decimals)

def main():
    print("=" * 70)
    print("LuminoFlow — Offline Data & Causal Simulation Engine")
    print("=" * 70)

    csv_dir = "data/csv"
    output_dir = "public/data"
    os.makedirs(output_dir, exist_ok=True)

    # 1. Load raw CSVs
    print("1. Loading raw CSV datasets...")
    items_df = pd.read_csv(os.path.join(csv_dir, "items.csv"))
    sets_df = pd.read_csv(os.path.join(csv_dir, "sets.csv"))
    receipts_df = pd.read_csv(os.path.join(csv_dir, "receipts.csv"))
    transfers_df = pd.read_csv(os.path.join(csv_dir, "transfers.csv"))
    cm_df = pd.read_csv(os.path.join(csv_dir, "contractor_moves.csv"))

    print(f"   Items: {len(items_df)} rows")
    print(f"   Sets: {len(sets_df)} rows")
    print(f"   Receipts: {len(receipts_df)} rows")
    print(f"   Transfers: {len(transfers_df)} rows")
    print(f"   Contractor moves: {len(cm_df)} rows")

    # 2. Data Cleaning Rules
    # Rule 1: DO NOT drop duplicate rows.
    # Rule 2: Ignore rows where qty == 0.
    receipts_clean = receipts_df[receipts_df["qty_received"] > 0].copy()
    transfers_clean = transfers_df[transfers_df["qty"] > 0].copy()
    cm_clean = cm_df[cm_df["qty"] > 0].copy()

    # Add month
    receipts_clean["month"] = receipts_clean["date"].astype(str).str[:7]
    transfers_clean["month"] = transfers_clean["date"].astype(str).str[:7]
    cm_clean["month"] = cm_clean["date"].astype(str).str[:7]

    # Rule 4: 6 active godowns
    active_godowns = [
        "KANPUR AURAIYA",
        "KANPUR DEHAT",
        "KANPUR ETAWAH",
        "KANPUR FARRUKHABAD",
        "KANPUR KANNAUJ",
        "KANPUR NAGAR"
    ]

    all_months = sorted(list(
        set(receipts_clean["month"])
        .union(set(transfers_clean["month"]))
        .union(set(cm_clean["month"]))
    ))
    T = len(all_months)
    month_to_idx = {m: i for i, m in enumerate(all_months)}
    print(f"   Time span: {T} months ({all_months[0]} to {all_months[-1]})")

    item_dict = {}
    for _, row in items_df.iterrows():
        item_dict[row["item_code"]] = {
            "item_code": row["item_code"],
            "item_name": row["item_name"],
            "unit": row["unit"],
            "lead_time_days": int(row["lead_time_days"]),
            "lead_time_months": max(1, math.ceil(int(row["lead_time_days"]) / 30)),
            "role": row["role"]
        }
    item_codes = list(item_dict.keys())

    # 3. Pre-aggregate transactions using groupby for speed
    print("2. Aggregating transaction matrices...")
    rec_grp = receipts_clean[receipts_clean["godown"].isin(active_godowns)].groupby(["item_code", "godown", "month"])["qty_received"].sum()
    tin_grp = transfers_clean[(transfers_clean["godown"].isin(active_godowns)) & (transfers_clean["direction"] == "IN")].groupby(["item_code", "godown", "month"])["qty"].sum()
    tout_grp = transfers_clean[(transfers_clean["godown"].isin(active_godowns)) & (transfers_clean["direction"] == "OUT")].groupby(["item_code", "godown", "month"])["qty"].sum()
    
    iss_grp = cm_clean[(cm_clean["godown"].isin(active_godowns)) & (cm_clean["type"] == "ISSUE")].groupby(["item_code", "godown", "month"])["qty"].sum()
    ret_grp = cm_clean[(cm_clean["godown"].isin(active_godowns)) & (cm_clean["type"] == "RETURN")].groupby(["item_code", "godown", "month"])["qty"].sum()

    # Project-wide contractor moves
    p_iss_grp = cm_clean[cm_clean["type"] == "ISSUE"].groupby(["item_code", "month"])["qty"].sum()
    p_ret_grp = cm_clean[cm_clean["type"] == "RETURN"].groupby(["item_code", "month"])["qty"].sum()
    p_con_grp = cm_clean[cm_clean["type"] == "CONSUMPTION"].groupby(["item_code", "month"])["qty"].sum()

    # Total consumption per item
    total_consumption_by_item = cm_clean[cm_clean["type"] == "CONSUMPTION"].groupby("item_code")["qty"].sum().to_dict()

    # 4. Job 1: Monthly Stock & Idle Ledger Reconstruction
    print("3. Building Job 1: Monthly Stock & Idle Ledger...")
    ledger_data = {}
    negative_balance_audit = []

    # Calculate ledger for every item
    for it in item_codes:
        it_unit = item_dict[it]["unit"]
        decimals = 4 if it_unit == "MT" else (2 if it_unit in ["KM", "KG", "MTR"] else 1)

        # Contractor cumulative stock project-wide
        c_cum_iss = 0.0
        c_cum_ret = 0.0
        c_cum_con = 0.0
        c_idle_by_month = {}

        for m in all_months:
            c_cum_iss += p_iss_grp.get((it, m), 0.0)
            c_cum_ret += p_ret_grp.get((it, m), 0.0)
            c_cum_con += p_con_grp.get((it, m), 0.0)
            c_stock_raw = c_cum_iss - c_cum_ret - c_cum_con
            c_idle_by_month[m] = max(0.0, c_stock_raw)

        # Godown stock per godown
        g_cum_data = {g: {"rec": 0.0, "tin": 0.0, "tout": 0.0, "iss": 0.0, "ret": 0.0, "raw_stock": 0.0} for g in active_godowns}
        godowns_monthly = {g: [] for g in active_godowns}

        project_monthly = []

        for m in all_months:
            m_rec = 0.0
            m_tin = 0.0
            m_tout = 0.0
            m_iss = 0.0
            m_ret = 0.0
            m_con = p_con_grp.get((it, m), 0.0)

            m_godown_stock_total = 0.0
            m_raw_godown_stock_total = 0.0

            for g in active_godowns:
                r = rec_grp.get((it, g, m), 0.0)
                tin = tin_grp.get((it, g, m), 0.0)
                tout = tout_grp.get((it, g, m), 0.0)
                iss = iss_grp.get((it, g, m), 0.0)
                ret = ret_grp.get((it, g, m), 0.0)

                g_cum = g_cum_data[g]
                g_cum["rec"] += r
                g_cum["tin"] += tin
                g_cum["tout"] += tout
                g_cum["iss"] += iss
                g_cum["ret"] += ret

                raw_stock = g_cum["rec"] + g_cum["tin"] - g_cum["tout"] - g_cum["iss"] + g_cum["ret"]
                g_cum["raw_stock"] = raw_stock

                if raw_stock < -1e-5:
                    negative_balance_audit.append({
                        "item_code": it,
                        "godown": g,
                        "month": m,
                        "raw_balance": round_num(raw_stock, decimals)
                    })

                clamped_stock = max(0.0, raw_stock)
                m_godown_stock_total += clamped_stock
                m_raw_godown_stock_total += raw_stock

                m_rec += r
                m_tin += tin
                m_tout += tout
                m_iss += iss
                m_ret += ret

                godowns_monthly[g].append({
                    "month": m,
                    "receipts": round_num(r, decimals),
                    "transfers_in": round_num(tin, decimals),
                    "transfers_out": round_num(tout, decimals),
                    "issued": round_num(iss, decimals),
                    "returned": round_num(ret, decimals),
                    "godown_stock": round_num(clamped_stock, decimals),
                    "raw_godown_stock": round_num(raw_stock, decimals)
                })

            c_idle = c_idle_by_month[m]
            project_monthly.append({
                "month": m,
                "receipts": round_num(m_rec, decimals),
                "transfers_in": round_num(m_tin, decimals),
                "transfers_out": round_num(m_tout, decimals),
                "issued": round_num(m_iss, decimals),
                "returned": round_num(m_ret, decimals),
                "consumed": round_num(m_con, decimals),
                "godown_stock": round_num(m_godown_stock_total, decimals),
                "raw_godown_stock": round_num(m_raw_godown_stock_total, decimals),
                "contractor_idle": round_num(c_idle, decimals),
                "total_idle": round_num(m_godown_stock_total + c_idle, decimals)
            })

        total_rec = sum(p["receipts"] for p in project_monthly)
        total_tin = sum(p["transfers_in"] for p in project_monthly)
        total_tout = sum(p["transfers_out"] for p in project_monthly)
        total_iss = sum(p["issued"] for p in project_monthly)
        total_ret = sum(p["returned"] for p in project_monthly)
        total_con = sum(p["consumed"] for p in project_monthly)
        peak_g_stock = max(p["godown_stock"] for p in project_monthly)
        curr_g_stock = project_monthly[-1]["godown_stock"]
        peak_c_idle = max(p["contractor_idle"] for p in project_monthly)
        curr_c_idle = project_monthly[-1]["contractor_idle"]

        ledger_data[it] = {
            "item_code": it,
            "item_name": item_dict[it]["item_name"],
            "unit": it_unit,
            "lead_time_days": item_dict[it]["lead_time_days"],
            "summary": {
                "total_received": round_num(total_rec, decimals),
                "total_transfers_in": round_num(total_tin, decimals),
                "total_transfers_out": round_num(total_tout, decimals),
                "total_issued": round_num(total_iss, decimals),
                "total_returned": round_num(total_ret, decimals),
                "total_consumed": round_num(total_con, decimals),
                "peak_godown_idle": round_num(peak_g_stock, decimals),
                "current_godown_idle": round_num(curr_g_stock, decimals),
                "peak_contractor_idle": round_num(peak_c_idle, decimals),
                "current_contractor_idle": round_num(curr_c_idle, decimals),
                "total_idle_current": round_num(curr_g_stock + curr_c_idle, decimals)
            },
            "project_monthly": project_monthly,
            "godowns_monthly": godowns_monthly
        }

        # Update item_dict summary
        item_dict[it]["total_received"] = round_num(total_rec, decimals)
        item_dict[it]["total_consumed"] = round_num(total_con, decimals)
        item_dict[it]["total_issued"] = round_num(total_iss, decimals)
        item_dict[it]["total_returned"] = round_num(total_ret, decimals)
        item_dict[it]["peak_godown_stock"] = round_num(peak_g_stock, decimals)
        item_dict[it]["peak_contractor_stock"] = round_num(peak_c_idle, decimals)
        item_dict[it]["current_godown_stock"] = round_num(curr_g_stock, decimals)
        item_dict[it]["current_contractor_stock"] = round_num(curr_c_idle, decimals)

    # 5. Job 3: Sets Calibration & Assembly Bottleneck Detector
    print("4. Building Job 3: Assembly Bottleneck Detector & Ratio Calibration...")
    sets_metadata = []
    parent_set_records = {}

    for s_no, s_group in sets_df.groupby("set_no"):
        first_row = s_group.iloc[0]
        p_code = first_row["parent_code"]
        p_name = first_row["parent_name"]
        p_unit = first_row["parent_unit"]
        p_cons = total_consumption_by_item.get(p_code, 0.0)

        children_meta = []
        for _, c_row in s_group.iterrows():
            c_code = c_row["child_code"]
            c_name = c_row["child_name"]
            c_unit = c_row["child_unit"]
            raw_r = float(c_row["ratio_of_parent"])
            c_cons = total_consumption_by_item.get(c_code, 0.0)
            obs_r = c_cons / p_cons if p_cons > 0 else 0.0
            diff_pct = abs(obs_r - raw_r) / raw_r * 100.0 if raw_r > 0 else 0.0
            is_anomaly = diff_pct > 35.0

            reason = ""
            if is_anomaly:
                if c_unit == "MT":
                    reason = f"Unit mismatch: child is measured in Metric Tonnes (MT), site usage is {obs_r:.6f} MT per set vs raw ratio {raw_r}."
                elif diff_pct > 100.0:
                    reason = f"BOQ ratio discrepancy: raw ratio is {raw_r} but site consumption observed is {obs_r:.2f} {c_unit} per set."
                else:
                    reason = f"Observed site ratio differs by {diff_pct:.1f}% from raw BOQ ratio."

            children_meta.append({
                "child_code": c_code,
                "child_name": c_name,
                "child_unit": c_unit,
                "raw_ratio": round_num(raw_r, 4),
                "observed_ratio": round_num(obs_r, 6 if c_unit == "MT" else 4),
                "diff_pct": round_num(diff_pct, 1),
                "is_anomaly": is_anomaly,
                "anomaly_reason": reason
            })

        set_info = {
            "set_no": str(s_no),
            "parent_code": p_code,
            "parent_name": p_name,
            "parent_unit": p_unit,
            "children": children_meta
        }
        sets_metadata.append(set_info)

        # Build monthly godown set balance for both calibrated and raw modes
        timeline_calibrated = []
        timeline_raw = []
        monthly_set_records = []

        for m_idx, m in enumerate(all_months):
            for mode in ["calibrated", "raw"]:
                # Evaluate per mode
                pass

            month_eval = {"month": m, "calibrated": {}, "raw": {}}

            for mode in ["calibrated", "raw"]:
                godown_cards = []
                total_p_stock = 0.0
                total_b_sets = 0.0
                total_stranded = 0.0
                imbalanced_cnt = 0

                for g in active_godowns:
                    p_stock = ledger_data[p_code]["godowns_monthly"][g][m_idx]["godown_stock"]
                    total_p_stock += p_stock

                    # Evaluate each child
                    child_caps = []
                    child_breakdown = []
                    for c_info in children_meta:
                        c_code = c_info["child_code"]
                        c_unit = c_info["child_unit"]
                        ratio = c_info["observed_ratio"] if mode == "calibrated" else c_info["raw_ratio"]
                        c_stock = ledger_data[c_code]["godowns_monthly"][g][m_idx]["godown_stock"]

                        if ratio > 0:
                            possible_sets = c_stock / ratio
                        else:
                            possible_sets = 999999999.0

                        needed_for_all = p_stock * ratio
                        shortfall_surplus = c_stock - needed_for_all

                        child_caps.append((possible_sets, c_code, c_info["child_name"]))
                        child_breakdown.append({
                            "child_code": c_code,
                            "child_name": c_info["child_name"],
                            "child_unit": c_unit,
                            "child_stock": c_stock,
                            "ratio": ratio,
                            "needed_for_all_parent": round_num(needed_for_all, 4 if c_unit == "MT" else 2),
                            "shortfall_surplus": round_num(shortfall_surplus, 4 if c_unit == "MT" else 2),
                            "max_sets_possible": round_num(possible_sets, 1)
                        })

                    # Buildable complete sets is min across parent stock and all child capacities
                    min_child_cap, limiting_code, limiting_name = min(child_caps, key=lambda x: x[0]) if child_caps else (0.0, None, None)
                    buildable = min(p_stock, math.floor(min_child_cap)) if p_stock > 0 else 0.0
                    stranded = max(0.0, p_stock - buildable)

                    total_b_sets += buildable
                    total_stranded += stranded

                    is_balanced = (stranded <= 1e-4)
                    if not is_balanced:
                        imbalanced_cnt += 1

                    godown_cards.append({
                        "godown": g,
                        "parent_stock": round_num(p_stock, 1),
                        "buildable_sets": round_num(buildable, 1),
                        "stranded_parent_stock": round_num(stranded, 1),
                        "is_balanced": is_balanced,
                        "limiting_child_code": limiting_code if not is_balanced else None,
                        "limiting_child_name": limiting_name if not is_balanced else None,
                        "children_breakdown": child_breakdown
                    })

                month_eval[mode] = {
                    "godowns": godown_cards,
                    "total_parent_stock": round_num(total_p_stock, 1),
                    "total_buildable_sets": round_num(total_b_sets, 1),
                    "total_stranded_parent": round_num(total_stranded, 1),
                    "imbalanced_godown_count": imbalanced_cnt
                }

            timeline_calibrated.append(month_eval["calibrated"]["imbalanced_godown_count"])
            timeline_raw.append(month_eval["raw"]["imbalanced_godown_count"])
            monthly_set_records.append(month_eval)

        parent_set_records[p_code] = {
            "set_no": str(s_no),
            "parent_code": p_code,
            "parent_name": p_name,
            "parent_unit": p_unit,
            "children": children_meta,
            "timeline_calibrated": timeline_calibrated,
            "timeline_raw": timeline_raw,
            "monthly_records": monthly_set_records
        }

    # 6. Job 2: Causal Time-Travel Replay & "The Bar" Simulation
    print("5. Running Job 2: Strictly Causal Simulation & Actual vs. Plan Scorecard...")
    planner_data = {}
    items_scorecard = []

    total_actual_idle_sum = 0.0
    total_plan_idle_sum = 0.0
    total_project_demand = 0.0
    total_project_shortage = 0.0

    for it in item_codes:
        it_meta = item_dict[it]
        it_unit = it_meta["unit"]
        decimals = 4 if it_unit == "MT" else (2 if it_unit in ["KM", "KG", "MTR"] else 1)
        lead_days = it_meta["lead_time_days"]
        L = it_meta["lead_time_months"]

        # Actual history per month
        act_godown_stock_history = [p["godown_stock"] for p in ledger_data[it]["project_monthly"]]
        act_contractor_stock_history = [p["contractor_idle"] for p in ledger_data[it]["project_monthly"]]
        act_consumption_history = [p["consumed"] for p in ledger_data[it]["project_monthly"]]

        actual_avg_stock = float(np.mean(act_godown_stock_history))
        actual_peak_stock = float(max(act_godown_stock_history))

        # Causal Simulation:
        # Commitments in flight prior to month 0 arrive during initial lead time L
        pipeline = [0.0] * (T + L + 1)
        for t in range(min(L, T)):
            pipeline[t] = ledger_data[it]["project_monthly"][t]["receipts"]

        sim_stock = 0.0
        sim_stock_history = []
        shortage_history = []
        demand_history = []
        order_qty_history = []
        action_history = []
        dhat_history = []
        sigma_history = []
        ss_history = []
        target_history = []
        invpos_history = []
        transfers_history = []
        godown_status_history = []

        for t, m in enumerate(all_months):
            # 1. Pipeline deliveries arrive at month t
            sim_stock += pipeline[t]

            # 2. Site consumption occurs at month t
            d_actual = act_consumption_history[t]
            demand_history.append(d_actual)

            if sim_stock >= d_actual:
                sim_stock -= d_actual
                shortage = 0.0
            else:
                shortage = d_actual - sim_stock
                sim_stock = 0.0

            shortage_history.append(shortage)
            sim_stock_history.append(sim_stock)

            # 3. Strictly Causal Trailing Demand Estimation (known up to month t)
            # Trailing 3-month demand
            trailing_window = demand_history[max(0, t - 2): t + 1]
            d_hat = float(np.mean(trailing_window)) if trailing_window else 0.0
            sigma = float(np.std(trailing_window, ddof=1)) if len(trailing_window) > 1 else 0.0
            if math.isnan(sigma):
                sigma = 0.0

            # Early project seeding if consumption has not ramped up yet
            if d_hat <= 1e-6:
                past_recs = [ledger_data[it]["project_monthly"][i]["receipts"] for i in range(t + 1)]
                d_hat = float(np.mean(past_recs)) if np.mean(past_recs) > 0 else 1.0

            # Lead time safety stock buffer: covers L + 1 review period + volatility
            safety_stock = 1.5 * (0.5 * d_hat + sigma * math.sqrt(L))
            target_inv = d_hat * (L + 1) + safety_stock

            in_flight = sum(pipeline[t + 1: t + L + 1])
            inv_pos = sim_stock + in_flight

            # Order decision
            if inv_pos < target_inv and (t + L < T):
                qty_to_order = target_inv - inv_pos
                base_action = "ORDER"
            else:
                qty_to_order = 0.0
                base_action = "HOLD"

            pipeline[t + L] += qty_to_order
            order_qty_history.append(qty_to_order)
            dhat_history.append(d_hat)
            sigma_history.append(sigma)
            ss_history.append(safety_stock)
            target_history.append(target_inv)
            invpos_history.append(inv_pos)

            # 4. Godown Surplus / Deficit & Transfer Recommendations at month t
            # Compute godown stock & trailing issues known up to month t
            m_godowns_status = []
            surplus_godowns = []
            deficit_godowns = []

            for g in active_godowns:
                g_stock = ledger_data[it]["godowns_monthly"][g][t]["godown_stock"]
                # Trailing 3-month issues for godown g
                trailing_iss = [ledger_data[it]["godowns_monthly"][g][i]["issued"] for i in range(max(0, t - 2), t + 1)]
                g_dhat = float(np.mean(trailing_iss)) if trailing_iss else 0.0
                if g_dhat < 1e-4:
                    g_dhat = max(0.1, d_hat / 6.0)

                cover = g_stock / g_dhat if g_dhat > 0 else 99.0

                if cover > 3.0 and g_stock > (3.0 * g_dhat):
                    surplus_qty = g_stock - (3.0 * g_dhat)
                    surplus_godowns.append({"godown": g, "surplus_qty": surplus_qty, "cover": cover})
                    g_status = "SURPLUS"
                elif cover < 1.0:
                    needed_qty = max(0.0, (2.0 * g_dhat) - g_stock)
                    deficit_godowns.append({"godown": g, "needed_qty": needed_qty, "cover": cover})
                    g_status = "DEFICIT"
                else:
                    g_status = "NORMAL"

                m_godowns_status.append({
                    "godown": g,
                    "stock": round_num(g_stock, decimals),
                    "trailing_monthly_demand": round_num(g_dhat, decimals),
                    "cover_months": round_num(cover, 1),
                    "status": g_status
                })

            godown_status_history.append(m_godowns_status)

            # Match surplus godowns with deficit godowns
            recommended_transfers = []
            surplus_sorted = sorted(surplus_godowns, key=lambda x: x["surplus_qty"], reverse=True)
            deficit_sorted = sorted(deficit_godowns, key=lambda x: x["needed_qty"], reverse=True)

            min_transfer_threshold = 0.005 if it_unit == "MT" else 1.0

            s_idx = 0
            for def_item in deficit_sorted:
                needed = def_item["needed_qty"]
                while needed > min_transfer_threshold and s_idx < len(surplus_sorted):
                    avail = surplus_sorted[s_idx]["surplus_qty"]
                    xfer_qty = min(avail, needed)
                    if xfer_qty >= min_transfer_threshold:
                        recommended_transfers.append({
                            "from_godown": surplus_sorted[s_idx]["godown"],
                            "to_godown": def_item["godown"],
                            "qty": round_num(xfer_qty, decimals),
                            "unit": it_unit,
                            "reason": f"Rebalance {surplus_sorted[s_idx]['godown']} ({surplus_sorted[s_idx]['cover']:.1f}mo cover) to relieve {def_item['godown']} ({def_item['cover']:.1f}mo cover)"
                        })
                        needed -= xfer_qty
                        surplus_sorted[s_idx]["surplus_qty"] -= xfer_qty

                    if surplus_sorted[s_idx]["surplus_qty"] <= min_transfer_threshold:
                        s_idx += 1

            transfers_history.append(recommended_transfers)

            if len(recommended_transfers) > 0 and base_action == "ORDER":
                action = "ORDER & TRANSFER"
            elif len(recommended_transfers) > 0:
                action = "TRANSFER"
            else:
                action = base_action
            action_history.append(action)

        sim_avg_stock = float(np.mean(sim_stock_history))
        sim_peak_stock = float(max(sim_stock_history))
        tot_demand = sum(demand_history)
        tot_shortage = sum(shortage_history)
        service_lvl = (1.0 - (tot_shortage / tot_demand)) * 100.0 if tot_demand > 0 else 100.0
        idle_red_pct = ((actual_avg_stock - sim_avg_stock) / actual_avg_stock * 100.0) if actual_avg_stock > 0 else 0.0
        shortage_months_cnt = sum(1 for s in shortage_history if s > (0.001 if it_unit == "MT" else 1.0))

        total_actual_idle_sum += actual_avg_stock
        total_plan_idle_sum += sim_avg_stock
        total_project_demand += tot_demand
        total_project_shortage += tot_shortage

        # Assemble monthly replay records
        monthly_replay = []
        for t, m in enumerate(all_months):
            arrival_idx = t + L
            arrival_m = all_months[arrival_idx] if arrival_idx < T else "Post-Project"

            monthly_replay.append({
                "month": m,
                "month_idx": t,
                "actual_godown_stock": round_num(act_godown_stock_history[t], decimals),
                "actual_contractor_idle": round_num(act_contractor_stock_history[t], decimals),
                "actual_total_idle": round_num(act_godown_stock_history[t] + act_contractor_stock_history[t], decimals),
                "actual_consumption": round_num(demand_history[t], decimals),
                "plan_stock": round_num(sim_stock_history[t], decimals),
                "plan_shortage": round_num(shortage_history[t], decimals),
                "plan_demand_met": round_num(demand_history[t] - shortage_history[t], decimals),
                "trailing_demand_dhat": round_num(dhat_history[t], decimals),
                "volatility_sigma": round_num(sigma_history[t], decimals),
                "safety_stock": round_num(ss_history[t], decimals),
                "target_inventory": round_num(target_history[t], decimals),
                "inventory_position": round_num(invpos_history[t], decimals),
                "action": action_history[t],
                "order_qty": round_num(order_qty_history[t], decimals),
                "expected_arrival_month": arrival_m,
                "recommended_transfers": transfers_history[t],
                "godowns_status": godown_status_history[t]
            })

        scorecard_item = {
            "item_code": it,
            "item_name": it_meta["item_name"],
            "unit": it_unit,
            "lead_time_days": lead_days,
            "lead_time_months": L,
            "actual_avg": round_num(actual_avg_stock, decimals),
            "plan_avg": round_num(sim_avg_stock, decimals),
            "reduction_pct": round_num(idle_red_pct, 1),
            "actual_peak": round_num(actual_peak_stock, decimals),
            "plan_peak": round_num(sim_peak_stock, decimals),
            "service_level": round_num(service_lvl, 2),
            "shortage_months": shortage_months_cnt,
            "total_demand": round_num(tot_demand, decimals),
            "total_shortage": round_num(tot_shortage, decimals)
        }
        items_scorecard.append(scorecard_item)

        planner_data[it] = {
            "item_code": it,
            "item_name": it_meta["item_name"],
            "unit": it_unit,
            "lead_time_days": lead_days,
            "lead_time_months": L,
            "comparison": scorecard_item,
            "monthly_replay": monthly_replay
        }

    overall_reduction_pct = ((total_actual_idle_sum - total_plan_idle_sum) / total_actual_idle_sum * 100.0) if total_actual_idle_sum > 0 else 0.0
    overall_service_level = (1.0 - (total_project_shortage / total_project_demand)) * 100.0 if total_project_demand > 0 else 100.0

    overall_scorecard = {
        "actual_avg_idle_stock": round_num(total_actual_idle_sum, 1),
        "plan_avg_idle_stock": round_num(total_plan_idle_sum, 1),
        "idle_reduction_pct": round_num(overall_reduction_pct, 1),
        "service_level_pct": round_num(overall_service_level, 2),
        "total_demand": round_num(total_project_demand, 1),
        "total_shortage": round_num(total_project_shortage, 1),
        "items_scorecard": items_scorecard
    }

    # 7. Write JSON output files
    print("6. Writing JSON files to public/data/...")
    
    # meta.json
    meta_json = {
        "project_name": "Lumino Industries — 1,700 Poles (VCH3 Hackathon)",
        "product_name": "LuminoFlow — Site-Driven EPC Stock & Ordering Planner",
        "region": "Kanpur 6-District Power Line",
        "time_span": {
            "start_month": all_months[0],
            "end_month": all_months[-1],
            "total_months": T
        },
        "stats": {
            "total_transactions": len(receipts_clean) + len(transfers_clean) + len(cm_clean),
            "receipts_rows": len(receipts_clean),
            "transfers_rows": len(transfers_clean),
            "contractor_moves_rows": len(cm_clean),
            "raw_negative_dips_count": len(negative_balance_audit),
            "raw_negative_audit": negative_balance_audit[:10]  # sample audit
        },
        "items": list(item_dict.values()),
        "godowns": active_godowns,
        "months": all_months,
        "sets_meta": sets_metadata,
        "overall_scorecard": overall_scorecard
    }

    with open(os.path.join(output_dir, "meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta_json, f, indent=2)
    print("   -> Generated public/data/meta.json")

    with open(os.path.join(output_dir, "ledger.json"), "w", encoding="utf-8") as f:
        json.dump(ledger_data, f, separators=(',', ':'))
    print("   -> Generated public/data/ledger.json")

    with open(os.path.join(output_dir, "planner.json"), "w", encoding="utf-8") as f:
        json.dump(planner_data, f, separators=(',', ':'))
    print("   -> Generated public/data/planner.json")

    with open(os.path.join(output_dir, "sets.json"), "w", encoding="utf-8") as f:
        json.dump(parent_set_records, f, separators=(',', ':'))
    print("   -> Generated public/data/sets.json")

    # 8. Print Executive Summary Scorecard to Console
    print("\n" + "=" * 80)
    print("LUMINOFLOW SCORECARD: ACTUAL LUMINO HISTORY VS. CAUSAL PLAN")
    print("=" * 80)
    print(f"Overall Idle Stock Reduction: {overall_reduction_pct:.1f}%")
    print(f"Overall Site Service Level:   {overall_service_level:.2f}% (Shortage: {total_project_shortage:.1f} / {total_project_demand:.1f})")
    print("-" * 80)
    header = f"{'Item Code':<11} | {'Unit':<4} | {'L':<2} | {'Act Avg':>10} | {'Plan Avg':>10} | {'Red %':>7} | {'Act Peak':>10} | {'Plan Peak':>10} | {'Svc Lvl':>7} | {'Short M'}"
    print(header)
    print("-" * 80)
    for sc in items_scorecard:
        print(f"{sc['item_code']:<11} | {sc['unit']:<4} | {sc['lead_time_months']:<2} | {sc['actual_avg']:>10.1f} | {sc['plan_avg']:>10.1f} | {sc['reduction_pct']:>6.1f}% | {sc['actual_peak']:>10.1f} | {sc['plan_peak']:>10.1f} | {sc['service_level']:>6.2f}% | {sc['shortage_months']}")
    print("=" * 80)
    print("Offline Data Engine completed successfully.")

if __name__ == "__main__":
    main()
