"use client";

import clsx from "clsx";
import Papa from "papaparse";
import { LayoutGrid, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ExcelStyleTimeline } from "@/components/ExcelStyleTimeline";
import { cellLabel, ImportedSpreadsheet } from "@/components/ImportedSpreadsheet";
import { SheetStatusBar } from "@/components/SheetStatusBar";
import { SheetToolbar } from "@/components/SheetToolbar";
import type { SheetViewMode } from "@/components/SheetToolbar.types";
import { SprintTimeline } from "@/components/SprintTimeline";
import type { ImportedTab, TabManifestEntry } from "@/types/imported-tab";

export function Dashboard() {
  const [manifest, setManifest] = useState<TabManifestEntry[]>([]);
  const [activeId, setActiveId] = useState("");
  const [tabData, setTabData] = useState<ImportedTab | null>(null);
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  const [search, setSearch] = useState("");
  const [hideEmpty, setHideEmpty] = useState(true);
  const [wrapText, setWrapText] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("rd-tracker-dark");
    if (saved !== null) setDark(saved === "1");
  }, []);

  useEffect(() => {
    localStorage.setItem("rd-tracker-dark", dark ? "1" : "0");
  }, [dark]);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<SheetViewMode>("split");
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [formulaDraft, setFormulaDraft] = useState("");
  const [columnWidths, setColumnWidths] = useState<number[]>([]);

  const isSprintTab = activeId === "sprint-26" || activeId === "sprint-25";
  const activeMeta = manifest.find((m) => m.id === activeId);

  useEffect(() => {
    fetch("/data/manifest.json")
      .then((r) => r.json())
      .then((m: TabManifestEntry[]) => {
        setManifest(m);
        setActiveId(m[0]?.id ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeId) return;
    setLoading(true);
    setSearch("");
    setSelected(null);
    setViewMode(activeId === "sprint-26" || activeId === "sprint-25" ? "split" : "grid");
    fetch(`/data/${activeId}.json`)
      .then((r) => r.json())
      .then((t: ImportedTab) => {
        setTabData(t);
        setRows(t.rawRows);
        setColumnWidths(t.columnWidths);
      })
      .finally(() => setLoading(false));
  }, [activeId]);

  const cellValue = selected ? (rows[selected.r]?.[selected.c] ?? "") : "";
  const selectedLabel = selected ? cellLabel(selected.r, selected.c) : null;

  useEffect(() => {
    setFormulaDraft(cellValue);
  }, [cellValue, selected?.r, selected?.c]);

  const visibleRowCount = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row, i) => {
      if (tabData && i < tabData.headerRows) return true;
      if (hideEmpty && !row.some((c) => c.trim())) return false;
      if (!q) return true;
      return row.some((c) => c.toLowerCase().includes(q));
    }).length;
  }, [rows, tabData, hideEmpty, search]);

  const handleFormulaCommit = useCallback(() => {
    if (!selected) return;
    setRows((prev) =>
      prev.map((row, ri) =>
        ri === selected.r ? row.map((c, ci) => (ci === selected.c ? formulaDraft : c)) : row,
      ),
    );
  }, [selected, formulaDraft]);

  const handleCopy = useCallback(async () => {
    if (cellValue) await navigator.clipboard.writeText(cellValue);
  }, [cellValue]);

  const handleExportCsv = useCallback(() => {
    if (!tabData) return;
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tabData.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [rows, tabData]);

  const handleReimport = useCallback(async () => {
    setImporting(true);
    try {
      await fetch("/api/reimport", { method: "POST" });
      const m = await fetch("/data/manifest.json").then((r) => r.json());
      setManifest(m);
      const t = await fetch(`/data/${activeId}.json`).then((r) => r.json());
      setTabData(t);
      setRows(t.rawRows);
      setColumnWidths(t.columnWidths);
    } finally {
      setImporting(false);
    }
  }, [activeId]);

  const liveTab = tabData ? { ...tabData, rawRows: rows, columnWidths } : null;

  if (loading && !tabData) {
    return <div className="flex h-screen items-center justify-center bg-[#202124] text-sm text-[#9aa0a6]">Loading…</div>;
  }

  return (
    <div className={clsx("flex h-screen flex-col", dark ? "bg-[#202124] text-[#e8eaed]" : "bg-[#e8eaed] text-[#202124]")}>
      <header className={clsx("flex shrink-0 items-center justify-between border-b px-4 py-2", dark ? "border-[#3c4043] bg-[#303134]" : "border-[#dadce0] bg-white")}>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded" style={{ backgroundColor: activeMeta?.tabColor ?? "#188038" }}>
            <LayoutGrid className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">RD Project Tracker</h1>
            <p className="text-[10px] opacity-70">Like-for-like Google Sheet · {manifest.length} tabs</p>
          </div>
        </div>
        <button type="button" onClick={handleReimport} disabled={importing} className={clsx("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs", dark ? "border-[#3c4043]" : "border-[#dadce0]")}>
          <RefreshCw className={clsx("h-3.5 w-3.5", importing && "animate-spin")} />
          {importing ? "Importing…" : "Re-import"}
        </button>
      </header>

      <nav className={clsx("flex shrink-0 overflow-x-auto border-b px-1 pt-1", dark ? "border-[#3c4043] bg-[#303134]" : "border-[#dadce0] bg-[#e8eaed]")}>
        {manifest.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveId(tab.id)}
            className={clsx(
              "shrink-0 rounded-t-md px-3 py-2 text-xs font-medium transition-all",
              activeId === tab.id
                ? dark ? "bg-[#202124] text-white" : "bg-white text-[#188038] shadow-sm"
                : "opacity-70 hover:opacity-100",
            )}
            style={activeId === tab.id ? { borderTop: `3px solid ${tab.tabColor}` } : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {liveTab ? (
        <SheetToolbar
          tabId={liveTab.id}
          tabLabel={liveTab.label}
          rowCount={liveTab.rawRows.length}
          colCount={liveTab.columnWidths.length}
          search={search}
          onSearchChange={setSearch}
          hideEmpty={hideEmpty}
          onHideEmptyChange={setHideEmpty}
          wrapText={wrapText}
          onWrapTextChange={setWrapText}
          dark={dark}
          onDarkChange={setDark}
          zoom={zoom}
          onZoomChange={setZoom}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showTimelineToggle={isSprintTab}
          selectedCell={selectedLabel}
          cellValue={formulaDraft}
          canEditFormula={!!selected && selected.r >= liveTab.headerRows}
          onFormulaChange={setFormulaDraft}
          onFormulaCommit={handleFormulaCommit}
          onCopy={handleCopy}
          onExportCsv={handleExportCsv}
        />
      ) : null}

      <main className="flex min-h-0 flex-1 flex-col gap-2 p-2">
        {liveTab ? (
          <>
            {(viewMode === "grid" || viewMode === "split") && (
              <ImportedSpreadsheet
                key={`${liveTab.id}-grid`}
                tab={liveTab}
                zoom={zoom}
                search={search}
                hideEmpty={hideEmpty}
                wrapText={wrapText}
                selected={selected}
                onSelect={setSelected}
                columnWidths={columnWidths}
                onColumnWidthsChange={setColumnWidths}
                dark={dark}
                onCellChange={(r, c, v) => {
                  setRows((prev) => prev.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? v : cell)) : row)));
                }}
              />
            )}
            {isSprintTab && (viewMode === "timeline" || viewMode === "split") && (
              <div className={clsx("flex shrink-0 flex-col gap-2", viewMode === "split" && "max-h-[42vh] overflow-auto")}>
                <ExcelStyleTimeline tab={liveTab} dark={dark} />
                {viewMode === "timeline" && <SprintTimeline tab={liveTab} dark={dark} />}
              </div>
            )}
          </>
        ) : null}
      </main>

      <SheetStatusBar
        dark={dark}
        selectedCell={selectedLabel}
        visibleRows={visibleRowCount}
        totalRows={rows.length}
        totalCols={columnWidths.length}
      />
    </div>
  );
}
