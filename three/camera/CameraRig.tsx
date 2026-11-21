"use client";

import { forwardRef } from "react";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { SCENE_DEFAULTS } from "@/constants/scene";

interface CameraRigProps {
  minDistance?: number;
  maxDistance?: number;
  autoRotate?: boolean;
}

/**
 * Damped orbit controls shared by every scene. Forwards the underlying
 * OrbitControls instance so `useCameraFocus` can drive cinematic GSAP
 * transitions (camera position + `.target`) without fighting user input.
 */
const CameraRig = forwardRef<OrbitControlsImpl, CameraRigProps>(
  ({ minDistance = 2, maxDistance = 40, autoRotate = false }, ref) => {
    return (
      <OrbitControls
        ref={ref}
        makeDefault
        enableDamping
        dampingFactor={SCENE_DEFAULTS.cameraDampingFactor}
        minDistance={minDistance}
        maxDistance={maxDistance}
        maxPolarAngle={Math.PI * 0.92}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />
    );
  },
);

CameraRig.displayName = "CameraRig";

export default CameraRig;
