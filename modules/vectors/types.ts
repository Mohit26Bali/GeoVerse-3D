export type VectorOp = "add" | "subtract" | "scale" | "dot" | "project" | "cross";

export const VECTOR_OPS: { id: VectorOp; label: string }[] = [
  { id: "add", label: "Add" },
  { id: "subtract", label: "Subtract" },
  { id: "scale", label: "Scale" },
  { id: "dot", label: "Dot" },
  { id: "project", label: "Project" },
  { id: "cross", label: "Cross" },
];
