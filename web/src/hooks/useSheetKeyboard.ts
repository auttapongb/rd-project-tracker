"use client";

import { useEffect } from "react";
import { colLetter } from "@/lib/sheet-utils";

type Cell = { r: number; c: number };

type Args = {
  selected: Cell | null;
  rowCount: number;
  colCount: number;
  onMove: (cell: Cell) => void;
  onEdit?: (key: string) => void;
  enabled?: boolean;
};

export function useSheetKeyboard({
  selected,
  rowCount,
  colCount,
  onMove,
  onEdit,
  enabled = true,
}: Args) {
  useEffect(() => {
    if (!enabled || !selected) return;

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT") {
        if (e.key === "Escape") t.blur();
        return;
      }

      const { r, c } = selected;
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (r > 0) onMove({ r: r - 1, c });
          break;
        case "ArrowDown":
          e.preventDefault();
          if (r < rowCount - 1) onMove({ r: r + 1, c });
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (c > 0) onMove({ r, c: c - 1 });
          break;
        case "ArrowRight":
        case "Tab":
          e.preventDefault();
          if (c < colCount - 1) onMove({ r, c: c + 1 });
          break;
        case "Enter":
          e.preventDefault();
          if (r < rowCount - 1) onMove({ r: r + 1, c });
          break;
        case "F2":
          e.preventDefault();
          onEdit?.("F2");
          break;
        default:
          if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && onEdit) {
            onEdit(e.key);
          }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, rowCount, colCount, onMove, onEdit, enabled]);
}

export function cellLabel(r: number, c: number): string {
  return `${colLetter(c)}${r + 1}`;
}
