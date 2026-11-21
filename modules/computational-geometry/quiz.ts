import type { Vec3Tuple } from "@/types/math";
import {
  aabbCorners,
  boundingBoxAABB,
  circleAabbOverlap,
  circlesOverlap,
  convexHull2D,
  delaunayTriangulation,
  fromXZ,
  fromXZAll,
  rayIntersectsPolygon,
  toXZ,
  toXZAll,
  triangleEdges,
  voronoiCells,
  type Point2,
} from "@/math/computationalGeometry";
import {
  randomPoint,
  randomPoints,
  TOPICS,
  type GeometryTopic,
} from "@/modules/computational-geometry/types";

export type ShapeKind = "circle" | "box";

export interface Shape {
  kind: ShapeKind;
  center: Vec3Tuple;
  radius: number;
}

export type QuizRender =
  | { topic: "convex-hull"; points: Vec3Tuple[]; hull: Vec3Tuple[]; markedIndex: number }
  | {
      topic: "voronoi";
      sites: Vec3Tuple[];
      cells: Vec3Tuple[][];
      query: Vec3Tuple;
      candidateSiteIndex: number;
    }
  | {
      topic: "delaunay";
      points: Vec3Tuple[];
      edges: [Vec3Tuple, Vec3Tuple][];
      candidateEdge: [Vec3Tuple, Vec3Tuple];
    }
  | { topic: "bounding-box"; points: Vec3Tuple[]; box: Vec3Tuple[] }
  | { topic: "ray-casting"; origin: Vec3Tuple; dir: Vec3Tuple; polygon: Vec3Tuple[] }
  | { topic: "collision"; shapeA: Shape; shapeB: Shape };

export interface QuizScenario {
  topic: GeometryTopic;
  question: string;
  answer: boolean;
  render: QuizRender;
}

function randomKind(): ShapeKind {
  return Math.random() < 0.5 ? "circle" : "box";
}

function shapeToAabb(shape: Shape) {
  const [x, , z] = shape.center;
  return {
    min: [x - shape.radius, z - shape.radius] as Point2,
    max: [x + shape.radius, z + shape.radius] as Point2,
  };
}

function shapesOverlap(a: Shape, b: Shape): boolean {
  const centerA = toXZ(a.center);
  const centerB = toXZ(b.center);
  if (a.kind === "circle" && b.kind === "circle") {
    return circlesOverlap(centerA, a.radius, centerB, b.radius);
  }
  if (a.kind === "box" && b.kind === "box") {
    const boxA = {
      min: [centerA[0] - a.radius, centerA[1] - a.radius] as Point2,
      max: [centerA[0] + a.radius, centerA[1] + a.radius] as Point2,
    };
    const boxB = {
      min: [centerB[0] - b.radius, centerB[1] - b.radius] as Point2,
      max: [centerB[0] + b.radius, centerB[1] + b.radius] as Point2,
    };
    return (
      boxA.min[0] <= boxB.max[0] &&
      boxA.max[0] >= boxB.min[0] &&
      boxA.min[1] <= boxB.max[1] &&
      boxA.max[1] >= boxB.min[1]
    );
  }
  const circle = a.kind === "circle" ? a : b;
  const box = a.kind === "box" ? a : b;
  return circleAabbOverlap(toXZ(circle.center), circle.radius, shapeToAabb(box));
}

function convexHullScenario(): QuizScenario {
  const points = randomPoints(7);
  const hull = fromXZAll(convexHull2D(toXZAll(points)));
  const markedIndex = Math.floor(Math.random() * points.length);
  const marked = points[markedIndex];
  const onHull = hull.some(
    (h) => Math.abs(h[0] - marked[0]) < 1e-6 && Math.abs(h[2] - marked[2]) < 1e-6,
  );

  return {
    topic: "convex-hull",
    question: `Is the highlighted point (${markedIndex === undefined ? "" : `P${markedIndex}`}) a vertex of the convex hull?`,
    answer: onHull,
    render: { topic: "convex-hull", points, hull, markedIndex },
  };
}

function voronoiScenario(): QuizScenario {
  const sites = randomPoints(5, 2.6);
  const siteXZ = toXZAll(sites);
  const cells = voronoiCells(siteXZ, 6).map(fromXZAll);
  const query = randomPoint(2.6);
  const queryXZ = toXZ(query);

  let nearest = 0;
  let bestDist = Infinity;
  siteXZ.forEach((s, i) => {
    const d = Math.hypot(s[0] - queryXZ[0], s[1] - queryXZ[1]);
    if (d < bestDist) {
      bestDist = d;
      nearest = i;
    }
  });

  const candidateSiteIndex =
    Math.random() < 0.5 ? nearest : Math.floor(Math.random() * sites.length);

  return {
    topic: "voronoi",
    question: `Is the marked query point inside Site ${candidateSiteIndex}'s region?`,
    answer: candidateSiteIndex === nearest,
    render: { topic: "voronoi", sites, cells, query, candidateSiteIndex },
  };
}

function edgeKey(a: Point2, b: Point2): string {
  const [s1, s2] = [a, b].sort((m, n) => m[0] - n[0] || m[1] - n[1]);
  return `${s1.join(",")}|${s2.join(",")}`;
}

function delaunayScenario(): QuizScenario {
  const points = randomPoints(6, 2.8);
  const pointsXZ = toXZAll(points);
  const triangles = delaunayTriangulation(pointsXZ);
  const realEdgeKeys = new Set<string>();
  const edges: [Vec3Tuple, Vec3Tuple][] = [];
  triangles.forEach((t) => {
    triangleEdges(t).forEach(([a, b]) => {
      const key = edgeKey(a, b);
      if (!realEdgeKeys.has(key)) {
        realEdgeKeys.add(key);
        edges.push([fromXZ(a), fromXZ(b)]);
      }
    });
  });

  const showRealEdge = Math.random() < 0.5;
  let candidateEdge: [Vec3Tuple, Vec3Tuple];
  if (showRealEdge && edges.length > 0) {
    candidateEdge = edges[Math.floor(Math.random() * edges.length)];
  } else {
    let i = 0;
    let j = 0;
    let attempts = 0;
    do {
      i = Math.floor(Math.random() * points.length);
      j = Math.floor(Math.random() * points.length);
      attempts++;
    } while (
      (i === j || realEdgeKeys.has(edgeKey(pointsXZ[i], pointsXZ[j]))) &&
      attempts < 40
    );
    candidateEdge = [points[i], points[j]];
  }

  const isReal = realEdgeKeys.has(
    edgeKey(toXZ(candidateEdge[0]), toXZ(candidateEdge[1])),
  );

  return {
    topic: "delaunay",
    question: "Is the highlighted dashed edge part of the Delaunay triangulation?",
    answer: isReal,
    render: { topic: "delaunay", points, edges, candidateEdge },
  };
}

function boundingBoxScenario(): QuizScenario {
  const points = randomPoints(6);
  const realBox = boundingBoxAABB(toXZAll(points));
  const showReal = Math.random() < 0.5;

  let box = realBox;
  if (!showReal) {
    const shrink = 0.25 + Math.random() * 0.3;
    const width = realBox.max[0] - realBox.min[0];
    const height = realBox.max[1] - realBox.min[1];
    box = {
      min: [
        realBox.min[0] + width * shrink * 0.5,
        realBox.min[1] + height * shrink * 0.5,
      ],
      max: [
        realBox.max[0] - width * shrink * 0.5,
        realBox.max[1] - height * shrink * 0.5,
      ],
    };
  }

  return {
    topic: "bounding-box",
    question: "Does this rectangle tightly bound every point (with no point outside it)?",
    answer: showReal,
    render: { topic: "bounding-box", points, box: fromXZAll(aabbCorners(box)) },
  };
}

function rayCastingScenario(): QuizScenario {
  const shapePoints = randomPoints(5, 2);
  const polygon = fromXZAll(convexHull2D(toXZAll(shapePoints)));
  const polygonXZ = toXZAll(polygon);

  const angle = Math.random() * Math.PI * 2;
  const originRadius = 5;
  const origin: Vec3Tuple = [
    Math.cos(angle) * originRadius,
    0,
    Math.sin(angle) * originRadius,
  ];

  const centroid: Point2 = [
    polygonXZ.reduce((s, p) => s + p[0], 0) / polygonXZ.length,
    polygonXZ.reduce((s, p) => s + p[1], 0) / polygonXZ.length,
  ];
  const toward = Math.atan2(
    centroid[1] - Math.sin(angle) * originRadius,
    centroid[0] - Math.cos(angle) * originRadius,
  );
  const jitter = (Math.random() - 0.5) * (Math.random() < 0.5 ? 0.35 : 1.8);
  const dirAngle = toward + jitter;
  const dir: Vec3Tuple = [Math.cos(dirAngle), 0, Math.sin(dirAngle)];

  const hit = rayIntersectsPolygon(toXZ(origin), toXZ(dir), polygonXZ);

  return {
    topic: "ray-casting",
    question: "Does the ray hit the shaded polygon?",
    answer: hit !== null,
    render: { topic: "ray-casting", origin, dir, polygon },
  };
}

function collisionScenario(): QuizScenario {
  const kindA = randomKind();
  const kindB = randomKind();
  const radiusA = 0.7 + Math.random() * 0.5;
  const radiusB = 0.7 + Math.random() * 0.5;

  const angle = Math.random() * Math.PI * 2;
  const separation = (radiusA + radiusB) * (0.4 + Math.random() * 1.6);
  const centerA: Vec3Tuple = [
    -Math.cos(angle) * separation * 0.5,
    0,
    -Math.sin(angle) * separation * 0.5,
  ];
  const centerB: Vec3Tuple = [
    Math.cos(angle) * separation * 0.5,
    0,
    Math.sin(angle) * separation * 0.5,
  ];

  const shapeA: Shape = { kind: kindA, center: centerA, radius: radiusA };
  const shapeB: Shape = { kind: kindB, center: centerB, radius: radiusB };

  return {
    topic: "collision",
    question: "Do these two shapes collide?",
    answer: shapesOverlap(shapeA, shapeB),
    render: { topic: "collision", shapeA, shapeB },
  };
}

const GENERATORS: Record<GeometryTopic, () => QuizScenario> = {
  "convex-hull": convexHullScenario,
  voronoi: voronoiScenario,
  delaunay: delaunayScenario,
  "bounding-box": boundingBoxScenario,
  "ray-casting": rayCastingScenario,
  collision: collisionScenario,
};

export function randomTopic(exclude?: GeometryTopic): GeometryTopic {
  const pool = TOPICS.map((t) => t.id).filter((id) => id !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function generateScenario(topic: GeometryTopic): QuizScenario {
  return GENERATORS[topic]();
}
