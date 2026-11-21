"use client";

import { useEffect } from "react";
import { Line } from "@react-three/drei";
import PointObject from "@/three/objects/PointObject";
import PlaneObject from "@/three/objects/PlaneObject";
import SphereShell from "@/three/objects/SphereShell";
import WaterFillSphere from "@/three/objects/WaterFillSphere";
import CameraDirector from "@/modules/_shared/CameraDirector";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { PALETTE } from "@/constants/theme";
import { scale } from "@/math/vector";
import { circlePoints3D, greatCirclePoints3D } from "@/math/geometry";
import { crossSectionRadius } from "@/math/sphere";
import type { SphereStep } from "@/modules/sphere-geometry/steps";

const ORIGIN: [number, number, number] = [0, 0, 0];

interface GuidedSceneContentProps {
  step: SphereStep;
}

export default function GuidedSceneContent({ step }: GuidedSceneContentProps) {
  return (
    <>
      <CameraDirector target={step.cameraTarget} distance={step.cameraDistance} />

      {step.id === "volume" ? (
        <VolumeGrowthSphere key={step.id} radius={step.radius} />
      ) : step.fillHeight !== undefined ? (
        <WaterFillSphere radius={step.radius} fillHeight={step.fillHeight} />
      ) : (
        <SphereShell radius={step.radius} />
      )}

      {step.chordPoints && (
        <ChordAndGreatCircle
          radius={step.radius}
          a={step.chordPoints[0]}
          b={step.chordPoints[1]}
          showGreatCircle={step.id === "great-circles"}
        />
      )}

      {step.sliceOffset !== undefined && (
        <CrossSection radius={step.radius} offset={step.sliceOffset} />
      )}
    </>
  );
}

function VolumeGrowthSphere({ radius }: { radius: number }) {
  const { value, animateTo } = useAnimatedNumber(0);

  useEffect(() => {
    animateTo(radius, 1.8);
  }, [radius, animateTo]);

  return <SphereShell radius={value} />;
}

function ChordAndGreatCircle({
  radius,
  a,
  b,
  showGreatCircle,
}: {
  radius: number;
  a: [number, number, number];
  b: [number, number, number];
  showGreatCircle: boolean;
}) {
  const pointA = scale(a, radius);
  const pointB = scale(b, radius);
  const greatCircle = greatCirclePoints3D(ORIGIN, radius, pointA, pointB);

  return (
    <>
      <PointObject position={pointA} label="A" color={PALETTE.primary} radius={0.11} />
      <PointObject position={pointB} label="B" color={PALETTE.secondary} radius={0.11} />
      <Line points={[pointA, pointB]} color={PALETTE.accent} lineWidth={2.5} />
      {showGreatCircle && (
        <Line
          points={greatCircle}
          color={PALETTE.accent}
          transparent
          opacity={0.7}
          lineWidth={1.5}
        />
      )}
    </>
  );
}

function CrossSection({ radius, offset }: { radius: number; offset: number }) {
  const sliceRadius = crossSectionRadius(radius, offset);
  const circle = circlePoints3D([0, offset, 0], sliceRadius, [0, 1, 0]);

  return (
    <>
      <PlaneObject
        point={[0, offset, 0]}
        normal={[0, 1, 0]}
        size={radius * 2.4}
        color={PALETTE.secondary}
      />
      {sliceRadius > 0.001 && (
        <Line points={circle} color={PALETTE.accent} lineWidth={2.5} />
      )}
    </>
  );
}
