"use client";

import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import type { Vec3Tuple } from "@/types/math";

/**
 * Position state that can be set instantly (drag) or tweened smoothly
 * (auto-solve demo, programmatic moves) — same underlying value, two ways
 * to update it. Keeps a ref in lockstep with state so `animateTo` always
 * starts from the true current position, not a stale closure.
 */
export function useAnimatedPosition(initial: Vec3Tuple) {
  const [position, setPositionState] = useState<Vec3Tuple>(initial);
  const liveRef = useRef<Vec3Tuple>(initial);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const setPosition = useCallback((next: Vec3Tuple) => {
    liveRef.current = next;
    setPositionState(next);
  }, []);

  const animateTo = useCallback(
    (target: Vec3Tuple, duration = 1.2, onComplete?: () => void) => {
      tweenRef.current?.kill();
      const proxy = {
        x: liveRef.current[0],
        y: liveRef.current[1],
        z: liveRef.current[2],
      };
      tweenRef.current = gsap.to(proxy, {
        x: target[0],
        y: target[1],
        z: target[2],
        duration,
        ease: "power2.inOut",
        onUpdate: () => setPosition([proxy.x, proxy.y, proxy.z]),
        onComplete,
      });
    },
    [setPosition],
  );

  return { position, setPosition, animateTo };
}
