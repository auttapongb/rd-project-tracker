/** Column index → Excel letter (A, B, … Z, AA, …) */
export function colLetter(index: number): string {
  let n = index;
  let label = "";
  while (n >= 0) {
    label = String.fromCharCode((n % 26) + 65) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
}

/** Parse Jira-style dates: 12/Jun/26 4:33 PM */
export function parseJiraDate(raw: string): Date | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const m = trimmed.match(/(\d{1,2})\/(\w{3})\/(\d{2,4})/i);
  if (!m) {
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const day = parseInt(m[1], 10);
  const mon = months[m[2].toLowerCase()];
  if (mon === undefined) return null;
  let year = parseInt(m[3], 10);
  if (year < 100) year += 2000;
  return new Date(year, mon, day);
}

export function statusProgress(status: string): number {
  const s = status.toLowerCase();
  if (["done", "closed", "resolved"].some((x) => s.includes(x))) return 100;
  if (["in progress", "in review"].some((x) => s.includes(x))) return 55;
  if (s.includes("to do") || s.includes("open")) return 5;
  return 25;
}

export const TIMELINE_FILLS: Record<string, string> = {
  "■": "#188038",
  "●": "#188038",
  "◐": "#fbbc04",
  "◑": "#fbbc04",
  "○": "#dadce0",
  "□": "#f1f3f4",
};

export function isTimelineMarker(value: string): boolean {
  return value.length <= 2 && value in TIMELINE_FILLS;
}

export function rowHasData(row: string[]): boolean {
  return row.some((c) => (c ?? "").trim() !== "");
}
