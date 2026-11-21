import type { GuidedStep } from "@/hooks/useGuidedSequence";
import type { Vec3Tuple } from "@/types/math";
import { orthonormalBasis } from "@/math/vector";
import { classifyConic, conicCoefficients } from "@/math/conic";
import { formatNumber } from "@/math/format";
import { CONE_K, PARABOLA_TILT_DEG } from "@/modules/conic-sections/types";

export interface ConicStep extends GuidedStep {
  cameraTarget: Vec3Tuple;
  cameraDistance: number;
  tilt: number;
  offset: number;
  showPlane?: boolean;
  latex?: string;
}

function discriminantAt(tiltDeg: number) {
  const rad = (tiltDeg * Math.PI) / 180;
  const normal: Vec3Tuple = [Math.sin(rad), Math.cos(rad), 0];
  const [u, v] = orthonormalBasis(normal);
  const { a, b, c } = conicCoefficients(u, v, CONE_K);
  return { a, b, c, discriminant: b * b - 4 * a * c, kind: classifyConic({ a, b, c }) };
}

const ellipseTilt = PARABOLA_TILT_DEG * 0.5;
const hyperbolaTilt = Math.min(89, PARABOLA_TILT_DEG + 20);

export const CONIC_GUIDED_STEPS: ConicStep[] = [
  {
    id: "double-cone",
    title: "The double cone",
    description:
      "Two cones joined apex to apex, sharing an axis. Every conic section comes from slicing this shape with a single flat plane.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 9,
    tilt: 0,
    offset: 1,
    showPlane: false,
    duration: 6,
  },
  {
    id: "circle",
    title: "Circle",
    description:
      "A plane perpendicular to the axis cuts a perfectly round circle — the simplest, most symmetric case.",
    cameraTarget: [0, 1, 0],
    cameraDistance: 8,
    tilt: 0,
    offset: 1,
    latex: `\\text{discriminant} = ${formatNumber(discriminantAt(0).discriminant)}`,
    duration: 6,
  },
  {
    id: "ellipse",
    title: "Ellipse",
    description:
      "Tilting the plane stretches the circle into an ellipse — still a closed curve, but no longer symmetric in every direction.",
    cameraTarget: [0, 1, 0],
    cameraDistance: 8,
    tilt: ellipseTilt,
    offset: 1,
    latex: `\\text{discriminant} = ${formatNumber(discriminantAt(ellipseTilt).discriminant)}`,
    duration: 7,
  },
  {
    id: "parabola",
    title: "Parabola",
    description:
      "At one exact tilt — parallel to the cone's own slant — the curve opens up and never closes. This is the knife-edge between an ellipse and a hyperbola.",
    cameraTarget: [0, 1, 0],
    cameraDistance: 9,
    tilt: PARABOLA_TILT_DEG,
    offset: 1,
    latex: `\\text{discriminant} \\approx 0`,
    duration: 7,
  },
  {
    id: "hyperbola",
    title: "Hyperbola",
    description:
      "Tilt further still and the plane cuts both nappes of the double cone at once, producing two separate, mirrored branches.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 10,
    tilt: hyperbolaTilt,
    offset: 1,
    latex: `\\text{discriminant} = ${formatNumber(discriminantAt(hyperbolaTilt).discriminant)}`,
    duration: 7,
  },
  {
    id: "discriminant",
    title: "The discriminant ties it together",
    description:
      "Substituting the plane's own coordinates into the cone's equation gives a quadratic curve equation, exactly like the one from algebra class. Its discriminant, B squared minus 4AC, decides everything: negative is an ellipse, zero is a parabola, positive is a hyperbola.",
    cameraTarget: [0, 1, 0],
    cameraDistance: 9,
    tilt: ellipseTilt,
    offset: 1,
    latex:
      "B^2 - 4AC \\begin{cases} < 0 & \\text{ellipse (or circle)} \\\\ = 0 & \\text{parabola} \\\\ > 0 & \\text{hyperbola} \\end{cases}",
    duration: 8,
  },
];
