"use client";

import { Line } from "@react-three/drei";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import PlaneObject from "@/three/objects/PlaneObject";
import LineObject from "@/three/objects/LineObject";
import CameraDirector from "@/modules/_shared/CameraDirector";
import { PALETTE } from "@/constants/theme";
import {
  PLANE_P0,
  PLANE_NORMAL,
  THREE_A,
  THREE_B,
  THREE_C,
  THREE_PLANE,
  POINT_Q,
  CLOSEST_POINT,
  GUIDED_LINE_P0,
  GUIDED_LINE_DIR,
  LINE_HIT,
  PLANE_B_P0,
  PLANE_B_NORMAL,
  PLANE_INTERSECTION,
  type PlaneStep,
} from "@/modules/planes/steps";

interface GuidedSceneContentProps {
  step: PlaneStep;
}

/** Chooses which planes/points/highlights to render for the active Guided-mode step. */
export default function GuidedSceneContent({ step }: GuidedSceneContentProps) {
  const showBasePlane = !["three-point"].includes(step.id);

  return (
    <>
      <CameraDirector target={step.cameraTarget} distance={step.cameraDistance} />

      {showBasePlane && (
        <>
          <PlaneObject point={PLANE_P0} normal={PLANE_NORMAL} color={PALETTE.primary} />
          <VectorArrow
            origin={PLANE_P0}
            direction={PLANE_NORMAL}
            color={PALETTE.primary}
          />
          <PointObject
            position={PLANE_P0}
            label="P₀"
            color={PALETTE.primary}
            radius={0.13}
          />
        </>
      )}

      {step.id === "three-point" && (
        <>
          <PlaneObject
            point={THREE_A}
            normal={THREE_PLANE.normal}
            color={PALETTE.primary}
          />
          <PointObject
            position={THREE_A}
            label="A"
            color={PALETTE.primary}
            radius={0.13}
          />
          <PointObject
            position={THREE_B}
            label="B"
            color={PALETTE.secondary}
            radius={0.13}
          />
          <PointObject
            position={THREE_C}
            label="C"
            color={PALETTE.accent}
            radius={0.13}
          />
        </>
      )}

      {(step.id === "distance" || step.id === "closest-point") && (
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

      {step.id === "line-plane" && (
        <>
          <LineObject
            point={GUIDED_LINE_P0}
            direction={GUIDED_LINE_DIR}
            color={PALETTE.secondary}
          />
          <VectorArrow
            origin={GUIDED_LINE_P0}
            direction={GUIDED_LINE_DIR}
            color={PALETTE.secondary}
          />
          <PointObject
            position={GUIDED_LINE_P0}
            label="L₀"
            color={PALETTE.secondary}
            radius={0.13}
          />
          {LINE_HIT && (
            <PointObject
              position={LINE_HIT}
              label="Hit"
              color={PALETTE.accent}
              radius={0.11}
            />
          )}
        </>
      )}

      {step.id === "plane-plane" && (
        <>
          <PlaneObject
            point={PLANE_B_P0}
            normal={PLANE_B_NORMAL}
            color={PALETTE.secondary}
          />
          <VectorArrow
            origin={PLANE_B_P0}
            direction={PLANE_B_NORMAL}
            color={PALETTE.secondary}
          />
          <PointObject
            position={PLANE_B_P0}
            label="P₀'"
            color={PALETTE.secondary}
            radius={0.13}
          />
          {PLANE_INTERSECTION && (
            <LineObject
              point={PLANE_INTERSECTION.point}
              direction={PLANE_INTERSECTION.direction}
              color={PALETTE.accent}
              extent={6}
            />
          )}
        </>
      )}
    </>
  );
}
