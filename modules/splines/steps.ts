import type { GuidedStep } from "@/hooks/useGuidedSequence";
import type { Vec3Tuple } from "@/types/math";
import type { SplineKind } from "@/modules/splines/types";

export interface SplineStep extends GuidedStep {
  cameraTarget: Vec3Tuple;
  cameraDistance: number;
  kind: SplineKind;
  showHandles?: boolean;
}

export const SPLINE_GUIDED_STEPS: SplineStep[] = [
  {
    id: "why-splines",
    title: "Why splines?",
    description:
      "A single Bézier curve only has one segment. Real paths — camera rails, animation motion, roads — need many points threaded together smoothly. A spline chains segments so the whole thing still reads as one continuous curve.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 10,
    kind: "catmull-rom",
    duration: 7,
  },
  {
    id: "catmull-rom",
    title: "Catmull-Rom splines",
    description:
      "Each segment blends the 4 nearest anchor points using a fixed formula, built so the curve passes through every single anchor exactly — no adjustment needed.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 10,
    kind: "catmull-rom",
    duration: 7,
  },
  {
    id: "bezier-spline",
    title: "Bézier splines",
    description:
      "A different approach: chain full cubic Bézier segments end to end. Each anchor gets two handles, aligned opposite each other, so consecutive segments meet without a visible kink.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 10,
    kind: "bezier-spline",
    showHandles: true,
    duration: 7,
  },
  {
    id: "b-spline",
    title: "B-splines",
    description:
      "A B-spline trades interpolation for locality: the curve glides near the anchors rather than through them, but moving one anchor only reshapes a short local stretch — the rest of the curve doesn't move at all.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 10,
    kind: "b-spline",
    duration: 8,
  },
  {
    id: "compare",
    title: "Choosing the right spline",
    description:
      "Same anchors, three different curves: Catmull-Rom and Bézier splines guarantee the path visits every point exactly — useful for camera paths that must hit specific waypoints. B-splines trade that guarantee for smoother, more controllable shapes — the standard in CAD and surface modeling.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 11,
    kind: "b-spline",
    duration: 8,
  },
];
