"use client";

import { useRef, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import gsap from "gsap";
import { ANIMATION_DURATIONS } from "@/constants/scene";
import type { Vec3Tuple } from "@/types/math";

/**
 * Cinematic camera transitions: tweens both camera position and the orbit
 * controls' look-at target in lockstep with a shared GSAP timeline, so pans
 * and zooms read as one smooth motion rather than two competing tweens.
 *
 * Reads the active OrbitControls instance from the R3F store rather than a
 * prop-drilled ref — CameraRig registers itself there via `makeDefault`, so
 * any component anywhere in the scene tree (e.g. a Guided-mode step
 * director) can call this with no wiring.
 */
export function useCameraFocus() {
  const camera = useThree((state) => state.camera);
  const controls = useThree(
    (state) => state.controls,
  ) as unknown as OrbitControlsImpl | null;
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const focusOn = useCallback(
    (
      target: Vec3Tuple,
      options?: { distance?: number; duration?: number; direction?: Vec3Tuple },
    ) => {
      if (!controls) return;

      timelineRef.current?.kill();

      const distance = options?.distance ?? camera.position.distanceTo(controls.target);
      const dir = options?.direction
        ? new Vector3(...options.direction).normalize()
        : camera.position.clone().sub(controls.target).normalize();

      const targetVec = new Vector3(...target);
      const nextCameraPos = targetVec.clone().add(dir.multiplyScalar(distance));

      const proxy = {
        cx: camera.position.x,
        cy: camera.position.y,
        cz: camera.position.z,
        tx: controls.target.x,
        ty: controls.target.y,
        tz: controls.target.z,
      };

      const tl = gsap.timeline();
      tl.to(proxy, {
        cx: nextCameraPos.x,
        cy: nextCameraPos.y,
        cz: nextCameraPos.z,
        tx: targetVec.x,
        ty: targetVec.y,
        tz: targetVec.z,
        duration: options?.duration ?? ANIMATION_DURATIONS.cinematic,
        ease: "power3.inOut",
        onUpdate: () => {
          camera.position.set(proxy.cx, proxy.cy, proxy.cz);
          controls.target.set(proxy.tx, proxy.ty, proxy.tz);
          controls.update();
        },
      });

      timelineRef.current = tl;
    },
    [camera, controls],
  );

  return { focusOn };
}
