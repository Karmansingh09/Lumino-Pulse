export interface ItemMeta {
  item_code: string;
  item_name: string;
  unit: string;
  lead_time_days: number;
  lead_time_months: number;
  role: "Child" | "Independent" | "Parent";
  total_received: number;
  total_consumed: number;
  total_issued: number;
  total_returned: number;
  peak_godown_stock: number;
  peak_contractor_stock: number;
  current_godown_stock: number;
  current_contractor_stock: number;
}

export interface SetChildMeta {
  child_code: string;
  child_name: string;
  child_unit: string;
  raw_ratio: number;
  observed_ratio: number;
  diff_pct: number;
  is_anomaly: boolean;
  anomaly_reason: string;
}

export interface SetMeta {
  set_no: string;
  parent_code: string;
  parent_name: string;
  parent_unit: string;
  children: SetChildMeta[];
}

export interface ItemScorecard {
  item_code: string;
  item_name: string;
  unit: string;
  lead_time_days: number;
  lead_time_months: number;
  actual_avg: number;
  plan_avg: number;
  reduction_pct: number;
  actual_peak: number;
  plan_peak: number;
  service_level: number;
  shortage_months: number;
  total_demand: number;
  total_shortage: number;
}

export interface OverallScorecard {
  actual_avg_idle_stock: number;
  plan_avg_idle_stock: number;
  idle_reduction_pct: number;
  service_level_pct: number;
  total_demand: number;
  total_shortage: number;
  items_scorecard: ItemScorecard[];
}

export interface MetaData {
  project_name: string;
  product_name: string;
  region: string;
  time_span: {
    start_month: string;
    end_month: string;
    total_months: number;
  };
  stats: {
    total_transactions: number;
    receipts_rows: number;
    transfers_rows: number;
    contractor_moves_rows: number;
    raw_negative_dips_count: number;
    raw_negative_audit: Array<{
      item_code: string;
      godown: string;
      month: string;
      raw_balance: number;
    }>;
  };
  items: ItemMeta[];
  godowns: string[];
  months: string[];
  sets_meta: SetMeta[];
  overall_scorecard: OverallScorecard;
}

export interface ProjectMonthlyRow {
  month: string;
  receipts: number;
  transfers_in: number;
  transfers_out: number;
  issued: number;
  returned: number;
  consumed: number;
  godown_stock: number;
  raw_godown_stock: number;
  contractor_idle: number;
  total_idle: number;
}

export interface GodownMonthlyRow {
  month: string;
  receipts: number;
  transfers_in: number;
  transfers_out: number;
  issued: number;
  returned: number;
  godown_stock: number;
  raw_godown_stock: number;
}

export interface ItemLedgerSummary {
  total_received: number;
  total_transfers_in: number;
  total_transfers_out: number;
  total_issued: number;
  total_returned: number;
  total_consumed: number;
  peak_godown_idle: number;
  current_godown_idle: number;
  peak_contractor_idle: number;
  current_contractor_idle: number;
  total_idle_current: number;
}

export interface ItemLedger {
  item_code: string;
  item_name: string;
  unit: string;
  lead_time_days: number;
  summary: ItemLedgerSummary;
  project_monthly: ProjectMonthlyRow[];
  godowns_monthly: Record<string, GodownMonthlyRow[]>;
}

export type LedgerData = Record<string, ItemLedger>;
