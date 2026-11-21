"use client";

import ModuleScene from "@/three/engine/ModuleScene";
import GuidedSceneContent from "@/modules/vectors/GuidedSceneContent";
import GuidedControls from "@/components/panels/GuidedControls";
import { useGuidedSequence } from "@/hooks/useGuidedSequence";
import { VECTOR_GUIDED_STEPS } from "@/modules/vectors/steps";

export default function GuidedView() {
  const seq = useGuidedSequence(VECTOR_GUIDED_STEPS);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <GuidedSceneContent step={seq.step} />
      </ModuleScene>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="pointer-events-auto">
          <GuidedControls
            moduleTitle="Vectors"
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
