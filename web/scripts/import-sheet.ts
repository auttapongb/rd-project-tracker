/**
 * Import Google Sheet tabs from workbook.xlsx into public/data/*.json
 * Run: npm run import:sheet
 */
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const SHEET_ID = "1yhMYDkjllUlVUjFQGFe2PWy9Jq5NPWg3a1rKYJ_fdz4";

const TABS: {
  label: string;
  headerRows: number;
  headerColor: string;
  selectColumns?: string[];
}[] = [
  { label: "Projects", headerRows: 3, headerColor: "#188038", selectColumns: ["Status"] },
  { label: "Sprint Resource", headerRows: 2, headerColor: "#674ea7" },
  { label: "Resource Allocate", headerRows: 3, headerColor: "#e69138" },
  { label: "Summarize Sprint 26", headerRows: 1, headerColor: "#1155cc" },
  { label: "Sprint 26", headerRows: 1, headerColor: "#38761d", selectColumns: ["Status", "Priority", "Issue Type"] },
  { label: "Summarize Sprint 25", headerRows: 1, headerColor: "#1155cc" },
  { label: "Sprint 25", headerRows: 1, headerColor: "#38761d", selectColumns: ["Status", "Priority", "Issue Type"] },
];

const ROOT = path.join(import.meta.dirname, "..");
const XLSX_PATH = path.join(ROOT, "..", "data", "csv-raw", "workbook.xlsx");
const CSV_DIR = path.join(ROOT, "..", "data", "csv");
const OUT_DIR = path.join(ROOT, "public", "data");

export type ImportedTab = {
  id: string;
  label: string;
  headerRows: number;
  headerColor: string;
  selectColumnIndexes: number[];
  columnWidths: number[];
  rawRows: string[][];
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function readXlsxSheet(wb: XLSX.WorkBook, sheetName: string): string[][] {
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error(`Sheet not found: ${sheetName}`);
  return XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: "", raw: false });
}

async function fetchGvizCsv(sheetName: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`gviz failed: ${sheetName}`);
  const parsed = Papa.parse<string[]>((await res.text()), { skipEmptyLines: false });
  return parsed.data as string[][];
}

function normalizeRows(rows: string[][]): string[][] {
  const maxCols = Math.max(...rows.map((r) => r.length), 0);
  return rows.map((r) => {
    const row = [...r];
    while (row.length < maxCols) row.push("");
    return row.map((c) => String(c ?? "").trim());
  });
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

function columnWidths(rows: string[][], maxCols: number): number[] {
  return Array.from({ length: maxCols }, (_, col) => {
    let max = 60;
    for (const row of rows) {
      const len = (row[col] ?? "").length;
      max = Math.max(max, Math.min(len * 7 + 24, 280));
    }
    return max;
  });
}

async function main() {
  fs.mkdirSync(CSV_DIR, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const wb = fs.existsSync(XLSX_PATH) ? XLSX.readFile(XLSX_PATH) : null;
  const manifest: { id: string; label: string; file: string; rows: number; cols: number }[] = [];

  for (const tab of TABS) {
    const id = slugify(tab.label);
    const raw = wb?.Sheets[tab.label]
      ? readXlsxSheet(wb, tab.label)
      : await fetchGvizCsv(tab.label);

    const rawRows = normalizeRows(raw);
    const maxCols = rawRows[0]?.length ?? 0;
    const headerRow = rawRows[tab.headerRows - 1] ?? rawRows[0] ?? [];

    const exported: ImportedTab = {
      id,
      label: tab.label,
      headerRows: tab.headerRows,
      headerColor: tab.headerColor,
      selectColumnIndexes: tab.selectColumns
        ? findSelectColumns(headerRow, tab.selectColumns)
        : [],
      columnWidths: columnWidths(rawRows, maxCols),
      rawRows,
    };

    const csv = Papa.unparse(rawRows);
    fs.writeFileSync(path.join(CSV_DIR, `${id}.csv`), csv, "utf8");
    fs.writeFileSync(path.join(OUT_DIR, `${id}.json`), JSON.stringify(exported), "utf8");

    manifest.push({ id, label: tab.label, file: `${id}.json`, rows: rawRows.length, cols: maxCols });
    console.log(`✓ ${tab.label}: ${rawRows.length} rows × ${maxCols} cols`);
  }

  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`\nDone → ${OUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
