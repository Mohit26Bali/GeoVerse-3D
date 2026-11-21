"use client";

import { useCallback, useState } from "react";
import { Line } from "@react-three/drei";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import LineObject from "@/three/objects/LineObject";
import ControlPanel from "@/components/panels/ControlPanel";
import StatReadout from "@/components/panels/StatReadout";
import Equation from "@/components/ui/Equation";
import { PALETTE } from "@/constants/theme";
import { cn } from "@/utils/cn";
import type { LineDef, Vec3Tuple } from "@/types/math";
import { add, subtract } from "@/math/vector";
import {
  closestApproachBetweenLines,
  closestPointOnLine,
  distancePointToLine,
} from "@/math/geometry";
import { lineParametricLatex } from "@/math/format";
import { LINE_OPS, type LineOp } from "@/modules/lines/types";

const START_P0: Vec3Tuple = [-1.5, 0.5, -1];
const START_DIR: Vec3Tuple = [1.2, 0.4, 1.3];
const START_Q: Vec3Tuple = [1.5, 1.8, -1.5];
const START_P0_B: Vec3Tuple = [1.5, -0.5, 1.5];
const START_DIR_B: Vec3Tuple = [-1, 0.8, -0.8];

export default function ExploreView() {
  const [op, setOp] = useState<LineOp>("point-distance");

  const [p0, setP0] = useState<Vec3Tuple>(START_P0);
  const [direction, setDirection] = useState<Vec3Tuple>(START_DIR);
  const [q, setQ] = useState<Vec3Tuple>(START_Q);

  const [p0B, setP0B] = useState<Vec3Tuple>(START_P0_B);
  const [directionB, setDirectionB] = useState<Vec3Tuple>(START_DIR_B);

  const dirHandle = add(p0, direction);
  const dirHandleB = add(p0B, directionB);

  const handleP0Drag = useCallback((next: Vec3Tuple) => setP0(next), []);
  const handleDirDrag = useCallback(
    (next: Vec3Tuple) => setDirection(subtract(next, p0)),
    [p0],
  );
  const handleQDrag = useCallback((next: Vec3Tuple) => setQ(next), []);
  const handleP0BDrag = useCallback((next: Vec3Tuple) => setP0B(next), []);
  const handleDirBDrag = useCallback(
    (next: Vec3Tuple) => setDirectionB(subtract(next, p0B)),
    [p0B],
  );

  const lineA: LineDef = { id: "a", point: p0, direction };
  const lineB: LineDef = { id: "b", point: p0B, direction: directionB };

  const closest = closestPointOnLine(lineA, q);
  const dist = distancePointToLine(lineA, q);
  const approach = closestApproachBetweenLines(lineA, lineB);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <LineObject point={p0} direction={direction} color={PALETTE.primary} />
        <VectorArrow origin={p0} direction={direction} color={PALETTE.primary} />
        <PointObject
          position={p0}
          label="P₀"
          color={PALETTE.primary}
          radius={0.13}
          draggable
          onDrag={handleP0Drag}
        />
        <PointObject
          position={dirHandle}
          label=""
          color={PALETTE.primary}
          radius={0.11}
          draggable
          onDrag={handleDirDrag}
        />

        {op === "point-distance" && (
          <>
            <PointObject
              position={q}
              label="Q"
              color={PALETTE.secondary}
              radius={0.13}
              draggable
              onDrag={handleQDrag}
            />
            <PointObject
              position={closest}
              label="Foot"
              color={PALETTE.accent}
              radius={0.09}
            />
            <Line
              points={[q, closest]}
              color={PALETTE.border}
              dashed
              dashScale={4}
              lineWidth={1.5}
            />
          </>
        )}

        {op === "line-line" && (
          <>
            <LineObject point={p0B} direction={directionB} color={PALETTE.secondary} />
            <VectorArrow origin={p0B} direction={directionB} color={PALETTE.secondary} />
            <PointObject
              position={p0B}
              label="P₀'"
              color={PALETTE.secondary}
              radius={0.13}
              draggable
              onDrag={handleP0BDrag}
            />
            <PointObject
              position={dirHandleB}
              label=""
              color={PALETTE.secondary}
              radius={0.11}
              draggable
              onDrag={handleDirBDrag}
            />
            <PointObject
              position={approach.pointOnA}
              label=""
              color={PALETTE.accent}
              radius={0.08}
            />
            <PointObject
              position={approach.pointOnB}
              label=""
              color={PALETTE.accent}
              radius={0.08}
            />
            <Line
              points={[approach.pointOnA, approach.pointOnB]}
              color={PALETTE.accent}
              dashed
              dashScale={4}
              lineWidth={1.75}
            />
          </>
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Line A">
            <div className="flex flex-wrap gap-1.5">
              {LINE_OPS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setOp(o.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    op === o.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-hover text-muted hover:text-foreground",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <Equation latex={lineParametricLatex(p0, direction)} block />

            {op === "point-distance" && (
              <>
                <StatReadout label="Distance from Q to line" value={dist} />
                <p className="text-muted text-xs leading-relaxed">
                  Drag P₀ or the direction handle to move the line; drag Q anywhere. The
                  dashed segment is the perpendicular from Q to its closest point.
                </p>
              </>
            )}

            {op === "line-line" && (
              <>
                <Equation latex={lineParametricLatex(p0B, directionB)} block />
                <StatReadout
                  label="Closest approach distance"
                  value={approach.distance}
                />
                <p className="text-muted text-xs leading-relaxed">
                  Two lines in 3D are usually skew. The bright dashed segment is their
                  shortest connecting path — perpendicular to both directions.
                </p>
              </>
            )}

            <p className="text-muted text-xs leading-relaxed">
              Left-drag empty space to orbit and adjust depth.
            </p>
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
