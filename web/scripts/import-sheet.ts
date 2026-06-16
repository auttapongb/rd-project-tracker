/**
 * Import Google Sheet tabs from workbook.xlsx into public/data/*.json
 */
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { CellStyleMeta, ImportedTab, MergeRange } from "../src/types/imported-tab";

const SHEET_ID = "1yhMYDkjllUlVUjFQGFe2PWy9Jq5NPWg3a1rKYJ_fdz4";

const TABS: {
  label: string;
  headerRows: number;
  headerColor: string;
  tabColor: string;
  freezeCols: number;
  selectColumns?: string[];
}[] = [
  { label: "Projects", headerRows: 3, headerColor: "#188038", tabColor: "#188038", freezeCols: 3, selectColumns: ["Status"] },
  { label: "Sprint Resource", headerRows: 2, headerColor: "#674ea7", tabColor: "#674ea7", freezeCols: 2 },
  { label: "Resource Allocate", headerRows: 3, headerColor: "#e69138", tabColor: "#e69138", freezeCols: 2 },
  { label: "Summarize Sprint 26", headerRows: 1, headerColor: "#1155cc", tabColor: "#1155cc", freezeCols: 1 },
  { label: "Sprint 26", headerRows: 1, headerColor: "#38761d", tabColor: "#38761d", freezeCols: 4, selectColumns: ["Status", "Priority", "Issue Type"] },
  { label: "Summarize Sprint 25", headerRows: 1, headerColor: "#1155cc", tabColor: "#1155cc", freezeCols: 1 },
  { label: "Sprint 25", headerRows: 1, headerColor: "#38761d", tabColor: "#38761d", freezeCols: 4, selectColumns: ["Status", "Priority", "Issue Type"] },
];

const ROOT = path.join(import.meta.dirname, "..");
const XLSX_PATH = path.join(ROOT, "..", "data", "csv-raw", "workbook.xlsx");
const CSV_DIR = path.join(ROOT, "..", "data", "csv");
const OUT_DIR = path.join(ROOT, "public", "data");

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function rowHasData(row: string[]): boolean {
  return row.some((c) => c !== "");
}

function normalizeRows(rows: string[][]): string[][] {
  const maxCols = Math.max(...rows.map((r) => r.length), 0);
  let normalized = rows.map((r) => {
    const row = [...r];
    while (row.length < maxCols) row.push("");
    return row.map((c) => String(c ?? "").trim());
  });
  while (normalized.length > 0 && !rowHasData(normalized[normalized.length - 1])) {
    normalized.pop();
  }
  return normalized;
}

function findSelectColumns(headerRow: string[], names: string[]): number[] {
  const indexes: number[] = [];
  headerRow.forEach((cell, i) => {
    const h = cell.trim().toLowerCase();
    if (names.some((n) => h === n.toLowerCase() || h.includes(n.toLowerCase()))) {
      indexes.push(i);
    }
  });
  return indexes;
}

function columnWidths(rows: string[][], maxCols: number, ws?: XLSX.WorkSheet): number[] {
  const xlsxCols = ws?.["!cols"] as { wpx?: number; wch?: number }[] | undefined;
  return Array.from({ length: maxCols }, (_, col) => {
    if (xlsxCols?.[col]?.wpx) return Math.round(Math.min(Math.max(xlsxCols[col].wpx!, 40), 320));
    if (xlsxCols?.[col]?.wch) return Math.round(Math.min(Math.max(xlsxCols[col].wch! * 8, 40), 320));
    let max = 52;
    for (const row of rows) {
      const len = (row[col] ?? "").length;
      max = Math.max(max, Math.min(len * 7 + 20, 280));
    }
    return max;
  });
}

function extractMerges(ws: XLSX.WorkSheet): MergeRange[] {
  const merges = ws["!merges"] as XLSX.Range[] | undefined;
  if (!merges) return [];
  return merges.map((m) => ({
    r: m.s.r,
    c: m.s.c,
    rs: m.e.r - m.s.r + 1,
    cs: m.e.c - m.s.c + 1,
  }));
}

function extractCellStyles(ws: XLSX.WorkSheet, rowCount: number, colCount: number): Record<string, CellStyleMeta> {
  const styles: Record<string, CellStyleMeta> = {};
  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cell = ws[addr] as any;
      if (!cell?.s) continue;
      const meta: CellStyleMeta = {};
      const rgb = cell.s.fgColor?.rgb as string | undefined;
      if (rgb && rgb !== "FFFFFF" && rgb !== "FFFFFFFF") meta.bg = rgb.slice(-6);
      if (cell.s.font?.bold) meta.bold = true;
      if (cell.s.font?.italic) meta.italic = true;
      const fontColor = cell.s.font?.color?.rgb;
      if (fontColor) meta.color = fontColor.slice(-6);
      const h = cell.s.alignment?.horizontal;
      if (h === "center" || h === "right" || h === "left") meta.align = h;
      if (Object.keys(meta).length) styles[`${r},${c}`] = meta;
    }
  }
  return styles;
}

async function fetchGvizCsv(sheetName: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`gviz failed: ${sheetName}`);
  const parsed = Papa.parse<string[]>((await res.text()), { skipEmptyLines: false });
  return parsed.data as string[][];
}

async function main() {
  fs.mkdirSync(CSV_DIR, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const wb = fs.existsSync(XLSX_PATH)
    ? XLSX.readFile(XLSX_PATH, { cellStyles: true })
    : null;

  const manifest: { id: string; label: string; file: string; rows: number; cols: number; tabColor: string }[] = [];

  for (const tab of TABS) {
    const id = slugify(tab.label);
    const ws = wb?.Sheets[tab.label];
    const raw = ws
      ? XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: "", raw: false })
      : await fetchGvizCsv(tab.label);

    const rawRows = normalizeRows(raw as string[][]);
    const maxCols = rawRows[0]?.length ?? 0;
    const headerRow = rawRows[tab.headerRows - 1] ?? rawRows[0] ?? [];

    const exported: ImportedTab = {
      id,
      label: tab.label,
      headerRows: tab.headerRows,
      headerColor: tab.headerColor,
      tabColor: tab.tabColor,
      freezeCols: tab.freezeCols,
      selectColumnIndexes: tab.selectColumns
        ? findSelectColumns(headerRow, tab.selectColumns)
        : [],
      columnWidths: columnWidths(rawRows, maxCols, ws),
      rawRows,
      merges: ws ? extractMerges(ws) : [],
      cellStyles: ws ? extractCellStyles(ws, rawRows.length, maxCols) : {},
    };

    fs.writeFileSync(path.join(CSV_DIR, `${id}.csv`), Papa.unparse(rawRows), "utf8");
    fs.writeFileSync(path.join(OUT_DIR, `${id}.json`), JSON.stringify(exported), "utf8");

    manifest.push({ id, label: tab.label, file: `${id}.json`, rows: rawRows.length, cols: maxCols, tabColor: tab.tabColor });
    console.log(`✓ ${tab.label}: ${rawRows.length}×${maxCols}, merges=${exported.merges.length}, styles=${Object.keys(exported.cellStyles).length}`);
  }

  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`\nDone → ${OUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
