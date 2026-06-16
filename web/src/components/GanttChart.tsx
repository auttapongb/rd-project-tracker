"use client";

import { useEffect, useRef } from "react";
import Gantt from "frappe-gantt";
import type { SheetTab } from "@/types/sheet";

type Props = {
  tab: SheetTab;
};

export function GanttChart({ tab }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !tab.gantt) return;

    const { taskField, startField, endField, progressField } = tab.gantt;
    const tasks = tab.rows
      .filter((r) => r[startField] && r[endField])
      .map((r, i) => ({
        id: String(r.key ?? i),
        name: String(r[taskField] ?? "Task"),
        start: String(r[startField]),
        end: String(r[endField]),
        progress: progressField ? Number(r[progressField] ?? 0) : 0,
      }));

    ref.current.innerHTML = "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (Gantt as any)(ref.current, tasks, {
      view_mode: "Week",
      bar_height: 22,
      padding: 16,
      date_format: "YYYY-MM-DD",
    });
  }, [tab]);

  if (!tab.gantt) return null;

  return (
    <div className="mt-4 rounded-md border border-[#dadce0] bg-white p-3">
      <h3 className="mb-2 text-sm font-semibold text-[#202124]">Timeline (Frappe Gantt)</h3>
      <div ref={ref} className="gantt-container overflow-x-auto" />
    </div>
  );
}
