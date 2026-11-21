import { det, inv, eigs, multiply } from "mathjs";

/**
 * General NxN matrix math backed by mathjs, for the Linear Algebra Playground
 * and Matrices module (determinants, inverses, eigen-decomposition). For 3D
 * scene transforms, prefer THREE.Matrix4 directly (see three/engine) — this
 * module is for the numeric/pedagogical layer, not the render layer.
 */

export type MatrixData = number[][];

export function determinant(m: MatrixData): number {
  return det(m) as number;
}

export function inverse(m: MatrixData): MatrixData | null {
  try {
    return inv(m) as MatrixData;
  } catch {
    return null;
  }
}

export function multiplyMatrices(a: MatrixData, b: MatrixData): MatrixData {
  return multiply(a, b) as MatrixData;
}

export function applyToVector(m: MatrixData, v: number[]): number[] {
  return multiply(m, v) as number[];
}

export interface EigenResult {
  values: number[];
  vectors: number[][];
}

/** Real eigenvalues/eigenvectors for a square matrix. Returns null if complex. */
export function eigenDecomposition(m: MatrixData): EigenResult | null {
  try {
    const result = eigs(m);
    const values = (result.values as unknown as number[]).map((v) => Number(v));
    if (values.some((v) => Number.isNaN(v))) return null;
    const vectors = (result.eigenvectors as unknown as { vector: number[] }[]).map(
      (e) => e.vector,
    );
    return { values, vectors };
  } catch {
    return null;
  }
}

export function rank(m: MatrixData): number {
  // Gaussian elimination row-echelon rank, robust to mathjs version differences.
  const mat = m.map((row) => [...row]);
  const rows = mat.length;
  const cols = mat[0]?.length ?? 0;
  let rank = 0;
  for (let col = 0; col < cols && rank < rows; col++) {
    let pivot = -1;
    for (let row = rank; row < rows; row++) {
      if (Math.abs(mat[row][col]) > 1e-9) {
        pivot = row;
        break;
      }
    }
    if (pivot === -1) continue;
    [mat[rank], mat[pivot]] = [mat[pivot], mat[rank]];
    for (let row = 0; row < rows; row++) {
      if (row === rank) continue;
      const factor = mat[row][col] / mat[rank][col];
      for (let c = col; c < cols; c++) mat[row][c] -= factor * mat[rank][c];
    }
    rank++;
  }
  return rank;
}

export const IDENTITY_3: MatrixData = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
