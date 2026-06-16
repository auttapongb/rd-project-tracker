"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";
import { useCallback, useMemo, useRef, useState } from "react";
import { STATUS_COLORS } from "@/types/sheet";
import {
  colLetter,
  isTimelineMarker,
  rowHasData,
  TIMELINE_FILLS,
} from "@/lib/sheet-utils";

export type ImportedTab = {
  id: string;
  label: string;
  headerRows: number;
  headerColor: string;
  selectColumnIndexes: number[];
  columnWidths: number[];
  rawRows: string[][];
};

const STATUS_OPTIONS = [
  "Done", "In Progress", "To Do", "Blocked", "Closed", "Open", "In Review", "Resolved",
];

type Props = {
  tab: ImportedTab;
  zoom?: number;
  search?: string;
  hideEmpty?: boolean;
  selected?: { r: number; c: number } | null;
  onSelect?: (cell: { r: number; c: number } | null) => void;
};

function cellStyle(
  rowIndex: number,
  colIndex: number,
  value: string,
  tab: ImportedTab,
): React.CSSProperties {
  if (rowIndex < tab.headerRows) {
    return { backgroundColor: tab.headerColor, color: "#fff", fontWeight: 600 };
  }
  const headerRow = tab.rawRows[tab.headerRows - 1] ?? [];
  const header = (headerRow[colIndex] ?? "").toLowerCase();
  if (header.includes("status") && STATUS_COLORS[value]) {
    return { backgroundColor: STATUS_COLORS[value], color: "#202124" };
  }
  if (value.endsWith("%") || header.includes("complete") || header.includes("capacity")) {
    const n = parseFloat(value);
    if (!Number.isNaN(n)) {
      if (n >= 100) return { backgroundColor: "#b7e1cd" };
      if (n >= 50) return { backgroundColor: "#fce8b2" };
      if (n > 0) return { backgroundColor: "#fff2cc" };
    }
  }
  return {};
}

export function ImportedSpreadsheet({
  tab,
  zoom = 1,
  search = "",
  hideEmpty = true,
  selected: selectedProp,
  onSelect,
}: Props) {
  const [rows, setRows] = useState(tab.rawRows);
  const [selectedLocal, setSelectedLocal] = useState<{ r: number; c: number } | null>(null);
  const selected = selectedProp ?? selectedLocal;
  const setSelected = onSelect ?? setSelectedLocal;
  const parentRef = useRef<HTMLDivElement>(null);

  const colCount = useMemo(
    () => Math.max(...rows.map((r) => r.length), tab.columnWidths.length),
    [rows, tab.columnWidths.length],
  );

  const dataRowIndices = useMemo(() => {
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

  const headerIndices = dataRowIndices.filter((i) => i < tab.headerRows);
  const bodyIndices = dataRowIndices.filter((i) => i >= tab.headerRows);

  const virtualizer = useVirtualizer({
    count: bodyIndices.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => Math.round(28 * zoom),
    overscan: 12,
  });

  const updateCell = useCallback((r: number, c: number, value: string) => {
    setRows((prev) =>
      prev.map((row, ri) =>
        ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row,
      ),
    );
  }, []);

  const renderCell = (ri: number, ci: number) => {
    const value = rows[ri]?.[ci] ?? "";
    const isHeader = ri < tab.headerRows;
    const isSelect = !isHeader && tab.selectColumnIndexes.includes(ci);
    const style = cellStyle(ri, ci, value, tab);
    const width = Math.round((tab.columnWidths[ci] ?? 90) * zoom);
    const isSelected = selected?.r === ri && selected?.c === ci;

    if (isTimelineMarker(value)) {
      return (
        <td
          key={ci}
          style={{ ...style, width, minWidth: width, backgroundColor: TIMELINE_FILLS[value] }}
          className={clsx(
            "sheet-cell border border-[#e0e0e0] p-0 text-center align-middle",
            isSelected && "ring-2 ring-inset ring-[#1a73e8]",
          )}
          onClick={() => setSelected({ r: ri, c: ci })}
        >
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: TIMELINE_FILLS[value] }} />
        </td>
      );
    }

    return (
      <td
        key={ci}
        style={{ ...style, width, minWidth: width }}
        className={clsx(
          "sheet-cell border border-[#e0e0e0] p-0 align-middle",
          isSelected && "ring-2 ring-inset ring-[#1a73e8]",
          !isHeader && ci <= 2 && "sticky z-[5] bg-white",
          ci === 0 && !isHeader && "left-0",
          ci === 1 && !isHeader && "left-[40px]",
          ci === 2 && !isHeader && "left-[140px]",
        )}
        onClick={() => setSelected({ r: ri, c: ci })}
      >
        {isSelect ? (
          <select
            className="h-full w-full bg-transparent px-1 py-1 outline-none"
            value={value}
            onChange={(e) => updateCell(ri, ci, e.target.value)}
          >
            <option value="">—</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
            {value && !STATUS_OPTIONS.includes(value) ? <option value={value}>{value}</option> : null}
          </select>
        ) : (
          <input
            className="w-full bg-transparent px-1 py-1 outline-none"
            value={value}
            readOnly={isHeader}
            onChange={(e) => updateCell(ri, ci, e.target.value)}
          />
        )}
      </td>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-[#dadce0] bg-white shadow-sm">
      <div ref={parentRef} className="sheet-scroll flex-1 overflow-auto">
        <table className="sheet-table min-w-max border-collapse" style={{ fontSize: `${Math.round(11 * zoom)}px` }}>
          <thead>
            <tr className="sticky top-0 z-30 bg-[#f3f3f3]">
              <th className="sticky left-0 z-40 w-10 min-w-10 border border-[#dadce0] bg-[#f3f3f3] text-[10px] text-[#5f6368]" />
              {Array.from({ length: colCount }, (_, ci) => (
                <th
                  key={ci}
                  style={{
                    width: Math.round((tab.columnWidths[ci] ?? 90) * zoom),
                    minWidth: Math.round((tab.columnWidths[ci] ?? 90) * zoom),
                  }}
                  className="border border-[#dadce0] py-0.5 text-[10px] font-medium text-[#5f6368]"
                >
                  {colLetter(ci)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {headerIndices.map((ri) => (
              <tr key={`h-${ri}`}>
                <td className="sticky left-0 z-20 w-10 border border-[#dadce0] bg-[#f3f3f3] text-center text-[10px] text-[#5f6368]">
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
                  <td className="sticky left-0 z-20 w-10 border border-[#dadce0] bg-[#f3f3f3] text-center text-[10px] text-[#5f6368]">
                    {ri + 1}
                  </td>
                  {Array.from({ length: colCount }, (_, ci) => renderCell(ri, ci))}
                </tr>
              );
            })}
            {virtualizer.getVirtualItems().length > 0 && (
              <tr
                style={{
                  height: virtualizer.getTotalSize() - (virtualizer.getVirtualItems().at(-1)?.end ?? 0),
                }}
              >
                <td colSpan={colCount + 1} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
