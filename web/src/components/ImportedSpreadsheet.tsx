"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildMergeIndex,
  isUrl,
  resolveCellStyle,
  selectOptionsForColumn,
} from "@/lib/cell-style-engine";
import { colLetter, isTimelineMarker, rowHasData } from "@/lib/sheet-utils";
import { cellLabel, useSheetKeyboard } from "@/hooks/useSheetKeyboard";
import type { ImportedTab } from "@/types/imported-tab";

export type { ImportedTab };

type Props = {
  tab: ImportedTab;
  zoom?: number;
  search?: string;
  hideEmpty?: boolean;
  wrapText?: boolean;
  selected?: { r: number; c: number } | null;
  onSelect?: (cell: { r: number; c: number } | null) => void;
  onCellChange?: (r: number, c: number, value: string) => void;
  columnWidths?: number[];
  onColumnWidthsChange?: (widths: number[]) => void;
  dark?: boolean;
};

export function ImportedSpreadsheet({
  tab,
  zoom = 1,
  search = "",
  hideEmpty = true,
  wrapText = false,
  selected: selectedProp,
  onSelect,
  onCellChange,
  columnWidths: widthsProp,
  onColumnWidthsChange,
  dark = false,
}: Props) {
  const [rows, setRows] = useState(tab.rawRows);
  const [selectedLocal, setSelectedLocal] = useState<{ r: number; c: number } | null>(null);
  const [widthsLocal, setWidthsLocal] = useState(tab.columnWidths);
  const [resizing, setResizing] = useState<{ col: number; startX: number; startW: number } | null>(null);
  const [editing, setEditing] = useState<{ r: number; c: number } | null>(null);

  const selected = selectedProp ?? selectedLocal;
  const setSelected = onSelect ?? setSelectedLocal;
  const widths = widthsProp ?? widthsLocal;
  const setWidths = onColumnWidthsChange ?? setWidthsLocal;
  const parentRef = useRef<HTMLDivElement>(null);

  const colCount = useMemo(
    () => Math.max(...rows.map((r) => r.length), widths.length),
    [rows, widths.length],
  );

  const mergeIndex = useMemo(() => buildMergeIndex(tab.merges), [tab.merges]);

  const visibleRowIndices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .map((_, i) => i)
      .filter((i) => {
        if (i < tab.headerRows) return true;
        if (hideEmpty && !rowHasData(rows[i])) return false;
        if (!q) return true;
        return rows[i].some((c) => (c ?? "").toLowerCase().includes(q));
      });
  }, [rows, tab.headerRows, hideEmpty, search]);

  const headerIndices = visibleRowIndices.filter((i) => i < tab.headerRows);
  const bodyIndices = visibleRowIndices.filter((i) => i >= tab.headerRows);

  const virtualizer = useVirtualizer({
    count: bodyIndices.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => Math.round((wrapText ? 36 : 26) * zoom),
    overscan: 15,
  });

  const updateCell = useCallback(
    (r: number, c: number, value: string) => {
      setRows((prev) =>
        prev.map((row, ri) =>
          ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row,
        ),
      );
      onCellChange?.(r, c, value);
    },
    [onCellChange],
  );

  useSheetKeyboard({
    selected,
    rowCount: rows.length,
    colCount,
    onMove: setSelected,
    onEdit: () => {
      if (selected) setEditing(selected);
    },
  });

  const stickyLeft = useCallback(
    (ci: number, isHeader: boolean) => {
      if (ci >= tab.freezeCols && !isHeader) return undefined;
      let left = 40;
      for (let i = 0; i < ci; i++) left += Math.round((widths[i] ?? 90) * zoom);
      return left;
    },
    [tab.freezeCols, widths, zoom],
  );

  const onResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!resizing) return;
      const delta = e.clientX - resizing.startX;
      const next = [...widths];
      next[resizing.col] = Math.max(40, resizing.startW + delta);
      setWidths(next);
    },
    [resizing, setWidths, widths],
  );

  const onResizeEnd = useCallback(() => setResizing(null), []);

  useEffect(() => {
    if (!resizing) return;
    window.addEventListener("mousemove", onResizeMove);
    window.addEventListener("mouseup", onResizeEnd);
    return () => {
      window.removeEventListener("mousemove", onResizeMove);
      window.removeEventListener("mouseup", onResizeEnd);
    };
  }, [resizing, onResizeMove, onResizeEnd]);

  const renderCell = (ri: number, ci: number) => {
    const key = `${ri},${ci}`;
    if (mergeIndex.covered.has(key)) return null;

    const merge = mergeIndex.anchor.get(key);
    const value = rows[ri]?.[ci] ?? "";
    const isHeader = ri < tab.headerRows;
    const style = resolveCellStyle(tab, ri, ci, value);
    const width = Math.round((widths[ci] ?? 90) * zoom);
    const isSelected = selected?.r === ri && selected?.c === ci;
    const isEditing = editing?.r === ri && editing?.c === ci;
    const selectOpts = selectOptionsForColumn(tab, ci);
    const sticky = stickyLeft(ci, isHeader);
    const isSticky = sticky !== undefined && (isHeader || ci < tab.freezeCols);

    const cellInner = () => {
      if (isTimelineMarker(value)) {
        return <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: style.backgroundColor }} title={value} />;
      }
      if (isUrl(value)) {
        return (
          <a href={value.trim()} target="_blank" rel="noreferrer" className="block truncate px-1 py-1 text-[#1a73e8] underline">
            {value.length > 40 ? `${value.slice(0, 38)}…` : value}
          </a>
        );
      }
      if (selectOpts && !isHeader) {
        return (
          <select
            className="h-full w-full bg-transparent px-1 py-1 outline-none"
            value={value}
            onChange={(e) => updateCell(ri, ci, e.target.value)}
          >
            <option value="">—</option>
            {selectOpts.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
            {value && !selectOpts.includes(value) ? <option value={value}>{value}</option> : null}
          </select>
        );
      }
      return (
        <input
          className={clsx("w-full bg-transparent px-1 py-1 outline-none", wrapText && "whitespace-pre-wrap")}
          value={value}
          readOnly={isHeader && !isEditing}
          autoFocus={isEditing}
          onDoubleClick={() => !isHeader && setEditing({ r: ri, c: ci })}
          onBlur={() => setEditing(null)}
          onChange={(e) => updateCell(ri, ci, e.target.value)}
        />
      );
    };

    return (
      <td
        key={ci}
        colSpan={merge?.cs}
        rowSpan={merge?.rs}
        style={{
          ...style,
          width,
          minWidth: width,
          maxWidth: merge ? undefined : width,
          left: isSticky ? sticky : undefined,
        }}
        className={clsx(
          "sheet-cell relative border border-[#e0e0e0] p-0 align-middle",
          dark && !style.backgroundColor && "border-[#3c4043] text-[#e8eaed]",
          isSelected && "ring-2 ring-inset ring-[#1a73e8] z-[8]",
          isSticky && "sticky z-[6]",
          isSticky && !isHeader && (dark ? "bg-[#202124]" : "bg-white"),
          wrapText && "align-top",
        )}
        onClick={() => setSelected({ r: ri, c: ci })}
      >
        {cellInner()}
        {!isHeader && ci === colCount - 1 ? null : null}
      </td>
    );
  };

  const headerRowTops = useMemo(() => {
    const h = Math.round(24 * zoom);
    return headerIndices.map((_, i) => i * h);
  }, [headerIndices, zoom]);

  return (
    <div className={clsx("flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border shadow-sm", dark ? "border-[#3c4043] bg-[#202124]" : "border-[#dadce0] bg-white")}>
      <div ref={parentRef} className="sheet-scroll flex-1 overflow-auto">
        <table className="sheet-table min-w-max border-collapse" style={{ fontSize: `${Math.round(11 * zoom)}px` }}>
          <thead>
            <tr className={clsx("sticky z-40", dark ? "bg-[#303134]" : "bg-[#f3f3f3]")} style={{ top: 0 }}>
              <th className={clsx("sticky left-0 z-50 w-10 min-w-10 border text-[10px]", dark ? "border-[#3c4043] bg-[#303134] text-[#9aa0a6]" : "border-[#dadce0] bg-[#f3f3f3] text-[#5f6368]")} />
              {Array.from({ length: colCount }, (_, ci) => {
                const w = Math.round((widths[ci] ?? 90) * zoom);
                return (
                  <th
                    key={ci}
                    style={{ width: w, minWidth: w, top: 0 }}
                    className={clsx("relative border py-0.5 text-[10px] font-medium", dark ? "border-[#3c4043] text-[#9aa0a6]" : "border-[#dadce0] text-[#5f6368]")}
                  >
                    {colLetter(ci)}
                    <span
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[#1a73e8]"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setResizing({ col: ci, startX: e.clientX, startW: w });
                      }}
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {headerIndices.map((ri, hi) => (
              <tr
                key={`h-${ri}`}
                className="sticky z-30"
                style={{ top: Math.round(24 * zoom) + (headerRowTops[hi] ?? 0) }}
              >
                <td className={clsx("sticky left-0 z-20 w-10 border text-center text-[10px]", dark ? "border-[#3c4043] bg-[#303134] text-[#9aa0a6]" : "border-[#dadce0] bg-[#f3f3f3] text-[#5f6368]")}>
                  {ri + 1}
                </td>
                {Array.from({ length: colCount }, (_, ci) => renderCell(ri, ci))}
              </tr>
            ))}
            {virtualizer.getVirtualItems().length > 0 && (
              <tr style={{ height: virtualizer.getVirtualItems()[0]?.start ?? 0 }}>
                <td colSpan={colCount + 1} />
              </tr>
            )}
            {virtualizer.getVirtualItems().map((vRow) => {
              const ri = bodyIndices[vRow.index];
              return (
                <tr key={ri} data-index={vRow.index} ref={virtualizer.measureElement}>
                  <td className={clsx("sticky left-0 z-10 w-10 border text-center text-[10px]", dark ? "border-[#3c4043] bg-[#303134] text-[#9aa0a6]" : "border-[#dadce0] bg-[#f3f3f3] text-[#5f6368]")}>
                    {ri + 1}
                  </td>
                  {Array.from({ length: colCount }, (_, ci) => renderCell(ri, ci))}
                </tr>
              );
            })}
            {virtualizer.getVirtualItems().length > 0 && (
              <tr style={{ height: virtualizer.getTotalSize() - (virtualizer.getVirtualItems().at(-1)?.end ?? 0) }}>
                <td colSpan={colCount + 1} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { cellLabel };
