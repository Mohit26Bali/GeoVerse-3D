"use client";

import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import ParallelepipedMesh from "@/three/objects/ParallelepipedMesh";
import TransformedGrid from "@/three/objects/TransformedGrid";
import CameraDirector from "@/modules/_shared/CameraDirector";
import GuidedControls from "@/components/panels/GuidedControls";
import { useGuidedSequence } from "@/hooks/useGuidedSequence";
import { AXIS_COLORS, PALETTE } from "@/constants/theme";
import { determinant } from "@/math/matrix";
import { matrixFromColumns } from "@/math/transform";
import { MATRIX_GUIDED_STEPS } from "@/modules/matrices/steps";

export default function GuidedView() {
  const seq = useGuidedSequence(MATRIX_GUIDED_STEPS);
  const { i, j, k } = seq.step;
  const matrix = matrixFromColumns(i, j, k);
  const det = determinant(matrix);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <CameraDirector
          target={seq.step.cameraTarget}
          distance={seq.step.cameraDistance}
        />
        <TransformedGrid matrix={matrix} color={PALETTE.border} />
        <ParallelepipedMesh
          a={i}
          b={j}
          c={k}
          color={det >= 0 ? PALETTE.success : PALETTE.error}
        />
        <VectorArrow origin={[0, 0, 0]} direction={i} color={AXIS_COLORS.x} />
        <VectorArrow origin={[0, 0, 0]} direction={j} color={AXIS_COLORS.y} />
        <VectorArrow origin={[0, 0, 0]} direction={k} color={AXIS_COLORS.z} />
        <PointObject position={i} label="î" color={AXIS_COLORS.x} radius={0.12} />
        <PointObject position={j} label="ĵ" color={AXIS_COLORS.y} radius={0.12} />
        <PointObject position={k} label="k̂" color={AXIS_COLORS.z} radius={0.12} />
      </ModuleScene>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="pointer-events-auto">
          <GuidedControls
            moduleTitle="Matrices"
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
