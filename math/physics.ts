import type { Vec3Tuple } from "@/types/math";

export type Vec2 = [number, number];

/**
 * Simple, deliberately un-realistic physics used for the Real-World
 * Applications vignettes: just enough to connect earlier modules (conic
 * sections, vectors) to a moving simulation, not a physics engine.
 */

export interface ProjectileResult {
  points: Vec3Tuple[];
  range: number;
  maxHeight: number;
  timeOfFlight: number;
}

/** Trajectory of a launched projectile under constant gravity, in the X-Y vertical plane (z = 0). */
export function projectileTrajectory(
  speed: number,
  angleRad: number,
  gravity = 9.8,
  samples = 80,
): ProjectileResult {
  const vx = speed * Math.cos(angleRad);
  const vy = speed * Math.sin(angleRad);
  const timeOfFlight = (2 * vy) / gravity;
  const range = vx * timeOfFlight;
  const maxHeight = (vy * vy) / (2 * gravity);

  const points: Vec3Tuple[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = (timeOfFlight * i) / samples;
    const x = vx * t;
    const y = Math.max(0, vy * t - 0.5 * gravity * t * t);
    points.push([x, y, 0]);
  }

  return { points, range, maxHeight, timeOfFlight };
}

export function projectilePositionAtTime(
  speed: number,
  angleRad: number,
  gravity: number,
  t: number,
): Vec3Tuple {
  const vx = speed * Math.cos(angleRad);
  const vy = speed * Math.sin(angleRad);
  return [vx * t, Math.max(0, vy * t - 0.5 * gravity * t * t), 0];
}

export type OrbitKind = "ellipse" | "parabola" | "hyperbola";

export interface OrbitClassification {
  kind: OrbitKind;
  specificEnergy: number;
}

/** Classifies a trajectory by its specific orbital energy — the same three conic types as the Conic Sections module. */
export function classifyOrbit(
  position: Vec2,
  velocity: Vec2,
  mu: number,
): OrbitClassification {
  const r = Math.hypot(position[0], position[1]);
  const v2 = velocity[0] * velocity[0] + velocity[1] * velocity[1];
  const specificEnergy = v2 / 2 - mu / r;
  const kind: OrbitKind =
    specificEnergy < -1e-3 ? "ellipse" : specificEnergy > 1e-3 ? "hyperbola" : "parabola";
  return { kind, specificEnergy };
}

/**
 * Integrates a two-body gravitational orbit (central mass fixed at the origin) using
 * semi-implicit Euler — stable enough for a short visual trace, not for long-term accuracy.
 */
export function orbitPath(
  position: Vec2,
  velocity: Vec2,
  mu: number,
  steps: number,
  dt: number,
  minRadius = 0.3,
): Vec3Tuple[] {
  const points: Vec3Tuple[] = [[position[0], 0, position[1]]];
  let pos: Vec2 = [...position];
  let vel: Vec2 = [...velocity];

  for (let i = 0; i < steps; i++) {
    const r = Math.max(minRadius, Math.hypot(pos[0], pos[1]));
    const accelMag = mu / (r * r);
    const ax = (-accelMag * pos[0]) / r;
    const az = (-accelMag * pos[1]) / r;

    vel = [vel[0] + ax * dt, vel[1] + az * dt];
    pos = [pos[0] + vel[0] * dt, pos[1] + vel[1] * dt];
    points.push([pos[0], 0, pos[1]]);

    if (Math.hypot(pos[0], pos[1]) > 40) break;
  }

  return points;
}
