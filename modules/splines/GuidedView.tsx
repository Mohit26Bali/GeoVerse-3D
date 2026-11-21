"use client";

import { Line } from "@react-three/drei";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import CameraDirector from "@/modules/_shared/CameraDirector";
import GuidedControls from "@/components/panels/GuidedControls";
import { useGuidedSequence } from "@/hooks/useGuidedSequence";
import { PALETTE } from "@/constants/theme";
import {
  bSplinePoints,
  bezierSplineHandles,
  bezierSplinePoints,
  catmullRomPoints,
} from "@/math/spline";
import { ANCHOR_LABELS, DEFAULT_ANCHORS } from "@/modules/splines/types";
import { SPLINE_GUIDED_STEPS } from "@/modules/splines/steps";

export default function GuidedView() {
  const seq = useGuidedSequence(SPLINE_GUIDED_STEPS);
  const { kind, showHandles } = seq.step;

  const curvePoints =
    kind === "catmull-rom"
      ? catmullRomPoints(DEFAULT_ANCHORS)
      : kind === "bezier-spline"
        ? bezierSplinePoints(DEFAULT_ANCHORS)
        : bSplinePoints(DEFAULT_ANCHORS);
  const handles = bezierSplineHandles(DEFAULT_ANCHORS);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <CameraDirector
          target={seq.step.cameraTarget}
          distance={seq.step.cameraDistance}
        />
        <Line
          points={DEFAULT_ANCHORS}
          color={PALETTE.border}
          dashed
          dashScale={4}
          lineWidth={1.25}
        />
        <Line points={curvePoints} color={PALETTE.primary} lineWidth={2.5} />

        {showHandles &&
          handles.map((h, i) => (
            <group key={i}>
              <Line
                points={[h.in, DEFAULT_ANCHORS[i]]}
                color={PALETTE.secondary}
                transparent
                opacity={0.6}
                lineWidth={1}
              />
              <Line
                points={[DEFAULT_ANCHORS[i], h.out]}
                color={PALETTE.secondary}
                transparent
                opacity={0.6}
                lineWidth={1}
              />
            </group>
          ))}

        {DEFAULT_ANCHORS.map((p, i) => (
          <PointObject
            key={i}
            position={p}
            label={ANCHOR_LABELS[i]}
            color={PALETTE.primary}
            radius={0.11}
          />
        ))}
      </ModuleScene>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="pointer-events-auto">
          <GuidedControls
            moduleTitle="Splines"
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
