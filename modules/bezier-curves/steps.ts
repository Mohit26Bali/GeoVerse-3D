import type { GuidedStep } from "@/hooks/useGuidedSequence";
import type { Vec3Tuple } from "@/types/math";
import { bezierPoint } from "@/math/bezier";
import { vectorToLatex } from "@/math/format";
import { DEFAULT_CONTROL_POINTS, type BezierDegree } from "@/modules/bezier-curves/types";

export interface BezierStep extends GuidedStep {
  cameraTarget: Vec3Tuple;
  cameraDistance: number;
  degree: BezierDegree;
  t: number;
  latex?: string;
}

const linearPoint = bezierPoint(DEFAULT_CONTROL_POINTS.linear, 0.5);
const quadPoint = bezierPoint(DEFAULT_CONTROL_POINTS.quadratic, 0.5);
const cubicPoint = bezierPoint(DEFAULT_CONTROL_POINTS.cubic, 0.5);

export const BEZIER_GUIDED_STEPS: BezierStep[] = [
  {
    id: "linear",
    title: "Linear Bézier",
    description:
      "The simplest case: two control points, and the curve is just a straight line between them. B(t) is a plain linear interpolation.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 7,
    degree: "linear",
    t: 0.5,
    latex: `B(t) = (1-t)P_0 + tP_1 = ${vectorToLatex(linearPoint)}`,
    duration: 6,
  },
  {
    id: "quadratic",
    title: "Quadratic Bézier",
    description:
      "With three control points, de Casteljau's construction kicks in: interpolate P0→P1 and P1→P2 by t, then interpolate between those two results — that final point is on the curve.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 7,
    degree: "quadratic",
    t: 0.5,
    latex: `B(t) = (1-t)^2P_0 + 2(1-t)tP_1 + t^2P_2 = ${vectorToLatex(quadPoint)}`,
    duration: 7,
  },
  {
    id: "cubic",
    title: "Cubic Bézier",
    description:
      "Four control points need one more level of nesting — three first-level interpolations, then two second-level, then one final point. This is the curve type used in fonts and vector graphics.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 8,
    degree: "cubic",
    t: 0.5,
    latex: `B(t) = (1-t)^3P_0 + 3(1-t)^2tP_1 + 3(1-t)t^2P_2 + t^3P_3 = ${vectorToLatex(cubicPoint)}`,
    duration: 8,
  },
  {
    id: "tangent",
    title: "The tangent line",
    description:
      "At any point on the curve, the tangent direction comes from the same construction one level up — it's exactly the direction the last interpolation step was heading.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 8,
    degree: "cubic",
    t: 0.3,
    duration: 6,
  },
  {
    id: "reshape",
    title: "Control points are handles",
    description:
      "None of the middle control points sit on the curve — they only pull it. Dragging P1 or P2 reshapes the whole curve, which is exactly how vector-graphics editors let you sculpt a path.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 8,
    degree: "cubic",
    t: 0.7,
    duration: 7,
  },
];
