import { coneHalfAngleTan, findParabolaTiltDeg } from "@/math/conic";

export const CONE_HALF_ANGLE_DEG = 35;
export const CONE_K = coneHalfAngleTan(CONE_HALF_ANGLE_DEG);
export const PARABOLA_TILT_DEG = findParabolaTiltDeg(CONE_K);

export interface ConicPreset {
  id: string;
  label: string;
  tilt: number;
  offset: number;
}

export const CONIC_PRESETS: ConicPreset[] = [
  { id: "circle", label: "Circle", tilt: 0, offset: 1 },
  { id: "ellipse", label: "Ellipse", tilt: PARABOLA_TILT_DEG * 0.5, offset: 1 },
  { id: "parabola", label: "Parabola", tilt: PARABOLA_TILT_DEG, offset: 1 },
  {
    id: "hyperbola",
    label: "Hyperbola",
    tilt: Math.min(89, PARABOLA_TILT_DEG + 20),
    offset: 1,
  },
];
