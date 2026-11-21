/** Shared defaults for every scene in the app, so modules stay visually consistent. */
export const SCENE_DEFAULTS = {
  gridSize: 20,
  gridDivisions: 20,
  cameraFov: 45,
  cameraNear: 0.1,
  cameraFar: 1000,
  cameraDefaultPosition: [6, 5, 8] as [number, number, number],
  cameraDampingFactor: 0.08,
  fogNear: 18,
  fogFar: 40,
  shadowMapSize: 2048,
} as const;

export const ANIMATION_DURATIONS = {
  fast: 0.25,
  base: 0.5,
  slow: 0.9,
  cinematic: 1.6,
} as const;

export const EASING = {
  standard: [0.22, 1, 0.36, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  spring: { tension: 210, friction: 24 },
} as const;
