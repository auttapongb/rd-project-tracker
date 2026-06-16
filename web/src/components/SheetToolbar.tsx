"use client";

import clsx from "clsx";
import {
  Copy,
  Download,
  Filter,
  Moon,
  Search,
  Sun,
  WrapText,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { SheetViewMode } from "@/components/SheetToolbar.types";

type Props = {
  tabId: string;
  tabLabel: string;
  rowCount: number;
  colCount: number;
  search: string;
  onSearchChange: (v: string) => void;
  hideEmpty: boolean;
  onHideEmptyChange: (v: boolean) => void;
  wrapText: boolean;
  onWrapTextChange: (v: boolean) => void;
  dark: boolean;
  onDarkChange: (v: boolean) => void;
  zoom: number;
  onZoomChange: (v: number) => void;
  viewMode: SheetViewMode;
  onViewModeChange: (v: SheetViewMode) => void;
  showTimelineToggle: boolean;
  selectedCell: string | null;
  cellValue: string;
  onFormulaChange?: (v: string) => void;
  onFormulaCommit?: () => void;
  canEditFormula?: boolean;
  onCopy?: () => void;
  onExportCsv?: () => void;
};

export function SheetToolbar({
  tabLabel,
  search,
  onSearchChange,
  hideEmpty,
  onHideEmptyChange,
  wrapText,
  onWrapTextChange,
  dark,
  onDarkChange,
  zoom,
  onZoomChange,
  viewMode,
  onViewModeChange,
  showTimelineToggle,
  selectedCell,
  cellValue,
  onFormulaChange,
  onFormulaCommit,
  canEditFormula,
  onCopy,
  onExportCsv,
  rowCount,
  colCount,
}: Props) {
  return (
    <div className={clsx("sheet-toolbar shrink-0 border-b", dark ? "border-[#3c4043] bg-[#303134]" : "border-[#dadce0] bg-[#edf2fa]")}>
      <div className={clsx("flex items-center gap-1 border-b px-2 py-1", dark ? "border-[#3c4043] bg-[#202124]" : "border-[#dadce0] bg-white")}>
        <span className={clsx("w-14 shrink-0 text-center text-[10px] font-semibold", dark ? "text-[#81c995]" : "text-[#188038]")}>
          {selectedCell ?? "—"}
        </span>
        <span className={dark ? "text-[#9aa0a6]" : "text-[#5f6368]"}>fx</span>
        <input
          value={cellValue}
          readOnly={!canEditFormula}
          onChange={(e) => onFormulaChange?.(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onFormulaCommit?.();
            }
          }}
          className={clsx(
            "min-w-0 flex-1 truncate px-2 text-xs outline-none",
            dark ? "bg-transparent text-[#e8eaed]" : "bg-transparent text-[#202124]",
            canEditFormula && "ring-1 ring-[#1a73e8]",
          )}
          placeholder={tabLabel}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        <div className="relative">
          <Search className={clsx("pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2", dark ? "text-[#9aa0a6]" : "text-[#5f6368]")} />
          <input
            type="search"
            placeholder="Find in sheet…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={clsx(
              "h-7 w-44 rounded border pl-7 pr-2 text-xs outline-none focus:border-[#188038]",
              dark ? "border-[#3c4043] bg-[#202124] text-[#e8eaed]" : "border-[#dadce0] bg-white",
            )}
          />
        </div>

        <label className={clsx("flex cursor-pointer items-center gap-1.5 text-xs", dark ? "text-[#9aa0a6]" : "text-[#5f6368]")}>
          <input type="checkbox" checked={hideEmpty} onChange={(e) => onHideEmptyChange(e.target.checked)} />
          <Filter className="h-3.5 w-3.5" /> Hide empty
        </label>

        <button type="button" onClick={() => onWrapTextChange(!wrapText)} className={clsx("flex items-center gap-1 rounded border px-2 py-1 text-xs", wrapText ? "border-[#188038] bg-[#e6f4ea] text-[#188038]" : dark ? "border-[#3c4043] text-[#9aa0a6]" : "border-[#dadce0] text-[#5f6368]")}>
          <WrapText className="h-3.5 w-3.5" /> Wrap
        </button>

        <div className={clsx("flex items-center rounded border", dark ? "border-[#3c4043] bg-[#202124]" : "border-[#dadce0] bg-white")}>
          <button type="button" onClick={() => onZoomChange(Math.max(0.6, zoom - 0.1))} className="p-1"><ZoomOut className="h-3.5 w-3.5" /></button>
          <span className="min-w-[3rem] text-center text-[10px]">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => onZoomChange(Math.min(1.5, zoom + 0.1))} className="p-1"><ZoomIn className="h-3.5 w-3.5" /></button>
        </div>

        {showTimelineToggle ? (
          <div className={clsx("flex rounded border text-xs", dark ? "border-[#3c4043]" : "border-[#dadce0]")}>
            {(["grid", "split", "timeline"] as SheetViewMode[]).map((mode) => (
              <button key={mode} type="button" onClick={() => onViewModeChange(mode)} className={clsx("px-2.5 py-1 capitalize", viewMode === mode ? "bg-[#188038] text-white" : dark ? "text-[#9aa0a6]" : "text-[#5f6368]")}>
                {mode}
              </button>
            ))}
          </div>
        ) : null}

        <button type="button" onClick={onCopy} className={clsx("rounded border p-1", dark ? "border-[#3c4043]" : "border-[#dadce0]")} title="Copy cell"><Copy className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => onDarkChange(!dark)} className={clsx("rounded border p-1", dark ? "border-[#3c4043]" : "border-[#dadce0]")}>
          {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

        <span className={clsx("ml-auto text-[10px]", dark ? "text-[#9aa0a6]" : "text-[#5f6368]")}>{rowCount}×{colCount}</span>
        <button type="button" onClick={onExportCsv} className={clsx("flex items-center gap-1 rounded border px-2 py-1 text-xs", dark ? "border-[#3c4043] text-[#9aa0a6]" : "border-[#dadce0] text-[#5f6368]")}>
          <Download className="h-3.5 w-3.5" /> CSV
        </button>
      </div>
    </div>
  );
}
