import { projectsTab } from "./projects";
import { resourceAllocateTab } from "./resource-allocate";
import { sprintResourceTab } from "./sprint-resource";
import { sprint25Tab, sprint26Tab, summarizeSprint25Tab, summarizeSprint26Tab } from "./sprints";
import type { SheetTab } from "@/types/sheet";

export const SHEET_TABS: SheetTab[] = [
  projectsTab,
  sprintResourceTab,
  resourceAllocateTab,
  summarizeSprint26Tab,
  sprint26Tab,
  summarizeSprint25Tab,
  sprint25Tab,
];

export function getTabById(id: string): SheetTab | undefined {
  return SHEET_TABS.find((t) => t.id === id);
}
