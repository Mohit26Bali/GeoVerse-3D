import type { Vec3Tuple } from "@/types/math";
import { distance } from "@/math/vector";

const GRID_STEP = 0.5;
const SNAP_RADIUS = 0.3;

function snapToGrid(v: Vec3Tuple): Vec3Tuple {
  return [
    Math.round(v[0] / GRID_STEP) * GRID_STEP,
    Math.round(v[1] / GRID_STEP) * GRID_STEP,
    Math.round(v[2] / GRID_STEP) * GRID_STEP,
  ];
}

/**
 * Snaps a candidate placement point to the origin, an existing point, or the
 * grid, in that priority order — the same "snap to something meaningful
 * first, fall back to the grid" behavior every CAD/design tool uses.
 */
export function snapPoint(candidate: Vec3Tuple, existingPoints: Vec3Tuple[]): Vec3Tuple {
  const origin: Vec3Tuple = [0, 0, 0];
  if (distance(candidate, origin) < SNAP_RADIUS) return origin;

  for (const point of existingPoints) {
    if (distance(candidate, point) < SNAP_RADIUS) return point;
  }

  return snapToGrid(candidate);
}
