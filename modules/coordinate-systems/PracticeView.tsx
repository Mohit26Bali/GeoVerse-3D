"use client";

import { useCallback, useState } from "react";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import ControlPanel from "@/components/panels/ControlPanel";
import StatReadout from "@/components/panels/StatReadout";
import Equation from "@/components/ui/Equation";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { PALETTE } from "@/constants/theme";
import { useAnimatedPosition } from "@/hooks/useAnimatedPosition";
import type { Vec3Tuple } from "@/types/math";
import { distance as distanceBetween, subtract } from "@/math/vector";
import { formatNumber } from "@/math/format";

const TOLERANCE = 0.35;

function randomTarget(): Vec3Tuple {
  const rand = (range: number) => Math.round((Math.random() * range * 2 - range) * 2) / 2;
  return [rand(3), rand(2), rand(3)];
}

export default function PracticeView() {
  const [target, setTarget] = useState<Vec3Tuple>(() => randomTarget());
  const { position: point, setPosition, animateTo } = useAnimatedPosition([0, 0, 0]);
  const [solved, setSolved] = useState(false);
  const [demoed, setDemoed] = useState(false);
  const [streak, setStreak] = useState(0);

  const dist = distanceBetween(point, target);

  const handleDrag = useCallback(
    (next: Vec3Tuple) => {
      setPosition(next);
      if (distanceBetween(next, target) < TOLERANCE && !solved) {
        setSolved(true);
        setDemoed(false);
        setStreak((s) => s + 1);
      }
    },
    [target, solved, setPosition],
  );

  const nextChallenge = useCallback(() => {
    setTarget(randomTarget());
    setPosition([0, 0, 0]);
    setSolved(false);
    setDemoed(false);
  }, [setPosition]);

  const showMe = useCallback(() => {
    animateTo(target, 1.2, () => {
      setDemoed(true);
    });
  }, [animateTo, target]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <PointObject
          position={point}
          label="P"
          color={PALETTE.primary}
          radius={0.15}
          draggable
          onDrag={handleDrag}
        />
        <PointObject
          position={target}
          label="Target"
          color={solved ? PALETTE.success : PALETTE.warning}
          radius={0.16}
        />
        {!solved && (
          <VectorArrow
            origin={point}
            direction={subtract(target, point)}
            color={PALETTE.muted}
            animateKey={`${point.join(",")}-${target.join(",")}`}
          />
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel
            title="Place the point"
            footer={
              <Equation
                latex={`\\text{Target} = (${target.map((v) => formatNumber(v)).join(",\\ ")})`}
                block
              />
            }
          >
            <div className="flex items-center justify-between">
              <StatReadout label="Distance to target" value={dist} />
              {solved ? (
                <Badge tone="success">Solved!</Badge>
              ) : demoed ? (
                <Badge tone="neutral">Demo — now try it</Badge>
              ) : (
                <Badge tone="neutral">Streak {streak}</Badge>
              )}
            </div>
            <p className="text-muted text-xs leading-relaxed">
              Drag point P toward the target. The gray arrow always points from P to the
              target — follow it. Dragging only moves P within your current camera view;
              left-drag empty space to orbit, then drag P again to close the remaining
              gap.
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
