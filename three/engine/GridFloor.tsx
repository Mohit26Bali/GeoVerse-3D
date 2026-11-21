"use client";

import { Grid } from "@react-three/drei";
import { PALETTE } from "@/constants/theme";
import { SCENE_DEFAULTS } from "@/constants/scene";

/**
 * Infinite-feel reference grid plus a faint receiving-shadow ground plane,
 * so objects never appear to float. Shared by every module scene.
 */
export default function GridFloor() {
  return (
    <>
      <Grid
        position={[0, -0.001, 0]}
        args={[SCENE_DEFAULTS.gridSize, SCENE_DEFAULTS.gridSize]}
        cellSize={1}
        cellThickness={0.5}
        cellColor={PALETTE.border}
        sectionSize={5}
        sectionThickness={1}
        sectionColor={PALETTE.primary}
        fadeDistance={SCENE_DEFAULTS.fogFar}
        fadeStrength={1.5}
        infiniteGrid
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial
          color={PALETTE.backgroundElevated}
          roughness={1}
          metalness={0}
          transparent
          opacity={0.6}
        />
      </mesh>
    </>
  );
}
