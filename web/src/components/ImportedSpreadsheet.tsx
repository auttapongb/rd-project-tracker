"use client";

import clsx from "clsx";
import { useMemo, useState } from "react";
import { STATUS_COLORS } from "@/types/sheet";

export type ImportedTab = {
  id: string;
  label: string;
  headerRows: number;
  headerColor: string;
  selectColumnIndexes: number[];
  columnWidths: number[];
  rawRows: string[][];
};

const STATUS_OPTIONS = ["Done", "In Progress", "To Do", "Blocked", "Closed", "Open", "In Review"];

type Props = {
  tab: ImportedTab;
};

function cellStyle(rowIndex: number, colIndex: number, value: string, tab: ImportedTab) {
  if (rowIndex < tab.headerRows) return { backgroundColor: tab.headerColor, color: "#fff", fontWeight: 600 };
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

export function ImportedSpreadsheet({ tab }: Props) {
  const [rows, setRows] = useState(tab.rawRows);

  const colCount = useMemo(
    () => Math.max(...rows.map((r) => r.length), tab.columnWidths.length),
    [rows, tab.columnWidths.length],
  );

  const updateCell = (r: number, c: number, value: string) => {
    setRows((prev) =>
      prev.map((row, ri) =>
        ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row,
      ),
    );
  };

  return (
    <div className="sheet-scroll overflow-auto rounded-md border border-[#dadce0] bg-white shadow-sm">
      <table className="sheet-table min-w-max border-collapse text-[11px]">
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri >= tab.headerRows ? "hover:bg-[#f8f9fa]" : undefined}>
              {Array.from({ length: colCount }, (_, ci) => {
                const value = row[ci] ?? "";
                const isSelect =
                  ri >= tab.headerRows && tab.selectColumnIndexes.includes(ci);
                const style = cellStyle(ri, ci, value, tab);
                const width = tab.columnWidths[ci] ?? 90;

                return (
                  <td
                    key={ci}
                    style={{ ...style, width, minWidth: width, maxWidth: width }}
                    className={clsx(
                      "sheet-cell border border-[#e0e0e0] p-0 align-middle",
                      ri < tab.headerRows && "sticky top-0 z-10",
                      ci <= 1 && ri >= tab.headerRows && "sticky left-0 z-[5] bg-white",
                    )}
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
                        {!STATUS_OPTIONS.includes(value) && value ? (
                          <option value={value}>{value}</option>
                        ) : null}
                      </select>
                    ) : (
                      <input
                        className="w-full bg-transparent px-1 py-1 outline-none"
                        value={value}
                        readOnly={ri < tab.headerRows}
                        onChange={(e) => updateCell(ri, ci, e.target.value)}
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
