"use client";

import { useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute } from "three";
import type { Vec3Tuple } from "@/types/math";
import { PALETTE } from "@/constants/theme";

interface ConicCurveLinesProps {
  segments: [Vec3Tuple, Vec3Tuple][];
  color?: string;
}

/**
 * Renders disjoint 3D line segments (from `planeConeIntersection`) as one
 * draw call — deliberately not a connected polyline, since a hyperbola's
 * two branches (and a parabola's open ends) aren't one continuous path.
 */
export default function ConicCurveLines({
  segments,
  color = PALETTE.accent,
}: ConicCurveLinesProps) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(segments.length * 6);
    segments.forEach(([a, b], i) => {
      positions[i * 6] = a[0];
      positions[i * 6 + 1] = a[1];
      positions[i * 6 + 2] = a[2];
      positions[i * 6 + 3] = b[0];
      positions[i * 6 + 4] = b[1];
      positions[i * 6 + 5] = b[2];
    });
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geo;
  }, [segments]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} linewidth={3} />
    </lineSegments>
  );
}
