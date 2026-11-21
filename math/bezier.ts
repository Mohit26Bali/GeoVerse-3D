import type { Vec3Tuple } from "@/types/math";
import { lerp, subtract } from "@/math/vector";

/**
 * De Casteljau's algorithm: repeatedly lerp each consecutive pair of points
 * by t until one point remains. Works for any degree — linear (2 points),
 * quadratic (3), cubic (4), or higher — with no per-degree formula needed.
 * Returns every intermediate level, since that's exactly what the classic
 * "nested interpolation lines converging to a point" visualization needs.
 */
export function deCasteljauLevels(controlPoints: Vec3Tuple[], t: number): Vec3Tuple[][] {
  const levels: Vec3Tuple[][] = [controlPoints];
  let current = controlPoints;
  while (current.length > 1) {
    const next: Vec3Tuple[] = [];
    for (let i = 0; i < current.length - 1; i++) {
      next.push(lerp(current[i], current[i + 1], t));
    }
    levels.push(next);
    current = next;
  }
  return levels;
}

/** The point on the Bézier curve at parameter t (0..1). */
export function bezierPoint(controlPoints: Vec3Tuple[], t: number): Vec3Tuple {
  const levels = deCasteljauLevels(controlPoints, t);
  return levels[levels.length - 1][0];
}

/**
 * The tangent direction at parameter t. The derivative of a degree-n Bézier
 * is n times a degree-(n-1) Bézier built from the differences between
 * consecutive control points — so this reuses `bezierPoint` rather than a
 * separate formula.
 */
export function bezierTangent(controlPoints: Vec3Tuple[], t: number): Vec3Tuple {
  if (controlPoints.length < 2) return [0, 0, 0];
  const n = controlPoints.length - 1;
  const differences: Vec3Tuple[] = [];
  for (let i = 0; i < controlPoints.length - 1; i++) {
    differences.push(subtract(controlPoints[i + 1], controlPoints[i]));
  }
  const derivative = bezierPoint(differences, t);
  return [derivative[0] * n, derivative[1] * n, derivative[2] * n];
}

/** Samples the curve for smooth rendering. */
export function bezierCurvePoints(
  controlPoints: Vec3Tuple[],
  segments = 64,
): Vec3Tuple[] {
  const points: Vec3Tuple[] = [];
  for (let i = 0; i <= segments; i++) {
    points.push(bezierPoint(controlPoints, i / segments));
  }
  return points;
}
