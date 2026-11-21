import type { Vec3Tuple, LineDef, PlaneDef } from "@/types/math";
import {
  add,
  cross,
  dot,
  magnitude,
  orthonormalBasis,
  scale,
  subtract,
} from "@/math/vector";

/** Points around a circle in 3D: `center` in a plane spanned by `u`/`v` (orthonormal, perpendicular to the circle's normal). */
export function circlePoints3D(
  center: Vec3Tuple,
  radius: number,
  normal: Vec3Tuple,
  segments = 64,
): Vec3Tuple[] {
  const [u, v] = orthonormalBasis(normal);
  const points: Vec3Tuple[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const cosT = Math.cos(t) * radius;
    const sinT = Math.sin(t) * radius;
    points.push(add(center, add(scale(u, cosT), scale(v, sinT))));
  }
  return points;
}

/** The great circle (radius = sphere radius) through two points on a sphere centered at `center`. */
export function greatCirclePoints3D(
  center: Vec3Tuple,
  radius: number,
  p1: Vec3Tuple,
  p2: Vec3Tuple,
  segments = 64,
): Vec3Tuple[] {
  const normal = cross(subtract(p1, center), subtract(p2, center));
  if (magnitude(normal) < 1e-9) {
    // p1 and p2 are antipodal or coincident — any plane through both works.
    return circlePoints3D(center, radius, subtract(p1, center), segments);
  }
  return circlePoints3D(center, radius, normal, segments);
}

/** Closest point on an infinite line to an arbitrary point in space. */
export function closestPointOnLine(line: LineDef, point: Vec3Tuple): Vec3Tuple {
  const dir = line.direction;
  const dirLenSq = dot(dir, dir);
  if (dirLenSq === 0) return line.point;
  const t = dot(subtract(point, line.point), dir) / dirLenSq;
  return add(line.point, scale(dir, t));
}

export function distancePointToLine(line: LineDef, point: Vec3Tuple): number {
  return magnitude(subtract(point, closestPointOnLine(line, point)));
}

export function distancePointToPlane(plane: PlaneDef, point: Vec3Tuple): number {
  const n = plane.normal;
  const nLen = magnitude(n);
  if (nLen === 0) return 0;
  return Math.abs(dot(subtract(point, plane.point), n)) / nLen;
}

export function closestPointOnPlane(plane: PlaneDef, point: Vec3Tuple): Vec3Tuple {
  const n = plane.normal;
  const nLenSq = dot(n, n);
  if (nLenSq === 0) return point;
  const signedDist = dot(subtract(point, plane.point), n) / nLenSq;
  return subtract(point, scale(n, signedDist));
}

/** Plane through three non-collinear points. */
export function planeFromPoints(p1: Vec3Tuple, p2: Vec3Tuple, p3: Vec3Tuple): PlaneDef {
  const normal = cross(subtract(p2, p1), subtract(p3, p1));
  return { id: "derived-plane", point: p1, normal };
}

/** Intersection of a line and a plane, or null if parallel (no/infinite intersection). */
export function lineIntersectsPlane(line: LineDef, plane: PlaneDef): Vec3Tuple | null {
  const denom = dot(plane.normal, line.direction);
  if (Math.abs(denom) < 1e-9) return null;
  const t = dot(plane.normal, subtract(plane.point, line.point)) / denom;
  return add(line.point, scale(line.direction, t));
}

/** Line of intersection between two planes, or null if parallel. */
export function planeIntersectsPlane(a: PlaneDef, b: PlaneDef): LineDef | null {
  const direction = cross(a.normal, b.normal);
  if (magnitude(direction) < 1e-9) return null;
  // Solve for a point on the intersection line via the two plane equations.
  const n1 = a.normal;
  const n2 = b.normal;
  const d1 = dot(n1, a.point);
  const d2 = dot(n2, b.point);
  const n1n2 = dot(n1, n2);
  const n1n1 = dot(n1, n1);
  const n2n2 = dot(n2, n2);
  const denom = n1n1 * n2n2 - n1n2 * n1n2;
  const c1 = (d1 * n2n2 - d2 * n1n2) / denom;
  const c2 = (d2 * n1n1 - d1 * n1n2) / denom;
  const point = add(scale(n1, c1), scale(n2, c2));
  return { id: "derived-line", point, direction };
}

export interface LineClosestApproach {
  pointOnA: Vec3Tuple;
  pointOnB: Vec3Tuple;
  distance: number;
}

/**
 * The shortest segment connecting two lines in 3D. Two lines that aren't
 * parallel and don't intersect are "skew" — this is the general case, and
 * the formula degrades gracefully to the parallel case (a fixed offset
 * between the lines) when their directions are proportional.
 */
export function closestApproachBetweenLines(a: LineDef, b: LineDef): LineClosestApproach {
  const r = subtract(a.point, b.point);
  const d1 = a.direction;
  const d2 = b.direction;
  const aCoef = dot(d1, d1);
  const bCoef = dot(d1, d2);
  const cCoef = dot(d2, d2);
  const dCoef = dot(d1, r);
  const eCoef = dot(d2, r);
  const denom = aCoef * cCoef - bCoef * bCoef;

  let s: number;
  let t: number;
  if (Math.abs(denom) < 1e-9) {
    // Parallel lines: any s works, so anchor at s = 0 and solve for t.
    s = 0;
    t = cCoef > 1e-9 ? eCoef / cCoef : 0;
  } else {
    s = (bCoef * eCoef - cCoef * dCoef) / denom;
    t = (aCoef * eCoef - bCoef * dCoef) / denom;
  }

  const pointOnA = add(a.point, scale(d1, s));
  const pointOnB = add(b.point, scale(d2, t));
  return { pointOnA, pointOnB, distance: magnitude(subtract(pointOnA, pointOnB)) };
}

/** A parameter range a 1D locus's `t` is allowed to take: a line is unbounded, a ray is [0, ∞), a segment is [0, 1]. */
export type ParamBound = [number, number];

export const LINE_BOUND: ParamBound = [-Infinity, Infinity];
export const RAY_BOUND: ParamBound = [0, Infinity];
export const SEGMENT_BOUND: ParamBound = [0, 1];

function clampParam(t: number, [lo, hi]: ParamBound): number {
  return Math.max(lo, Math.min(hi, t));
}

function projectParam(
  origin: Vec3Tuple,
  direction: Vec3Tuple,
  target: Vec3Tuple,
): number {
  const lenSq = dot(direction, direction);
  if (lenSq === 0) return 0;
  return dot(subtract(target, origin), direction) / lenSq;
}

/**
 * Closest approach between any two of {line, ray, segment}, expressed as a
 * point + direction + allowed parameter range on each side.
 *
 * The squared distance is a convex quadratic in the two parameters (s, t), so
 * its minimum over the allowed box is either the unconstrained optimum (when it
 * is allowed) or lies on the box boundary, where one parameter is pinned to one
 * of its limits and the other is the best clamped projection. Checking those
 * few candidates gives the exact answer for every pairing, including nearly
 * parallel lines where an iterative method converges slowly.
 */
export function closestApproachBounded(
  p1: Vec3Tuple,
  d1: Vec3Tuple,
  bound1: ParamBound,
  p2: Vec3Tuple,
  d2: Vec3Tuple,
  bound2: ParamBound,
): LineClosestApproach {
  const pointAt = (p: Vec3Tuple, d: Vec3Tuple, t: number): Vec3Tuple =>
    add(p, scale(d, t));
  const gap = (s: number, t: number) =>
    magnitude(subtract(pointAt(p1, d1, s), pointAt(p2, d2, t)));

  const candidates: [number, number][] = [];

  // Unconstrained optimum (skipped when the directions are parallel or degenerate).
  const r = subtract(p1, p2);
  const a = dot(d1, d1);
  const b = dot(d1, d2);
  const c = dot(d2, d2);
  const denom = a * c - b * b;
  if (a > 0 && c > 0 && denom > 1e-12 * a * c) {
    const d = dot(d1, r);
    const e = dot(d2, r);
    const s = (b * e - c * d) / denom;
    const t = (a * e - b * d) / denom;
    if (s >= bound1[0] && s <= bound1[1] && t >= bound2[0] && t <= bound2[1])
      candidates.push([s, t]);
  }

  // One parameter pinned to a finite limit, the other the best clamped projection.
  for (const s of bound1) {
    if (!Number.isFinite(s)) continue;
    const t = clampParam(projectParam(p2, d2, pointAt(p1, d1, s)), bound2);
    candidates.push([s, t]);
  }
  for (const t of bound2) {
    if (!Number.isFinite(t)) continue;
    const s = clampParam(projectParam(p1, d1, pointAt(p2, d2, t)), bound1);
    candidates.push([s, t]);
  }

  // Fallback for two parallel unbounded loci (any s works): anchor at the nearest allowed s to 0.
  const s0 = clampParam(0, bound1);
  candidates.push([s0, clampParam(projectParam(p2, d2, pointAt(p1, d1, s0)), bound2)]);

  let best = candidates[0];
  for (const cand of candidates)
    if (gap(cand[0], cand[1]) < gap(best[0], best[1])) best = cand;

  const [s, t] = best;
  const pointOnA = pointAt(p1, d1, s);
  const pointOnB = pointAt(p2, d2, t);
  return { pointOnA, pointOnB, distance: magnitude(subtract(pointOnA, pointOnB)) };
}

/** Closest point on a finite segment [a, b] to an arbitrary point (clamped, unlike the infinite-line version). */
export function closestPointOnSegment(
  a: Vec3Tuple,
  b: Vec3Tuple,
  point: Vec3Tuple,
): Vec3Tuple {
  const ab = subtract(b, a);
  const abLenSq = dot(ab, ab);
  if (abLenSq === 0) return a;
  const t = Math.max(0, Math.min(1, dot(subtract(point, a), ab) / abLenSq));
  return add(a, scale(ab, t));
}

export function distancePointToSegment(
  a: Vec3Tuple,
  b: Vec3Tuple,
  point: Vec3Tuple,
): number {
  return magnitude(subtract(point, closestPointOnSegment(a, b, point)));
}

/** Closest point on a ray (t >= 0 only) to an arbitrary point. */
export function closestPointOnRay(
  origin: Vec3Tuple,
  direction: Vec3Tuple,
  point: Vec3Tuple,
): Vec3Tuple {
  const dirLenSq = dot(direction, direction);
  if (dirLenSq === 0) return origin;
  const t = Math.max(0, dot(subtract(point, origin), direction) / dirLenSq);
  return add(origin, scale(direction, t));
}

export function distancePointToRay(
  origin: Vec3Tuple,
  direction: Vec3Tuple,
  point: Vec3Tuple,
): number {
  return magnitude(subtract(point, closestPointOnRay(origin, direction, point)));
}

/** Where a finite segment [a, b] crosses a plane, or null if parallel or the crossing falls outside the segment. */
export function segmentIntersectsPlane(
  a: Vec3Tuple,
  b: Vec3Tuple,
  plane: PlaneDef,
): Vec3Tuple | null {
  const dir = subtract(b, a);
  const denom = dot(plane.normal, dir);
  if (Math.abs(denom) < 1e-9) return null;
  const t = dot(plane.normal, subtract(plane.point, a)) / denom;
  if (t < 0 || t > 1) return null;
  return add(a, scale(dir, t));
}

/** Nearest point where a finite segment [a, b] enters a sphere, or null if it never reaches it. */
export function segmentSphereIntersection(
  a: Vec3Tuple,
  b: Vec3Tuple,
  center: Vec3Tuple,
  radius: number,
): Vec3Tuple | null {
  const dir = subtract(b, a);
  const oc = subtract(a, center);
  const aCoef = dot(dir, dir);
  const bCoef = 2 * dot(oc, dir);
  const cCoef = dot(oc, oc) - radius * radius;
  const discriminant = bCoef * bCoef - 4 * aCoef * cCoef;
  if (discriminant < 0) return null;

  const sqrtD = Math.sqrt(discriminant);
  const t1 = (-bCoef - sqrtD) / (2 * aCoef);
  const t2 = (-bCoef + sqrtD) / (2 * aCoef);
  const validTs = [t1, t2].filter((t) => t >= 0 && t <= 1);
  if (validTs.length === 0) return null;
  return add(a, scale(dir, Math.min(...validTs)));
}

/** Where a ray (not a full line) first meets a plane, or null if parallel or the plane is behind the ray's origin. */
export function rayIntersectsPlane(
  origin: Vec3Tuple,
  direction: Vec3Tuple,
  plane: PlaneDef,
): Vec3Tuple | null {
  const denom = dot(plane.normal, direction);
  if (Math.abs(denom) < 1e-9) return null;
  const t = dot(plane.normal, subtract(plane.point, origin)) / denom;
  if (t < 0) return null;
  return add(origin, scale(direction, t));
}

/** Nearest point where a ray meets a sphere's surface, or null if it misses or the sphere is behind the origin. */
export function raySphereIntersection(
  origin: Vec3Tuple,
  direction: Vec3Tuple,
  center: Vec3Tuple,
  radius: number,
): Vec3Tuple | null {
  const oc = subtract(origin, center);
  const a = dot(direction, direction);
  const b = 2 * dot(oc, direction);
  const c = dot(oc, oc) - radius * radius;
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null;

  const sqrtD = Math.sqrt(discriminant);
  const t1 = (-b - sqrtD) / (2 * a);
  const t2 = (-b + sqrtD) / (2 * a);
  const t = t1 >= 0 ? t1 : t2 >= 0 ? t2 : null;
  if (t === null) return null;
  return add(origin, scale(direction, t));
}

export function triangleArea(a: Vec3Tuple, b: Vec3Tuple, c: Vec3Tuple): number {
  return magnitude(cross(subtract(b, a), subtract(c, a))) / 2;
}

/** Signed volume of the parallelepiped (scalar triple product) — also 6x tetra volume. */
export function tripleProduct(a: Vec3Tuple, b: Vec3Tuple, c: Vec3Tuple): number {
  return dot(a, cross(b, c));
}
