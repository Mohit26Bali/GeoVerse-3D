/**
 * 2x2-specific linear algebra: rank, null space, and real eigen-decomposition
 * with closed-form formulas — used by the Linear Algebra Playground, where
 * everything lives on the ground plane (x, z) so it can share rendering with
 * the rest of the platform. For general NxN work (determinant/inverse/rank
 * via mathjs), see math/matrix.ts.
 */

export type Vec2 = [number, number];
export type Mat2 = [[number, number], [number, number]];

export function toMat2(i: Vec2, j: Vec2): Mat2 {
  return [
    [i[0], j[0]],
    [i[1], j[1]],
  ];
}

export function apply2(m: Mat2, v: Vec2): Vec2 {
  return [m[0][0] * v[0] + m[0][1] * v[1], m[1][0] * v[0] + m[1][1] * v[1]];
}

export function det2(m: Mat2): number {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

function length2(v: Vec2): number {
  return Math.hypot(v[0], v[1]);
}

export function normalize2(v: Vec2): Vec2 {
  const len = length2(v);
  if (len < 1e-9) return [0, 0];
  return [v[0] / len, v[1] / len];
}

function cross2(a: Vec2, b: Vec2): number {
  return a[0] * b[1] - a[1] * b[0];
}

/** True if two directions are parallel (or anti-parallel), within an angular tolerance. */
export function isParallel(a: Vec2, b: Vec2, tolerance = 0.05): boolean {
  if (length2(a) < 1e-6 || length2(b) < 1e-6) return false;
  const na = normalize2(a);
  const nb = normalize2(b);
  return Math.abs(cross2(na, nb)) < tolerance;
}

export type RankKind = 0 | 1 | 2;

export function rank2x2(m: Mat2, eps = 0.04): RankKind {
  const cols: Vec2[] = [
    [m[0][0], m[1][0]],
    [m[0][1], m[1][1]],
  ];
  const bothTiny = cols.every((c) => length2(c) < eps);
  if (bothTiny) return 0;
  if (Math.abs(det2(m)) < eps) return 1;
  return 2;
}

export type NullSpaceKind = "trivial" | "line" | "everything";

export interface NullSpaceResult {
  kind: NullSpaceKind;
  direction: Vec2 | null;
}

/** The null space of a 2x2 matrix: the origin only, a line, or the whole plane. */
export function nullSpace2x2(m: Mat2, eps = 0.04): NullSpaceResult {
  const rank = rank2x2(m, eps);
  if (rank === 2) return { kind: "trivial", direction: null };
  if (rank === 0) return { kind: "everything", direction: null };

  const row0: Vec2 = [m[0][0], m[0][1]];
  const row1: Vec2 = [m[1][0], m[1][1]];
  const row = length2(row0) >= length2(row1) ? row0 : row1;
  // A vector (x, y) satisfies row0·(x,y) = 0 when (x, y) = (row[1], -row[0]).
  return { kind: "line", direction: normalize2([row[1], -row[0]]) };
}

export type ColumnSpaceKind = "origin" | "line" | "plane";

export interface ColumnSpaceResult {
  kind: ColumnSpaceKind;
  direction: Vec2 | null;
}

/** The column space (= span of the matrix's columns): the origin only, a line, or the whole plane. */
export function columnSpace2x2(m: Mat2, eps = 0.04): ColumnSpaceResult {
  const rank = rank2x2(m, eps);
  if (rank === 0) return { kind: "origin", direction: null };
  if (rank === 2) return { kind: "plane", direction: null };

  const colI: Vec2 = [m[0][0], m[1][0]];
  const colJ: Vec2 = [m[0][1], m[1][1]];
  const direction = length2(colI) >= length2(colJ) ? colI : colJ;
  return { kind: "line", direction: normalize2(direction) };
}

export interface RealEigenResult {
  values: [number, number];
  vectors: [Vec2, Vec2];
  repeated: boolean;
}

/** Closed-form real eigen-decomposition of a 2x2 matrix, or null if its eigenvalues are complex. */
export function realEigen2x2(m: Mat2): RealEigenResult | null {
  const trace = m[0][0] + m[1][1];
  const determinant = det2(m);
  const discriminant = trace * trace - 4 * determinant;
  if (discriminant < -1e-9) return null;

  const sqrtDisc = Math.sqrt(Math.max(0, discriminant));
  const lambda1 = (trace + sqrtDisc) / 2;
  const lambda2 = (trace - sqrtDisc) / 2;

  const eigenvectorFor = (lambda: number): Vec2 => {
    const a = m[0][0] - lambda;
    const b = m[0][1];
    const c = m[1][0];
    const d = m[1][1] - lambda;
    const row: Vec2 = Math.hypot(a, b) >= Math.hypot(c, d) ? [a, b] : [c, d];
    if (Math.hypot(row[0], row[1]) < 1e-9) return [1, 0];
    return normalize2([row[1], -row[0]]);
  };

  return {
    values: [lambda1, lambda2],
    vectors: [eigenvectorFor(lambda1), eigenvectorFor(lambda2)],
    repeated: discriminant < 1e-9,
  };
}

/** How far `v`'s direction is from being an eigenvector of `m`, as an angle in degrees (0 = exact eigenvector). */
export function eigenvectorDeviationDeg(m: Mat2, v: Vec2): number {
  if (length2(v) < 1e-6) return 90;
  const image = apply2(m, v);
  if (length2(image) < 1e-6) return 0;
  const nv = normalize2(v);
  const ni = normalize2(image);
  const dot = Math.max(-1, Math.min(1, Math.abs(nv[0] * ni[0] + nv[1] * ni[1])));
  return (Math.acos(dot) * 180) / Math.PI;
}

/** Builds a matrix with guaranteed real, distinct eigenvalues along a random basis P: M = P diag(λ1, λ2) P⁻¹. */
export function randomDiagonalizableMatrix(): {
  matrix: Mat2;
  eigenvalues: [number, number];
  eigenvectors: [Vec2, Vec2];
} {
  const angle1 = Math.random() * Math.PI;
  const angle2 = angle1 + Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 2 - 0.3);
  const p1: Vec2 = [Math.cos(angle1), Math.sin(angle1)];
  const p2: Vec2 = [Math.cos(angle2), Math.sin(angle2)];

  const lambda1 = Math.round((Math.random() * 3 - 1) * 10) / 10 || 0.5;
  let lambda2 = Math.round((Math.random() * 3 - 1) * 10) / 10 || -0.5;
  // Equal eigenvalues make M a plain multiple of the identity, where every vector is an
  // eigenvector and the challenge would be solved before the player does anything.
  while (Math.abs(lambda2 - lambda1) < 0.4) {
    lambda2 = Math.round((Math.random() * 3 - 1) * 10) / 10 || -0.5;
  }

  const pDet = p1[0] * p2[1] - p2[0] * p1[1];
  const pInv: Mat2 = [
    [p2[1] / pDet, -p2[0] / pDet],
    [-p1[1] / pDet, p1[0] / pDet],
  ];

  const d: Mat2 = [
    [lambda1, 0],
    [0, lambda2],
  ];
  const p: Mat2 = [
    [p1[0], p2[0]],
    [p1[1], p2[1]],
  ];

  const pd: Mat2 = [
    [p[0][0] * d[0][0] + p[0][1] * d[1][0], p[0][0] * d[0][1] + p[0][1] * d[1][1]],
    [p[1][0] * d[0][0] + p[1][1] * d[1][0], p[1][0] * d[0][1] + p[1][1] * d[1][1]],
  ];
  const matrix: Mat2 = [
    [
      pd[0][0] * pInv[0][0] + pd[0][1] * pInv[1][0],
      pd[0][0] * pInv[0][1] + pd[0][1] * pInv[1][1],
    ],
    [
      pd[1][0] * pInv[0][0] + pd[1][1] * pInv[1][0],
      pd[1][0] * pInv[0][1] + pd[1][1] * pInv[1][1],
    ],
  ];

  return { matrix, eigenvalues: [lambda1, lambda2], eigenvectors: [p1, p2] };
}
