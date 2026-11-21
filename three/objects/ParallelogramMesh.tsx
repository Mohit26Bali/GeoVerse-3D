"use client";

import { useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute, DoubleSide } from "three";
import type { Vec3Tuple } from "@/types/math";
import { add } from "@/math/vector";

interface ParallelogramMeshProps {
  origin?: Vec3Tuple;
  a: Vec3Tuple;
  b: Vec3Tuple;
  color?: string;
  opacity?: number;
}

/**
 * The parallelogram spanned by two vectors from a common origin — visualizes
 * the geometric meaning of a cross product's magnitude (its area) or a
 * determinant. Built as a two-triangle BufferGeometry rather than composing
 * primitives, since it's an arbitrary quad, not an axis-aligned shape.
 */
export default function ParallelogramMesh({
  origin = [0, 0, 0],
  a,
  b,
  color = "#4c7cff",
  opacity = 0.28,
}: ParallelogramMeshProps) {
  const geometry = useMemo(() => {
    const p0 = origin;
    const p1 = add(origin, a);
    const p2 = add(origin, add(a, b));
    const p3 = add(origin, b);

    const positions = new Float32Array([...p0, ...p1, ...p2, ...p0, ...p2, ...p3]);
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geo.computeVertexNormals();
    return geo;
  }, [origin, a, b]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
