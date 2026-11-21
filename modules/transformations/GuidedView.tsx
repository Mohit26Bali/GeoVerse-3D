"use client";

import ModuleScene from "@/three/engine/ModuleScene";
import TransformShape from "@/three/objects/TransformShape";
import CameraDirector from "@/modules/_shared/CameraDirector";
import GuidedControls from "@/components/panels/GuidedControls";
import { useGuidedSequence } from "@/hooks/useGuidedSequence";
import { TRANSFORM_GUIDED_STEPS } from "@/modules/transformations/steps";

export default function GuidedView() {
  const seq = useGuidedSequence(TRANSFORM_GUIDED_STEPS);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <CameraDirector
          target={seq.step.cameraTarget}
          distance={seq.step.cameraDistance}
        />
        <TransformShape ghost />
        <TransformShape matrix={seq.step.matrix} />
      </ModuleScene>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="pointer-events-auto">
          <GuidedControls
            moduleTitle="Transformations"
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
