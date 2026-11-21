"use client";

import { useMemo } from "react";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import LineObject from "@/three/objects/LineObject";
import TransformedGrid from "@/three/objects/TransformedGrid";
import FilledPolygon from "@/three/objects/FilledPolygon";
import CameraDirector from "@/modules/_shared/CameraDirector";
import GuidedControls from "@/components/panels/GuidedControls";
import { useGuidedSequence } from "@/hooks/useGuidedSequence";
import { PALETTE } from "@/constants/theme";
import { nullSpace2x2, realEigen2x2, type Vec2 } from "@/math/linearAlgebra2x2";
import { embedMat2InXZPlane, toVec3 } from "@/modules/linear-algebra-playground/types";
import { LIN_ALG_GUIDED_STEPS } from "@/modules/linear-algebra-playground/steps";

export default function GuidedView() {
  const seq = useGuidedSequence(LIN_ALG_GUIDED_STEPS);
  const { topic, matrix } = seq.step;

  const embedded = useMemo(() => embedMat2InXZPlane(matrix), [matrix]);
  const i = useMemo<Vec2>(() => [matrix[0][0], matrix[1][0]], [matrix]);
  const j = useMemo<Vec2>(() => [matrix[0][1], matrix[1][1]], [matrix]);
  const eigen = useMemo(
    () => (topic === "eigen" ? realEigen2x2(matrix) : null),
    [topic, matrix],
  );
  const nullSpace = useMemo(
    () => (topic === "null-space" ? nullSpace2x2(matrix) : null),
    [topic, matrix],
  );

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <CameraDirector
          target={seq.step.cameraTarget}
          distance={seq.step.cameraDistance}
        />

        <TransformedGrid matrix={embedded} color={PALETTE.border} />
        <FilledPolygon
          points={[[0, 0, 0], toVec3(i), toVec3([i[0] + j[0], i[1] + j[1]]), toVec3(j)]}
          color={PALETTE.primary}
          opacity={0.16}
        />
        <VectorArrow
          origin={[0, 0, 0]}
          direction={toVec3(i)}
          color={PALETTE.primary}
          label="î"
        />
        <VectorArrow
          origin={[0, 0, 0]}
          direction={toVec3(j)}
          color={PALETTE.secondary}
          label="ĵ"
        />
        <PointObject position={toVec3(i)} color={PALETTE.primary} radius={0.11} />
        <PointObject position={toVec3(j)} color={PALETTE.secondary} radius={0.11} />

        {topic === "eigen" && eigen && (
          <>
            <LineObject
              point={[0, 0, 0]}
              direction={toVec3(eigen.vectors[0])}
              color={PALETTE.warning}
              dashed
            />
            <LineObject
              point={[0, 0, 0]}
              direction={toVec3(eigen.vectors[1])}
              color={PALETTE.success}
              dashed
            />
          </>
        )}

        {topic === "null-space" && nullSpace?.kind === "line" && nullSpace.direction && (
          <LineObject
            point={[0, 0, 0]}
            direction={toVec3(nullSpace.direction)}
            color={PALETTE.error}
            dashed
          />
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="pointer-events-auto">
          <GuidedControls
            moduleTitle="Linear Algebra Playground"
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
          />
        </div>
      </div>
    </div>
  );
}
