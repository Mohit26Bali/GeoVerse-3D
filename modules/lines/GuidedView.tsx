"use client";

import ModuleScene from "@/three/engine/ModuleScene";
import GuidedSceneContent from "@/modules/lines/GuidedSceneContent";
import GuidedControls from "@/components/panels/GuidedControls";
import { useGuidedSequence } from "@/hooks/useGuidedSequence";
import { LINE_GUIDED_STEPS } from "@/modules/lines/steps";

export default function GuidedView() {
  const seq = useGuidedSequence(LINE_GUIDED_STEPS);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <GuidedSceneContent step={seq.step} />
      </ModuleScene>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="pointer-events-auto">
          <GuidedControls
            moduleTitle="Lines"
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
