"use client";

import { useMemo } from "react";
import { Line, Html } from "@react-three/drei";
import { Vector3, Quaternion } from "three";
import type { Vec3Tuple } from "@/types/math";
import { PALETTE } from "@/constants/theme";
import { useProgressiveDraw } from "@/animations/useProgressiveDraw";

interface VectorArrowProps {
  origin?: Vec3Tuple;
  direction: Vec3Tuple;
  color?: string;
  label?: string;
  /** Re-runs the progressive draw-in animation whenever this changes. */
  animateKey?: unknown;
}

/**
 * Animated arrow primitive (shaft + cone head) used for vectors, normals,
 * and projections throughout the app. The shaft draws in progressively and
 * the head orients via a shared quaternion so it never appears instantly.
 */
export default function VectorArrow({
  origin = [0, 0, 0],
  direction,
  color = PALETTE.secondary,
  label,
  animateKey,
}: VectorArrowProps) {
  const progress = useProgressiveDraw(animateKey ?? direction.join(","));

  const { end, headPosition, headQuaternion, length } = useMemo(() => {
    const dirVec = new Vector3(...direction);
    const len = dirVec.length();
    const animatedLen = len * progress;
    const originVec = new Vector3(...origin);
    const endVec = originVec.clone().add(dirVec.clone().setLength(animatedLen));
    const headLen = Math.min(0.28, animatedLen * 0.35);
    const headPos = originVec
      .clone()
      .add(dirVec.clone().setLength(Math.max(0, animatedLen - headLen / 2)));
    const quat = new Quaternion().setFromUnitVectors(
      new Vector3(0, 1, 0),
      len > 0 ? dirVec.clone().normalize() : new Vector3(0, 1, 0),
    );
    return {
      end: endVec,
      headPosition: headPos,
      headQuaternion: quat,
      length: animatedLen,
    };
  }, [origin, direction, progress]);

  const headLen = Math.min(0.28, length * 0.35);

  return (
    <group>
      <Line
        points={[origin, [end.x, end.y, end.z]]}
        color={color}
        lineWidth={2.5}
        transparent
        opacity={0.95}
      />
      {length > 0.02 && (
        <mesh position={headPosition} quaternion={headQuaternion} castShadow>
          <coneGeometry args={[headLen * 0.45, headLen, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
        </mesh>
      )}
      {label && progress > 0.9 && (
        <Html distanceFactor={10} position={[end.x, end.y + 0.25, end.z]}>
          <span className="bg-background/80 text-foreground rounded-md px-1.5 py-0.5 font-mono text-xs backdrop-blur-sm select-none">
            {label}
          </span>
        </Html>
      )}
    </group>
  );
}
