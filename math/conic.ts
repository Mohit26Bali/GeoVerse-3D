import type { Vec3Tuple } from "@/types/math";
import { add, orthonormalBasis, scale } from "@/math/vector";

export type ConicKind = "circle" | "ellipse" | "parabola" | "hyperbola";

export interface ConicCoefficients {
  a: number;
  b: number;
  c: number;
}

/**
 * The double cone x² + z² = (k·y)², apex at the world origin, axis along Y.
 * `k` is the tangent of the cone's half-angle.
 */
export function coneHalfAngleTan(halfAngleDeg: number): number {
  return Math.tan((halfAngleDeg * Math.PI) / 180);
}

/**
 * Coefficients of the s², st, t² terms when the cone is sliced by a plane
 * through the origin's local frame, spanned by orthonormal `u`, `v` — i.e.
 * substituting a point in the plane, (s·u + t·v), into the cone equation.
 * These are exactly what the discriminant test (B² - 4AC) needs.
 */
export function conicCoefficients(
  u: Vec3Tuple,
  v: Vec3Tuple,
  k: number,
): ConicCoefficients {
  const a = u[0] * u[0] + u[2] * u[2] - k * k * u[1] * u[1];
  const c = v[0] * v[0] + v[2] * v[2] - k * k * v[1] * v[1];
  const b = 2 * (u[0] * v[0] + u[2] * v[2] - k * k * u[1] * v[1]);
  return { a, b, c };
}

export function classifyConic({ a, b, c }: ConicCoefficients, epsilon = 0.05): ConicKind {
  const discriminant = b * b - 4 * a * c;
  if (Math.abs(discriminant) < epsilon) return "parabola";
  if (discriminant < 0) {
    return Math.abs(a - c) < epsilon && Math.abs(b) < epsilon ? "circle" : "ellipse";
  }
  return "hyperbola";
}

/** The one tilt angle (in degrees, measured the same way `ExploreView` builds its plane normal) where the cut transitions from ellipse to hyperbola. */
export function findParabolaTiltDeg(k: number): number {
  const discriminantAt = (tiltDeg: number) => {
    const rad = (tiltDeg * Math.PI) / 180;
    const normal: Vec3Tuple = [Math.sin(rad), Math.cos(rad), 0];
    const [u, v] = orthonormalBasis(normal);
    const { a, b, c } = conicCoefficients(u, v, k);
    return b * b - 4 * a * c;
  };
  let lo = 0;
  let hi = 89;
  for (let iter = 0; iter < 40; iter++) {
    const mid = (lo + hi) / 2;
    if (discriminantAt(mid) < 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function coneImplicitLocal(
  origin: Vec3Tuple,
  u: Vec3Tuple,
  v: Vec3Tuple,
  k: number,
  s: number,
  t: number,
): number {
  const x = origin[0] + s * u[0] + t * v[0];
  const y = origin[1] + s * u[1] + t * v[1];
  const z = origin[2] + s * u[2] + t * v[2];
  return x * x + z * z - k * k * y * y;
}

/**
 * Traces the intersection of a plane (through `origin`, with the given
 * `normal`) with the double cone via marching squares over the plane's own
 * local (s, t) coordinates. Returns disjoint 3D line segments — this
 * correctly renders a hyperbola's two separate branches with no
 * special-casing, since marching squares finds whatever zero-crossings
 * exist without needing to know the curve's type in advance.
 */
export function planeConeIntersection(
  origin: Vec3Tuple,
  normal: Vec3Tuple,
  k: number,
  range = 6,
  resolution = 90,
): [Vec3Tuple, Vec3Tuple][] {
  const [u, v] = orthonormalBasis(normal);
  const step = (range * 2) / resolution;
  const segments: [Vec3Tuple, Vec3Tuple][] = [];

  const grid: number[][] = [];
  for (let i = 0; i <= resolution; i++) {
    const row: number[] = [];
    for (let j = 0; j <= resolution; j++) {
      row.push(coneImplicitLocal(origin, u, v, k, -range + i * step, -range + j * step));
    }
    grid.push(row);
  }

  const toWorld = (s: number, t: number): Vec3Tuple =>
    add(origin, add(scale(u, s), scale(v, t)));

  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const s0 = -range + i * step;
      const s1 = s0 + step;
      const t0 = -range + j * step;
      const t1 = t0 + step;

      const corners: [number, number, number][] = [
        [s0, t0, grid[i][j]],
        [s1, t0, grid[i + 1][j]],
        [s1, t1, grid[i + 1][j + 1]],
        [s0, t1, grid[i][j + 1]],
      ];

      const crossings: [number, number][] = [];
      for (let e = 0; e < 4; e++) {
        const [as, at, af] = corners[e];
        const [bs, bt, bf] = corners[(e + 1) % 4];
        if (af < 0 !== bf < 0) {
          const frac = af / (af - bf);
          crossings.push([as + (bs - as) * frac, at + (bt - at) * frac]);
        }
      }

      if (crossings.length === 2) {
        segments.push([toWorld(...crossings[0]), toWorld(...crossings[1])]);
      }
      // A 4-crossing saddle cell is possible in principle but vanishingly
      // rare at this resolution near a cone's apex — skipped rather than
      // disambiguated, since it isn't needed for a clean visualization.
    }
  }

  return segments;
}
