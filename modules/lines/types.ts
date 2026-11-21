export type LineOp = "point-distance" | "line-line";

export const LINE_OPS: { id: LineOp; label: string }[] = [
  { id: "point-distance", label: "Point Distance" },
  { id: "line-line", label: "Line-Line" },
];
