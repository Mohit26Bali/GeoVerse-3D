import type { GuidedStep } from "@/hooks/useGuidedSequence";
import type { Vec3Tuple } from "@/types/math";
import {
  add,
  subtract,
  magnitude,
  dot,
  cross,
  angleBetween,
  vectorProjection,
} from "@/math/vector";
import { formatNumber, vectorToLatex } from "@/math/format";

export interface VectorStep extends GuidedStep {
  cameraTarget: Vec3Tuple;
  cameraDistance: number;
  latex?: string;
}

export const VECTOR_A: Vec3Tuple = [2.5, 1, -1];
export const VECTOR_B: Vec3Tuple = [0.5, 1.5, 2];
export const VECTOR_SUM = add(VECTOR_A, VECTOR_B);
export const VECTOR_DIFF = subtract(VECTOR_A, VECTOR_B);
export const VECTOR_PROJECTION = vectorProjection(VECTOR_A, VECTOR_B);
export const VECTOR_CROSS = cross(VECTOR_A, VECTOR_B);

const dotAB = dot(VECTOR_A, VECTOR_B);
const angleDeg = (angleBetween(VECTOR_A, VECTOR_B) * 180) / Math.PI;

export const VECTOR_GUIDED_STEPS: VectorStep[] = [
  {
    id: "intro",
    title: "What is a vector?",
    description:
      "A vector is an arrow from the origin with a magnitude (length) and a direction — it represents displacement, force, or velocity.",
    cameraTarget: VECTOR_A,
    cameraDistance: 8,
    latex: `A = ${vectorToLatex(VECTOR_A)},\\ \\ |A| = ${formatNumber(magnitude(VECTOR_A))}`,
    duration: 6,
  },
  {
    id: "addition",
    title: "Vector addition",
    description:
      "Complete the parallelogram formed by A and B — the diagonal from the origin is A + B, added component-wise.",
    cameraTarget: VECTOR_SUM,
    cameraDistance: 9,
    latex: `A + B = ${vectorToLatex(VECTOR_SUM)}`,
    duration: 7,
  },
  {
    id: "subtraction",
    title: "Vector subtraction",
    description:
      "A - B points from the tip of B to the tip of A — the displacement between them.",
    cameraTarget: VECTOR_DIFF,
    cameraDistance: 8,
    latex: `A - B = ${vectorToLatex(VECTOR_DIFF)}`,
    duration: 6,
  },
  {
    id: "dot-product",
    title: "Dot product and angle",
    description:
      "The dot product measures how aligned two vectors are. It's zero when they're perpendicular, and lets you recover the angle between them.",
    cameraTarget: [0, 0.5, 0],
    cameraDistance: 8,
    latex: `A \\cdot B = |A||B|\\cos\\theta = ${formatNumber(dotAB)},\\ \\ \\theta \\approx ${formatNumber(angleDeg, 1)}^\\circ`,
    duration: 7,
  },
  {
    id: "projection",
    title: "Projecting A onto B",
    description:
      "The projection of A onto B is the \"shadow\" A casts on B's line — the component of A that points in B's direction.",
    cameraTarget: VECTOR_PROJECTION,
    cameraDistance: 8,
    latex: `\\text{proj}_B A = \\dfrac{A\\cdot B}{B\\cdot B}B = ${vectorToLatex(VECTOR_PROJECTION)}`,
    duration: 7,
  },
  {
    id: "cross-product",
    title: "Cross product",
    description:
      "A × B produces a new vector perpendicular to both A and B, with length equal to the area of the parallelogram they span.",
    cameraTarget: VECTOR_CROSS,
    cameraDistance: 10,
    latex: `A \\times B = ${vectorToLatex(VECTOR_CROSS)},\\ \\ |A\\times B| = ${formatNumber(magnitude(VECTOR_CROSS))}`,
    duration: 8,
  },
];
