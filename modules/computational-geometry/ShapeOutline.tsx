"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import type { Vec3Tuple } from "@/types/math";
import FilledPolygon from "@/three/objects/FilledPolygon";
import type { Shape } from "@/modules/computational-geometry/quiz";

function circlePoints(center: Vec3Tuple, radius: number, segments = 48): Vec3Tuple[] {
  const points: Vec3Tuple[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    points.push([center[0] + Math.cos(a) * radius, 0, center[2] + Math.sin(a) * radius]);
  }
  return points;
}

function boxCorners(center: Vec3Tuple, radius: number): Vec3Tuple[] {
  return [
    [center[0] - radius, 0, center[2] - radius],
    [center[0] + radius, 0, center[2] - radius],
    [center[0] + radius, 0, center[2] + radius],
    [center[0] - radius, 0, center[2] + radius],
    [center[0] - radius, 0, center[2] - radius],
  ];
}

interface ShapeOutlineProps {
  shape: Shape;
  color: string;
}

export default function ShapeOutline({ shape, color }: ShapeOutlineProps) {
  const outline = useMemo(
    () =>
      shape.kind === "circle"
        ? circlePoints(shape.center, shape.radius)
        : boxCorners(shape.center, shape.radius),
    [shape],
  );
  const fillPoints = useMemo(() => outline.slice(0, -1), [outline]);

  return (
    <>
      <FilledPolygon points={fillPoints} color={color} opacity={0.25} y={0.006} />
      <Line points={outline} color={color} lineWidth={2.5} />
    </>
  );
}
