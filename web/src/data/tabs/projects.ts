import { STATUS_OPTIONS, type SheetTab } from "@/types/sheet";

const months2025 = [
  "jan_2025", "feb_2025", "mar_2025", "apr_2025", "may_2025", "jun_2025",
  "jul_2025", "aug_2025", "sep_2025", "oct_2025", "nov_2025", "dec_2025",
];
const months2026 = [
  "jan_2026", "feb_2026", "mar_2026", "apr_2026", "may_2026", "jun_2026",
  "jul_2026", "aug_2026", "sep_2026", "oct_2026", "nov_2026", "dec_2026",
];

const monthHeaders = [
  ...months2025.map((m) => ({ id: m, header: m.replace("_", " ").toUpperCase(), width: 72, type: "text" as const })),
  ...months2026.map((m) => ({ id: m, header: m.replace("_", " ").toUpperCase(), width: 72, type: "text" as const })),
];

export const projectsTab: SheetTab = {
  id: "projects",
  label: "Projects",
  description: "RD project portfolio — parity with Google Sheet Projects tab",
  columns: [
    { id: "num", header: "#", width: 40, sticky: true, headerColor: "#188038" },
    { id: "project", header: "Projects", width: 220, sticky: true, headerColor: "#188038" },
    { id: "pm", header: "PM", width: 100, headerColor: "#188038" },
    { id: "progress", header: "TASK COMPLETE", width: 110, type: "percent", headerColor: "#188038" },
    { id: "status", header: "Status", width: 120, type: "select", options: [...STATUS_OPTIONS], headerColor: "#188038" },
    { id: "note", header: "Note", width: 260, headerColor: "#188038" },
    ...monthHeaders.map((c) => ({ ...c, headerColor: "#188038" })),
  ],
  rows: [
    { num: 1, project: "Adjust", pm: "Zan", progress: 100, status: "Done", note: "", mar_2025: "■" },
    { num: 2, project: "CleverTap", pm: "Jack", progress: 100, status: "Done", note: "", apr_2025: "■" },
    { num: 3, project: "Ecommerce Shopify", pm: "Aek", progress: 100, status: "Done", note: "", may_2025: "■" },
    { num: 4, project: "AWS Migration", pm: "A", progress: 30, status: "In Progress", note: "Dev 85%, UAT 0%, Prod 0%", jun_2026: "◐" },
    { num: 5, project: "Thana Datamart API (New Datamart)", pm: "Zan", progress: 80, status: "In Progress", note: "Timeline", jun_2026: "◐" },
    { num: 6, project: "Thana City (Out of Scope OM)", pm: "Zan, Aek", progress: 60, status: "In Progress", note: "POS transaction API, Shopify webhook", jun_2026: "◐" },
    { num: 7, project: "Vimi Termination", pm: "Zan, Aek", progress: 60, status: "In Progress", note: "Plan deploy 17 Jun", jun_2026: "◐" },
    { num: 8, project: "New Point Engine", pm: "Aom, Jack", progress: 15, status: "In Progress", note: "Timeline", jul_2026: "○" },
    { num: 9, project: "Subscription Short-Distance", pm: "Aek, Zan", progress: 100, status: "Done", note: "RR App and A920", may_2025: "■" },
    { num: 10, project: "Pay with Point", pm: "Aom, Zan", progress: 90, status: "In Progress", note: "Timeline", jun_2026: "◐" },
    { num: 11, project: "Turtle Plus member tier upgrade & downgrade", pm: "Zan", progress: 10, status: "In Progress", note: "Downgrade -> run script", aug_2026: "○" },
    { num: 12, project: "PayPoint (Point Marketplace) integration", pm: "Zan, Aek", progress: 0, status: "In Progress", note: "Provided spec", sep_2026: "○" },
    { num: 13, project: "SSO Migration", pm: "A", progress: 0, status: "To Do", note: "", oct_2026: "○" },
    { num: 14, project: "Cloud Samsung", pm: "", progress: 0, status: "In Progress", note: "", nov_2026: "○" },
    { num: 15, project: "Unified App", pm: "", progress: 0, status: "In Progress", note: "", dec_2026: "○" },
    { num: 16, project: "Tech Debt", pm: "", progress: 0, status: "In Progress", note: "", jun_2026: "◐" },
  ],
};
