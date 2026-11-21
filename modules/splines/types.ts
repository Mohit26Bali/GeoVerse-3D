import type { Vec3Tuple } from "@/types/math";

export type SplineKind = "catmull-rom" | "bezier-spline" | "b-spline";

export const SPLINE_KINDS: {
  id: SplineKind;
  label: string;
  passesThroughAnchors: boolean;
}[] = [
  { id: "catmull-rom", label: "Catmull-Rom", passesThroughAnchors: true },
  { id: "bezier-spline", label: "Bézier Spline", passesThroughAnchors: true },
  { id: "b-spline", label: "B-Spline", passesThroughAnchors: false },
];

export const ANCHOR_LABELS = ["A0", "A1", "A2", "A3", "A4", "A5"];

export const DEFAULT_ANCHORS: Vec3Tuple[] = [
  [-3.5, -0.5, 0],
  [-2, 1.2, 0.8],
  [-0.5, -1, -0.8],
  [1, 1.5, 0.6],
  [2.5, -0.3, -0.5],
  [3.8, 1, 0],
];

export function randomAnchors(count = 5): Vec3Tuple[] {
  const rand = (range: number) => Math.round((Math.random() * range * 2 - range) * 2) / 2;
  const anchors: Vec3Tuple[] = [];
  for (let i = 0; i < count; i++) {
    const x = -3.5 + (7 * i) / (count - 1) + rand(0.3);
    anchors.push([x, rand(1.6), rand(1)]);
  }
  return anchors;
}
