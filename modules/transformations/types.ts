export type TransformOp = "translate" | "scale" | "rotate" | "reflect" | "shear";

export const TRANSFORM_OPS: { id: TransformOp; label: string }[] = [
  { id: "translate", label: "Translate" },
  { id: "scale", label: "Scale" },
  { id: "rotate", label: "Rotate" },
  { id: "reflect", label: "Reflect" },
  { id: "shear", label: "Shear" },
];
