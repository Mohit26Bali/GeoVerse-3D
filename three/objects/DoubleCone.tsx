"use client";

import { DoubleSide } from "three";
import { PALETTE } from "@/constants/theme";

interface DoubleConeProps {
  halfAngleTan: number;
  height?: number;
  color?: string;
  opacity?: number;
}

/** Two cones joined apex-to-apex at the world origin, axis along Y — the classic conic-section demonstration surface. */
export default function DoubleCone({
  halfAngleTan,
  height = 4,
  color = PALETTE.primary,
  opacity = 0.16,
}: DoubleConeProps) {
  const radius = height * halfAngleTan;

  return (
    <group>
      <mesh position={[0, height / 2, 0]}>
        <coneGeometry args={[radius, height, 48, 1, true]} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={opacity}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, -height / 2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[radius, height, 48, 1, true]} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={opacity}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
