import type { GuidedStep } from "@/hooks/useGuidedSequence";
import type { Vec3Tuple } from "@/types/math";
import type { GeometryTopic } from "@/modules/computational-geometry/types";

export interface CompGeoStep extends GuidedStep {
  cameraTarget: Vec3Tuple;
  cameraDistance: number;
  topic: GeometryTopic;
}

export const COMP_GEO_GUIDED_STEPS: CompGeoStep[] = [
  {
    id: "convex-hull",
    title: "Convex Hull",
    description:
      "Imagine stretching a rubber band around every point, then letting it snap taut. The shape it traces — using only the outermost points as corners — is the convex hull. Points inside never contribute a corner.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 11,
    topic: "convex-hull",
    duration: 7,
  },
  {
    id: "voronoi",
    title: "Voronoi Diagram",
    description:
      "Given several sites, color every location in the plane by whichever site is nearest to it. The boundary between two colors is always exactly halfway between the two sites — a perpendicular bisector.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 11,
    topic: "voronoi",
    duration: 8,
  },
  {
    id: "delaunay",
    title: "Delaunay Triangulation",
    description:
      "Connect the points into triangles so that no point ever ends up inside another triangle's circumcircle. This one rule produces the 'best-shaped' triangulation possible — avoiding thin, sliver-shaped triangles.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 11,
    topic: "delaunay",
    duration: 8,
  },
  {
    id: "bounding-box",
    title: "Bounding Box",
    description:
      "The simplest possible enclosure: the smallest axis-aligned rectangle that contains every point. It's cheap to compute and cheap to test against, which is why physics engines and renderers use it as a first, coarse check before anything more precise.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 10,
    topic: "bounding-box",
    duration: 7,
  },
  {
    id: "ray-casting",
    title: "Ray Casting",
    description:
      "Fire a ray from a point in a direction, and ask where it first hits a shape's edges. This is exactly how a mouse click picks an object on screen, how a game determines line-of-sight, and how a point-in-polygon test can be built by counting crossings.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 11,
    topic: "ray-casting",
    duration: 7,
  },
  {
    id: "collision",
    title: "Collision Detection",
    description:
      "Testing whether two shapes overlap gets progressively more expensive: circle-circle just compares a distance to a sum of radii, box-box compares ranges on each axis, and general convex polygons need the separating axis theorem — checking every edge normal for a gap.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 10,
    topic: "collision",
    duration: 8,
  },
];
