"use client";

import ModuleScene from "@/three/engine/ModuleScene";
import DoubleCone from "@/three/objects/DoubleCone";
import PlaneObject from "@/three/objects/PlaneObject";
import ConicCurveLines from "@/three/objects/ConicCurveLines";
import CameraDirector from "@/modules/_shared/CameraDirector";
import GuidedControls from "@/components/panels/GuidedControls";
import { useGuidedSequence } from "@/hooks/useGuidedSequence";
import type { Vec3Tuple } from "@/types/math";
import { planeConeIntersection } from "@/math/conic";
import { CONE_K } from "@/modules/conic-sections/types";
import { CONIC_GUIDED_STEPS } from "@/modules/conic-sections/steps";

export default function GuidedView() {
  const seq = useGuidedSequence(CONIC_GUIDED_STEPS);
  const { tilt, offset, showPlane = true } = seq.step;

  const tiltRad = (tilt * Math.PI) / 180;
  const normal: Vec3Tuple = [Math.sin(tiltRad), Math.cos(tiltRad), 0];
  const planeOrigin: Vec3Tuple = [0, offset, 0];
  const segments = showPlane ? planeConeIntersection(planeOrigin, normal, CONE_K) : [];

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <CameraDirector
          target={seq.step.cameraTarget}
          distance={seq.step.cameraDistance}
        />
        <DoubleCone halfAngleTan={CONE_K} />
        {showPlane && (
          <>
            <PlaneObject point={planeOrigin} normal={normal} size={7} />
            <ConicCurveLines segments={segments} />
          </>
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="pointer-events-auto">
          <GuidedControls
            moduleTitle="Conic Sections"
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
