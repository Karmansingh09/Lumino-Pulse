# LuminoFlow — Site-Driven EPC Stock, Set-Balance & Ordering Planner

> **Lumino Industries Limited — "1,700 Poles"**  
> *Vibe Coders Hackathon Edition 3 (VCH3), Kolkata — 21 November 2026*  
> **Tagline:** *"See every yard. Plan on actual site consumption. Never strand an assembly set."*

---

## 1. Executive Summary & The Problem

Lumino Industries executes high-voltage power transmission line and district distribution projects across Uttar Pradesh. Historically, project procurement operated on **fixed monthly delivery schedules** specified at tender stage rather than adapting dynamically to actual field erection velocity:

* **The "1,700 Poles" Phenomenon:** Fixed procurement plans called for 1,000 poles each month. Field contractors erected 400 in Month 1, 600 in Month 2, and 300 in Month 3. By Month 3, 3,000 poles had arrived at district godowns while only 1,300 were erected—leaving **1,700 bulky PCC poles lying idle in yards**, congesting storage space and locking up significant working capital.
* **The Assembly-Set Bottleneck Trap:** In electrical infrastructure, parent equipment only functions when all child components are present (e.g., a Pole Clamp requires Eye Hooks and G.I. Nuts & Bolts). When low-cost fasteners run out in a district yard, parent equipment is stranded—even if hundreds of parent clamps are physically present.
* **High Lead-Time Vulnerability:** Primary structural items like 8.5m PCC Poles carry a **150-day vendor lead time** (5 months). Hasty order cuts risk severe project stalls, while rigid fixed-order deliveries flood the yards.

**LuminoFlow** replaces static ordering with a **strictly causal, site-consumption-driven inventory ledger, live walk-forward simulation engine, assembly bottleneck detector, and human-in-the-loop tool-calling supply chain agent**.

---

## 2. Core Implemented Modules

### Module 1: SEE IT — 44-Month Physical Inventory & Idle Ledger
* **Dual-Scope Visibility:** Explicit architectural separation of **Godown Yard Stock** (tracked per district godown) and **Contractor-Held Idle Stock** (tracked project-wide only, because contractor site consumption slips do not log a source godown).
* **4 Operational KPIs:** Total Vendor Receipts, Total Site Consumption, Peak Godown Idle Stock, and Vendor Lead Time with Peak Contractor Idle.
* **Dual Recharts Visualizations:**
  1. *Idle Stock Over Time* (Area Chart): Amber godown yard stock + blue contractor idle stock with gradient fills and synchronized tooltips.
  2. *Monthly Material Flows* (Composed Bar/Line Chart): Blue receipt bars, amber contractor issue lines, emerald site consumption lines, and inter-godown transfer flows.
* **44-Month Physical Ledger Audit Table:** Displays exact monthly transactions and cumulative stock balances under Lumino's EPC accounting identity, complete with year filters (`ALL`, `2023`, `2024`, `2025`, `2026`) and **one-click CSV Export**.

### Module 2: PLAN IT — Strictly Causal Walk-Forward Simulator & "The Bar"
* **Instantaneous Walk-Forward Engine (<2ms):** Pure TypeScript causal simulator running in real time on client slider adjustments.
* **Live What-If Levers:**
  * *Safety Stock Multiplier:* $0.5\times$ to $2.5\times$ (scales safety buffer based on demand volatility $\sigma_{\text{demand}} \cdot \sqrt{LT}$).
  * *Trailing Demand Smoothing Window:* $2$, $3$, $4$, or $6$ months lookback.
  * *Vendor Lead-Time Stress Delay:* $+0\text{d}$, $+15\text{d}$, $+30\text{d}$, or $+60\text{d}$ to simulate real-world vendor delays.
* **"The Bar" Benchmark Chart:** Side-by-side comparison of Lumino's Actual Historical Godown Stock against Our Causal Plan curve with shortage markers and synchronized vertical reference lines.
* **44-Month Time-Travel Slider:** Step through project history month by month with an interactive **Play / Pause** loop (600ms interval) defaulting to high-activity replenishment periods.
* **Interactive 16-Item Benchmark Table:** Benchmarks actual vs. simulated peak idle, average idle, and service levels across all 16 project materials.

### Module 3: MATCH THE SETS — Assembly Bottleneck Detector & Ratio Anomaly Guardrail
* **The Built-In ERP Data Traps Identified & Auto-Calibrated:**
  1. *`MNB010174` (G.I. Nuts & Bolts):* Tracked in ERP in **Metric Tonnes (MT)** with a raw BOQ ratio of `1.0 MT/clamp`. Actual site consumption proves usage is **0.00015 MT / Pole Clamp** (~6,600× ratio error). Using raw BOQ ratio artificially strands 100% of parent assemblies.
  2. *`MLU020008` (25 SQMM Ring Type Lugs):* Listed in `sets.csv` with raw ratio `0.25 NOS/box`, whereas actual site consumption is **5.66 NOS / box** (~23× higher).
  3. *Shared Child Dependency:* `MNB010174` is shared across all three parent assembly sets.
* **Ratio Mode Toggle:** Switch instantly between **"Calibrated Site Ratio (Recommended)"** and **"Raw BOQ Ratio (sets.csv)"** to verify data traps.
* **44-Month Bottleneck Timeline Heatmap:** 44-month color-coded problem strip with a **"Jump to Worst Bottleneck Month"** button defaulting directly to peak stranded periods (e.g., `2024-12`).
* **6-Godown Operational Balance Grid:** Evaluates whether each godown is `BALANCED` or `BLOCKED` ($>15\%$ stranded), identifies the limiting child component, and suggests candidate donors with genuine child surplus.

### Module 4: Lumino Supply-Chain Copilot & Human-in-the-Loop ERP Vouchers
* **Deterministic Server Tools:** 
  * `get_godown_stock`: Queries receipts, issues, yard stock, and contractor idle.
  * `get_plan_decision`: Queries causal replenishment decisions (`ORDER`, `TRANSFER`, `HOLD`).
  * `get_set_bottlenecks`: Identifies limiting child components and surplus godowns.
  * `draft_erp_voucher`: Drafts structured Purchase Orders or Inter-Godown Transfer vouchers with validation guardrails (rejecting negative quantities and identical from/to stores).
* **Visible Tool Trace:** Displays sub-millisecond execution times and deterministic arguments in the drawer.
* **Synthesized 4-Bullet Executive Brief:** Formats actionable briefs into Situation, Root Cause, Recommended Action, and Risk Note.
* **Human-in-the-Loop Digital Sign-off:** Vouchers default to `PENDING_HOD_APPROVAL` for Head of Department review and one-click digital signing.
* **SAP Business One DTW CSV File Export:** Approved vouchers export standard CSV files ready for SAP Business One Data Transfer Workbench import (file export only; never executes arbitrary live database mutations).
* **100% Reliable Deterministic Fallback:** Generates rigorous analytical summaries even if external LLM API keys are not supplied.

---

## 3. Executive Scorecard & Analytical Methodology

All metrics are derived strictly from Lumino's historical dataset across **44 project months (March 2023 – October 2026)** and **6 active Kanpur region godowns** (`KANPUR AURAIYA`, `KANPUR DEHAT`, `KANPUR ETAWAH`, `KANPUR FARRUKHABAD`, `KANPUR KANNAUJ`, `KANPUR NAGAR`):

* **Dataset Scope:** 231,076 contractor moves, 2,600 receipts, 1,446 transfers.
* **Unweighted Average Idle Stock Reduction:** **+10.4%** (arithmetic mean of simulated percentage reductions across all 16 distinct materials).
* **Aggregate Demand-Weighted Idle Reduction:** **+55.7%** (aggregate idle stock reduction across all project units).
* **Unweighted Average Site Service Level:** **95.4%** across all 16 items.
* **Aggregate Demand-Weighted Service Level:** **94.74%** (total fulfilled demand / total site demand).
* **Data Integrity Audit:** 21 instances (<0.5%) where minor ERP logging delays resulted in transient negative stock dips before receipt slips were recorded. These are clamped to 0 for physical yard display while preserving raw negative values for audit inspection.

> **Methodology & Limitations Note:** Simulated planning outcomes represent counterfactual walk-forward simulation results based on historical consumption patterns and stated vendor lead times. They do not constitute guaranteed future savings. Physical quantities are never summed across incompatible units (`PCS`, `NOS`, `SET`, `KG`, `MT`, `KM`, `MTR`).

---

## 4. Architecture & Technical Stack

```text
Lumino-Pulse/
├── app/
│   ├── api/
│   │   ├── agent/route.ts        # POST /api/agent (tool-calling supply chain copilot)
│   │   └── explain/route.ts      # POST /api/explain (action brief endpoint)
│   ├── globals.css               # Control-room styling (Tailwind CSS v4)
│   ├── layout.tsx                # Root layout & font definition
│   └── page.tsx                  # Server Component static preloader
├── components/
│   ├── DashboardShell.tsx        # Executive summary strip & tab orchestrator
│   ├── LuminoAgentPanel.tsx      # Tool-calling agent slide-over drawer & voucher export
│   ├── MatchSetsTab.tsx          # Tab 3: Assembly bottleneck detector & heatmap
│   ├── PlanItTab.tsx             # Tab 2: Causal time-travel & what-if simulator
│   ├── ProjectScorecard.tsx      # 16-Item Actual vs. Plan scorecard modal
│   └── SeeItTab.tsx              # Tab 1: Monthly ledger, dual charts & CSV export
├── lib/
│   ├── agentEngine.ts            # Deterministic tools, voucher validation & fallback
│   └── causalSimulator.ts        # Strictly causal walk-forward simulation engine (<2ms)
├── public/data/                  # Static pre-computed datasets (sub-10ms UI delivery)
│   ├── ledger.json               # 44-month item & godown inventory balances
│   ├── meta.json                 # Scorecard, data dictionary & transaction audit
│   ├── planner.json              # Pre-computed baseline causal replay
│   └── sets.json                 # Assembly set balances & donor surplus calculations
├── scripts/
│   └── build_lumino_data.py      # Offline Python data engine (pandas/numpy)
├── tests/
│   ├── test_agent.ts             # Agent tools, validation guardrails & fallback tests
│   ├── test_causal_simulator.ts  # Causal benchmark, anti-leakage & stress tests
│   ├── test_data_engine.py       # Accounting identity, conservation & balance tests
│   └── test_match_sets.ts        # Set invariants, donor surplus & unit trap tests
└── package.json
```

---

## 5. Local Setup & Verification

### Prerequisites
* **Node.js:** v18.0.0 or higher (tested on Node v24)
* **Python:** 3.9+ with `pandas` and `numpy` (only required if re-processing raw CSVs)

### Installation & Run
```bash
# 1. Clone repository & install dependencies
git clone https://github.com/Karmansingh09/Lumino-Pulse.git
cd Lumino-Pulse
npm install

# 2. Run offline data engine (Optional: static JSONs are already pre-computed in public/data/)
python3 scripts/build_lumino_data.py

# 3. Start development server
npm run dev
# Open http://localhost:3000 in your browser

# 4. Production build check
npm run build
```

### Environment Variables (Optional)
Create `.env.local` in the project root if you wish to use external AI providers. If omitted, the deterministic fallback engine activates automatically with 100% uptime:
```env
# Optional external LLM keys
SARVAM_API_KEY=your_sarvam_key_here
GEMINI_API_KEY=your_gemini_key_here
```

---

## 6. Automated Test Suites

LuminoFlow features four comprehensive automated test suites covering data integrity, simulation causality, assembly set invariants, and agent tool execution:

```bash
# Run all test suites in sequence:
python3 -m unittest tests/test_data_engine.py && \
npx tsx tests/test_causal_simulator.ts && \
npx tsx tests/test_match_sets.ts && \
npx tsx tests/test_agent.ts
```

### Test Coverage Highlights:
1. `test_data_engine.py` (7 tests): Validates EPC conservation identities ($Stock_t = Stock_{t-1} + Receipts - Issues$), confirms 44 contiguous months, and verifies that zero rows were discarded.
2. `test_causal_simulator.ts` (4 benchmarks): Proves simulation speed is **<2ms**, verifies strictly positive transfer volumes, and executes anti-leakage verification proving that future months ($t \ge 30$) have zero mathematical impact on decisions at $t < 30$.
3. `test_match_sets.ts` (5 tests): Confirms parent-child mathematical invariants ($Buildable \le Parent$), verifies the raw BOQ ratio anomaly divergence, and tests donor surplus calculations.
4. `test_agent.ts` (6 tests): Validates tool execution speed (<100ms), entity resolution, identical store transfer rejection guardrails, negative quantity rejection guardrails, and deterministic fallback synthesis.

---

## 7. Vercel Deployment Instructions

LuminoFlow is configured for one-click deployment on Vercel:

1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and select `Lumino-Pulse`.
3. Set the Framework Preset to **Next.js**.
4. (Optional) In **Environment Variables**, add `GEMINI_API_KEY` or `SARVAM_API_KEY` if desired.
5. Click **Deploy**. The application builds statically via Turbopack in ~10 seconds. All static JSON files in `public/data/` are served with global CDN edge caching.

---

## 8. Engineering Invariants & Integrity Checklist

* [x] **Zero Future Peeking:** $t$ strictly uses data $\le t$.
* [x] **Zero Raw Deduplication:** All 231,076 contractor moves and 2,600 receipts are preserved.
* [x] **No Hallucinated Savings:** Impact metrics benchmarked directly against Lumino's historical actuals.
* [x] **Zero Incompatible Sums:** Metrics are kept in native physical units (`PCS`, `NOS`, `SET`, `KG`, `MT`, `KM`, `MTR`).
* [x] **ERP Guardrails:** Safe file-based SAP B1 CSV export without unauthorized database mutations.
