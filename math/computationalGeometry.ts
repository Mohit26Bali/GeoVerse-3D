import type { Vec3Tuple } from "@/types/math";

/**
 * All algorithms here work in 2D (x, z), with y fixed at 0 — the ground
 * plane every module scene already renders. Point2 = [x, z].
 */
export type Point2 = [number, number];

export const toXZ = (p: Vec3Tuple): Point2 => [p[0], p[2]];
export const fromXZ = (p: Point2): Vec3Tuple => [p[0], 0, p[1]];
export const toXZAll = (ps: Vec3Tuple[]): Point2[] => ps.map(toXZ);
export const fromXZAll = (ps: Point2[]): Vec3Tuple[] => ps.map(fromXZ);

function cross2(o: Point2, a: Point2, b: Point2): number {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

function dist2(a: Point2, b: Point2): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

/** Andrew's monotone chain convex hull. Returns hull vertices in CCW order. */
export function convexHull2D(points: Point2[]): Point2[] {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length < 3) return pts;

  const lower: Point2[] = [];
  for (const p of pts) {
    while (
      lower.length >= 2 &&
      cross2(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    ) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: Point2[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (
      upper.length >= 2 &&
      cross2(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    ) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return [...lower, ...upper];
}

/** True if `p` lies strictly inside (or on) a convex polygon given in CCW order. */
export function pointInConvexPolygon(p: Point2, hull: Point2[]): boolean {
  for (let i = 0; i < hull.length; i++) {
    const a = hull[i];
    const b = hull[(i + 1) % hull.length];
    if (cross2(a, b, p) < -1e-9) return false;
  }
  return true;
}

/** Crossing-number point-in-polygon test — works for any simple polygon, convex or not. */
export function pointInPolygonRayCast(p: Point2, polygon: Point2[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, zi] = polygon[i];
    const [xj, zj] = polygon[j];
    const intersects =
      zi > p[1] !== zj > p[1] && p[0] < ((xj - xi) * (p[1] - zi)) / (zj - zi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

export interface AABB2 {
  min: Point2;
  max: Point2;
}

export function boundingBoxAABB(points: Point2[]): AABB2 {
  const xs = points.map((p) => p[0]);
  const zs = points.map((p) => p[1]);
  return {
    min: [Math.min(...xs), Math.min(...zs)],
    max: [Math.max(...xs), Math.max(...zs)],
  };
}

export function aabbCorners(box: AABB2): Point2[] {
  return [
    [box.min[0], box.min[1]],
    [box.max[0], box.min[1]],
    [box.max[0], box.max[1]],
    [box.min[0], box.max[1]],
  ];
}

export function aabbsOverlap(a: AABB2, b: AABB2): boolean {
  return (
    a.min[0] <= b.max[0] &&
    a.max[0] >= b.min[0] &&
    a.min[1] <= b.max[1] &&
    a.max[1] >= b.min[1]
  );
}

export function circlesOverlap(
  centerA: Point2,
  radiusA: number,
  centerB: Point2,
  radiusB: number,
): boolean {
  return dist2(centerA, centerB) <= radiusA + radiusB;
}

export function circleAabbOverlap(center: Point2, radius: number, box: AABB2): boolean {
  const closestX = Math.max(box.min[0], Math.min(center[0], box.max[0]));
  const closestZ = Math.max(box.min[1], Math.min(center[1], box.max[1]));
  return dist2(center, [closestX, closestZ]) <= radius;
}

/** Separating Axis Theorem overlap test for two convex polygons (CCW order). */
export function polygonsOverlapSAT(a: Point2[], b: Point2[]): boolean {
  const polygons = [a, b];
  for (const poly of polygons) {
    for (let i = 0; i < poly.length; i++) {
      const p1 = poly[i];
      const p2 = poly[(i + 1) % poly.length];
      const axis: Point2 = [-(p2[1] - p1[1]), p2[0] - p1[0]];

      const project = (pts: Point2[]) => {
        const vals = pts.map((p) => p[0] * axis[0] + p[1] * axis[1]);
        return [Math.min(...vals), Math.max(...vals)];
      };

      const [minA, maxA] = project(a);
      const [minB, maxB] = project(b);
      if (maxA < minB || maxB < minA) return false;
    }
  }
  return true;
}

/** Ray-segment intersection. Returns the hit point, or null if no hit within the ray's forward half-line. */
export function rayIntersectsSegment(
  origin: Point2,
  dir: Point2,
  a: Point2,
  b: Point2,
): Point2 | null {
  const v1 = [origin[0] - a[0], origin[1] - a[1]];
  const v2 = [b[0] - a[0], b[1] - a[1]];
  const v3 = [-dir[1], dir[0]];

  const denom = v2[0] * v3[0] + v2[1] * v3[1];
  if (Math.abs(denom) < 1e-9) return null;

  const t1 = (v2[0] * v1[1] - v2[1] * v1[0]) / denom;
  const t2 = (v1[0] * v3[0] + v1[1] * v3[1]) / denom;

  if (t1 >= 0 && t2 >= 0 && t2 <= 1) {
    return [origin[0] + dir[0] * t1, origin[1] + dir[1] * t1];
  }
  return null;
}

export function rayIntersectsCircle(
  origin: Point2,
  dir: Point2,
  center: Point2,
  radius: number,
): Point2 | null {
  const oc = [origin[0] - center[0], origin[1] - center[1]];
  const a = dir[0] * dir[0] + dir[1] * dir[1];
  const b = 2 * (oc[0] * dir[0] + oc[1] * dir[1]);
  const c = oc[0] * oc[0] + oc[1] * oc[1] - radius * radius;
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null;

  const sqrtD = Math.sqrt(discriminant);
  const t1 = (-b - sqrtD) / (2 * a);
  const t2 = (-b + sqrtD) / (2 * a);
  const t = t1 >= 0 ? t1 : t2 >= 0 ? t2 : null;
  if (t === null) return null;
  return [origin[0] + dir[0] * t, origin[1] + dir[1] * t];
}

/** Polygon edges as [a, b] pairs, for ray-vs-polygon hit testing. */
export function polygonEdges(polygon: Point2[]): [Point2, Point2][] {
  return polygon.map(
    (p, i) => [p, polygon[(i + 1) % polygon.length]] as [Point2, Point2],
  );
}

export function rayIntersectsPolygon(
  origin: Point2,
  dir: Point2,
  polygon: Point2[],
): Point2 | null {
  let closest: Point2 | null = null;
  let closestDist = Infinity;
  for (const [a, b] of polygonEdges(polygon)) {
    const hit = rayIntersectsSegment(origin, dir, a, b);
    if (hit) {
      const d = dist2(origin, hit);
      if (d < closestDist) {
        closestDist = d;
        closest = hit;
      }
    }
  }
  return closest;
}

/** Clip a convex polygon by the half-plane { p : dot(p - pointOnLine, normal) <= 0 } (Sutherland-Hodgman). */
function clipHalfPlane(polygon: Point2[], normal: Point2, pointOnLine: Point2): Point2[] {
  const side = (p: Point2) =>
    (p[0] - pointOnLine[0]) * normal[0] + (p[1] - pointOnLine[1]) * normal[1];

  const output: Point2[] = [];
  for (let i = 0; i < polygon.length; i++) {
    const current = polygon[i];
    const prev = polygon[(i - 1 + polygon.length) % polygon.length];
    const currentIn = side(current) <= 1e-9;
    const prevIn = side(prev) <= 1e-9;

    if (currentIn !== prevIn) {
      const sPrev = side(prev);
      const sCurrent = side(current);
      const t = sPrev / (sPrev - sCurrent);
      output.push([
        prev[0] + t * (current[0] - prev[0]),
        prev[1] + t * (current[1] - prev[1]),
      ]);
    }
    if (currentIn) output.push(current);
  }
  return output;
}

/** Bounded Voronoi cells: for each site, the region closer to it than any other site, clipped to a square. */
export function voronoiCells(sites: Point2[], halfSize = 6): Point2[][] {
  const square: Point2[] = [
    [-halfSize, -halfSize],
    [halfSize, -halfSize],
    [halfSize, halfSize],
    [-halfSize, halfSize],
  ];

  return sites.map((site, i) => {
    let cell = square;
    sites.forEach((other, j) => {
      if (i === j) return;
      const normal: Point2 = [other[0] - site[0], other[1] - site[1]];
      const midpoint: Point2 = [(site[0] + other[0]) / 2, (site[1] + other[1]) / 2];
      cell = clipHalfPlane(cell, normal, midpoint);
    });
    return cell;
  });
}

export interface Triangle2 {
  a: Point2;
  b: Point2;
  c: Point2;
}

function circumcircle(t: Triangle2): { center: Point2; radiusSq: number } {
  const { a, b, c } = t;
  const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
  const ux =
    ((a[0] * a[0] + a[1] * a[1]) * (b[1] - c[1]) +
      (b[0] * b[0] + b[1] * b[1]) * (c[1] - a[1]) +
      (c[0] * c[0] + c[1] * c[1]) * (a[1] - b[1])) /
    d;
  const uy =
    ((a[0] * a[0] + a[1] * a[1]) * (c[0] - b[0]) +
      (b[0] * b[0] + b[1] * b[1]) * (a[0] - c[0]) +
      (c[0] * c[0] + c[1] * c[1]) * (b[0] - a[0])) /
    d;
  const center: Point2 = [ux, uy];
  return { center, radiusSq: dist2(center, a) ** 2 };
}

/** Bowyer-Watson incremental Delaunay triangulation. Returns triangles referencing the input points. */
export function delaunayTriangulation(points: Point2[]): Triangle2[] {
  if (points.length < 3) return [];

  const xs = points.map((p) => p[0]);
  const zs = points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);
  const dx = maxX - minX || 1;
  const dz = maxZ - minZ || 1;
  const midX = (minX + maxX) / 2;
  const midZ = (minZ + maxZ) / 2;
  const spanMax = Math.max(dx, dz) * 1000; // a small super-triangle cuts slivers off the hull

  const superA: Point2 = [midX - spanMax, midZ - spanMax];
  const superB: Point2 = [midX + spanMax, midZ - spanMax];
  const superC: Point2 = [midX, midZ + spanMax];

  let triangles: Triangle2[] = [{ a: superA, b: superB, c: superC }];

  for (const point of points) {
    const bad: Triangle2[] = [];
    const good: Triangle2[] = [];
    for (const t of triangles) {
      const { center, radiusSq } = circumcircle(t);
      if (dist2(center, point) ** 2 <= radiusSq + 1e-9) bad.push(t);
      else good.push(t);
    }

    const edgeKey = (p: Point2, q: Point2) =>
      [p, q].sort((m, n) => m[0] - n[0] || m[1] - n[1]);
    const edgeCount = new Map<string, { edge: [Point2, Point2]; count: number }>();
    for (const t of bad) {
      const edges: [Point2, Point2][] = [
        [t.a, t.b],
        [t.b, t.c],
        [t.c, t.a],
      ];
      for (const [p, q] of edges) {
        const [s1, s2] = edgeKey(p, q);
        const key = `${s1.join(",")}|${s2.join(",")}`;
        const entry = edgeCount.get(key);
        if (entry) entry.count++;
        else edgeCount.set(key, { edge: [p, q], count: 1 });
      }
    }

    const boundary = [...edgeCount.values()]
      .filter((e) => e.count === 1)
      .map((e) => e.edge);
    const newTriangles = boundary.map(([p, q]) => ({ a: p, b: q, c: point }));
    triangles = [...good, ...newTriangles];
  }

  const isSuperVertex = (p: Point2) => p === superA || p === superB || p === superC;
  return triangles.filter(
    (t) => !isSuperVertex(t.a) && !isSuperVertex(t.b) && !isSuperVertex(t.c),
  );
}

export function triangleEdges(t: Triangle2): [Point2, Point2][] {
  return [
    [t.a, t.b],
    [t.b, t.c],
    [t.c, t.a],
  ];
}
