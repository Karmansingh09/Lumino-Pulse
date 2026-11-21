import fs from "fs/promises";
import path from "path";
import DashboardShell from "@/components/DashboardShell";
import { MetaData, LedgerData, SetsData } from "@/types";

export const dynamic = "force-dynamic";

async function loadData() {
  const dataDir = path.join(process.cwd(), "public", "data");

  const [metaRaw, ledgerRaw, setsRaw] = await Promise.all([
    fs.readFile(path.join(dataDir, "meta.json"), "utf-8"),
    fs.readFile(path.join(dataDir, "ledger.json"), "utf-8"),
    fs.readFile(path.join(dataDir, "sets.json"), "utf-8"),
  ]);

  const meta: MetaData = JSON.parse(metaRaw);
  const ledger: LedgerData = JSON.parse(ledgerRaw);
  const setsData: SetsData = JSON.parse(setsRaw);

  return { meta, ledger, setsData };
}

interface DashboardPageProps {
  searchParams?: Promise<{
    tab?: string;
    agent?: string;
    item?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { meta, ledger, setsData } = await loadData();
  const params = searchParams ? await searchParams : {};

  let initialTab: "SEE_IT" | "PLAN_IT" | "MATCH_SETS" = "SEE_IT";
  if (params.tab === "plan") {
    initialTab = "PLAN_IT";
  } else if (params.tab === "sets") {
    initialTab = "MATCH_SETS";
  }

  const initialAgentOpen = params.agent === "open";
  const initialItem = params.item || "MPO010014";

  return (
    <DashboardShell
      meta={meta}
      ledger={ledger}
      setsData={setsData}
      initialTab={initialTab}
      initialAgentOpen={initialAgentOpen}
      initialItem={initialItem}
    />
  );
}
