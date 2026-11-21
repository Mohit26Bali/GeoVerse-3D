import type { Vec3Tuple } from "@/types/math";
import type { MatrixData } from "@/math/matrix";
import { multiplyMatrices } from "@/math/matrix";

/**
 * Homogeneous 4x4 transformation matrices — the "everything is one matrix"
 * unification the Guided walkthrough's final step teaches. Translation,
 * scaling, rotation, reflection, and shear all produce a MatrixData that
 * TransformShape applies identically, via `applyMatrixToPoint`.
 */

export const IDENTITY_4: MatrixData = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];

export function translationMatrix([tx, ty, tz]: Vec3Tuple): MatrixData {
  return [
    [1, 0, 0, tx],
    [0, 1, 0, ty],
    [0, 0, 1, tz],
    [0, 0, 0, 1],
  ];
}

export function scaleMatrix([sx, sy, sz]: Vec3Tuple): MatrixData {
  return [
    [sx, 0, 0, 0],
    [0, sy, 0, 0],
    [0, 0, sz, 0],
    [0, 0, 0, 1],
  ];
}

export type Axis = "x" | "y" | "z";

/** Right-handed rotation about a coordinate axis by `angleRad` radians. */
export function rotationMatrix(axis: Axis, angleRad: number): MatrixData {
  const c = Math.cos(angleRad);
  const s = Math.sin(angleRad);
  switch (axis) {
    case "x":
      return [
        [1, 0, 0, 0],
        [0, c, -s, 0],
        [0, s, c, 0],
        [0, 0, 0, 1],
      ];
    case "y":
      return [
        [c, 0, s, 0],
        [0, 1, 0, 0],
        [-s, 0, c, 0],
        [0, 0, 0, 1],
      ];
    case "z":
      return [
        [c, -s, 0, 0],
        [s, c, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ];
  }
}

/** Mirrors across the coordinate plane perpendicular to `axis` (through the origin). */
export function reflectionMatrix(axis: Axis): MatrixData {
  const scale: Vec3Tuple =
    axis === "x" ? [-1, 1, 1] : axis === "y" ? [1, -1, 1] : [1, 1, -1];
  return scaleMatrix(scale);
}

export type ShearPair = "xy" | "xz" | "yz";

/** Shears one axis in proportion to another — e.g. "xy" shifts x by `amount * y`. */
export function shearMatrix(pair: ShearPair, amount: number): MatrixData {
  const m = IDENTITY_4.map((row) => [...row]);
  if (pair === "xy") m[0][1] = amount;
  if (pair === "xz") m[0][2] = amount;
  if (pair === "yz") m[1][2] = amount;
  return m;
}

export function composeMatrices(...matrices: MatrixData[]): MatrixData {
  return matrices.reduce((acc, m) => multiplyMatrices(acc, m), IDENTITY_4);
}

/** Applies a 4x4 homogeneous matrix to a 3D point (implicit w = 1). */
export function applyMatrixToPoint(m: MatrixData, [x, y, z]: Vec3Tuple): Vec3Tuple {
  const w = m[3][0] * x + m[3][1] * y + m[3][2] * z + m[3][3];
  const nx = (m[0][0] * x + m[0][1] * y + m[0][2] * z + m[0][3]) / w;
  const ny = (m[1][0] * x + m[1][1] * y + m[1][2] * z + m[1][3]) / w;
  const nz = (m[2][0] * x + m[2][1] * y + m[2][2] * z + m[2][3]) / w;
  return [nx, ny, nz];
}

/** The top-left 3x3 linear part of a 4x4 homogeneous matrix (drops translation). */
export function linearPart(m4: MatrixData): MatrixData {
  return [
    [m4[0][0], m4[0][1], m4[0][2]],
    [m4[1][0], m4[1][1], m4[1][2]],
    [m4[2][0], m4[2][1], m4[2][2]],
  ];
}

/** A 3x3 matrix's columns as the three basis vectors it sends î, ĵ, k̂ to. */
export function columnsOf3x3(m: MatrixData): [Vec3Tuple, Vec3Tuple, Vec3Tuple] {
  return [
    [m[0][0], m[1][0], m[2][0]],
    [m[0][1], m[1][1], m[2][1]],
    [m[0][2], m[1][2], m[2][2]],
  ];
}

/** Builds a 3x3 matrix from its three column (basis-image) vectors. */
export function matrixFromColumns(i: Vec3Tuple, j: Vec3Tuple, k: Vec3Tuple): MatrixData {
  return [
    [i[0], j[0], k[0]],
    [i[1], j[1], k[1]],
    [i[2], j[2], k[2]],
  ];
}
