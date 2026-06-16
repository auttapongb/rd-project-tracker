export type CellStyleMeta = {
  bg?: string;
  bold?: boolean;
  align?: "left" | "center" | "right";
  color?: string;
  italic?: boolean;
};

export type MergeRange = {
  r: number;
  c: number;
  rs: number;
  cs: number;
};

export type ImportedTab = {
  id: string;
  label: string;
  headerRows: number;
  headerColor: string;
  tabColor: string;
  selectColumnIndexes: number[];
  columnWidths: number[];
  freezeCols: number;
  rawRows: string[][];
  merges: MergeRange[];
  cellStyles: Record<string, CellStyleMeta>;
};

export type TabManifestEntry = {
  id: string;
  label: string;
  file: string;
  rows: number;
  cols: number;
  tabColor: string;
};
