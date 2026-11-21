import type { LucideIcon } from "lucide-react";
import { Pyramid, Box, Diamond, Hexagon, Gem, Triangle, Layers } from "lucide-react";

export type PolyhedronType =
  | "tetrahedron"
  | "cube"
  | "octahedron"
  | "dodecahedron"
  | "icosahedron"
  | "prism"
  | "pyramid";

export interface PolyhedronInfo {
  id: PolyhedronType;
  label: string;
  icon: LucideIcon;
  vertices: number;
  edges: number;
  faces: number;
  faceShape: string;
  isPlatonic: boolean;
}

/** V, E, F are the standard, well-known counts for each solid — Euler's formula V - E + F = 2 holds for all of them. */
export const POLYHEDRA: PolyhedronInfo[] = [
  {
    id: "tetrahedron",
    label: "Tetrahedron",
    icon: Pyramid,
    vertices: 4,
    edges: 6,
    faces: 4,
    faceShape: "triangles",
    isPlatonic: true,
  },
  {
    id: "cube",
    label: "Cube",
    icon: Box,
    vertices: 8,
    edges: 12,
    faces: 6,
    faceShape: "squares",
    isPlatonic: true,
  },
  {
    id: "octahedron",
    label: "Octahedron",
    icon: Diamond,
    vertices: 6,
    edges: 12,
    faces: 8,
    faceShape: "triangles",
    isPlatonic: true,
  },
  {
    id: "dodecahedron",
    label: "Dodecahedron",
    icon: Gem,
    vertices: 20,
    edges: 30,
    faces: 12,
    faceShape: "pentagons",
    isPlatonic: true,
  },
  {
    id: "icosahedron",
    label: "Icosahedron",
    icon: Hexagon,
    vertices: 12,
    edges: 30,
    faces: 20,
    faceShape: "triangles",
    isPlatonic: true,
  },
  {
    id: "prism",
    label: "Hexagonal prism",
    icon: Layers,
    vertices: 12,
    edges: 18,
    faces: 8,
    faceShape: "hexagons & rectangles",
    isPlatonic: false,
  },
  {
    id: "pyramid",
    label: "Square pyramid",
    icon: Triangle,
    vertices: 5,
    edges: 8,
    faces: 5,
    faceShape: "a square & triangles",
    isPlatonic: false,
  },
];

export function polyhedronInfo(type: PolyhedronType): PolyhedronInfo {
  return POLYHEDRA.find((p) => p.id === type)!;
}
