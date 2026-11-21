"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import PointObject from "@/three/objects/PointObject";
import { PALETTE } from "@/constants/theme";
import type { Vec3Tuple } from "@/types/math";
import type { MatrixData } from "@/math/matrix";
import { IDENTITY_4, applyMatrixToPoint } from "@/math/transform";

/** Asymmetric so rotation/reflection direction is visible — a cube's symmetry hides it. */
export const TETRA_VERTICES: Vec3Tuple[] = [
  [0, 1.2, 0],
  [1, -0.6, 0.8],
  [-1, -0.6, 0.8],
  [0, -0.6, -1.1],
];

export const TETRA_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [1, 3],
  [2, 3],
];

const VERTEX_COLORS = [
  PALETTE.primary,
  PALETTE.secondary,
  PALETTE.accent,
  PALETTE.warning,
];

interface TransformShapeProps {
  /** 4x4 homogeneous matrix to apply; identity (no-op) if omitted. */
  matrix?: MatrixData;
  /** Ghost mode: single flat color, dashed edges, no vertex handles — for "original" or "target" poses. */
  ghost?: boolean;
  ghostColor?: string;
}

/**
 * The shared test object for the Transformations module: a small tetrahedron
 * with distinctly colored vertices, transformed by applying a 4x4 matrix to
 * each vertex — the same mechanism for translate/scale/rotate/reflect/shear.
 */
export default function TransformShape({
  matrix = IDENTITY_4,
  ghost = false,
  ghostColor = PALETTE.border,
}: TransformShapeProps) {
  const vertices = useMemo(
    () => TETRA_VERTICES.map((v) => applyMatrixToPoint(matrix, v)),
    [matrix],
  );

  return (
    <group>
      {TETRA_EDGES.map(([a, b], i) => (
        <Line
          key={i}
          points={[vertices[a], vertices[b]]}
          color={ghost ? ghostColor : PALETTE.foreground}
          dashed={ghost}
          dashScale={4}
          transparent={ghost}
          opacity={ghost ? 0.55 : 1}
          lineWidth={ghost ? 1.25 : 2}
        />
      ))}
      {!ghost &&
        vertices.map((v, i) => (
          <PointObject key={i} position={v} color={VERTEX_COLORS[i]} radius={0.09} />
        ))}
    </group>
  );
}
