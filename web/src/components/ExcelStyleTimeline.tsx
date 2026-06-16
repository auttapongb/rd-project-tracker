"use client";

import clsx from "clsx";
import { useMemo } from "react";
import { parseJiraDate } from "@/lib/sheet-utils";
import type { ImportedTab } from "@/types/imported-tab";

type Props = { tab: ImportedTab; dark?: boolean };

type TimelineRow = {
  key: string;
  summary: string;
  assignee: string;
  status: string;
  start: Date;
  end: Date;
};

function weeksBetween(start: Date, end: Date): Date[] {
  const weeks: Date[] = [];
  const cur = new Date(start);
  cur.setDate(cur.getDate() - cur.getDay());
  const limit = new Date(end);
  limit.setDate(limit.getDate() + 14);
  while (cur <= limit) {
    weeks.push(new Date(cur));
    cur.setDate(cur.getDate() + 7);
  }
  return weeks;
}

function buildRows(tab: ImportedTab): TimelineRow[] {
  const header = tab.rawRows[tab.headerRows - 1] ?? [];
  const idx = (n: string) => header.findIndex((h) => h.toLowerCase() === n.toLowerCase());
  const rows: TimelineRow[] = [];
  tab.rawRows.slice(tab.headerRows).forEach((row) => {
    const summary = row[idx("Summary")]?.trim();
    const start = parseJiraDate(row[idx("Created")] ?? "");
    if (!summary || !start) return;
    let end = parseJiraDate(row[idx("Due date")] ?? "") ?? new Date(start);
    if (end <= start) end = new Date(start.getTime() + 5 * 86400000);
    rows.push({
      key: row[idx("Issue key")] ?? summary.slice(0, 12),
      summary,
      assignee: row[idx("Assignee")] ?? "",
      status: row[idx("Status")] ?? "",
      start,
      end,
    });
  });
  return rows.slice(0, 80);
}

/** Excel / Sheets-style in-grid timeline (week columns + colored bars) */
export function ExcelStyleTimeline({ tab, dark = false }: Props) {
  const rows = useMemo(() => buildRows(tab), [tab]);

  const range = useMemo(() => {
    if (!rows.length) return null;
    const starts = rows.map((r) => r.start.getTime());
    const ends = rows.map((r) => r.end.getTime());
    const min = new Date(Math.min(...starts));
    min.setDate(min.getDate() - 7);
    const max = new Date(Math.max(...ends));
    return { min, max, weeks: weeksBetween(min, max) };
  }, [rows]);

  if (!rows.length || !range) {
    return null;
  }

  const weekMs = 7 * 86400000;
  const totalMs = range.max.getTime() - range.min.getTime() + weekMs;

  return (
    <div className={clsx("excel-timeline overflow-hidden rounded-md border shadow-sm", dark ? "border-[#3c4043] bg-[#202124]" : "border-[#dadce0] bg-white")}>
      <div className="border-b border-[#188038] bg-[#188038] px-3 py-1.5 text-xs font-medium text-white">
        Excel-style timeline (week columns — matches Projects tab markers)
      </div>
      <div className="overflow-auto">
        <table className="min-w-max border-collapse text-[10px]">
          <thead>
            <tr className="bg-[#f3f3f3]">
              <th className="sticky left-0 z-20 min-w-[88px] border border-[#dadce0] bg-[#f3f3f3] px-1 py-1">Key</th>
              <th className="sticky left-[88px] z-20 min-w-[200px] border border-[#dadce0] bg-[#f3f3f3] px-1 py-1 text-left">Summary</th>
              <th className="min-w-[100px] border border-[#dadce0] px-1 py-1">Assignee</th>
              <th className="min-w-[72px] border border-[#dadce0] px-1 py-1">Status</th>
              {range.weeks.map((w, i) => (
                <th key={i} className="min-w-[28px] border border-[#dadce0] px-0.5 py-1 text-[9px] font-normal text-[#5f6368]">
                  {w.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const barStart = ((row.start.getTime() - range.min.getTime()) / totalMs) * 100;
              const barWidth = Math.max(((row.end.getTime() - row.start.getTime()) / totalMs) * 100, 2);
              const done = /done|closed/i.test(row.status);
              return (
                <tr key={row.key} className="hover:bg-[#f8f9fa]">
                  <td className="sticky left-0 z-10 border border-[#e0e0e0] bg-white px-1 py-0.5 font-mono text-[#1a73e8]">{row.key}</td>
                  <td className="sticky left-[88px] z-10 max-w-[200px] truncate border border-[#e0e0e0] bg-white px-1 py-0.5">{row.summary}</td>
                  <td className="truncate border border-[#e0e0e0] px-1 py-0.5">{row.assignee.split(":")[0]}</td>
                  <td className="border border-[#e0e0e0] px-1 py-0.5">
                    <span className={clsx("rounded px-1 py-0.5", done ? "bg-[#b7e1cd]" : "bg-[#fce8b2]")}>{row.status}</span>
                  </td>
                  <td colSpan={range.weeks.length} className="relative h-6 border border-[#e0e0e0] p-0">
                    <div
                      className="absolute top-1 h-3.5 rounded-sm border border-[#137333]"
                      style={{
                        left: `${barStart}%`,
                        width: `${barWidth}%`,
                        backgroundColor: done ? "#81c995" : "#8ab4f8",
                      }}
                      title={`${row.start.toLocaleDateString()} – ${row.end.toLocaleDateString()}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
