"use client";

import { type ReactNode, useRef } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import Scene from "@/three/engine/Scene";
import CameraRig from "@/three/camera/CameraRig";
import LightingRig from "@/three/lights/LightingRig";
import GridFloor from "@/three/engine/GridFloor";
import Axes from "@/three/engine/Axes";
import Effects from "@/three/postprocessing/Effects";

interface ModuleSceneProps {
  children?: ReactNode;
  showAxes?: boolean;
  showGrid?: boolean;
  cinematic?: boolean;
  className?: string;
}

/**
 * The standard scene composition every content module renders into:
 * Scene → Camera → Lights → Grid/Axes → module-specific Objects. Wiring
 * this once here means new modules only ever author the `children` layer.
 */
export default function ModuleScene({
  children,
  showAxes = true,
  showGrid = true,
  cinematic = true,
  className,
}: ModuleSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <Scene className={className}>
      <CameraRig ref={controlsRef} />
      <LightingRig />
      {showGrid && <GridFloor />}
      {showAxes && <Axes />}
      {children}
      {cinematic && <Effects />}
    </Scene>
  );
}
