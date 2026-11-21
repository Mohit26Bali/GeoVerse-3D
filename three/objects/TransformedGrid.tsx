"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import type { Vec3Tuple } from "@/types/math";
import type { MatrixData } from "@/math/matrix";
import { applyToVector } from "@/math/matrix";
import { PALETTE } from "@/constants/theme";

interface TransformedGridProps {
  /** 3x3 linear map applied to the grid (no translation). */
  matrix: MatrixData;
  size?: number;
  divisions?: number;
  color?: string;
}

function apply3(matrix: MatrixData, v: Vec3Tuple): Vec3Tuple {
  const [x, y, z] = applyToVector(matrix, v);
  return [x, y, z];
}

/**
 * A ground grid warped by a 3x3 matrix. Since linear maps preserve
 * straight lines, each grid line only needs its two endpoints transformed —
 * the classic "watch the grid bend" visualization of what a matrix does.
 */
export default function TransformedGrid({
  matrix,
  size = 4,
  divisions = 8,
  color = PALETTE.accent,
}: TransformedGridProps) {
  const segments = useMemo(() => {
    const segs: [Vec3Tuple, Vec3Tuple][] = [];
    const step = (size * 2) / divisions;
    for (let i = 0; i <= divisions; i++) {
      const offset = -size + i * step;
      segs.push([apply3(matrix, [-size, 0, offset]), apply3(matrix, [size, 0, offset])]);
      segs.push([apply3(matrix, [offset, 0, -size]), apply3(matrix, [offset, 0, size])]);
    }
    return segs;
  }, [matrix, size, divisions]);

  return (
    <group>
      {segments.map(([p, q], i) => (
        <Line
          key={i}
          points={[p, q]}
          color={color}
          lineWidth={1}
          transparent
          opacity={0.35}
        />
      ))}
    </group>
  );
}
