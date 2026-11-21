"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ANIMATION_DURATIONS } from "@/constants/scene";

/**
 * Returns a 0..1 progress value that eases from 0 to 1 whenever `trigger`
 * changes, meant to drive a line/curve's visible point count so it "draws"
 * onto the scene instead of appearing instantly.
 */
export function useProgressiveDraw(
  trigger: unknown,
  duration = ANIMATION_DURATIONS.slow,
) {
  const [progress, setProgress] = useState(0);
  const proxy = useRef({ p: 0 });

  useEffect(() => {
    proxy.current.p = 0;
    const tween = gsap.to(proxy.current, {
      p: 1,
      duration,
      ease: "power2.out",
      onUpdate: () => setProgress(proxy.current.p),
    });
    return () => {
      tween.kill();
    };
  }, [trigger, duration]);

  return progress;
}
