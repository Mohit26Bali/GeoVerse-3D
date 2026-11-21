import type { Vec3Tuple } from "@/types/math";

export type GeometryTopic =
  "convex-hull" | "voronoi" | "delaunay" | "bounding-box" | "ray-casting" | "collision";

export const TOPICS: { id: GeometryTopic; label: string; description: string }[] = [
  {
    id: "convex-hull",
    label: "Convex Hull",
    description:
      "The smallest convex polygon that contains every point — like a rubber band snapped around them.",
  },
  {
    id: "voronoi",
    label: "Voronoi Diagram",
    description: "Splits the plane into regions — each one closest to a single site.",
  },
  {
    id: "delaunay",
    label: "Delaunay Triangulation",
    description:
      "Triangulates a point set so no point sits inside any triangle's circumcircle.",
  },
  {
    id: "bounding-box",
    label: "Bounding Box",
    description: "The tightest axis-aligned rectangle enclosing a set of points.",
  },
  {
    id: "ray-casting",
    label: "Ray Casting",
    description: "Fires a ray and finds where — or whether — it hits a shape.",
  },
  {
    id: "collision",
    label: "Collision Detection",
    description: "Tests whether two shapes overlap.",
  },
];

export const POINT_LABELS = ["P0", "P1", "P2", "P3", "P4", "P5", "P6", "P7"];

export function randomPoints(count: number, spread = 3.2): Vec3Tuple[] {
  const points: Vec3Tuple[] = [];
  for (let i = 0; i < count; i++) {
    const x = (Math.random() * 2 - 1) * spread;
    const z = (Math.random() * 2 - 1) * spread;
    points.push([x, 0, z]);
  }
  return points;
}

export function randomPoint(spread = 3.2): Vec3Tuple {
  return randomPoints(1, spread)[0];
}

export const DEFAULT_HULL_POINTS: Vec3Tuple[] = [
  [-2.8, 0, -1.2],
  [-1.2, 0, -2.6],
  [1.6, 0, -2.2],
  [2.8, 0, 0.4],
  [1.4, 0, 2.4],
  [-1.8, 0, 1.8],
  [0.1, 0, 0.2],
];

export const DEFAULT_VORONOI_SITES: Vec3Tuple[] = [
  [-2.2, 0, -1.6],
  [1.8, 0, -1.8],
  [2.4, 0, 1.4],
  [-1.6, 0, 1.8],
  [0.2, 0, 0.1],
];

export const DEFAULT_DELAUNAY_POINTS: Vec3Tuple[] = [
  [-2.4, 0, -1.4],
  [-0.4, 0, -2.4],
  [2.2, 0, -1],
  [2, 0, 1.6],
  [-0.6, 0, 2.2],
  [-2.2, 0, 0.6],
];

export const DEFAULT_BBOX_POINTS: Vec3Tuple[] = [
  [-2.4, 0, -0.8],
  [-1.4, 0, 1.6],
  [0.6, 0, -1.8],
  [1.8, 0, 0.4],
  [0.2, 0, 1.2],
  [-0.4, 0, -0.2],
];

export const DEFAULT_RAY_POLYGON_POINTS: Vec3Tuple[] = [
  [-1.2, 0, -1],
  [1.2, 0, -1.4],
  [1.6, 0, 0.6],
  [0, 0, 1.6],
  [-1.6, 0, 0.8],
];

export const DEFAULT_RAY_ORIGIN: Vec3Tuple = [-5, 0, -3];
export const DEFAULT_RAY_AIM: Vec3Tuple = [0, 0, 0];

export const DEFAULT_SHAPE_A_CENTER: Vec3Tuple = [-1.6, 0, 0];
export const DEFAULT_SHAPE_B_CENTER: Vec3Tuple = [1.2, 0, 0];
