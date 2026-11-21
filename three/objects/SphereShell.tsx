"use client";

import { DoubleSide } from "three";
import { PALETTE } from "@/constants/theme";

interface SphereShellProps {
  radius: number;
  color?: string;
  opacity?: number;
  wireframe?: boolean;
}

/** The glass-like sphere surface shared across Explore/Guided/Practice/Challenge. */
export default function SphereShell({
  radius,
  color = PALETTE.primary,
  opacity = 0.2,
  wireframe = false,
}: SphereShellProps) {
  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[radius, 48, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={0.1}
        metalness={0.1}
        transparent={opacity < 1}
        opacity={opacity}
        wireframe={wireframe}
        side={DoubleSide}
        depthWrite={opacity >= 1}
      />
    </mesh>
  );
}
