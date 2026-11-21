import type { GuidedStep } from "@/hooks/useGuidedSequence";
import type { Vec3Tuple } from "@/types/math";
import type { Mat2 } from "@/math/linearAlgebra2x2";
import type { LinAlgTopic } from "@/modules/linear-algebra-playground/types";

export interface LinAlgStep extends GuidedStep {
  cameraTarget: Vec3Tuple;
  cameraDistance: number;
  topic: LinAlgTopic;
  matrix: Mat2;
}

const GENERIC_MATRIX: Mat2 = [
  [1.6, 0.4],
  [0.4, 1.4],
];

const DEGENERATE_MATRIX: Mat2 = [
  [1.5, -1],
  [0.75, -0.5],
];

const EIGEN_MATRIX: Mat2 = [
  [2, 1],
  [0, 1],
];

export const LIN_ALG_GUIDED_STEPS: LinAlgStep[] = [
  {
    id: "span",
    title: "Span",
    description:
      "The span of î and ĵ is every point reachable by scaling and adding them: a·î + b·ĵ for any real a, b. When the two vectors point in different directions, their span is the entire plane.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 9,
    topic: "span",
    matrix: GENERIC_MATRIX,
    duration: 7,
  },
  {
    id: "column-space",
    title: "Column Space",
    description:
      "î and ĵ are exactly the matrix's two columns. So 'the column space' is just the span of the columns, viewed as 'everything this matrix can output.' Same picture, new question: not 'what can I reach?' but 'what can this matrix produce?'",
    cameraTarget: [0, 0, 0],
    cameraDistance: 9,
    topic: "span",
    matrix: GENERIC_MATRIX,
    duration: 8,
  },
  {
    id: "rank",
    title: "Rank",
    description:
      "Here î and ĵ point in nearly opposite directions along the same line — their span has collapsed from a plane down to a line. The rank (the dimension of that span) drops from 2 to 1. If both vectors collapsed all the way to the origin, the rank would be 0.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 9,
    topic: "rank",
    matrix: DEGENERATE_MATRIX,
    duration: 8,
  },
  {
    id: "null-space",
    title: "Null Space",
    description:
      "Whenever a matrix collapses the plane down (rank less than 2), some whole line of input vectors gets squashed to the exact origin — that line is the null space. A full-rank matrix has a trivial null space: only the origin itself maps to the origin.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 9,
    topic: "null-space",
    matrix: DEGENERATE_MATRIX,
    duration: 8,
  },
  {
    id: "eigen",
    title: "Eigenvectors & Eigenvalues",
    description:
      "Most directions get rotated by a matrix. But an eigenvector is special: the matrix only stretches or flips it, never turns it — landing back on the exact same line. That stretch factor is the eigenvalue, λ. This matrix has two real eigenvectors, with eigenvalues 2 and 1.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 9,
    topic: "eigen",
    matrix: EIGEN_MATRIX,
    duration: 9,
  },
];
