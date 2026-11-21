import type { GuidedStep } from "@/hooks/useGuidedSequence";
import type { LineDef, Vec3Tuple } from "@/types/math";
import { subtract } from "@/math/vector";
import {
  closestApproachBetweenLines,
  closestPointOnLine,
  distancePointToLine,
} from "@/math/geometry";
import { formatNumber, lineParametricLatex, vectorToLatex } from "@/math/format";

export interface LineStep extends GuidedStep {
  cameraTarget: Vec3Tuple;
  cameraDistance: number;
  latex?: string;
}

export const LINE_P0: Vec3Tuple = [-1.5, 0.5, -1];
export const LINE_DIR: Vec3Tuple = [1.2, 0.4, 1.3];
export const LINE_A: LineDef = { id: "guided-a", point: LINE_P0, direction: LINE_DIR };

export const POINT_Q: Vec3Tuple = [1.5, 1.8, -1.5];
export const CLOSEST_POINT = closestPointOnLine(LINE_A, POINT_Q);
const distanceToQ = distancePointToLine(LINE_A, POINT_Q);

export const TWO_POINT_A: Vec3Tuple = [-2, -0.5, 1.5];
export const TWO_POINT_B: Vec3Tuple = [1.5, 1, -1];
export const TWO_POINT_DIR = subtract(TWO_POINT_B, TWO_POINT_A);

export const LINE_B_P0: Vec3Tuple = [1.5, -0.5, 1.5];
export const LINE_B_DIR: Vec3Tuple = [-1, 0.8, -0.8];
export const LINE_B: LineDef = {
  id: "guided-b",
  point: LINE_B_P0,
  direction: LINE_B_DIR,
};
export const APPROACH = closestApproachBetweenLines(LINE_A, LINE_B);

export const LINE_GUIDED_STEPS: LineStep[] = [
  {
    id: "definition",
    title: "Defining a line",
    description:
      "A line is fully determined by one point it passes through, P₀, and a direction vector d it travels along.",
    cameraTarget: LINE_P0,
    cameraDistance: 9,
    latex: `P_0 = ${vectorToLatex(LINE_P0)},\\ \\ d = ${vectorToLatex(LINE_DIR)}`,
    duration: 6,
  },
  {
    id: "parametric",
    title: "Parametric equations",
    description:
      "Every point on the line is P₀ plus some multiple t of the direction. As t sweeps through all real numbers, this equation traces the entire line.",
    cameraTarget: LINE_P0,
    cameraDistance: 12,
    latex: lineParametricLatex(LINE_P0, LINE_DIR),
    duration: 7,
  },
  {
    id: "closest-point",
    title: "Closest point on a line",
    description:
      "For any external point Q, the closest point on the line is found by projecting Q's offset from P₀ onto the direction vector.",
    cameraTarget: CLOSEST_POINT,
    cameraDistance: 8,
    latex: `\\text{foot} = ${vectorToLatex(CLOSEST_POINT)}`,
    duration: 7,
  },
  {
    id: "distance",
    title: "Distance from a point to a line",
    description:
      "The distance is the length of the perpendicular segment from Q to its closest point — always the shortest path from Q to the line.",
    cameraTarget: POINT_Q,
    cameraDistance: 8,
    latex: `|Q - \\text{foot}| = ${formatNumber(distanceToQ)}`,
    duration: 6,
  },
  {
    id: "two-point-form",
    title: "Line through two points",
    description:
      "Given two points A and B, the line through them uses A as the anchor and B - A as the direction.",
    cameraTarget: TWO_POINT_A,
    cameraDistance: 9,
    latex: lineParametricLatex(TWO_POINT_A, TWO_POINT_DIR),
    duration: 7,
  },
  {
    id: "closest-approach",
    title: "Closest approach between two lines",
    description:
      "Two lines in 3D usually don't intersect — they're skew. The shortest segment connecting them is perpendicular to both directions at once.",
    cameraTarget: APPROACH.pointOnA,
    cameraDistance: 11,
    latex: `\\text{distance} = ${formatNumber(APPROACH.distance)}`,
    duration: 8,
  },
];
