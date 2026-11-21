import fs from "fs/promises";
import path from "path";
import DashboardShell from "@/components/DashboardShell";
import { MetaData, LedgerData, SetsData } from "@/types";

export const dynamic = "force-static"; // Pre-render as static HTML for instant zero-lag delivery

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

export default async function HomePage() {
  const { meta, ledger, setsData } = await loadData();

  return <DashboardShell meta={meta} ledger={ledger} setsData={setsData} />;
}
