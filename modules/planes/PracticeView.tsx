"use client";

import { useCallback, useMemo, useState } from "react";
import { Line } from "@react-three/drei";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import PlaneObject from "@/three/objects/PlaneObject";
import ControlPanel from "@/components/panels/ControlPanel";
import StatReadout from "@/components/panels/StatReadout";
import Equation from "@/components/ui/Equation";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { PALETTE } from "@/constants/theme";
import { useAnimatedPosition } from "@/hooks/useAnimatedPosition";
import type { PlaneDef, Vec3Tuple } from "@/types/math";
import { distance as distanceBetween, subtract } from "@/math/vector";
import { closestPointOnPlane } from "@/math/geometry";
import { planeEquationLatex } from "@/math/format";

const TOLERANCE = 0.35;

function randomPlane(): PlaneDef {
  const rand = (range: number) => Math.round((Math.random() * range * 2 - range) * 2) / 2;
  return {
    id: "practice-plane",
    point: [rand(1.5), rand(1), rand(1.5)],
    normal: [rand(1) || 0.5, rand(1) || 1, rand(1) || 0.5],
  };
}

function randomPoint(): Vec3Tuple {
  const rand = (range: number) => Math.round((Math.random() * range * 2 - range) * 2) / 2;
  return [rand(3), rand(2.5), rand(3)];
}

export default function PracticeView() {
  const [plane, setPlane] = useState<PlaneDef>(() => randomPlane());
  const [q, setQ] = useState<Vec3Tuple>(() => randomPoint());
  const { position: marker, setPosition, animateTo } = useAnimatedPosition([0, 0, 0]);
  const [solved, setSolved] = useState(false);
  const [demoed, setDemoed] = useState(false);
  const [streak, setStreak] = useState(0);

  const foot = useMemo(() => closestPointOnPlane(plane, q), [plane, q]);
  const dist = distanceBetween(marker, foot);

  const handleDrag = useCallback(
    (next: Vec3Tuple) => {
      setPosition(next);
      if (distanceBetween(next, foot) < TOLERANCE && !solved) {
        setSolved(true);
        setDemoed(false);
        setStreak((s) => s + 1);
      }
    },
    [foot, solved, setPosition],
  );

  const nextChallenge = useCallback(() => {
    setPlane(randomPlane());
    setQ(randomPoint());
    setPosition([0, 0, 0]);
    setSolved(false);
    setDemoed(false);
  }, [setPosition]);

  const showMe = useCallback(() => {
    animateTo(foot, 1.2, () => setDemoed(true));
  }, [animateTo, foot]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <PlaneObject point={plane.point} normal={plane.normal} color={PALETTE.primary} />
        <VectorArrow
          origin={plane.point}
          direction={plane.normal}
          color={PALETTE.primary}
        />
        <PointObject position={q} label="Q" color={PALETTE.secondary} radius={0.13} />
        <PointObject
          position={marker}
          label="Your guess"
          color={solved ? PALETTE.success : PALETTE.primary}
          radius={0.14}
          draggable
          onDrag={handleDrag}
        />
        {!solved && (
          <VectorArrow
            origin={marker}
            direction={subtract(foot, marker)}
            color={PALETTE.muted}
            animateKey={`${marker.join(",")}-${foot.join(",")}`}
          />
        )}
        <Line
          points={[q, foot]}
          color={PALETTE.border}
          dashed
          dashScale={4}
          lineWidth={1.5}
        />
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel
            title="Find the closest point"
            footer={
              <Equation latex={planeEquationLatex(plane.point, plane.normal)} block />
            }
          >
            <StatReadout label="Distance to closest point" value={dist} />
            {solved ? (
              <Badge tone="success">Solved!</Badge>
            ) : demoed ? (
              <Badge tone="neutral">Demo — now try it</Badge>
            ) : (
              <Badge tone="neutral">Streak {streak}</Badge>
            )}
            <p className="text-muted text-xs leading-relaxed">
              Drag the marker onto the point on the plane closest to Q — the gray arrow
              points the way. Left-drag empty space to orbit and adjust depth.
            </p>
            <div className="flex gap-2">
              {solved ? (
                <Button size="sm" onClick={nextChallenge}>
                  Next challenge
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={showMe}>
                  Show me
                </Button>
              )}
            </div>
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
