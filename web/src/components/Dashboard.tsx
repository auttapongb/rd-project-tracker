"use client";

import clsx from "clsx";
import { LayoutGrid, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ExcelStyleTimeline } from "@/components/ExcelStyleTimeline";
import { ImportedSpreadsheet, type ImportedTab } from "@/components/ImportedSpreadsheet";
import { SheetToolbar, type SheetViewMode } from "@/components/SheetToolbar";
import { SprintTimeline } from "@/components/SprintTimeline";
import { colLetter } from "@/lib/sheet-utils";

type ManifestEntry = { id: string; label: string; file: string; rows: number; cols: number };

export function Dashboard() {
  const [manifest, setManifest] = useState<ManifestEntry[]>([]);
  const [activeId, setActiveId] = useState("");
  const [tabData, setTabData] = useState<ImportedTab | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  const [search, setSearch] = useState("");
  const [hideEmpty, setHideEmpty] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<SheetViewMode>("split");
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);

  const isSprintTab = activeId === "sprint-26" || activeId === "sprint-25";

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
    setSearch("");
    setSelected(null);
    setViewMode(activeId === "sprint-26" || activeId === "sprint-25" ? "split" : "grid");
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

  const selectedLabel = selected ? `${colLetter(selected.c)}${selected.r + 1}` : null;
  const cellValue = selected && tabData ? (tabData.rawRows[selected.r]?.[selected.c] ?? "") : "";

  if (loading && !tabData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa] text-sm text-[#5f6368]">
        Loading sheet data…
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#e8eaed]">
      <header className="flex shrink-0 items-center justify-between border-b border-[#dadce0] bg-white px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#188038]">
            <LayoutGrid className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-[#202124]">RD Project Tracker</h1>
            <p className="text-[10px] text-[#5f6368]">
              Sheet parity · FortuneSheet-ready · Jira sync next
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleReimport}
          disabled={importing}
          className="flex items-center gap-1.5 rounded-full border border-[#dadce0] bg-white px-3 py-1.5 text-xs font-medium text-[#5f6368] shadow-sm hover:bg-[#f1f3f4] disabled:opacity-50"
        >
          <RefreshCw className={clsx("h-3.5 w-3.5", importing && "animate-spin")} />
          {importing ? "Importing…" : "Re-import sheet"}
        </button>
      </header>

      <nav className="flex shrink-0 gap-0 overflow-x-auto border-b border-[#dadce0] bg-[#e8eaed] px-1 pt-1">
        {manifest.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveId(tab.id)}
            className={clsx(
              "sheet-tab shrink-0 rounded-t-md px-3 py-2 text-xs font-medium transition-all",
              activeId === tab.id
                ? "bg-white text-[#188038] shadow-sm"
                : "text-[#5f6368] hover:bg-white/60",
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {tabData ? (
        <SheetToolbar
          tabLabel={tabData.label}
          rowCount={tabData.rawRows.length}
          colCount={tabData.columnWidths.length}
          search={search}
          onSearchChange={setSearch}
          hideEmpty={hideEmpty}
          onHideEmptyChange={setHideEmpty}
          zoom={zoom}
          onZoomChange={setZoom}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showTimelineToggle={isSprintTab}
          selectedCell={selectedLabel}
          cellValue={cellValue}
        />
      ) : null}

      <main className="flex min-h-0 flex-1 flex-col gap-3 p-3">
        {tabData ? (
          <>
            {(viewMode === "grid" || viewMode === "split") && (
              <ImportedSpreadsheet
                key={`${tabData.id}-${search}-${hideEmpty}`}
                tab={tabData}
                zoom={zoom}
                search={search}
                hideEmpty={hideEmpty}
                selected={selected}
                onSelect={setSelected}
              />
            )}
            {isSprintTab && (viewMode === "timeline" || viewMode === "split") && (
              <div className={clsx("flex shrink-0 flex-col gap-3", viewMode === "split" && "max-h-[45vh]")}>
                <ExcelStyleTimeline tab={tabData} />
                {viewMode === "timeline" && <SprintTimeline tab={tabData} />}
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
