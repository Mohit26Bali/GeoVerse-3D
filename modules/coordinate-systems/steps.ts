import type { GuidedStep } from "@/hooks/useGuidedSequence";
import type { Vec3Tuple } from "@/types/math";
import { magnitude, midpoint } from "@/math/vector";
import { formatNumber } from "@/math/format";

export interface CoordinateStep extends GuidedStep {
  cameraTarget: Vec3Tuple;
  cameraDistance: number;
  latex?: string;
}

/** Shared across the "reading a point" and "distance from origin" steps. */
export const READING_POINT: Vec3Tuple = [2.5, 1.5, -1.5];
export const MIDPOINT_A: Vec3Tuple = [-2, 0.5, 1.5];
export const MIDPOINT_B: Vec3Tuple = [2, 1.5, -1.5];
export const MIDPOINT_M: Vec3Tuple = midpoint(MIDPOINT_A, MIDPOINT_B);

const originDistance = magnitude(READING_POINT);

export const COORDINATE_GUIDED_STEPS: CoordinateStep[] = [
  {
    id: "origin",
    title: "The origin",
    description:
      "Every point in this space is measured from one fixed reference: the origin, at (0, 0, 0). It's where all three axes meet.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 9,
    latex: "O = (0,\\ 0,\\ 0)",
    duration: 6,
  },
  {
    id: "axes",
    title: "Three perpendicular axes",
    description:
      "The X, Y, and Z axes are mutually perpendicular. Moving along X shifts left/right, Y shifts up/down, and Z shifts forward/back.",
    cameraTarget: [0, 1, 0],
    cameraDistance: 15,
    duration: 6,
  },
  {
    id: "reading-point",
    title: "Reading a point's coordinates",
    description:
      "Point P's coordinates are its signed distances along each axis. The dashed path shows how to walk from the origin to P one axis at a time.",
    cameraTarget: READING_POINT,
    cameraDistance: 8,
    latex: `P = (${formatNumber(READING_POINT[0])},\\ ${formatNumber(READING_POINT[1])},\\ ${formatNumber(READING_POINT[2])})`,
    duration: 7,
  },
  {
    id: "distance-from-origin",
    title: "Distance from the origin",
    description:
      "The straight-line distance from O to P comes from the 3D distance formula — a generalization of the Pythagorean theorem to three dimensions.",
    cameraTarget: [READING_POINT[0] / 2, READING_POINT[1] / 2, READING_POINT[2] / 2],
    cameraDistance: 9,
    latex: `|OP| = \\sqrt{x^2+y^2+z^2} = ${formatNumber(originDistance)}`,
    duration: 7,
  },
  {
    id: "midpoint",
    title: "Midpoint between two points",
    description:
      "The midpoint of A and B averages each coordinate independently — it always lands exactly halfway along the segment AB.",
    cameraTarget: MIDPOINT_M,
    cameraDistance: 10,
    latex: `M = \\left(\\dfrac{x_1+x_2}{2},\\ \\dfrac{y_1+y_2}{2},\\ \\dfrac{z_1+z_2}{2}\\right) = (${MIDPOINT_M.map(
      (v) => formatNumber(v),
    ).join(",\\ ")})`,
    duration: 8,
  },
];
