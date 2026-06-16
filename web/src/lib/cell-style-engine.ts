import type { CSSProperties } from "react";
import type { CellStyleMeta, ImportedTab } from "@/types/imported-tab";
import { isTimelineMarker, TIMELINE_FILLS } from "@/lib/sheet-utils";
import { STATUS_COLORS } from "@/types/sheet";

const PRIORITY_COLORS: Record<string, string> = {
  Highest: "#f4c7c3",
  High: "#fce8b2",
  Medium: "#fff2cc",
  Low: "#e8f0fe",
  Lowest: "#f3f3f3",
};

const ISSUE_TYPE_COLORS: Record<string, string> = {
  Story: "#e8f0fe",
  Bug: "#fce8b2",
  "Sub-task": "#f3f3f3",
  Task: "#e6f4ea",
  Epic: "#e8eaed",
};

const URL_RE = /^https?:\/\//i;

export function isErrorRef(value: string): boolean {
  return value === "#REF!" || value.startsWith("#REF");
}

export function isUrl(value: string): boolean {
  return URL_RE.test(value.trim());
}

export function isSectionTitleRow(row: string[], rowIndex: number, headerRows: number): boolean {
  if (rowIndex < headerRows) return false;
  const joined = row.join(" ");
  return (
    joined.includes("Resource Plan") ||
    joined.includes("Capacity รวม") ||
    joined.startsWith("Sprint ") ||
    /^Capacity/.test(row[0] ?? "")
  );
}

export function isSubRowLabel(row: string[]): boolean {
  const a = (row[0] ?? "").toLowerCase();
  return a === "day" || a === "hour" || a === "point";
}

export function getColumnHeader(tab: ImportedTab, col: number): string {
  const hr = tab.rawRows[tab.headerRows - 1] ?? [];
  return (hr[col] ?? "").toLowerCase();
}

export function resolveCellStyle(
  tab: ImportedTab,
  row: number,
  col: number,
  value: string,
): CSSProperties {
  const key = `${row},${col}`;
  const imported = tab.cellStyles[key];
  const style: CSSProperties = {};

  if (imported?.bg) style.backgroundColor = `#${imported.bg.replace("#", "")}`;
  if (imported?.color) style.color = `#${imported.color.replace("#", "")}`;
  if (imported?.bold) style.fontWeight = 700;
  if (imported?.italic) style.fontStyle = "italic";
  if (imported?.align) style.textAlign = imported.align;

  if (row < tab.headerRows && !imported?.bg) {
    style.backgroundColor = tab.headerColor;
    style.color = "#fff";
    style.fontWeight = 600;
  }

  if (isTimelineMarker(value)) {
    style.backgroundColor = TIMELINE_FILLS[value];
    style.textAlign = "center";
  }

  if (isErrorRef(value)) {
    style.color = "#c5221f";
    style.fontWeight = 600;
  }

  const header = getColumnHeader(tab, col);
  if (header.includes("status") && STATUS_COLORS[value]) {
    style.backgroundColor = STATUS_COLORS[value];
  }
  if (header.includes("priority") && PRIORITY_COLORS[value]) {
    style.backgroundColor = PRIORITY_COLORS[value];
  }
  if (header.includes("issue type") && ISSUE_TYPE_COLORS[value]) {
    style.backgroundColor = ISSUE_TYPE_COLORS[value];
  }

  if (value.endsWith("%") || header.includes("complete") || header.includes("capacity") || header.includes("workload")) {
    const n = parseFloat(value);
    if (!Number.isNaN(n)) {
      style.textAlign = "right";
      if (n >= 100) style.backgroundColor = style.backgroundColor ?? "#b7e1cd";
      else if (n >= 50) style.backgroundColor = style.backgroundColor ?? "#fce8b2";
      else if (n > 0) style.backgroundColor = style.backgroundColor ?? "#fff2cc";
    }
  }

  if (/^\d+(\.\d+)?$/.test(value.trim())) {
    style.textAlign = style.textAlign ?? "right";
  }

  const rowData = tab.rawRows[row] ?? [];
  if (isSectionTitleRow(rowData, row, tab.headerRows)) {
    style.backgroundColor = "#fff2cc";
    style.fontWeight = 700;
  }
  if (isSubRowLabel(rowData)) {
    style.backgroundColor = "#f8f9fa";
    style.fontStyle = "italic";
    style.color = "#5f6368";
  }

  if (row >= tab.headerRows && row % 2 === 0 && !style.backgroundColor) {
    style.backgroundColor = "#fafafa";
  }

  return style;
}

export function buildMergeIndex(merges: ImportedTab["merges"]) {
  const anchor = new Map<string, { rs: number; cs: number }>();
  const covered = new Set<string>();
  for (const m of merges) {
    anchor.set(`${m.r},${m.c}`, { rs: m.rs, cs: m.cs });
    for (let ri = m.r; ri < m.r + m.rs; ri++) {
      for (let ci = m.c; ci < m.c + m.cs; ci++) {
        if (ri !== m.r || ci !== m.c) covered.add(`${ri},${ci}`);
      }
    }
  }
  return { anchor, covered };
}

export const STATUS_OPTIONS = [
  "Done", "In Progress", "To Do", "Blocked", "Closed", "Open",
  "In Review", "Resolved", "In Progress",
];

export const PRIORITY_OPTIONS = ["Highest", "High", "Medium", "Low", "Lowest"];
export const ISSUE_TYPE_OPTIONS = ["Story", "Bug", "Sub-task", "Task", "Epic"];

export function selectOptionsForColumn(tab: ImportedTab, col: number): string[] | null {
  if (!tab.selectColumnIndexes.includes(col)) return null;
  const h = getColumnHeader(tab, col);
  if (h.includes("priority")) return PRIORITY_OPTIONS;
  if (h.includes("issue type")) return ISSUE_TYPE_OPTIONS;
  if (h.includes("status")) return STATUS_OPTIONS;
  return STATUS_OPTIONS;
}
