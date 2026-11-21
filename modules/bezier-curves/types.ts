import type { Vec3Tuple } from "@/types/math";

export type BezierDegree = "linear" | "quadratic" | "cubic";

export const DEGREE_POINT_COUNT: Record<BezierDegree, number> = {
  linear: 2,
  quadratic: 3,
  cubic: 4,
};

export const DEGREE_LABELS: { id: BezierDegree; label: string }[] = [
  { id: "linear", label: "Linear" },
  { id: "quadratic", label: "Quadratic" },
  { id: "cubic", label: "Cubic" },
];

export const POINT_LABELS = ["P0", "P1", "P2", "P3"];

export const DEFAULT_CONTROL_POINTS: Record<BezierDegree, Vec3Tuple[]> = {
  linear: [
    [-2, -1, 0],
    [2, 1, 0],
  ],
  quadratic: [
    [-2.5, -1, 0],
    [0, 2, 0.5],
    [2.5, -1, 0],
  ],
  cubic: [
    [-2.8, -1.2, 0],
    [-1, 1.8, 1],
    [1, 1.8, -1],
    [2.8, -1.2, 0],
  ],
};

export function randomControlPoints(degree: BezierDegree): Vec3Tuple[] {
  const count = DEGREE_POINT_COUNT[degree];
  const rand = (range: number) => Math.round((Math.random() * range * 2 - range) * 2) / 2;
  const points: Vec3Tuple[] = [];
  for (let i = 0; i < count; i++) {
    const x = -3 + (6 * i) / (count - 1) + rand(0.4);
    points.push([x, rand(2), rand(1.2)]);
  }
  return points;
}
