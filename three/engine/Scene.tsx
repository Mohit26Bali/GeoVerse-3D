"use client";

import { Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { SCENE_DEFAULTS } from "@/constants/scene";
import { PALETTE } from "@/constants/theme";
import SceneLoader from "@/three/engine/SceneLoader";

interface SceneProps {
  children: ReactNode;
  /** Enable postprocessing/expensive effects; auto-disabled on low-perf devices. */
  cinematic?: boolean;
  className?: string;
}

/**
 * The single Canvas root every module scene renders into. Centralizes
 * renderer config (color management, shadows, tone mapping) so every module
 * looks consistent without repeating boilerplate.
 */
export default function Scene({ children, className }: SceneProps) {
  return (
    <div className={className ?? "relative h-full w-full"}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          outputColorSpace: SRGBColorSpace,
        }}
        camera={{
          fov: SCENE_DEFAULTS.cameraFov,
          near: SCENE_DEFAULTS.cameraNear,
          far: SCENE_DEFAULTS.cameraFar,
          position: SCENE_DEFAULTS.cameraDefaultPosition,
        }}
        onCreated={({ scene }) => {
          scene.background = null;
        }}
      >
        <color attach="background" args={[PALETTE.background]} />
        <fog
          attach="fog"
          args={[PALETTE.background, SCENE_DEFAULTS.fogNear, SCENE_DEFAULTS.fogFar]}
        />
        <PerformanceMonitor>
          <Suspense fallback={null}>{children}</Suspense>
        </PerformanceMonitor>
      </Canvas>
      <SceneLoader />
    </div>
  );
}
