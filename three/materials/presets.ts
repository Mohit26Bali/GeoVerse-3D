import type { JSX } from "react";
import { PALETTE } from "@/constants/theme";

type MeshStandardMaterialProps = JSX.IntrinsicElements["meshStandardMaterial"];

/**
 * Shared material presets so every module's meshes share one visual
 * language instead of each hand-tuning roughness/metalness ad hoc.
 */

export function matteSurface(color: string = PALETTE.surface): MeshStandardMaterialProps {
  return { color, roughness: 0.55, metalness: 0.1 };
}

export function glassSurface(color: string = PALETTE.primary): MeshStandardMaterialProps {
  return {
    color,
    roughness: 0.05,
    metalness: 0.1,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  };
}

export function glowAccent(color: string): MeshStandardMaterialProps {
  return {
    color,
    roughness: 0.3,
    metalness: 0.4,
    emissive: color,
    emissiveIntensity: 0.6,
  };
}

export function selectionHighlight(
  active: boolean,
  base: string,
): MeshStandardMaterialProps {
  return active
    ? { color: base, emissive: base, emissiveIntensity: 0.9, roughness: 0.25 }
    : { color: base, emissive: base, emissiveIntensity: 0.15, roughness: 0.4 };
}
