"use client";

import { Line } from "@react-three/drei";
import VectorArrow from "@/three/objects/VectorArrow";
import ParallelogramMesh from "@/three/objects/ParallelogramMesh";
import CameraDirector from "@/modules/_shared/CameraDirector";
import { PALETTE } from "@/constants/theme";
import {
  VECTOR_A,
  VECTOR_B,
  VECTOR_SUM,
  VECTOR_DIFF,
  VECTOR_PROJECTION,
  VECTOR_CROSS,
  type VectorStep,
} from "@/modules/vectors/steps";

interface GuidedSceneContentProps {
  step: VectorStep;
}

/** Chooses which vectors/highlights to render for the active Guided-mode step. */
export default function GuidedSceneContent({ step }: GuidedSceneContentProps) {
  const showBoth = step.id !== "intro";

  return (
    <>
      <CameraDirector target={step.cameraTarget} distance={step.cameraDistance} />

      <VectorArrow
        origin={[0, 0, 0]}
        direction={VECTOR_A}
        color={PALETTE.primary}
        label="A"
      />
      {showBoth && (
        <VectorArrow
          origin={[0, 0, 0]}
          direction={VECTOR_B}
          color={PALETTE.secondary}
          label="B"
        />
      )}

      {step.id === "addition" && (
        <>
          <Line
            points={[VECTOR_A, VECTOR_SUM]}
            color={PALETTE.border}
            dashed
            dashScale={4}
          />
          <Line
            points={[VECTOR_B, VECTOR_SUM]}
            color={PALETTE.border}
            dashed
            dashScale={4}
          />
          <VectorArrow
            origin={[0, 0, 0]}
            direction={VECTOR_SUM}
            color={PALETTE.accent}
            label="A+B"
          />
        </>
      )}

      {step.id === "subtraction" && (
        <>
          <Line
            points={[VECTOR_B, VECTOR_A]}
            color={PALETTE.border}
            dashed
            dashScale={4}
          />
          <VectorArrow
            origin={[0, 0, 0]}
            direction={VECTOR_DIFF}
            color={PALETTE.accent}
            label="A-B"
          />
        </>
      )}

      {step.id === "dot-product" && (
        <Line
          points={[VECTOR_A, VECTOR_B]}
          color={PALETTE.accent}
          dashed
          dashScale={4}
          lineWidth={1.5}
        />
      )}

      {step.id === "projection" && (
        <>
          <VectorArrow
            origin={[0, 0, 0]}
            direction={VECTOR_PROJECTION}
            color={PALETTE.accent}
            label="proj"
          />
          <Line
            points={[VECTOR_A, VECTOR_PROJECTION]}
            color={PALETTE.border}
            dashed
            dashScale={4}
          />
        </>
      )}

      {step.id === "cross-product" && (
        <>
          <ParallelogramMesh a={VECTOR_A} b={VECTOR_B} color={PALETTE.accent} />
          <VectorArrow
            origin={[0, 0, 0]}
            direction={VECTOR_CROSS}
            color={PALETTE.accent}
            label="A×B"
          />
        </>
      )}
    </>
  );
}
