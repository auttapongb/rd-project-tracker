"use client";

import clsx from "clsx";
import {
  Download,
  Filter,
  Maximize2,
  Minimize2,
  Search,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export type SheetViewMode = "grid" | "timeline" | "split";

type Props = {
  tabLabel: string;
  rowCount: number;
  colCount: number;
  search: string;
  onSearchChange: (v: string) => void;
  hideEmpty: boolean;
  onHideEmptyChange: (v: boolean) => void;
  zoom: number;
  onZoomChange: (v: number) => void;
  viewMode: SheetViewMode;
  onViewModeChange: (v: SheetViewMode) => void;
  showTimelineToggle: boolean;
  selectedCell: string | null;
  cellValue: string;
};

export function SheetToolbar({
  tabLabel,
  rowCount,
  colCount,
  search,
  onSearchChange,
  hideEmpty,
  onHideEmptyChange,
  zoom,
  onZoomChange,
  viewMode,
  onViewModeChange,
  showTimelineToggle,
  selectedCell,
  cellValue,
}: Props) {
  return (
    <div className="sheet-toolbar shrink-0 border-b border-[#dadce0] bg-[#edf2fa]">
      {/* Formula bar row */}
      <div className="flex items-center gap-1 border-b border-[#dadce0] bg-white px-2 py-1">
        <span className="w-14 shrink-0 text-center text-[10px] font-semibold text-[#188038]">
          {selectedCell ?? "—"}
        </span>
        <span className="text-[#5f6368]">fx</span>
        <input
          readOnly
          value={cellValue}
          className="min-w-0 flex-1 truncate bg-transparent px-2 text-xs text-[#202124] outline-none"
          placeholder={`${tabLabel}`}
        />
      </div>

      {/* Tools row */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5f6368]" />
          <input
            type="search"
            placeholder="Find in sheet…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-7 w-44 rounded border border-[#dadce0] bg-white pl-7 pr-2 text-xs outline-none focus:border-[#188038]"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-[#5f6368]">
          <input
            type="checkbox"
            checked={hideEmpty}
            onChange={(e) => onHideEmptyChange(e.target.checked)}
            className="rounded border-[#dadce0]"
          />
          <Filter className="h-3.5 w-3.5" />
          Hide empty rows
        </label>

        <div className="flex items-center gap-0.5 rounded border border-[#dadce0] bg-white">
          <button type="button" onClick={() => onZoomChange(Math.max(0.7, zoom - 0.1))} className="p-1 hover:bg-[#f1f3f4]" aria-label="Zoom out">
            <ZoomOut className="h-3.5 w-3.5 text-[#5f6368]" />
          </button>
          <span className="min-w-[3rem] text-center text-[10px] text-[#5f6368]">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => onZoomChange(Math.min(1.4, zoom + 0.1))} className="p-1 hover:bg-[#f1f3f4]" aria-label="Zoom in">
            <ZoomIn className="h-3.5 w-3.5 text-[#5f6368]" />
          </button>
        </div>

        {showTimelineToggle ? (
          <div className="flex rounded border border-[#dadce0] bg-white text-xs">
            {(["grid", "split", "timeline"] as SheetViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onViewModeChange(mode)}
                className={clsx(
                  "px-2.5 py-1 capitalize",
                  viewMode === mode ? "bg-[#188038] text-white" : "text-[#5f6368] hover:bg-[#f1f3f4]",
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        ) : null}

        <span className="ml-auto text-[10px] text-[#5f6368]">
          {rowCount} rows × {colCount} cols
        </span>

        <button
          type="button"
          className="flex items-center gap-1 rounded border border-[#dadce0] bg-white px-2 py-1 text-xs text-[#5f6368] hover:bg-[#f1f3f4]"
          title="Export CSV (browser download)"
          onClick={() => {
            const a = document.createElement("a");
            a.href = `/data/${tabLabel.toLowerCase().replace(/\s+/g, "-")}.json`;
            a.download = `${tabLabel}.json`;
            a.click();
          }}
        >
          <Download className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function SheetCornerIcons() {
  return (
    <div className="flex gap-1 text-[#5f6368]">
      <Minimize2 className="h-3 w-3 opacity-40" />
      <Maximize2 className="h-3 w-3 opacity-40" />
    </div>
  );
}
