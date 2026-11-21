export type SphereOp = "chord" | "cross-section" | "water-fill";

export const SPHERE_OPS: { id: SphereOp; label: string }[] = [
  { id: "chord", label: "Chord & Great Circle" },
  { id: "cross-section", label: "Cross Section" },
  { id: "water-fill", label: "Water Fill" },
];
