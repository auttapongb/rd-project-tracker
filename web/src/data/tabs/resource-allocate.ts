import { ROLE_OPTIONS, STATUS_OPTIONS, type SheetTab } from "@/types/sheet";

export const resourceAllocateTab: SheetTab = {
  id: "resource-allocate",
  label: "Resource Allocate",
  description: "Cross-project resource allocation matrix",
  columns: [
    { id: "project", header: "Project", width: 200, sticky: true, headerColor: "#e69138" },
    { id: "resource", header: "Resource", width: 140, headerColor: "#e69138" },
    { id: "role", header: "Role", width: 90, type: "select", options: [...ROLE_OPTIONS], headerColor: "#e69138" },
    { id: "allocation", header: "Allocation %", width: 110, type: "percent", headerColor: "#e69138" },
    { id: "sprint", header: "Sprint", width: 80, headerColor: "#e69138" },
    { id: "start", header: "Start", width: 100, type: "date", headerColor: "#e69138" },
    { id: "end", header: "End", width: 100, type: "date", headerColor: "#e69138" },
    { id: "status", header: "Status", width: 120, type: "select", options: [...STATUS_OPTIONS], headerColor: "#e69138" },
    { id: "note", header: "Note", width: 200, headerColor: "#e69138" },
  ],
  rows: [
    { project: "Receipt not generate fix", resource: "Pui", role: "Dev", allocation: 40, sprint: "26", start: "2026-06-10", end: "2026-06-17", status: "In Progress", note: "Prod deploy 17 Jun" },
    { project: "Coupon upload optimize", resource: "Neung", role: "Dev", allocation: 35, sprint: "26", start: "2026-06-05", end: "2026-06-17", status: "In Progress", note: "Mongo bulk update" },
    { project: "Thana Callback API #2", resource: "Mac", role: "Dev", allocation: 60, sprint: "26", start: "2026-06-09", end: "2026-06-20", status: "In Progress", note: "RDTHANA-515" },
    { project: "CleverTap GATE_IN/OUT", resource: "Mac", role: "Dev", allocation: 30, sprint: "26", start: "2026-06-12", end: "2026-06-22", status: "To Do", note: "Depends RDTHANA-515" },
    { project: "AWS Migration", resource: "Win", role: "SA", allocation: 50, sprint: "26", start: "2026-06-01", end: "2026-07-15", status: "In Progress", note: "" },
    { project: "Pay with Point", resource: "Aom", role: "PM", allocation: 25, sprint: "26", start: "2026-06-01", end: "2026-06-30", status: "In Progress", note: "" },
    { project: "Sprint 26 QA", resource: "Plai", role: "QA", allocation: 70, sprint: "26", start: "2026-06-10", end: "2026-06-18", status: "In Progress", note: "UAT passed" },
  ],
};
