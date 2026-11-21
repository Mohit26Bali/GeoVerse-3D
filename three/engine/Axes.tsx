"use client";

import { useMemo } from "react";
import { Line, Text } from "@react-three/drei";
import { DoubleSide } from "three";
import { AXIS_COLORS } from "@/constants/theme";

interface AxesProps {
  length?: number;
  showLabels?: boolean;
}

const AXIS_DEFS = [
  { axis: "x", color: AXIS_COLORS.x, dir: [1, 0, 0] as const },
  { axis: "y", color: AXIS_COLORS.y, dir: [0, 1, 0] as const },
  { axis: "z", color: AXIS_COLORS.z, dir: [0, 0, 1] as const },
];

/** X/Y/Z reference axes, color-coded and labeled, anchored at the origin. */
export default function Axes({ length = 8, showLabels = true }: AxesProps) {
  const segments = useMemo(
    () =>
      AXIS_DEFS.map(({ axis, color, dir }) => ({
        axis,
        color,
        points: [
          [-dir[0] * length, -dir[1] * length, -dir[2] * length],
          [dir[0] * length, dir[1] * length, dir[2] * length],
        ] as [number, number, number][],
        labelPos: [
          dir[0] * (length + 0.5),
          dir[1] * (length + 0.5),
          dir[2] * (length + 0.5),
        ] as [number, number, number],
      })),
    [length],
  );

  return (
    <group>
      {segments.map((s) => (
        <group key={s.axis}>
          <Line
            points={s.points}
            color={s.color}
            lineWidth={1.5}
            transparent
            opacity={0.85}
          />
          {showLabels && (
            <Text
              // a bundled font: without one the text engine downloads font data from a third-party CDN
              font="/fonts/plex-mono-500.woff"
              position={s.labelPos}
              fontSize={0.4}
              color={s.color}
              anchorX="center"
              anchorY="middle"
              material-side={DoubleSide}
            >
              {s.axis.toUpperCase()}
            </Text>
          )}
        </group>
      ))}
    </group>
  );
}
