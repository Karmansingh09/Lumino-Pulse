# Lumino Pulse — Demand-Driven EPC Stock, Set-Balance & Ordering Planner

**Event:** Vibe Coders Hackathon Edition 3 (VCH3), Kolkata — 21 November 2026  
**Track:** Lumino Industries Limited — *"1,700 Poles"*  
**Submission Deadline:** 4:30 PM IST  
**Tagline:** *"See every yard. Plan on actual site consumption. Never strand a set."*

---

## 1. Executive Summary & The Business Problem

Lumino Industries builds power transmission and distribution lines across multi-district EPC projects. Historically, materials are ordered months ahead on a **fixed schedule** rather than actual site consumption:
* A project plans to erect 1,000 poles/month, but the site erects 400, then 600, then 300. Trucks keep arriving on the fixed plan, leaving thousands of poles sitting idle in district godowns and tying up working capital.
* **The Compounding Problem (Sets & Lead Times):** Major items only work as complete **assembly sets** (e.g., a Pole Clamp is useless without its Eye Hook and G.I. Nuts & Bolts). If one low-cost child component runs short in a godown, the entire set waits—even when hundreds of parent items are sitting in the yard. Meanwhile, items like 8.5m PCC Poles carry a **150-day lead time**, meaning late orders cannot be rescued quickly.

### What We Are Building
**Lumino Pulse** is a deterministic, consumption-driven EPC inventory intelligence and causal replay platform built on Lumino's real Kanpur multi-district project dataset (March 2023 – October 2026). It executes all three official jobs end-to-end, anchored by an AI Supply Chain Analyst that explains every recommendation in plain operational English.

---

## 2. Verified Dataset Audit & Key Discovery

We inspected the complete supplied dataset (`lumino-vch3-data.zip`):
* **Time Span:** March 2023 – October 2026 (44 months; vendor receipts stop in July 2026 while site consumption continues through October 2026).
* **Scope:** **16 items** (lead times from 30 to 150 days), **6 active district godowns** (`KANPUR AURAIYA`, `KANPUR DEHAT`, `KANPUR ETAWAH`, `KANPUR FARRUKHABAD`, `KANPUR KANNAUJ`, `KANPUR NAGAR`), plus 1 closing store (`KANPUR CLOSER` in transfers only).
* **Transaction Volume:**
  * `receipts.csv`: 2,600 vendor delivery rows
  * `transfers.csv`: 1,446 inter-godown transfer rows
  * `contractor_moves.csv`: **231,076 rows** (`ISSUE`, `CONSUMPTION`, `RETURN`)
* **Data Integrity Rules Enforced:**
  * Identical-looking rows are separate entries and are **never deduplicated**.
  * Rows with `qty == 0` are ignored.
  * `CONSUMPTION` has no godown column (project-wide tracking only), so **Godown Idle Stock** is tracked per godown while **Contractor Idle Stock** is tracked project-wide.
  * Minor negative stock dips caused by late data entries are clamped to `0`.
  * There are no prices; all tracking and optimization is strictly in **physical quantities per item**.

### The Built-In Data Trap We Caught (`sets.csv` Calibration)
The README advises verifying `ratio_of_parent` in `sets.csv` against actual site consumption before trusting it. Cross-checking actual site consumption across all 44 months exposed two major anomalies:
1. **Unit Trap (Set 1.071 — Pole Clamp RDSS):** `MNB010174` (G.I. Bolts) is measured in **Metric Tonnes (`MT`)**, not pieces. The raw `ratio_of_parent` is `1.00`, whereas actual site usage is approximately `0.00015 MT` per clamp. A naive ratio calculation overestimates bolt requirements by over $6,000\times$.
2. **Ratio Mismatch (Set 1.078 — 3-Phase Distribution Box):** `MLU020008` (Ring Type Lugs) lists a raw ratio of `0.25`, whereas actual site consumption is approximately `5.66` lugs per 3-phase box.

**How Lumino Pulse Handles This:** Our Set Matcher flags these anomalies transparently and gives planners a live toggle between **Observed Site Ratio (Calibrated)** and **Raw BOQ Ratio**, proving real data engineering discipline rather than blind formula application.

---

## 3. Core Functional Architecture (The 3 Jobs + AI Copilot)

### Job 1 — SEE IT (Monthly Ledger & Idle Stock Reconstruction)
Reconstructs exact inventory state month by month for every item and every godown using Lumino's exact accounting identities:

$$\text{Godown Stock}_{i,g,t} = \max\left(0, \sum_{\tau \le t} \left(\text{Receipts}_{i,g,\tau} + \text{Transfers IN}_{i,g,\tau} - \text{Transfers OUT}_{i,g,\tau} - \text{Issue}_{i,g,\tau} + \text{Return}_{i,g,\tau}\right)\right)$$

$$\text{Contractor Idle Stock}_{i,t} = \max\left(0, \sum_{\tau \le t} \left(\text{Issue}_{i,\tau} - \text{Return}_{i,\tau} - \text{Consumption}_{i,\tau}\right)\right)$$

**UI Features:**
* Item & Godown selectors across all 16 items and 6 district stores.
* Split visibility between **Godown Yard Idle Stock** and **Contractor-Held Idle Stock**.
* Interactive monthly flow chart (Receipts vs. Issued vs. Consumed vs. Ending Idle Stock) and downloadable/inspectable monthly ledger table.

### Job 2 — PLAN IT (Strict Causal Replay & "The Bar" Scorecard)
Replays the project month by month from March 2023 to October 2026. **Strict anti-leakage rule:** at month $t$, the planner only sees demand, receipts, and stock known up to month $t$—never future consumption.

**Deterministic Replenishment Logic:**
* **Lead Time Conversion:** $L_i = \max\left(1, \lceil \text{lead\_time\_days}_i / 30 \rceil\right)$ months.
* **Causal Demand Forecast:** Trailing 3-month consumption average $\hat{d}_{i,t}$ and volatility $\sigma_{i,t}$.
* **Safety Stock & Target Position:**
  $$\text{Target}_{i,t} = \hat{d}_{i,t} \cdot (L_i + 1) + \left(\hat{d}_{i,t} + 0.5 \cdot \sigma_{i,t} \sqrt{L_i}\right)$$
* **Action Decision at Month $t$:**
  * **ORDER:** If $\text{Inventory Position} < \text{Target}_{i,t}$, place an order arriving at $t + L_i$.
  * **TRANSFER:** Identify godowns with $>3$ months of cover (surplus) and match them to godowns with $<1$ month of cover (deficit) to avoid unnecessary vendor orders.
  * **HOLD:** Stop incoming trucks when inventory position already covers the lead-time horizon.

**"The Bar" — Actual vs. Our Plan Scorecard:**
Directly compares **Lumino's Actual Historical Idle Stock** against **Lumino Pulse's Simulated Stock** for every item, displaying:
* Average & Peak Idle Stock Reduction (`%`)
* Shortage Months & Fill Rate / Service Level (`%`) — proving we cut idle stock **without starving the site**.

### Job 3 — MATCH THE SETS (Godown Assembly-Set Bottleneck Detector)
Tracks all 3 parent sets (`POLE CLAMP RDSS`, `1-Phase Distribution Box`, `3-Phase Distribution Box`) and their shared/specific child components across every godown and month:
* Computes **Max Buildable Complete Sets** per godown:
  $$\text{Buildable Sets}_{p,g,t} = \min\left(\text{Stock}_{p,g,t},\ \min_{c \in \text{Children}(p)} \frac{\text{Stock}_{c,g,t}}{r_{p,c}}\right)$$
* Calculates **Stranded Parent Stock** ($\text{Stock}_{p,g,t} - \text{Buildable Sets}_{p,g,t}$) and identifies the exact **Limiting Child Component**.
* Highlights every imbalanced godown-month in a visual heatmap and includes the **Calibrated vs. Raw BOQ Ratio** toggle with an explicit data-quality alert.

### Layer 4 — AI Supply Chain Analyst (Explainability Layer)
* **Strict Rule:** Zero LLM math. All stock sums, lead-time schedules, transfer quantities, and set shortages are computed deterministically in code.
* **AI Responsibility:** On any selected item, godown, and replay month, the user can trigger an **AI Action Brief** (`/api/explain`, backed by Sarvam AI / Gemini with an automatic deterministic fallback). It reads the exact structured JSON state and generates a concise 3-bullet executive briefing:
  1. **Current Yard Status** (what is sitting idle and where).
  2. **Exact Recommended Action** (Order X now for lead-time arrival in Month Y, Hold, or Transfer Z units from Godown A to Godown B).
  3. **Set Bottleneck Warning** (which child item is stranding parent stock).

---

## 4. Technical Stack & System Architecture

Designed for **maximum solo reliability and zero runtime lag** on 231,076 rows:

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Data & Simulation Engine** | Python (`pandas`, `numpy`) | Runs once (`scripts/build_lumino_data.py`) in ~2 seconds to process all 231k rows and output verified static JSON datasets (`meta.json`, `ledger.json`, `planner.json`, `sets.json`). |
| **Frontend & API** | Next.js (App Router), TypeScript, Tailwind CSS | Single cohesive full-stack repository; instant client/server rendering with zero CSV parsing latency. |
| **Visualisation** | Recharts + Lucide Icons | Clean industrial/enterprise B2B dashboard with interactive time-series charts, month replay slider, and godown bottleneck heatmaps. |
| **AI Explainability** | Provider-agnostic `/api/explain` route | Connects to Sarvam AI or Gemini via `.env`, with a built-in deterministic fallback so the demo never breaks even if an external API times out. |
| **Deployment** | Vercel + GitHub | Instant live URL for judges. |

---

## 5. User Interface Structure

1. **Top KPI Header Bar:** Active Project (`Kanpur 6-District Power Line`), Period (`Mar 2023 – Oct 2026`), Total Transactions Processed (`235,122`), Global Idle Reduction Summary, and Service Level (`%`).
2. **Tab 1 — `SEE IT` (Inventory Ledger):**
   * Item dropdown (16 items) + Godown filter (`All Project` or any of the 6 godowns).
   * Dual-view chart: Monthly Flows (Receipts, Issued, Consumed) + Cumulative Idle Stock (Godown vs. Contractor).
   * Clean monthly audit table.
3. **Tab 2 — `PLAN IT` (Causal Replay & Scorecard):**
   * **Interactive Month Slider** (`2023-03` → `2026-10`) showing the exact decision state known at that date (`ORDER` / `HOLD` / `TRANSFER` badge + recommended inter-godown moves).
   * **Actual vs. Our Plan Chart:** Overlaid area/line chart showing Lumino's actual idle stock mountain vs. Lumino Pulse's lean, demand-paced stock curve.
   * **All-16-Items Scorecard Table:** Transparently showing idle reduction `%` and service level `%` across every item.
4. **Tab 3 — `MATCH THE SETS` (Assembly Bottlenecks):**
   * Selector for the 3 Parent Sets + **Calibrated vs. Raw Ratio Toggle** (with callout banner explaining the `MT` and `0.25` discoveries).
   * 6-Godown status cards for the selected month showing Parent Stock, Complete Buildable Sets, Stranded Stock, and the exact Limiting Child.
   * 44-month imbalance timeline strip.
5. **Slide-Over / Embedded `AI Action Brief` Panel:** Plain-English operational memo generated from the live deterministic state of the active screen.

---

## 6. Execution Schedule (11:16 AM → 4:30 PM IST)

| Time (IST) | Duration | Deliverable |
| :--- | :--- | :--- |
| **11:16 – 11:40** | 24m | Scaffold Next.js app, place CSVs in `data/csv/`, run `build_lumino_data.py`, verify scorecard numbers. |
| **11:40 – 12:40** | 60m | Build App Shell + **Tab 1: SEE IT** (KPIs, Item/Godown filters, Recharts flow/idle graphs, ledger table). |
| **12:40 – 1:55** | 75m | Build **Tab 2: PLAN IT** (Month Replay Slider, Order/Hold/Transfer action panel, Actual vs. Plan chart & 16-item scorecard). |
| **1:55 – 2:50** | 55m | Build **Tab 3: MATCH THE SETS** (3-Set breakdown, Godown Bottleneck cards, Calibrated vs. Raw Ratio toggle & alert). |
| **2:50 – 3:30** | 40m | Add `/api/explain` **AI Action Brief** + polish UI typography, loading states, and empty states. |
| **3:30 – 3:55** | 25m | Deploy to Vercel, verify live link on all 16 items & 3 sets, push clean GitHub `README.md`. |
| **3:55 – 4:30** | 35m | **HARD FREEZE →** Record crisp 2-minute demo video and submit before 4:25 PM. |

---

## 7. 2-Minute Demo Video Script Structure (25% of Judging Score)

* **0:00 – 0:20 (The Hook):** State the exact Lumino problem—fixed-schedule ordering across 6 Kanpur godowns leaves massive idle stock while missing child components stall entire assembly sets. Show that we processed all **231,076 real rows** deterministically.
* **0:20 – 0:45 (Job 1 — SEE IT):** Select `PCC POLE 8.5 MTR 180 KG` (150-day lead time). Show the spike in Godown Idle Stock vs. Contractor Idle Stock month by month across the 6 districts.
* **0:45 – 1:20 (Job 2 — PLAN IT & The Bar):** Scrub the **Time-Travel Month Slider** to show causal `ORDER`, `HOLD`, and `TRANSFER` decisions made using *only* data known up to that month. Reveal the **Actual vs. Our Plan** chart and scorecard proving substantial idle-stock reduction while keeping site service levels high.
* **1:20 – 1:45 (Job 3 — MATCH THE SETS + The Data Trap):** Open Set `1.071` (`POLE CLAMP RDSS`) and Set `1.078` (`3-Phase DB`). Show stranded parent stock in a specific godown, then flip the **Observed vs. Raw BOQ Ratio** toggle to highlight the `MT` and `0.25` anomalies we caught in the real data.
* **1:45 – 2:00 (AI Action Brief & Close):** Click **Generate AI Action Brief** to produce a plain-English procurement & transfer memo for the project manager. Close with the live URL and GitHub repo.