"use client";

import { Line } from "@react-three/drei";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import CameraDirector from "@/modules/_shared/CameraDirector";
import { PALETTE, AXIS_COLORS } from "@/constants/theme";
import {
  READING_POINT,
  MIDPOINT_A,
  MIDPOINT_B,
  MIDPOINT_M,
  type CoordinateStep,
} from "@/modules/coordinate-systems/steps";

interface GuidedSceneContentProps {
  step: CoordinateStep;
}

/** Chooses which objects to render for the active Guided-mode step. */
export default function GuidedSceneContent({ step }: GuidedSceneContentProps) {
  return (
    <>
      <CameraDirector target={step.cameraTarget} distance={step.cameraDistance} />

      {step.id === "origin" && (
        <PointObject
          position={[0, 0, 0]}
          label="O"
          color={PALETTE.accent}
          radius={0.16}
        />
      )}

      {(step.id === "reading-point" || step.id === "distance-from-origin") && (
        <>
          <PointObject position={READING_POINT} label="P" color={PALETTE.primary} />
          <Line
            points={[READING_POINT, [READING_POINT[0], 0, READING_POINT[2]]]}
            color={AXIS_COLORS.y}
            dashed
            dashScale={6}
            lineWidth={1.5}
          />
          <Line
            points={[
              [READING_POINT[0], 0, READING_POINT[2]],
              [READING_POINT[0], 0, 0],
            ]}
            color={AXIS_COLORS.z}
            dashed
            dashScale={6}
            lineWidth={1.5}
          />
          <Line
            points={[
              [READING_POINT[0], 0, 0],
              [0, 0, 0],
            ]}
            color={AXIS_COLORS.x}
            dashed
            dashScale={6}
            lineWidth={1.5}
          />
        </>
      )}

      {step.id === "distance-from-origin" && (
        <VectorArrow
          origin={[0, 0, 0]}
          direction={READING_POINT}
          color={PALETTE.accent}
          label="|OP|"
        />
      )}

      {step.id === "midpoint" && (
        <>
          <PointObject position={MIDPOINT_A} label="A" color={PALETTE.primary} />
          <PointObject position={MIDPOINT_B} label="B" color={PALETTE.secondary} />
          <PointObject
            position={MIDPOINT_M}
            label="M"
            color={PALETTE.accent}
            radius={0.1}
          />
          <Line
            points={[MIDPOINT_A, MIDPOINT_B]}
            color={PALETTE.border}
            dashed
            dashScale={4}
            lineWidth={1.25}
          />
        </>
      )}
    </>
  );
}
