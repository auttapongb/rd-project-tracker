"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { Task } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { parseJiraDate, statusProgress } from "@/lib/sheet-utils";
import type { ImportedTab } from "@/components/ImportedSpreadsheet";

const Gantt = dynamic(
  () => import("gantt-task-react").then((m) => m.Gantt),
  { ssr: false, loading: () => <div className="p-4 text-xs text-[#5f6368]">Loading timeline…</div> },
);

type Props = { tab: ImportedTab };

function buildTasks(tab: ImportedTab): Task[] {
  const header = tab.rawRows[tab.headerRows - 1] ?? tab.rawRows[0] ?? [];
  const idx = (name: string) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());
  const summaryIdx = idx("Summary");
  const keyIdx = idx("Issue key");
  const createdIdx = idx("Created");
  const dueIdx = idx("Due date");
  const statusIdx = idx("Status");
  if (summaryIdx < 0 || createdIdx < 0) return [];

  const tasks: Task[] = [];

  tab.rawRows.slice(tab.headerRows).forEach((row, i) => {
    const summary = row[summaryIdx]?.trim();
    if (!summary) return;
    const start = parseJiraDate(row[createdIdx] ?? "");
    let end = parseJiraDate(row[dueIdx] ?? "");
    if (!start) return;
    if (!end || end <= start) {
      end = new Date(start);
      end.setDate(end.getDate() + 7);
    }
    const status = row[statusIdx] ?? "";
    const key = row[keyIdx] ?? `row-${i}`;
    tasks.push({
      id: String(key),
      name: summary.length > 48 ? `${summary.slice(0, 45)}…` : summary,
      start,
      end,
      progress: statusProgress(status),
      type: "task",
      styles: {
        progressColor: "#81c995",
        progressSelectedColor: "#188038",
        backgroundColor: "#a8dab5",
        backgroundSelectedColor: "#188038",
      },
    });
  });

  return tasks.slice(0, 120);
}

export function SprintTimeline({ tab }: Props) {
  const tasks = useMemo(() => buildTasks(tab), [tab]);

  if (tasks.length === 0) {
    return (
      <div className="rounded-md border border-[#dadce0] bg-white p-4 text-xs text-[#5f6368]">
        No dated issues found for timeline view.
      </div>
    );
  }

  return (
    <div className="gantt-task-wrap overflow-hidden rounded-md border border-[#dadce0] bg-white shadow-sm">
      <div className="border-b border-[#dadce0] bg-[#f8f9fa] px-3 py-2 text-xs text-[#5f6368]">
        Timeline — {tasks.length} tasks (gantt-task-react, MIT) · drag bars · zoom with toolbar
      </div>
      <div className="max-h-[420px] overflow-auto">
        <Gantt
          tasks={tasks}
          listCellWidth="220px"
          columnWidth={52}
          rowHeight={36}
          barCornerRadius={2}
          barFill={60}
          todayColor="rgba(26, 115, 232, 0.12)"
          TooltipContent={({ task }) => (
            <div className="rounded bg-[#202124] px-2 py-1 text-[11px] text-white">
              <div className="font-semibold">{task.name}</div>
              <div>{task.start.toLocaleDateString()} → {task.end.toLocaleDateString()}</div>
              <div>{task.progress}% complete</div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
