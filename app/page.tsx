import fs from "fs/promises";
import path from "path";
import DashboardShell from "@/components/DashboardShell";
import { MetaData, LedgerData } from "@/types";

export const dynamic = "force-static"; // Pre-render as static HTML for instant zero-lag delivery

async function loadData() {
  const dataDir = path.join(process.cwd(), "public", "data");
  
  const [metaRaw, ledgerRaw] = await Promise.all([
    fs.readFile(path.join(dataDir, "meta.json"), "utf-8"),
    fs.readFile(path.join(dataDir, "ledger.json"), "utf-8"),
  ]);

  const meta: MetaData = JSON.parse(metaRaw);
  const ledger: LedgerData = JSON.parse(ledgerRaw);

  return { meta, ledger };
}

export default async function HomePage() {
  const { meta, ledger } = await loadData();

  return <DashboardShell meta={meta} ledger={ledger} />;
}
