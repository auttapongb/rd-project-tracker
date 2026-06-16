export type CellType = "text" | "number" | "percent" | "select" | "date" | "link";

export type ColumnDef = {
  id: string;
  header: string;
  width?: number;
  type?: CellType;
  options?: string[];
  sticky?: boolean;
  headerColor?: string;
  cellColor?: string;
};

export type SheetRow = Record<string, string | number | null>;

export type SheetTab = {
  id: string;
  label: string;
  description?: string;
  columns: ColumnDef[];
  rows: SheetRow[];
  gantt?: {
    taskField: string;
    startField: string;
    endField: string;
    progressField?: string;
  };
};

export const STATUS_OPTIONS = ["Done", "In Progress", "To Do", "Blocked"] as const;
export const ROLE_OPTIONS = ["Dev", "SA", "QA", "PM", "DevOps", "DE"] as const;

export const STATUS_COLORS: Record<string, string> = {
  Done: "#b7e1cd",
  "In Progress": "#fce8b2",
  "To Do": "#ffffff",
  Blocked: "#f4c7c3",
};
