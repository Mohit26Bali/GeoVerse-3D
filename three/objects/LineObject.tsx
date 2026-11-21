"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import type { Vec3Tuple } from "@/types/math";
import { add, scale } from "@/math/vector";
import { PALETTE } from "@/constants/theme";
import { useProgressiveDraw } from "@/animations/useProgressiveDraw";

interface LineObjectProps {
  point: Vec3Tuple;
  direction: Vec3Tuple;
  extent?: number;
  color?: string;
  dashed?: boolean;
}

/** Infinite-line primitive (rendered as a long finite segment) that draws in progressively. */
export default function LineObject({
  point,
  direction,
  extent = 10,
  color = PALETTE.accent,
  dashed = false,
}: LineObjectProps) {
  const progress = useProgressiveDraw([point.join(","), direction.join(",")].join("|"));

  const points = useMemo(() => {
    const half = extent * progress;
    const a = add(point, scale(direction, -half));
    const b = add(point, scale(direction, half));
    return [a, b] as [Vec3Tuple, Vec3Tuple];
  }, [point, direction, extent, progress]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1.75}
      dashed={dashed}
      dashScale={4}
      transparent
      opacity={0.85}
    />
  );
}
