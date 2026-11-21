"use client";

import { useCallback, useRef, useState } from "react";
import gsap from "gsap";

/** Scalar counterpart to useAnimatedPosition — set instantly (a slider drag) or tween smoothly (a demo). */
export function useAnimatedNumber(initial: number) {
  const [value, setValueState] = useState(initial);
  const liveRef = useRef(initial);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const setValue = useCallback((next: number) => {
    liveRef.current = next;
    setValueState(next);
  }, []);

  const animateTo = useCallback(
    (target: number, duration = 1, onComplete?: () => void) => {
      tweenRef.current?.kill();
      const proxy = { v: liveRef.current };
      tweenRef.current = gsap.to(proxy, {
        v: target,
        duration,
        ease: "power2.inOut",
        onUpdate: () => setValue(proxy.v),
        onComplete,
      });
    },
    [setValue],
  );

  return { value, setValue, animateTo };
}
