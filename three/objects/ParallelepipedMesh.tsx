"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { BufferGeometry, Float32BufferAttribute, DoubleSide } from "three";
import type { Vec3Tuple } from "@/types/math";
import { add } from "@/math/vector";
import { PALETTE } from "@/constants/theme";

interface ParallelepipedMeshProps {
  origin?: Vec3Tuple;
  a: Vec3Tuple;
  b: Vec3Tuple;
  c: Vec3Tuple;
  color?: string;
  opacity?: number;
}

/**
 * The 3D volume spanned by three vectors from a common origin — the image
 * of the unit cube under a matrix whose columns are a, b, c. Its volume
 * equals the absolute value of the determinant; a negative determinant
 * flips it inside-out (handled by the caller via `color`, not this component).
 */
export default function ParallelepipedMesh({
  origin = [0, 0, 0],
  a,
  b,
  c,
  color = PALETTE.primary,
  opacity = 0.18,
}: ParallelepipedMeshProps) {
  const vertices = useMemo(() => {
    const p000 = origin;
    const p100 = add(origin, a);
    const p010 = add(origin, b);
    const p001 = add(origin, c);
    const p110 = add(p100, b);
    const p101 = add(p100, c);
    const p011 = add(p010, c);
    const p111 = add(p110, c);
    return { p000, p100, p010, p001, p110, p101, p011, p111 };
  }, [origin, a, b, c]);

  const geometry = useMemo(() => {
    const { p000, p100, p010, p001, p110, p101, p011, p111 } = vertices;
    const quad = (v0: Vec3Tuple, v1: Vec3Tuple, v2: Vec3Tuple, v3: Vec3Tuple) => [
      ...v0,
      ...v1,
      ...v2,
      ...v0,
      ...v2,
      ...v3,
    ];
    const positions = new Float32Array([
      ...quad(p000, p100, p110, p010),
      ...quad(p001, p101, p111, p011),
      ...quad(p000, p100, p101, p001),
      ...quad(p010, p110, p111, p011),
      ...quad(p000, p010, p011, p001),
      ...quad(p100, p110, p111, p101),
    ]);
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geo.computeVertexNormals();
    return geo;
  }, [vertices]);

  const edges: [Vec3Tuple, Vec3Tuple][] = useMemo(() => {
    const { p000, p100, p010, p001, p110, p101, p011, p111 } = vertices;
    return [
      [p000, p100],
      [p000, p010],
      [p000, p001],
      [p100, p110],
      [p100, p101],
      [p010, p110],
      [p010, p011],
      [p001, p101],
      [p001, p011],
      [p110, p111],
      [p101, p111],
      [p011, p111],
    ];
  }, [vertices]);

  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {edges.map(([p, q], i) => (
        <Line
          key={i}
          points={[p, q]}
          color={color}
          lineWidth={1.25}
          transparent
          opacity={0.8}
        />
      ))}
    </group>
  );
}
