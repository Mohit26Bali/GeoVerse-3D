"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, Mesh, Quaternion, Vector3 } from "three";
import type { Vec3Tuple } from "@/types/math";
import { PALETTE } from "@/constants/theme";

interface PlaneObjectProps {
  point: Vec3Tuple;
  normal: Vec3Tuple;
  size?: number;
  color?: string;
}

/**
 * Finite plane patch oriented by its normal. Scales in from its center on
 * mount/update ("planes should unfold from their centers") and slerps its
 * orientation toward the target normal rather than snapping.
 */
export default function PlaneObject({
  point,
  normal,
  size = 4,
  color = PALETTE.primary,
}: PlaneObjectProps) {
  const meshRef = useRef<Mesh>(null);
  const scaleProgress = useRef(0);

  const targetQuaternion = useMemo(() => {
    const n = new Vector3(...normal);
    if (n.lengthSq() === 0) return new Quaternion();
    return new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), n.normalize());
  }, [normal]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.quaternion.slerp(targetQuaternion, Math.min(1, delta * 6));
    scaleProgress.current = Math.min(1, scaleProgress.current + delta * 1.8);
    const eased = 1 - Math.pow(1 - scaleProgress.current, 3);
    mesh.scale.setScalar(eased);
  });

  return (
    <mesh ref={meshRef} position={point}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial
        color={color}
        roughness={0.15}
        metalness={0.1}
        transparent
        opacity={0.22}
        side={DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
