"use client";

import { Line } from "@react-three/drei";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import LineObject from "@/three/objects/LineObject";
import CameraDirector from "@/modules/_shared/CameraDirector";
import { PALETTE } from "@/constants/theme";
import {
  LINE_P0,
  LINE_DIR,
  POINT_Q,
  CLOSEST_POINT,
  TWO_POINT_A,
  TWO_POINT_B,
  TWO_POINT_DIR,
  LINE_B_P0,
  LINE_B_DIR,
  APPROACH,
  type LineStep,
} from "@/modules/lines/steps";

interface GuidedSceneContentProps {
  step: LineStep;
}

/** Chooses which lines/points/highlights to render for the active Guided-mode step. */
export default function GuidedSceneContent({ step }: GuidedSceneContentProps) {
  const showBaseLine = step.id !== "two-point-form";

  return (
    <>
      <CameraDirector target={step.cameraTarget} distance={step.cameraDistance} />

      {showBaseLine && (
        <>
          <LineObject point={LINE_P0} direction={LINE_DIR} color={PALETTE.primary} />
          <VectorArrow origin={LINE_P0} direction={LINE_DIR} color={PALETTE.primary} />
          <PointObject
            position={LINE_P0}
            label="P₀"
            color={PALETTE.primary}
            radius={0.13}
          />
        </>
      )}

      {(step.id === "closest-point" || step.id === "distance") && (
        <>
          <PointObject
            position={POINT_Q}
            label="Q"
            color={PALETTE.secondary}
            radius={0.13}
          />
          <PointObject
            position={CLOSEST_POINT}
            label="Foot"
            color={PALETTE.accent}
            radius={0.09}
          />
          <Line
            points={[POINT_Q, CLOSEST_POINT]}
            color={PALETTE.border}
            dashed
            dashScale={4}
            lineWidth={1.5}
          />
        </>
      )}

      {step.id === "two-point-form" && (
        <>
          <LineObject
            point={TWO_POINT_A}
            direction={TWO_POINT_DIR}
            color={PALETTE.primary}
          />
          <PointObject
            position={TWO_POINT_A}
            label="A"
            color={PALETTE.primary}
            radius={0.13}
          />
          <PointObject
            position={TWO_POINT_B}
            label="B"
            color={PALETTE.secondary}
            radius={0.13}
          />
          <Line
            points={[TWO_POINT_A, TWO_POINT_B]}
            color={PALETTE.accent}
            lineWidth={2}
          />
        </>
      )}

      {step.id === "closest-approach" && (
        <>
          <LineObject
            point={LINE_B_P0}
            direction={LINE_B_DIR}
            color={PALETTE.secondary}
          />
          <VectorArrow
            origin={LINE_B_P0}
            direction={LINE_B_DIR}
            color={PALETTE.secondary}
          />
          <PointObject
            position={LINE_B_P0}
            label="P₀'"
            color={PALETTE.secondary}
            radius={0.13}
          />
          <PointObject
            position={APPROACH.pointOnA}
            label=""
            color={PALETTE.accent}
            radius={0.08}
          />
          <PointObject
            position={APPROACH.pointOnB}
            label=""
            color={PALETTE.accent}
            radius={0.08}
          />
          <Line
            points={[APPROACH.pointOnA, APPROACH.pointOnB]}
            color={PALETTE.accent}
            dashed
            dashScale={4}
            lineWidth={1.75}
          />
        </>
      )}
    </>
  );
}
