"use client";

import { Line } from "@react-three/drei";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import CameraDirector from "@/modules/_shared/CameraDirector";
import GuidedControls from "@/components/panels/GuidedControls";
import { useGuidedSequence } from "@/hooks/useGuidedSequence";
import { PALETTE } from "@/constants/theme";
import {
  bezierCurvePoints,
  bezierPoint,
  bezierTangent,
  deCasteljauLevels,
} from "@/math/bezier";
import { DEFAULT_CONTROL_POINTS } from "@/modules/bezier-curves/types";
import { BEZIER_GUIDED_STEPS } from "@/modules/bezier-curves/steps";

const LEVEL_COLORS = [PALETTE.secondary, PALETTE.warning, PALETTE.success];

export default function GuidedView() {
  const seq = useGuidedSequence(BEZIER_GUIDED_STEPS);
  const { degree, t } = seq.step;
  const controlPoints = DEFAULT_CONTROL_POINTS[degree];

  const curvePoints = bezierCurvePoints(controlPoints);
  const levels = deCasteljauLevels(controlPoints, t);
  const currentPoint = bezierPoint(controlPoints, t);
  const tangent = bezierTangent(controlPoints, t);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <CameraDirector
          target={seq.step.cameraTarget}
          distance={seq.step.cameraDistance}
        />
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
            label={`P${i}`}
            color={PALETTE.primary}
            radius={0.12}
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
        {seq.step.id === "tangent" && (
          <VectorArrow
            origin={currentPoint}
            direction={tangent}
            color={PALETTE.accent}
            label="tangent"
          />
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="pointer-events-auto">
          <GuidedControls
            moduleTitle="Bézier Curves"
            step={seq.step}
            index={seq.index}
            totalSteps={seq.steps.length}
            isFirst={seq.isFirst}
            isLast={seq.isLast}
            isPlaying={seq.isPlaying}
            onPlay={seq.play}
            onPause={seq.pause}
            onNext={seq.next}
            onPrev={seq.prev}
            onGoTo={seq.goTo}
            latex={seq.step.latex}
          />
        </div>
      </div>
    </div>
  );
}
