import { ROLE_OPTIONS, type SheetTab } from "@/types/sheet";

export const sprintResourceTab: SheetTab = {
  id: "sprint-resource",
  label: "Sprint Resource",
  description: "Team capacity and role assignment per sprint",
  columns: [
    { id: "name", header: "Name", width: 140, sticky: true, headerColor: "#674ea7" },
    { id: "role", header: "Role", width: 90, type: "select", options: [...ROLE_OPTIONS], headerColor: "#674ea7" },
    { id: "team", header: "Team", width: 100, headerColor: "#674ea7" },
    { id: "sprint", header: "Sprint", width: 80, headerColor: "#674ea7" },
    { id: "capacity", header: "Capacity %", width: 100, type: "percent", headerColor: "#674ea7" },
    { id: "allocated", header: "Allocated %", width: 110, type: "percent", headerColor: "#674ea7" },
    { id: "projects", header: "Projects", width: 220, headerColor: "#674ea7" },
    { id: "note", header: "Note", width: 200, headerColor: "#674ea7" },
  ],
  rows: [
    { name: "Pui Wigrom Naddakul", role: "Dev", team: "RR", sprint: "26", capacity: 100, allocated: 85, projects: "Vimi Termination, Order Service", note: "Deploy 17 Jun" },
    { name: "Neung Tawatchai Anuchat", role: "Dev", team: "RR", sprint: "26", capacity: 100, allocated: 80, projects: "RR Scheduler, Receipt fix", note: "" },
    { name: "Mac: Jarupong Pawichpongkul", role: "Dev", team: "Thana", sprint: "26", capacity: 100, allocated: 90, projects: "RDTHANA-515, RDTHANA-516", note: "Callback API" },
    { name: "Plai Thanaporn Rimnong-ang", role: "QA", team: "RR", sprint: "26", capacity: 100, allocated: 70, projects: "Sprint 26 UAT", note: "" },
    { name: "Aom: Pornsawan Polnyiem", role: "PM", team: "RR", sprint: "26", capacity: 100, allocated: 60, projects: "Pay with Point", note: "" },
    { name: "Zan : Isarapong Bulan", role: "PM", team: "RR", sprint: "26", capacity: 100, allocated: 75, projects: "Thana City, Vimi", note: "" },
    { name: "Win", role: "SA", team: "Infra", sprint: "26", capacity: 80, allocated: 50, projects: "AWS Migration", note: "Part-time" },
    { name: "Pan:Paliwan Boonhian", role: "DE", team: "Data", sprint: "26", capacity: 100, allocated: 85, projects: "Thana Datamart, Redshift", note: "" },
  ],
};
