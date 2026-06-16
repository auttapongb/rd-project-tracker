"use client";

import clsx from "clsx";
import { LayoutGrid, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ImportedSpreadsheet, type ImportedTab } from "@/components/ImportedSpreadsheet";
import { GanttChart } from "@/components/GanttChart";
import type { SheetTab } from "@/types/sheet";

type ManifestEntry = { id: string; label: string; file: string; rows: number; cols: number };

function toGanttTab(tab: ImportedTab): SheetTab | null {
  if (!tab.id.startsWith("sprint-") || tab.id.includes("summarize")) return null;
  const header = tab.rawRows[0] ?? [];
  const summaryIdx = header.findIndex((h) => h.toLowerCase() === "summary");
  const createdIdx = header.findIndex((h) => h.toLowerCase() === "created");
  const dueIdx = header.findIndex((h) => h.toLowerCase() === "due date");
  const keyIdx = header.findIndex((h) => h.toLowerCase() === "issue key");
  if (summaryIdx < 0 || createdIdx < 0 || dueIdx < 0) return null;

  const rows = tab.rawRows.slice(tab.headerRows).map((row, i) => ({
    key: row[keyIdx] ?? i,
    summary: row[summaryIdx] ?? "",
    start: row[createdIdx] ?? "",
    end: row[dueIdx] ?? "",
    progress: 50,
  }));

  return {
    id: tab.id,
    label: tab.label,
    columns: [],
    rows,
    gantt: { taskField: "summary", startField: "start", endField: "end", progressField: "progress" },
  };
}

export function Dashboard() {
  const [manifest, setManifest] = useState<ManifestEntry[]>([]);
  const [activeId, setActiveId] = useState("");
  const [tabData, setTabData] = useState<ImportedTab | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetch("/data/manifest.json")
      .then((r) => r.json())
      .then((m: ManifestEntry[]) => {
        setManifest(m);
        setActiveId(m[0]?.id ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeId) return;
    setLoading(true);
    fetch(`/data/${activeId}.json`)
      .then((r) => r.json())
      .then(setTabData)
      .finally(() => setLoading(false));
  }, [activeId]);

  const handleReimport = useCallback(async () => {
    setImporting(true);
    try {
      await fetch("/api/reimport", { method: "POST" });
      const m = await fetch("/data/manifest.json").then((r) => r.json());
      setManifest(m);
      const t = await fetch(`/data/${activeId}.json`).then((r) => r.json());
      setTabData(t);
    } finally {
      setImporting(false);
    }
  }, [activeId]);

  const ganttTab = tabData ? toGanttTab(tabData) : null;

  if (loading && !tabData) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-[#5f6368]">Loading sheet data…</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
      <header className="flex items-center justify-between border-b border-[#dadce0] bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-[#188038]" />
          <div>
            <h1 className="text-base font-semibold text-[#202124]">RD Project Tracker</h1>
            <p className="text-xs text-[#5f6368]">Imported from Google Sheet CSV · {manifest.length} tabs</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleReimport}
          disabled={importing}
          className="flex items-center gap-1 rounded border border-[#dadce0] px-2 py-1 text-xs text-[#5f6368] hover:bg-[#f1f3f4] disabled:opacity-50"
        >
          <RefreshCw className={clsx("h-3.5 w-3.5", importing && "animate-spin")} />
          {importing ? "Importing…" : "Re-import sheet"}
        </button>
      </header>

      <nav className="flex gap-0 overflow-x-auto border-b border-[#dadce0] bg-[#e8eaed] px-2 pt-1">
        {manifest.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveId(tab.id)}
            className={clsx(
              "sheet-tab shrink-0 rounded-t px-3 py-2 text-xs font-medium",
              activeId === tab.id ? "bg-white text-[#188038] shadow-sm" : "text-[#5f6368] hover:bg-[#f1f3f4]",
            )}
          >
            {tab.label}
            <span className="ml-1 text-[10px] opacity-60">{tab.rows}×{tab.cols}</span>
          </button>
        ))}
      </nav>

      <main className="flex-1 p-4">
        {tabData ? (
          <>
            <ImportedSpreadsheet key={tabData.id} tab={tabData} />
            {ganttTab ? <GanttChart tab={ganttTab} /> : null}
          </>
        ) : null}
      </main>
    </div>
  );
}
