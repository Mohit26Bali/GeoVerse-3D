import type { GuidedStep } from "@/hooks/useGuidedSequence";
import type { Vec3Tuple } from "@/types/math";
import type { PolyhedronType } from "@/modules/polyhedra/types";

export interface PolyhedronStep extends GuidedStep {
  cameraTarget: Vec3Tuple;
  cameraDistance: number;
  type: PolyhedronType;
  explode: number;
  latex?: string;
}

export const POLYHEDRA_GUIDED_STEPS: PolyhedronStep[] = [
  {
    id: "intro",
    title: "The Platonic solids",
    description:
      "A Platonic solid is built from one regular polygon repeated identically at every face, with the same number of faces meeting at every vertex — there are exactly five of them.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 6,
    type: "tetrahedron",
    explode: 0,
    duration: 6,
  },
  {
    id: "euler",
    title: "Euler's formula",
    description:
      "For any convex polyhedron, vertices minus edges plus faces always equals 2. The cube has 8 vertices, 12 edges, and 6 faces: 8 - 12 + 6 = 2.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 6,
    type: "cube",
    explode: 0,
    latex: "V - E + F = 8 - 12 + 6 = 2",
    duration: 7,
  },
  {
    id: "octahedron",
    title: "The octahedron",
    description:
      "Eight triangular faces meet four at a time at each of 6 vertices — it's the cube's \"dual\": swap faces and vertices and you get one from the other.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 6,
    type: "octahedron",
    explode: 0,
    duration: 6,
  },
  {
    id: "explode",
    title: "Exploded views",
    description:
      "Pushing each face outward along its own normal separates the solid into its parts — a great way to count faces and see how they fit together.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 8,
    type: "icosahedron",
    explode: 0.6,
    duration: 7,
  },
  {
    id: "dodecahedron",
    title: "Pentagons: the dodecahedron",
    description:
      "12 regular pentagons, 20 vertices, 30 edges — the only Platonic solid whose faces aren't triangles or squares.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 7,
    type: "dodecahedron",
    explode: 0.15,
    duration: 7,
  },
  {
    id: "icosahedron",
    title: "The icosahedron",
    description:
      "20 triangular faces — the most faces of any Platonic solid, and the dual of the dodecahedron.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 6,
    type: "icosahedron",
    explode: 0,
    duration: 6,
  },
  {
    id: "beyond-platonic",
    title: "Beyond Platonic solids",
    description:
      "A hexagonal prism and a square pyramid are common solids too, but not Platonic: a prism's side faces differ from its two hexagonal caps, and a pyramid mixes a square base with triangular sides.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 7,
    type: "prism",
    explode: 0.2,
    duration: 8,
  },
];
