import type { Vec3Tuple } from "@/types/math";
import { add, scale, subtract } from "@/math/vector";
import { bezierCurvePoints } from "@/math/bezier";

/**
 * A 4x4 basis matrix (row-major) turning a 4-point window into a cubic
 * curve segment. Catmull-Rom and uniform cubic B-splines are both "windowed
 * cubic" curves that differ only by this matrix — one shared evaluator
 * covers both instead of two separate formulas.
 */
export type SplineBasisMatrix = [
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number],
];

/** Catmull-Rom: interpolating — the curve passes through P1 and P2 (the middle two of each window). */
export const CATMULL_ROM_BASIS: SplineBasisMatrix = [
  [0, 2, 0, 0],
  [-1, 0, 1, 0],
  [2, -5, 4, -1],
  [-1, 3, -3, 1],
];
const CATMULL_ROM_SCALE = 0.5;

/** Uniform cubic B-spline: approximating — the curve stays near, but does not touch, the control points. */
export const B_SPLINE_BASIS: SplineBasisMatrix = [
  [1, 4, 1, 0],
  [-3, 0, 3, 0],
  [3, -6, 3, 0],
  [-1, 3, -3, 1],
];
const B_SPLINE_SCALE = 1 / 6;

function evaluateWindow(
  p0: Vec3Tuple,
  p1: Vec3Tuple,
  p2: Vec3Tuple,
  p3: Vec3Tuple,
  t: number,
  matrix: SplineBasisMatrix,
  matrixScale: number,
): Vec3Tuple {
  const tVec = [1, t, t * t, t * t * t];
  const coeffs = [0, 1, 2, 3].map((col) =>
    tVec.reduce((sum, tk, row) => sum + tk * matrix[row][col], 0),
  );
  const points = [p0, p1, p2, p3];
  let result: Vec3Tuple = [0, 0, 0];
  coeffs.forEach((c, i) => {
    result = add(result, scale(points[i], c * matrixScale));
  });
  return result;
}

/**
 * Pads the point list with phantom endpoints (mirroring the first/last
 * segment) so every real point has a well-defined 4-point window, then
 * samples the full windowed-cubic curve through all segments.
 */
export function windowedSplinePoints(
  anchors: Vec3Tuple[],
  matrix: SplineBasisMatrix,
  matrixScale: number,
  segmentsPerSpan = 24,
): Vec3Tuple[] {
  if (anchors.length < 2) return anchors;
  const first = add(anchors[0], subtract(anchors[0], anchors[1]));
  const last = add(
    anchors[anchors.length - 1],
    subtract(anchors[anchors.length - 1], anchors[anchors.length - 2]),
  );
  const padded = [first, ...anchors, last];

  const points: Vec3Tuple[] = [];
  for (let i = 0; i < padded.length - 3; i++) {
    const [p0, p1, p2, p3] = [padded[i], padded[i + 1], padded[i + 2], padded[i + 3]];
    for (let s = 0; s <= segmentsPerSpan; s++) {
      if (i > 0 && s === 0) continue; // avoid duplicating the shared joint
      points.push(
        evaluateWindow(p0, p1, p2, p3, s / segmentsPerSpan, matrix, matrixScale),
      );
    }
  }
  return points;
}

export function catmullRomPoints(
  anchors: Vec3Tuple[],
  segmentsPerSpan = 24,
): Vec3Tuple[] {
  return windowedSplinePoints(
    anchors,
    CATMULL_ROM_BASIS,
    CATMULL_ROM_SCALE,
    segmentsPerSpan,
  );
}

export function bSplinePoints(anchors: Vec3Tuple[], segmentsPerSpan = 24): Vec3Tuple[] {
  return windowedSplinePoints(anchors, B_SPLINE_BASIS, B_SPLINE_SCALE, segmentsPerSpan);
}

/**
 * A "Bézier spline": a chain of cubic Bézier segments through every anchor,
 * with the handle at each interior anchor set from its neighbors' midpoint
 * direction (the standard Catmull-Rom-derived tangent) so segments meet
 * smoothly (C1 continuity) instead of with a visible kink.
 */
export function bezierSplineHandles(
  anchors: Vec3Tuple[],
): { in: Vec3Tuple; out: Vec3Tuple }[] {
  return anchors.map((p, i) => {
    const prev = anchors[i - 1] ?? p;
    const next = anchors[i + 1] ?? p;
    const tangent = scale(subtract(next, prev), 1 / 6);
    return { in: subtract(p, tangent), out: add(p, tangent) };
  });
}

export function bezierSplinePoints(
  anchors: Vec3Tuple[],
  segmentsPerSpan = 24,
): Vec3Tuple[] {
  if (anchors.length < 2) return anchors;
  const handles = bezierSplineHandles(anchors);
  const points: Vec3Tuple[] = [];
  for (let i = 0; i < anchors.length - 1; i++) {
    const segment = bezierCurvePoints(
      [anchors[i], handles[i].out, handles[i + 1].in, anchors[i + 1]],
      segmentsPerSpan,
    );
    points.push(...(i > 0 ? segment.slice(1) : segment));
  }
  return points;
}
