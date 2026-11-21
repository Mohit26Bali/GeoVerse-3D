"use client";

import { useCallback, useState } from "react";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import PlaneObject from "@/three/objects/PlaneObject";
import type { Vec3Tuple } from "@/types/math";
import { magnitude, subtract } from "@/math/vector";
import { planeFromPoints } from "@/math/geometry";
import ControlPanel from "@/components/panels/ControlPanel";
import StatReadout from "@/components/panels/StatReadout";
import Equation from "@/components/ui/Equation";
import { vectorToLatex } from "@/math/format";
import { PALETTE } from "@/constants/theme";

const ORIGIN: Vec3Tuple = [0, 0, 0];

/**
 * Reference implementation that exercises the full Foundation Engine stack
 * end-to-end — Scene → Objects → Math Engine → Explanation Layer →
 * Interactive Controls — so later content modules have a working template
 * to copy. Drag either point; the vector, plane, and readouts update live.
 */
export default function FoundationDemoScene() {
  const [pointA, setPointA] = useState<Vec3Tuple>([2.5, 1.5, 1]);
  const [pointB, setPointB] = useState<Vec3Tuple>([-1.5, 0.5, -2]);

  const handleDragA = useCallback((next: Vec3Tuple) => setPointA(next), []);
  const handleDragB = useCallback((next: Vec3Tuple) => setPointB(next), []);

  const diff = subtract(pointB, pointA);
  const dist = magnitude(diff);
  const plane = planeFromPoints(ORIGIN, pointA, pointB);

  return (
    <div className="relative h-full w-full">
      <ModuleScene>
        <PointObject
          position={pointA}
          label="A"
          color={PALETTE.primary}
          draggable
          onDrag={handleDragA}
        />
        <PointObject
          position={pointB}
          label="B"
          color={PALETTE.secondary}
          draggable
          onDrag={handleDragB}
        />
        <VectorArrow origin={pointA} direction={diff} color={PALETTE.accent} label="AB" />
        <PlaneObject
          point={ORIGIN}
          normal={plane.normal}
          color={PALETTE.primary}
          size={5}
        />
      </ModuleScene>

      <div className="pointer-events-none absolute top-4 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel
            title="Live Vector AB"
            footer={<Equation latex={`\\vec{AB} = ${vectorToLatex(diff)}`} block />}
          >
            <div className="grid grid-cols-2 gap-4">
              <StatReadout label="Distance |AB|" value={dist} />
              <StatReadout label="Plane normal |n|" value={magnitude(plane.normal)} />
            </div>
            <p className="text-muted text-xs leading-relaxed">
              Drag point A or B in the scene — the vector, spanning plane, and every
              readout update in real time.
            </p>
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
