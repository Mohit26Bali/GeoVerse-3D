export type PlaneOp = "distance" | "three-point" | "line-plane" | "plane-plane";

export const PLANE_OPS: { id: PlaneOp; label: string }[] = [
  { id: "distance", label: "Distance" },
  { id: "three-point", label: "Three Points" },
  { id: "line-plane", label: "Line-Plane" },
  { id: "plane-plane", label: "Plane-Plane" },
];
