"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Creates a GSAP timeline scoped to the component's lifetime and kills it on
 * unmount, so cinematic sequences (camera moves, unfold/reveal animations)
 * never leak or keep animating a disposed scene.
 */
export function useGsapTimeline(
  build: (tl: gsap.core.Timeline) => void,
  deps: React.DependencyList,
) {
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    build(tl);
    tlRef.current = tl;
    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return tlRef;
}
