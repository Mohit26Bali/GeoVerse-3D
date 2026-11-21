import type { GuidedStep } from "@/hooks/useGuidedSequence";
import type { Vec3Tuple } from "@/types/math";
import { normalize } from "@/math/vector";
import {
  crossSectionRadius,
  sphereSurfaceArea,
  sphereVolume,
  sphericalCapVolume,
} from "@/math/sphere";
import { formatNumber } from "@/math/format";

export interface SphereStep extends GuidedStep {
  cameraTarget: Vec3Tuple;
  cameraDistance: number;
  radius: number;
  latex?: string;
  animateVolume?: boolean;
  chordPoints?: [Vec3Tuple, Vec3Tuple];
  sliceOffset?: number;
  fillHeight?: number;
}

const RADIUS = 2.2;
const CHORD_A: Vec3Tuple = normalize([1, 1, 0.4]);
const CHORD_B: Vec3Tuple = normalize([-0.6, 0.8, 1]);
const SLICE_OFFSET = 1.1;

export const SPHERE_GUIDED_STEPS: SphereStep[] = [
  {
    id: "radius",
    title: "Radius and diameter",
    description:
      "Every point on a sphere sits exactly one radius away from its center. The diameter — the widest distance straight across — is always twice that.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 7,
    radius: RADIUS,
    latex: `r = ${formatNumber(RADIUS)},\\ \\ d = 2r = ${formatNumber(RADIUS * 2)}`,
    duration: 6,
  },
  {
    id: "surface-area",
    title: "Surface area",
    description:
      "The surface area grows with the square of the radius — double the radius, and the surface area quadruples.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 7,
    radius: RADIUS,
    latex: `A = 4\\pi r^2 = ${formatNumber(sphereSurfaceArea(RADIUS))}`,
    duration: 6,
  },
  {
    id: "volume",
    title: "Volume",
    description:
      "Volume grows with the cube of the radius — it fills space three-dimensionally, so it grows even faster than surface area as the sphere expands.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 7,
    radius: RADIUS,
    latex: `V = \\dfrac{4}{3}\\pi r^3 = ${formatNumber(sphereVolume(RADIUS))}`,
    animateVolume: true,
    duration: 7,
  },
  {
    id: "chords",
    title: "Chords",
    description:
      "A chord is a straight line connecting two points on the sphere — it cuts through the interior rather than following the curved surface.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 7,
    radius: RADIUS,
    chordPoints: [CHORD_A, CHORD_B],
    duration: 6,
  },
  {
    id: "great-circles",
    title: "Great circles",
    description:
      "A great circle is the largest circle that fits on a sphere — its center coincides with the sphere's own center. The equator is a great circle; other lines of latitude are not.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 8,
    radius: RADIUS,
    chordPoints: [CHORD_A, CHORD_B],
    duration: 7,
  },
  {
    id: "cross-section",
    title: "Cross sections",
    description:
      "Slicing a sphere with a flat plane always produces a circle. The farther the slice is from the center, the smaller that circle gets — following the Pythagorean theorem.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 7,
    radius: RADIUS,
    sliceOffset: SLICE_OFFSET,
    latex: `r_{\\text{slice}} = \\sqrt{r^2 - h^2} = ${formatNumber(crossSectionRadius(RADIUS, SLICE_OFFSET))}`,
    duration: 7,
  },
  {
    id: "spherical-cap",
    title: "Spherical caps and water fill",
    description:
      "The volume of liquid filled to a certain height in a spherical tank follows its own formula — it's how the fill gauge on a round tank actually works.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 7,
    radius: RADIUS,
    fillHeight: RADIUS * 1.2,
    latex: `V_{\\text{cap}} = \\dfrac{\\pi h^2(3r-h)}{3} = ${formatNumber(sphericalCapVolume(RADIUS, RADIUS * 1.2))}`,
    duration: 8,
  },
];
