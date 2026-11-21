import type { GuidedStep } from "@/hooks/useGuidedSequence";
import type { LineDef, PlaneDef, Vec3Tuple } from "@/types/math";
import {
  closestPointOnPlane,
  distancePointToPlane,
  lineIntersectsPlane,
  planeFromPoints,
  planeIntersectsPlane,
} from "@/math/geometry";
import { formatNumber, planeEquationLatex, vectorToLatex } from "@/math/format";

export interface PlaneStep extends GuidedStep {
  cameraTarget: Vec3Tuple;
  cameraDistance: number;
  latex?: string;
}

export const PLANE_P0: Vec3Tuple = [0, 0.5, 0];
export const PLANE_NORMAL: Vec3Tuple = [0.6, 1, 0.3];
export const PLANE_A: PlaneDef = {
  id: "guided-a",
  point: PLANE_P0,
  normal: PLANE_NORMAL,
};

export const THREE_A: Vec3Tuple = [-2, -0.5, 1];
export const THREE_B: Vec3Tuple = [1.5, 0.5, 1.5];
export const THREE_C: Vec3Tuple = [-0.5, 1.5, -1.5];
export const THREE_PLANE = planeFromPoints(THREE_A, THREE_B, THREE_C);

export const POINT_Q: Vec3Tuple = [2, 2.2, -1.5];
export const CLOSEST_POINT = closestPointOnPlane(PLANE_A, POINT_Q);
const distanceToQ = distancePointToPlane(PLANE_A, POINT_Q);

export const GUIDED_LINE_P0: Vec3Tuple = [-2, 2.5, -2];
export const GUIDED_LINE_DIR: Vec3Tuple = [1.2, -1, 1.3];
export const GUIDED_LINE: LineDef = {
  id: "guided-line",
  point: GUIDED_LINE_P0,
  direction: GUIDED_LINE_DIR,
};
export const LINE_HIT = lineIntersectsPlane(GUIDED_LINE, PLANE_A);

export const PLANE_B_P0: Vec3Tuple = [1, -1, -1];
export const PLANE_B_NORMAL: Vec3Tuple = [0.4, 0.3, 1];
export const PLANE_B: PlaneDef = {
  id: "guided-b",
  point: PLANE_B_P0,
  normal: PLANE_B_NORMAL,
};
export const PLANE_INTERSECTION = planeIntersectsPlane(PLANE_A, PLANE_B);

export const PLANE_GUIDED_STEPS: PlaneStep[] = [
  {
    id: "definition",
    title: "The plane equation",
    description:
      "A plane is fully determined by one point it passes through, P₀, and a normal vector n perpendicular to its surface.",
    cameraTarget: PLANE_P0,
    cameraDistance: 9,
    latex: planeEquationLatex(PLANE_P0, PLANE_NORMAL),
    duration: 6,
  },
  {
    id: "three-point",
    title: "Plane through three points",
    description:
      "Any three non-collinear points determine a unique plane. Its normal comes from the cross product of two edge vectors.",
    cameraTarget: THREE_A,
    cameraDistance: 9,
    latex: `n = (B-A)\\times(C-A) = ${vectorToLatex(THREE_PLANE.normal)}`,
    duration: 7,
  },
  {
    id: "distance",
    title: "Distance from a point to a plane",
    description:
      "The distance is found by projecting the offset from P₀ to Q onto the unit normal — the length of the perpendicular drop.",
    cameraTarget: POINT_Q,
    cameraDistance: 9,
    latex: `\\text{distance} = ${formatNumber(distanceToQ)}`,
    duration: 7,
  },
  {
    id: "closest-point",
    title: "Closest point on a plane",
    description:
      "Subtracting that perpendicular drop from Q lands exactly on the plane — its closest point to Q.",
    cameraTarget: CLOSEST_POINT,
    cameraDistance: 8,
    latex: `\\text{foot} = ${vectorToLatex(CLOSEST_POINT)}`,
    duration: 6,
  },
  {
    id: "line-plane",
    title: "Line-plane intersection",
    description:
      "A line pierces a plane at the one parameter value t where its equation satisfies the plane's equation — unless the line is parallel to the plane.",
    cameraTarget: LINE_HIT ?? PLANE_P0,
    cameraDistance: 10,
    latex: LINE_HIT
      ? `\\text{hit} = ${vectorToLatex(LINE_HIT)}`
      : "\\text{parallel — no intersection}",
    duration: 7,
  },
  {
    id: "plane-plane",
    title: "Plane-plane intersection",
    description:
      "Two non-parallel planes always meet in a line, running perpendicular to both normals — found by solving both plane equations at once.",
    cameraTarget: PLANE_INTERSECTION?.point ?? PLANE_P0,
    cameraDistance: 11,
    latex: PLANE_INTERSECTION
      ? `d = ${vectorToLatex(PLANE_INTERSECTION.direction)}`
      : "\\text{parallel — no intersection}",
    duration: 8,
  },
];
