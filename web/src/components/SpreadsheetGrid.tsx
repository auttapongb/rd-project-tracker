"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef as TanColumnDef,
} from "@tanstack/react-table";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { STATUS_COLORS, type ColumnDef, type SheetRow, type SheetTab } from "@/types/sheet";

type Props = {
  tab: SheetTab;
};

function cellBackground(column: ColumnDef, value: unknown): string | undefined {
  if (column.id === "status" && typeof value === "string") {
    return STATUS_COLORS[value] ?? undefined;
  }
  if (column.type === "percent" && typeof value === "number") {
    if (value >= 100) return "#b7e1cd";
    if (value >= 50) return "#fce8b2";
    if (value > 0) return "#fff2cc";
  }
  return column.cellColor;
}

function EditableCell({
  column,
  value,
  onChange,
}: {
  column: ColumnDef;
  value: unknown;
  onChange: (v: string) => void;
}) {
  if (column.type === "select" && column.options) {
    return (
      <select
        className="h-full w-full bg-transparent px-1 text-xs outline-none"
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">—</option>
        {column.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      className="h-full w-full bg-transparent px-1 text-xs outline-none"
      value={value == null ? "" : String(value)}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function SpreadsheetGrid({ tab }: Props) {
  const [rows, setRows] = useState<SheetRow[]>(tab.rows);

  const columns = useMemo<TanColumnDef<SheetRow>[]>(
    () =>
      tab.columns.map((col) => ({
        id: col.id,
        accessorKey: col.id,
        header: col.header,
        size: col.width ?? 120,
        cell: ({ row, column }) => {
          const colDef = tab.columns.find((c) => c.id === column.id)!;
          const val = row.original[col.id];
          return (
            <EditableCell
              column={colDef}
              value={val}
              onChange={(next) => {
                setRows((prev) =>
                  prev.map((r, i) =>
                    i === row.index
                      ? {
                          ...r,
                          [col.id]:
                            colDef.type === "number" || colDef.type === "percent"
                              ? Number(next) || 0
                              : next,
                        }
                      : r,
                  ),
                );
              }}
            />
          );
        },
      })),
    [tab.columns],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="sheet-scroll overflow-auto rounded-md border border-[#dadce0] bg-white shadow-sm">
      <table className="sheet-table min-w-max border-collapse text-xs">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => {
                const colDef = tab.columns.find((c) => c.id === header.id)!;
                return (
                  <th
                    key={header.id}
                    style={{
                      width: header.getSize(),
                      minWidth: header.getSize(),
                      backgroundColor: colDef.headerColor ?? "#f3f3f3",
                    }}
                    className={clsx(
                      "sheet-header border border-[#dadce0] px-1 py-1.5 text-left font-semibold text-white",
                      colDef.sticky && "sticky left-0 z-20",
                    )}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-[#f8f9fa]">
              {row.getVisibleCells().map((cell) => {
                const colDef = tab.columns.find((c) => c.id === cell.column.id)!;
                const val = row.original[colDef.id];
                const bg = cellBackground(colDef, val);
                return (
                  <td
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                      minWidth: cell.column.getSize(),
                      backgroundColor: bg,
                    }}
                    className={clsx(
                      "sheet-cell border border-[#e0e0e0] p-0 align-middle text-[#202124]",
                      colDef.sticky && "sticky left-0 z-10 bg-white",
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
