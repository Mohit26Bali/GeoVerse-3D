"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { Vec3Tuple } from "@/types/math";

interface MovingMarkerProps {
  points: Vec3Tuple[];
  durationSeconds: number;
  color: string;
  radius?: number;
  loop?: boolean;
}

/** Animates a small sphere looping along a precomputed path via useFrame (no per-frame React state). */
export default function MovingMarker({
  points,
  durationSeconds,
  color,
  radius = 0.14,
  loop = true,
}: MovingMarkerProps) {
  const meshRef = useRef<Mesh>(null);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current || points.length < 2) return;
    elapsed.current += delta;
    let t = (elapsed.current / durationSeconds) % 1;
    if (!loop && elapsed.current >= durationSeconds) t = 1;

    const scaled = t * (points.length - 1);
    const index = Math.min(points.length - 2, Math.floor(scaled));
    const localT = scaled - index;
    const [ax, ay, az] = points[index];
    const [bx, by, bz] = points[index + 1];
    meshRef.current.position.set(
      ax + (bx - ax) * localT,
      ay + (by - ay) * localT,
      az + (bz - az) * localT,
    );
  });

  return (
    <mesh ref={meshRef} castShadow>
      <sphereGeometry args={[radius, 20, 20]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
    </mesh>
  );
}
