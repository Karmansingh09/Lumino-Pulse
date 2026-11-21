# LuminoFlow — Site-Driven EPC Stock, Set-Balance & Ordering Planner

> **Lumino Industries Limited — "1,700 Poles"**  
> *Vibe Coders Hackathon Edition 3 (VCH3), Kolkata — 21 November 2026*  
> **Tagline:** *"See every yard. Plan on actual site consumption. Never strand an assembly set."*

---

## 1. Executive Summary & The Problem

Lumino Industries constructs high-voltage power transmission lines and district distribution networks. Historically, materials were procured months in advance on a **fixed delivery schedule** rather than pacing against actual site consumption:
* **The "1,700 Poles" Phenomenon:** Fixed plans dispatched 1,000 poles each month. The site erected 400, then 600, then 300. Three months in, 3,000 poles had arrived and **1,700 were lying idle in district godowns**, needlessly locking up working capital.
* **The Assembly-Set Trap:** Major infrastructure only functions as complete assembly sets (e.g., a Pole Clamp requires Eye Hooks and G.I. Nuts & Bolts). If a low-cost child fastener runs out in a yard, the entire parent set is stranded—even if hundreds of parent clamps are in stock.
* **High Lead-Time Vulnerability:** Critical items like 8.5m PCC Poles carry a **150-day lead time**, meaning late orders cannot be rescued quickly.

**LuminoFlow** solves this with a **zero-database-overhead, strictly causal walk-forward simulation and tool-calling agent platform** built directly on Lumino's complete Kanpur 6-District real project dataset (March 2023 – October 2026).

---

## 2. Key Scorecard: Actual Lumino History vs. Causal Plan ("The Bar")

The planning engine enforces **strict causality**: at month $t$, decisions depend exclusively on historical data known up to month $t$ (zero future peeking).

* **Overall Idle Stock Reduction:** **+55.7%** (average idle stock cut by more than half)
* **Overall Site Service Level:** **94.74%** (proving idle stock was reduced *without starving the site*)
* **Transactions Processed:** **235,122 clean transactions** (231,076 contractor moves, 2,600 receipts, 1,446 transfers) with zero row deduplication.
* **Late ERP Entry Dips:** 21 instances (<0.5%) clamped for display while preserving raw un-clamped values for auditability.

---

## 3. The Three Core Modules + Agent Copilot

### Tab 1: SEE IT — Monthly Stock & Idle Ledger
* **Dual-Scope Visibility:** Explicit separation of **Godown Yard Stock** (per godown) and **Contractor-Held Idle Stock** (project-wide only, as site consumption has no district column).
* **KPI Strip:** Vendor Receipts, Site Consumption, Peak Godown Idle, Lead Time & Peak Contractor Idle.
* **Dual Recharts Analytics:** Cumulative Idle Stock Area Chart + Monthly Material Flows Composed Chart.
* **44-Month Physical Ledger Table:** Sticky-header scrollable audit table with year filters (`ALL`, `2023`, `2024`, `2025`, `2026`).

### Tab 2: PLAN IT — Causal Replay & Live "What-If" Simulator
* **Live Walk-Forward Engine (<2ms):** Pure TypeScript causal simulator running live on client slider changes.
* **Live Policy Controls:**
  * Safety Stock Multiplier ($0.5\times$ to $2.5\times$)
  * Demand Lookback Window ($2$, $3$, $4$, $6$ months)
  * Vendor Lead-Time Stress Delay ($+0\text{d}$, $+15\text{d}$, $+30\text{d}$, $+60\text{d}$)
* **"The Bar" Dual-Line Chart:** Side-by-side comparison of Actual Lumino Stock vs. Our Causal Plan curve with shortage indicators and synchronized reference lines.
* **44-Month Time-Travel Slider:** Step through historical months with an automatic **Play / Pause** loop (600ms interval).
* **Collapsible 16-Item Benchmark Table:** Click any row to simulate that item live.

### Tab 3: MATCH THE SETS — Assembly Bottlenecks & Ratio Anomaly Guardrail
* **The Built-In ERP Ratio Trap Caught:**
  * `MNB010174` (G.I. Nuts & Bolts) is in **Metric Tonnes (MT)** with raw ratio `1.0`, while actual site usage is **0.00015 MT / Pole Clamp** (~6,600× error in raw BOQ).
  * `MLU020008` (Ring Lugs) for 3-Phase DB lists raw ratio `0.25`, while site usage is **5.66 NOS / box** (~23× higher).
  * `MNB010174` is shared across all 3 assembly sets.
* **Ratio Mode Toggle:** Switch seamlessly between **"Calibrated Site Ratio (Recommended)"** and **"Raw BOQ Ratio"**.
* **44-Month Heatmap Timeline Strip:** Visual problem heatmap with a **"Jump to Worst Bottleneck Month"** button.
* **6-Godown Grid & Smart Transfers:** Identifies blocked godowns and detects candidate donors with genuine surplus of limiting child components to suggest inter-godown rebalancing.

### AI Supply-Chain Agent & ERP Vouchers
* **Deterministic Server Tools:** `get_godown_stock`, `get_plan_decision`, `get_set_bottlenecks`, `draft_erp_voucher`.
* **Visible Tool Trace:** Displays execution times (sub-millisecond) and structured tool summaries in the UI.
* **Executive 4-Bullet Brief:** Situation, Root Cause, Recommended Action, Risk Note.
* **Human-in-the-Loop ERP Drafting:** Generates structured PO or Transfer draft vouchers (`PENDING_HOD_APPROVAL`) with one-click digital approval.
* **100% Reliable Deterministic Fallback:** Operates with zero downtime even without an external API key.

---

## 4. Repository Structure

```text
Lumino-Pulse/
├── app/
│   ├── api/
│   │   ├── agent/route.ts      # Tool-calling agent endpoint
│   │   └── explain/route.ts    # Action brief alias endpoint
│   ├── globals.css             # Industrial control room styling
│   ├── layout.tsx              # Root HTML shell
│   └── page.tsx                # Server Component data loader
├── components/
│   ├── DashboardShell.tsx      # Main layout & tab orchestrator
│   ├── LuminoAgentPanel.tsx    # Slide-over tool-calling copilot drawer
│   ├── MatchSetsTab.tsx        # Tab 3: Set bottleneck detector & heatmap
│   ├── PlanItTab.tsx           # Tab 2: Causal time-travel & what-if simulator
│   ├── ProjectScorecard.tsx    # 16-Item Actual vs. Plan scorecard modal
│   └── SeeItTab.tsx            # Tab 1: Monthly ledger & flow charts
├── data/
│   └── csv/                    # 5 raw Lumino CSV files (235k rows)
├── lib/
│   ├── agentEngine.ts          # Deterministic tools & voucher drafting
│   └── causalSimulator.ts      # Pure TS walk-forward simulation engine
├── public/data/
│   ├── ledger.json             # Pre-computed Job 1 monthly ledger
│   ├── meta.json               # Project metadata & scorecard
│   ├── planner.json            # Pre-computed Job 2 causal replay
│   └── sets.json               # Pre-computed Job 3 set balances
├── scripts/
│   └── build_lumino_data.py    # Offline data engine (Python/pandas)
├── tests/
│   ├── test_agent.ts           # Agent tools & voucher unit tests
│   ├── test_causal_simulator.ts# Causal integrity & anti-leakage tests
│   ├── test_data_engine.py     # Accounting identity & balance tests
│   └── test_match_sets.ts      # Assembly invariants & donor surplus tests
└── package.json
```

---

## 5. Local Setup & Verification

### Prerequisites
* Node.js v18+ (tested on Node v24)
* Python 3.9+ with `pandas` and `numpy`

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Build the pre-computed static datasets (if re-processing CSVs)
python3 scripts/build_lumino_data.py

# 3. Start development server
npm run dev
# Open http://localhost:3000 in your browser

# 4. Production build check
npm run build
```

### Running All Automated Test Suites
```bash
# Runs Python ledger tests + TS causal simulator tests + TS sets tests + TS agent tests
python3 -m unittest tests/test_data_engine.py && \
npx tsx tests/test_causal_simulator.ts && \
npx tsx tests/test_match_sets.ts && \
npx tsx tests/test_agent.ts
```
All 4 test suites pass with zero failures.

---

## 6. Engineering Integrity & Rules Enforced

1. **Zero Data Leakage:** Decisions at month $t$ strictly use historical data up to month $t$. Verified by modifying future records and proving zero deviation in prior decisions.
2. **Zero Fabrication:** Scorecard improvements reflect genuine historical rebalancing using Lumino's real receipts and contractor consumption.
3. **Inventory Conservation:** Transfers strictly conserve total project stock and never create inventory.
4. **No Price Hallucination:** All metrics count strictly in physical items and native units (`PCS`, `NOS`, `SET`, `KG`, `MT`, `KM`, `MTR`).
