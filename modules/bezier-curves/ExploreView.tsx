"use client";

import { useCallback, useMemo, useState } from "react";
import { Line } from "@react-three/drei";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import ControlPanel from "@/components/panels/ControlPanel";
import StatReadout from "@/components/panels/StatReadout";
import Equation from "@/components/ui/Equation";
import { PALETTE } from "@/constants/theme";
import { cn } from "@/utils/cn";
import type { Vec3Tuple } from "@/types/math";
import {
  bezierCurvePoints,
  bezierPoint,
  bezierTangent,
  deCasteljauLevels,
} from "@/math/bezier";
import { vectorToLatex } from "@/math/format";
import {
  DEFAULT_CONTROL_POINTS,
  DEGREE_LABELS,
  POINT_LABELS,
  type BezierDegree,
} from "@/modules/bezier-curves/types";

const LEVEL_COLORS = [PALETTE.secondary, PALETTE.warning, PALETTE.success];

export default function ExploreView() {
  const [degree, setDegree] = useState<BezierDegree>("cubic");
  const [pointsByDegree, setPointsByDegree] = useState(DEFAULT_CONTROL_POINTS);
  const [t, setT] = useState(0.5);

  const controlPoints = pointsByDegree[degree];

  const handleDrag = useCallback(
    (index: number, next: Vec3Tuple) => {
      setPointsByDegree((prev) => {
        const updated = [...prev[degree]];
        updated[index] = next;
        return { ...prev, [degree]: updated };
      });
    },
    [degree],
  );

  const curvePoints = useMemo(() => bezierCurvePoints(controlPoints), [controlPoints]);
  const levels = useMemo(() => deCasteljauLevels(controlPoints, t), [controlPoints, t]);
  const currentPoint = bezierPoint(controlPoints, t);
  const tangent = bezierTangent(controlPoints, t);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <Line
          points={controlPoints}
          color={PALETTE.border}
          dashed
          dashScale={4}
          lineWidth={1.25}
        />
        <Line points={curvePoints} color={PALETTE.primary} lineWidth={2.5} />

        {controlPoints.map((p, i) => (
          <PointObject
            key={i}
            position={p}
            label={POINT_LABELS[i]}
            color={PALETTE.primary}
            radius={0.12}
            draggable
            onDrag={(next) => handleDrag(i, next)}
          />
        ))}

        {levels.slice(1, -1).map((level, li) => (
          <group key={li}>
            <Line
              points={level}
              color={LEVEL_COLORS[li % LEVEL_COLORS.length]}
              lineWidth={1.5}
            />
            {level.map((p, pi) => (
              <PointObject
                key={pi}
                position={p}
                label=""
                color={LEVEL_COLORS[li % LEVEL_COLORS.length]}
                radius={0.07}
              />
            ))}
          </group>
        ))}

        <PointObject
          position={currentPoint}
          label="B(t)"
          color={PALETTE.accent}
          radius={0.1}
        />
        <VectorArrow
          origin={currentPoint}
          direction={tangent}
          color={PALETTE.accent}
          label="tangent"
        />
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Bézier curve">
            <div className="flex flex-wrap gap-1.5">
              {DEGREE_LABELS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDegree(d.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    degree === d.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-hover text-muted hover:text-foreground",
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div>
              <label className="text-muted mb-1 block text-xs">t = {t.toFixed(2)}</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={t}
                onChange={(e) => setT(Number(e.target.value))}
                className="accent-primary w-full"
              />
            </div>

            <Equation latex={`B(t) = ${vectorToLatex(currentPoint)}`} block />
            <StatReadout label="|tangent|" value={Math.hypot(...tangent)} />

            <p className="text-muted text-xs leading-relaxed">
              Drag the control points (blue). The colored lines show de Casteljau&apos;s
              construction — nested interpolations that converge to the point B(t) as you
              move the slider. Left-drag empty space to orbit.
            </p>
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
