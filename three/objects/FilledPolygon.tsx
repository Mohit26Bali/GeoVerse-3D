"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { Vec3Tuple } from "@/types/math";
import { PALETTE } from "@/constants/theme";

interface FilledPolygonProps {
  /** Convex polygon vertices in order, y is ignored and reset to `y`. */
  points: Vec3Tuple[];
  y?: number;
  color?: string;
  opacity?: number;
}

/** Flat fan-triangulated mesh for a convex polygon lying on the ground plane. */
export default function FilledPolygon({
  points,
  y = 0.005,
  color = PALETTE.primary,
  opacity = 0.2,
}: FilledPolygonProps) {
  const geometry = useMemo(() => {
    if (points.length < 3) return null;
    const vertices: number[] = [];
    const indices: number[] = [];
    points.forEach((p) => vertices.push(p[0], y, p[2]));
    for (let i = 1; i < points.length - 1; i++) {
      indices.push(0, i, i + 1);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [points, y]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
