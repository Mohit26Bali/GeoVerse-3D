"use client";

import { useSpring } from "@react-spring/web";

/**
 * Smoothly animates a numeric readout (distance, angle, determinant, ...)
 * toward its latest value instead of snapping, per the "numbers should
 * count smoothly" requirement. Backed by react-spring for physical easing.
 */
export function useCountUp(value: number, precision = 2) {
  const { display } = useSpring({
    display: value,
    config: { tension: 170, friction: 26 },
  });

  return display.to((v) => v.toFixed(precision));
}
