import { STATUS_OPTIONS, type SheetTab } from "@/types/sheet";

const summaryColumns = (headerColor: string) => [
  { id: "category", header: "Category", width: 160, sticky: true, headerColor },
  { id: "planned", header: "Planned", width: 80, type: "number" as const, headerColor },
  { id: "completed", header: "Completed", width: 100, type: "number" as const, headerColor },
  { id: "in_progress", header: "In Progress", width: 110, type: "number" as const, headerColor },
  { id: "blocked", header: "Blocked", width: 90, type: "number" as const, headerColor },
  { id: "completion", header: "Completion %", width: 120, type: "percent" as const, headerColor },
  { id: "note", header: "Note", width: 280, headerColor },
];

export const summarizeSprint26Tab: SheetTab = {
  id: "summarize-sprint-26",
  label: "Summarize Sprint 26",
  description: "Sprint 26 rollup — mirrors sheet summary tab",
  columns: summaryColumns("#1155cc"),
  rows: [
    { category: "Features", planned: 8, completed: 3, in_progress: 4, blocked: 1, completion: 38, note: "Receipt fix, coupon optimize, VIMI removal planned 17 Jun" },
    { category: "Bugfix", planned: 4, completed: 2, in_progress: 2, blocked: 0, completion: 50, note: "Daily Sales Tracking Receipt ID" },
    { category: "Improvement", planned: 3, completed: 1, in_progress: 2, blocked: 0, completion: 33, note: "MongoDB bulk coupon status" },
    { category: "Thana City / TDM", planned: 5, completed: 0, in_progress: 5, blocked: 0, completion: 0, note: "Callback API fields RDTHANA-515/516" },
    { category: "DevOps / DE", planned: 2, completed: 1, in_progress: 1, blocked: 0, completion: 50, note: "CleverTap Thanacity deploy 13 May" },
    { category: "QA", planned: 6, completed: 4, in_progress: 2, blocked: 0, completion: 67, note: "UAT passed for 17 Jun deploy" },
    { category: "Total", planned: 28, completed: 11, in_progress: 16, blocked: 1, completion: 39, note: "Sprint ends 20 Jun 2026" },
  ],
};

export const summarizeSprint25Tab: SheetTab = {
  id: "summarize-sprint-25",
  label: "Summarize Sprint 25",
  description: "Sprint 25 rollup",
  columns: summaryColumns("#1155cc"),
  rows: [
    { category: "Features", planned: 7, completed: 6, in_progress: 1, blocked: 0, completion: 86, note: "CleverTap MAU filtering deployed 10 Jun" },
    { category: "Bugfix", planned: 3, completed: 3, in_progress: 0, blocked: 0, completion: 100, note: "" },
    { category: "VIMI Termination", planned: 4, completed: 3, in_progress: 1, blocked: 0, completion: 75, note: "Remove MVP1 report — carry to Sprint 26" },
    { category: "Thana City", planned: 4, completed: 2, in_progress: 2, blocked: 0, completion: 50, note: "" },
    { category: "Total", planned: 18, completed: 14, in_progress: 4, blocked: 0, completion: 78, note: "Closed 6 Jun 2026" },
  ],
};

function sprintTaskTab(sprint: "25" | "26"): SheetTab {
  const id = sprint === "26" ? "sprint-26" : "sprint-25";
  const label = sprint === "26" ? "Sprint 26" : "Sprint 25";
  const color = sprint === "26" ? "#38761d" : "#38761d";
  return {
    id,
    label,
    description: `${label} task board with timeline`,
    columns: [
      { id: "key", header: "Key / ID", width: 120, sticky: true, headerColor: color },
      { id: "summary", header: "Summary", width: 280, sticky: true, headerColor: color },
      { id: "assignee", header: "Assignee", width: 130, headerColor: color },
      { id: "type", header: "Type", width: 90, headerColor: color },
      { id: "points", header: "Points", width: 70, type: "number", headerColor: color },
      { id: "status", header: "Status", width: 120, type: "select", options: [...STATUS_OPTIONS], headerColor: color },
      { id: "start", header: "Start", width: 100, type: "date", headerColor: color },
      { id: "end", header: "End", width: 100, type: "date", headerColor: color },
      { id: "progress", header: "Progress %", width: 100, type: "percent", headerColor: color },
      { id: "note", header: "Note", width: 200, headerColor: color },
    ],
    gantt: { taskField: "summary", startField: "start", endField: "end", progressField: "progress" },
    rows: sprint === "26"
      ? [
          { key: "REL-26.06", summary: "Fix Daily Sales Tracking Receipt ID not gen", assignee: "Pui", type: "Fix", points: 5, status: "In Progress", start: "2026-06-08", end: "2026-06-17", progress: 90, note: "Deploy 17 Jun 23:00" },
          { key: "REL-26.05", summary: "Optimize MongoDB Bulk Update Coupons", assignee: "Neung", type: "Improvement", points: 3, status: "In Progress", start: "2026-06-05", end: "2026-06-17", progress: 85, note: "rr-scheduler v2.10.0" },
          { key: "REL-26.06", summary: "Remove Vimi report function", assignee: "Neung", type: "Patch", points: 2, status: "In Progress", start: "2026-06-10", end: "2026-06-17", progress: 80, note: "Post VIMI terminate" },
          { key: "RDTHANA-515", summary: "Callback API #2 fields", assignee: "Mac", type: "Story", points: 5, status: "In Progress", start: "2026-06-09", end: "2026-06-20", progress: 60, note: "Ready to Staging" },
          { key: "RDTHANA-516", summary: "Enhance GATE_IN/GATE_OUT CleverTap", assignee: "Mac", type: "Story", points: 3, status: "To Do", start: "2026-06-15", end: "2026-06-22", progress: 10, note: "Blocked on 515" },
          { key: "QA-26", summary: "UAT Sprint 26 deploy items", assignee: "Plai", type: "QA", points: 2, status: "Done", start: "2026-06-10", end: "2026-06-14", progress: 100, note: "UAT passed" },
        ]
      : [
          { key: "REL-25.04", summary: "CleverTap MAU filtering config", assignee: "Neung", type: "Patch", points: 2, status: "Done", start: "2026-06-03", end: "2026-06-10", progress: 100, note: "Deployed 10 Jun" },
          { key: "REL-25.03", summary: "Filter unnecessary logs", assignee: "Pui", type: "Improvement", points: 1, status: "Done", start: "2026-05-28", end: "2026-06-04", progress: 100, note: "Deployed 4 Jun" },
          { key: "VIMI-25", summary: "Remove subscription MVP1 BOF", assignee: "Zan", type: "Feature", points: 5, status: "Done", start: "2026-05-20", end: "2026-06-06", progress: 100, note: "" },
          { key: "TDM-25", summary: "Thanacity CleverTap ingestion", assignee: "Pan", type: "DE", points: 3, status: "Done", start: "2026-05-10", end: "2026-05-13", progress: 100, note: "Redshift go-live" },
        ],
  };
}

export const sprint26Tab = sprintTaskTab("26");
export const sprint25Tab = sprintTaskTab("25");
