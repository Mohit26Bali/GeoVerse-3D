"use client";

import { useEffect } from "react";
import { useCameraFocus } from "@/three/camera/useCameraFocus";
import type { Vec3Tuple } from "@/types/math";

interface CameraDirectorProps {
  target: Vec3Tuple;
  distance?: number;
  duration?: number;
}

/**
 * Renders nothing — mount it inside a ModuleScene to drive a cinematic
 * camera move whenever `target`/`distance` change (e.g. per Guided-mode
 * step). Pass stable array references (module-scope constants) for
 * `target` so the focus move only fires on real step changes, not re-renders.
 */
export default function CameraDirector({
  target,
  distance,
  duration,
}: CameraDirectorProps) {
  const { focusOn } = useCameraFocus();

  useEffect(() => {
    focusOn(target, { distance, duration });
  }, [target, distance, duration, focusOn]);

  return null;
}
