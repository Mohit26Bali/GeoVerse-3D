import type { Vec3Tuple } from "@/types/math";
import type { MatrixData } from "@/math/matrix";
import type { Mat2, Vec2 } from "@/math/linearAlgebra2x2";

export type LinAlgTopic = "eigen" | "span" | "rank" | "null-space";

export const TOPICS: { id: LinAlgTopic; label: string; description: string }[] = [
  {
    id: "eigen",
    label: "Eigenvectors & Eigenvalues",
    description:
      "An eigenvector is a direction the matrix doesn't rotate — it only stretches or flips it, by a factor called the eigenvalue.",
  },
  {
    id: "span",
    label: "Span & Column Space",
    description:
      "The span of a set of vectors is everywhere you can reach by scaling and adding them. A matrix's column space is exactly the span of its columns — every possible output.",
  },
  {
    id: "rank",
    label: "Rank",
    description:
      "The rank is the dimension of the column space: 2 means the matrix still covers the whole plane, 1 means it collapses everything onto a line, 0 means it collapses everything to the origin.",
  },
  {
    id: "null-space",
    label: "Null Space",
    description:
      "The null space is everything the matrix sends to the origin — trivial (just the origin) for a full-rank matrix, but a whole line when the matrix is degenerate.",
  },
];

export const toVec3 = ([x, z]: Vec2): Vec3Tuple => [x, 0, z];
export const toVec2 = ([x, , z]: Vec3Tuple): Vec2 => [x, z];

export function randomVec2(spread = 3): Vec2 {
  return [(Math.random() * 2 - 1) * spread, (Math.random() * 2 - 1) * spread];
}

/** Embeds a 2x2 matrix acting on (x, z) into a 3x3 matrix that leaves y untouched, so it can drive TransformedGrid. */
export function embedMat2InXZPlane([[a, b], [c, d]]: Mat2): MatrixData {
  return [
    [a, 0, b],
    [0, 1, 0],
    [c, 0, d],
  ];
}
