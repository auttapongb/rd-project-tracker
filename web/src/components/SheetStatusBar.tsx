"use client";

type Props = {
  selectedCell: string | null;
  visibleRows: number;
  totalRows: number;
  totalCols: number;
  sumSelection?: string;
  dark?: boolean;
};

export function SheetStatusBar({ selectedCell, visibleRows, totalRows, totalCols, sumSelection, dark }: Props) {
  return (
    <footer
      className={`flex shrink-0 items-center gap-4 border-t px-3 py-1 text-[10px] ${
        dark ? "border-[#3c4043] bg-[#202124] text-[#9aa0a6]" : "border-[#dadce0] bg-[#f8f9fa] text-[#5f6368]"
      }`}
    >
      <span>Ready</span>
      {selectedCell ? <span>Cell: {selectedCell}</span> : null}
      <span>{visibleRows} / {totalRows} rows</span>
      <span>{totalCols} columns</span>
      {sumSelection ? <span className="ml-auto font-medium">{sumSelection}</span> : <span className="ml-auto">RD Project Tracker</span>}
    </footer>
  );
}
