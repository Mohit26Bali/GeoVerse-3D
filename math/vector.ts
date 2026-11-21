import { Vector3 } from "three";
import type { Vec3Tuple } from "@/types/math";

/**
 * Thin wrappers around THREE.Vector3 that operate on plain tuples, so the
 * rest of the app (store, modules, explanation layer) never has to import
 * `three` just to do arithmetic. Mathematical source of truth for the app.
 */

export const toVector3 = (v: Vec3Tuple): Vector3 => new Vector3(v[0], v[1], v[2]);

export const toTuple = (v: Vector3): Vec3Tuple => [v.x, v.y, v.z];

export function add(a: Vec3Tuple, b: Vec3Tuple): Vec3Tuple {
  return toTuple(toVector3(a).add(toVector3(b)));
}

export function subtract(a: Vec3Tuple, b: Vec3Tuple): Vec3Tuple {
  return toTuple(toVector3(a).sub(toVector3(b)));
}

export function scale(a: Vec3Tuple, s: number): Vec3Tuple {
  return toTuple(toVector3(a).multiplyScalar(s));
}

export function magnitude(a: Vec3Tuple): number {
  return toVector3(a).length();
}

export function normalize(a: Vec3Tuple): Vec3Tuple {
  const v = toVector3(a);
  if (v.lengthSq() === 0) return [0, 0, 0];
  return toTuple(v.normalize());
}

export function dot(a: Vec3Tuple, b: Vec3Tuple): number {
  return toVector3(a).dot(toVector3(b));
}

export function cross(a: Vec3Tuple, b: Vec3Tuple): Vec3Tuple {
  return toTuple(toVector3(a).cross(toVector3(b)));
}

export function distance(a: Vec3Tuple, b: Vec3Tuple): number {
  return toVector3(a).distanceTo(toVector3(b));
}

export function midpoint(a: Vec3Tuple, b: Vec3Tuple): Vec3Tuple {
  return toTuple(toVector3(a).add(toVector3(b)).multiplyScalar(0.5));
}

export function lerp(a: Vec3Tuple, b: Vec3Tuple, t: number): Vec3Tuple {
  return toTuple(toVector3(a).lerp(toVector3(b), t));
}

/** Angle between two vectors, in radians. */
export function angleBetween(a: Vec3Tuple, b: Vec3Tuple): number {
  return toVector3(a).angleTo(toVector3(b));
}

/** Scalar projection of `a` onto `b` (length of the shadow `a` casts on `b`). */
export function scalarProjection(a: Vec3Tuple, b: Vec3Tuple): number {
  const bLen = magnitude(b);
  if (bLen === 0) return 0;
  return dot(a, b) / bLen;
}

/** Vector projection of `a` onto `b`. */
export function vectorProjection(a: Vec3Tuple, b: Vec3Tuple): Vec3Tuple {
  const bLenSq = dot(b, b);
  if (bLenSq === 0) return [0, 0, 0];
  return scale(b, dot(a, b) / bLenSq);
}

/** Any two unit vectors perpendicular to `n` and to each other — a basis for the plane through the origin with normal `n`. */
export function orthonormalBasis(n: Vec3Tuple): [Vec3Tuple, Vec3Tuple] {
  const normal = toVector3(normalize(n));
  const helper = Math.abs(normal.x) < 0.9 ? new Vector3(1, 0, 0) : new Vector3(0, 1, 0);
  const u = new Vector3().crossVectors(normal, helper).normalize();
  const v = new Vector3().crossVectors(normal, u).normalize();
  return [toTuple(u), toTuple(v)];
}
