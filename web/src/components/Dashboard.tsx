"use client";

import clsx from "clsx";
import { SHEET_TABS } from "@/data/tabs";
import { GanttChart } from "@/components/GanttChart";
import { SpreadsheetGrid } from "@/components/SpreadsheetGrid";
import { useState } from "react";
import { LayoutGrid, RefreshCw } from "lucide-react";

export function Dashboard() {
  const [activeId, setActiveId] = useState(SHEET_TABS[0].id);
  const activeTab = SHEET_TABS.find((t) => t.id === activeId) ?? SHEET_TABS[0];

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
      <header className="flex items-center justify-between border-b border-[#dadce0] bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-[#188038]" />
          <div>
            <h1 className="text-base font-semibold text-[#202124]">RD Project Tracker</h1>
            <p className="text-xs text-[#5f6368]">Milestone 1 — Sheet parity · Jira sync coming next</p>
          </div>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 rounded border border-[#dadce0] px-2 py-1 text-xs text-[#5f6368] hover:bg-[#f1f3f4]"
          title="Milestone 2: pull from Atlassian"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Sync Jira (soon)
        </button>
      </header>

      <nav className="flex gap-0 overflow-x-auto border-b border-[#dadce0] bg-[#e8eaed] px-2 pt-1">
        {SHEET_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveId(tab.id)}
            className={clsx(
              "sheet-tab shrink-0 rounded-t px-3 py-2 text-xs font-medium transition-colors",
              activeId === tab.id
                ? "bg-white text-[#188038] shadow-sm"
                : "text-[#5f6368] hover:bg-[#f1f3f4]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-4">
        {activeTab.description && (
          <p className="mb-3 text-xs text-[#5f6368]">{activeTab.description}</p>
        )}
        <SpreadsheetGrid key={activeTab.id} tab={activeTab} />
        <GanttChart tab={activeTab} />
      </main>
    </div>
  );
}
