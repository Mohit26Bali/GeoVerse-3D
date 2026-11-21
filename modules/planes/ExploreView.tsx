"use client";

import { useCallback, useMemo, useState } from "react";
import { Line } from "@react-three/drei";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import PlaneObject from "@/three/objects/PlaneObject";
import LineObject from "@/three/objects/LineObject";
import ControlPanel from "@/components/panels/ControlPanel";
import StatReadout from "@/components/panels/StatReadout";
import Equation from "@/components/ui/Equation";
import Badge from "@/components/ui/Badge";
import { PALETTE } from "@/constants/theme";
import { cn } from "@/utils/cn";
import type { PlaneDef, LineDef, Vec3Tuple } from "@/types/math";
import { add, subtract } from "@/math/vector";
import {
  closestPointOnPlane,
  distancePointToPlane,
  lineIntersectsPlane,
  planeFromPoints,
  planeIntersectsPlane,
} from "@/math/geometry";
import { planeEquationLatex } from "@/math/format";
import { PLANE_OPS, type PlaneOp } from "@/modules/planes/types";

const START_P0: Vec3Tuple = [0, 0.5, 0];
const START_NORMAL: Vec3Tuple = [0.6, 1, 0.3];
const START_Q: Vec3Tuple = [2, 2.2, -1.5];
const START_THREE_A: Vec3Tuple = [-2, -0.5, 1];
const START_THREE_B: Vec3Tuple = [1.5, 0.5, 1.5];
const START_THREE_C: Vec3Tuple = [-0.5, 1.5, -1.5];
const START_LINE_P0: Vec3Tuple = [-2, 2.5, -2];
const START_LINE_DIR: Vec3Tuple = [1.2, -1, 1.3];
const START_P0_B: Vec3Tuple = [1, -1, -1];
const START_NORMAL_B: Vec3Tuple = [0.4, 0.3, 1];

export default function ExploreView() {
  const [op, setOp] = useState<PlaneOp>("distance");

  const [p0, setP0] = useState<Vec3Tuple>(START_P0);
  const [normalHandle, setNormalHandle] = useState<Vec3Tuple>(
    add(START_P0, START_NORMAL),
  );
  const [q, setQ] = useState<Vec3Tuple>(START_Q);

  const [threeA, setThreeA] = useState<Vec3Tuple>(START_THREE_A);
  const [threeB, setThreeB] = useState<Vec3Tuple>(START_THREE_B);
  const [threeC, setThreeC] = useState<Vec3Tuple>(START_THREE_C);

  const [linePoint, setLinePoint] = useState<Vec3Tuple>(START_LINE_P0);
  const [lineDirHandle, setLineDirHandle] = useState<Vec3Tuple>(
    add(START_LINE_P0, START_LINE_DIR),
  );

  const [p0B, setP0B] = useState<Vec3Tuple>(START_P0_B);
  const [normalHandleB, setNormalHandleB] = useState<Vec3Tuple>(
    add(START_P0_B, START_NORMAL_B),
  );

  const normal = subtract(normalHandle, p0);
  const plane: PlaneDef = { id: "a", point: p0, normal };
  const threePointPlane = useMemo(
    () => planeFromPoints(threeA, threeB, threeC),
    [threeA, threeB, threeC],
  );
  const lineDirection = subtract(lineDirHandle, linePoint);
  const line: LineDef = { id: "l", point: linePoint, direction: lineDirection };
  const normalB = subtract(normalHandleB, p0B);
  const planeB: PlaneDef = { id: "b", point: p0B, normal: normalB };

  const handleP0Drag = useCallback((next: Vec3Tuple) => setP0(next), []);
  const handleNormalDrag = useCallback((next: Vec3Tuple) => setNormalHandle(next), []);
  const handleQDrag = useCallback((next: Vec3Tuple) => setQ(next), []);

  const closest = closestPointOnPlane(plane, q);
  const dist = distancePointToPlane(plane, q);
  const lineHit = lineIntersectsPlane(line, plane);
  const planeIntersection = planeIntersectsPlane(plane, planeB);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        {op === "three-point" ? (
          <>
            <PlaneObject
              point={threeA}
              normal={threePointPlane.normal}
              color={PALETTE.primary}
            />
            <PointObject
              position={threeA}
              label="A"
              color={PALETTE.primary}
              radius={0.13}
              draggable
              onDrag={setThreeA}
            />
            <PointObject
              position={threeB}
              label="B"
              color={PALETTE.secondary}
              radius={0.13}
              draggable
              onDrag={setThreeB}
            />
            <PointObject
              position={threeC}
              label="C"
              color={PALETTE.accent}
              radius={0.13}
              draggable
              onDrag={setThreeC}
            />
          </>
        ) : (
          <>
            <PlaneObject point={p0} normal={normal} color={PALETTE.primary} />
            <VectorArrow origin={p0} direction={normal} color={PALETTE.primary} />
            <PointObject
              position={p0}
              label="P₀"
              color={PALETTE.primary}
              radius={0.13}
              draggable
              onDrag={handleP0Drag}
            />
            <PointObject
              position={normalHandle}
              label=""
              color={PALETTE.primary}
              radius={0.11}
              draggable
              onDrag={handleNormalDrag}
            />
          </>
        )}

        {op === "distance" && (
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

        {op === "line-plane" && (
          <>
            <LineObject
              point={linePoint}
              direction={lineDirection}
              color={PALETTE.secondary}
            />
            <VectorArrow
              origin={linePoint}
              direction={lineDirection}
              color={PALETTE.secondary}
            />
            <PointObject
              position={linePoint}
              label="L₀"
              color={PALETTE.secondary}
              radius={0.13}
              draggable
              onDrag={setLinePoint}
            />
            <PointObject
              position={lineDirHandle}
              label=""
              color={PALETTE.secondary}
              radius={0.11}
              draggable
              onDrag={setLineDirHandle}
            />
            {lineHit && (
              <PointObject
                position={lineHit}
                label="Hit"
                color={PALETTE.accent}
                radius={0.11}
              />
            )}
          </>
        )}

        {op === "plane-plane" && (
          <>
            <PlaneObject point={p0B} normal={normalB} color={PALETTE.secondary} />
            <VectorArrow origin={p0B} direction={normalB} color={PALETTE.secondary} />
            <PointObject
              position={p0B}
              label="P₀'"
              color={PALETTE.secondary}
              radius={0.13}
              draggable
              onDrag={setP0B}
            />
            <PointObject
              position={normalHandleB}
              label=""
              color={PALETTE.secondary}
              radius={0.11}
              draggable
              onDrag={setNormalHandleB}
            />
            {planeIntersection && (
              <LineObject
                point={planeIntersection.point}
                direction={planeIntersection.direction}
                color={PALETTE.accent}
                extent={6}
              />
            )}
          </>
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Plane A">
            <div className="flex flex-wrap gap-1.5">
              {PLANE_OPS.map((o) => (
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

            {op === "three-point" ? (
              <Equation
                latex={planeEquationLatex(threeA, threePointPlane.normal)}
                block
              />
            ) : (
              <Equation latex={planeEquationLatex(p0, normal)} block />
            )}

            {op === "distance" && (
              <>
                <StatReadout label="Distance from Q to plane" value={dist} />
                <p className="text-muted text-xs leading-relaxed">
                  Drag P₀ or the normal handle to reorient the plane; drag Q anywhere. The
                  dashed segment is the perpendicular from Q to its closest point.
                </p>
              </>
            )}

            {op === "three-point" && (
              <p className="text-muted text-xs leading-relaxed">
                Drag A, B, or C — the plane through all three updates live, with its
                normal from the cross product of two edge vectors.
              </p>
            )}

            {op === "line-plane" && (
              <>
                {lineHit ? (
                  <Badge tone="success">Intersects</Badge>
                ) : (
                  <Badge tone="neutral">Parallel — no intersection</Badge>
                )}
                <p className="text-muted text-xs leading-relaxed">
                  Drag the line&apos;s point or direction handle. It pierces the plane
                  where its parametric equation satisfies the plane&apos;s equation.
                </p>
              </>
            )}

            {op === "plane-plane" && (
              <>
                {planeIntersection ? (
                  <Badge tone="success">Intersects in a line</Badge>
                ) : (
                  <Badge tone="neutral">Parallel — no intersection</Badge>
                )}
                <p className="text-muted text-xs leading-relaxed">
                  Two non-parallel planes always meet in a line — shown in accent color.
                  Drag either plane to see it move.
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
