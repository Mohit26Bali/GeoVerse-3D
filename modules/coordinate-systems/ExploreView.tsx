"use client";

import { useCallback, useState } from "react";
import { Line } from "@react-three/drei";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import ControlPanel from "@/components/panels/ControlPanel";
import StatReadout from "@/components/panels/StatReadout";
import Equation from "@/components/ui/Equation";
import { AXIS_COLORS, PALETTE } from "@/constants/theme";
import type { Vec3Tuple } from "@/types/math";
import { magnitude } from "@/math/vector";
import { formatNumber } from "@/math/format";

const START: Vec3Tuple = [2.5, 1.5, -1.5];

export default function ExploreView() {
  const [point, setPoint] = useState<Vec3Tuple>(START);
  const handleDrag = useCallback((next: Vec3Tuple) => setPoint(next), []);
  const distance = magnitude(point);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <PointObject
          position={point}
          label="P"
          color={PALETTE.primary}
          radius={0.15}
          draggable
          onDrag={handleDrag}
        />
        <Line
          points={[point, [point[0], 0, point[2]]]}
          color={AXIS_COLORS.y}
          dashed
          dashScale={6}
          lineWidth={1.5}
        />
        <Line
          points={[
            [point[0], 0, point[2]],
            [point[0], 0, 0],
          ]}
          color={AXIS_COLORS.z}
          dashed
          dashScale={6}
          lineWidth={1.5}
        />
        <Line
          points={[
            [point[0], 0, 0],
            [0, 0, 0],
          ]}
          color={AXIS_COLORS.x}
          dashed
          dashScale={6}
          lineWidth={1.5}
        />
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel
            title="Point P"
            footer={
              <Equation
                latex={`P = (${formatNumber(point[0])},\\ ${formatNumber(point[1])},\\ ${formatNumber(point[2])})`}
                block
              />
            }
          >
            <div className="grid grid-cols-3 gap-3">
              <StatReadout label="X" value={point[0]} />
              <StatReadout label="Y" value={point[1]} />
              <StatReadout label="Z" value={point[2]} />
            </div>
            <StatReadout label="Distance from origin |OP|" value={distance} />
            <p className="text-muted text-xs leading-relaxed">
              Drag the point anywhere in the scene — the dashed path shows its projection
              onto each axis. Dragging only moves it within your current camera view;
              left-drag empty space to orbit, then drag again to adjust the axis facing
              the camera.
            </p>
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
