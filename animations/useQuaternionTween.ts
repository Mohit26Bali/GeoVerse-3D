"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Quaternion, type Object3D } from "three";

/**
 * Rotates an object toward a target quaternion using per-frame slerp instead
 * of setting rotation directly, so rotations never pop — required for
 * transformation ghosts, normal vectors, and any rotating handle.
 */
export function useQuaternionTween(
  ref: React.RefObject<Object3D | null>,
  target: Quaternion,
  speed = 6,
) {
  const targetRef = useRef(target);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  useFrame((_, delta) => {
    const obj = ref.current;
    if (!obj) return;
    obj.quaternion.slerp(targetRef.current, Math.min(1, speed * delta));
  });
}
