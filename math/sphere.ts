/** Pure sphere formulas — no rendering concerns, reused by Explore/Guided/Practice/Challenge. */

export function sphereSurfaceArea(radius: number): number {
  return 4 * Math.PI * radius * radius;
}

export function sphereVolume(radius: number): number {
  return (4 / 3) * Math.PI * radius ** 3;
}

/** Radius of the circle formed by slicing a sphere with a plane `offset` from its center, or 0 if the plane misses the sphere. */
export function crossSectionRadius(radius: number, offset: number): number {
  const rSq = radius * radius - offset * offset;
  return rSq > 0 ? Math.sqrt(rSq) : 0;
}

/** Volume of a spherical cap of height `h` (0 = empty, 2*radius = full), measured from the bottom of the sphere. */
export function sphericalCapVolume(radius: number, h: number): number {
  const clamped = Math.max(0, Math.min(h, 2 * radius));
  return (Math.PI * clamped * clamped * (3 * radius - clamped)) / 3;
}

export function greatCircleCircumference(radius: number): number {
  return 2 * Math.PI * radius;
}
