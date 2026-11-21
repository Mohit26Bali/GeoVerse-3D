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
import { distance as distanceBetween, magnitude } from "@/math/vector";
import { vectorToLatex } from "@/math/format";

const TOLERANCE = 0.35;

function randomTarget(): Vec3Tuple {
  const rand = (range: number) => Math.round((Math.random() * range * 2 - range) * 2) / 2;
  return [rand(3), rand(2), rand(3)];
}

export default function PracticeView() {
  const [target, setTarget] = useState<Vec3Tuple>(() => randomTarget());
  const { position: a, setPosition, animateTo } = useAnimatedPosition([0.5, 0.5, 0.5]);
  const [solved, setSolved] = useState(false);
  const [demoed, setDemoed] = useState(false);
  const [streak, setStreak] = useState(0);

  const dist = distanceBetween(a, target);

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
    setPosition([0.5, 0.5, 0.5]);
    setSolved(false);
    setDemoed(false);
  }, [setPosition]);

  const showMe = useCallback(() => {
    animateTo(target, 1.2, () => setDemoed(true));
  }, [animateTo, target]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <VectorArrow origin={[0, 0, 0]} direction={a} color={PALETTE.primary} label="A" />
        <PointObject
          position={a}
          label=""
          color={PALETTE.primary}
          radius={0.14}
          draggable
          onDrag={handleDrag}
        />
        <VectorArrow
          origin={[0, 0, 0]}
          direction={target}
          color={PALETTE.warning}
          label="Target"
        />
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel
            title="Construct the vector"
            footer={
              <Equation latex={`\\text{Target} = ${vectorToLatex(target)}`} block />
            }
          >
            <div className="grid grid-cols-2 gap-3">
              <StatReadout label="|A|" value={magnitude(a)} />
              <StatReadout label="Distance to target tip" value={dist} />
            </div>
            {solved ? (
              <Badge tone="success">Solved!</Badge>
            ) : demoed ? (
              <Badge tone="neutral">Demo — now try it</Badge>
            ) : (
              <Badge tone="neutral">Streak {streak}</Badge>
            )}
            <p className="text-muted text-xs leading-relaxed">
              Drag the tip of A (blue) until it matches the target vector (amber). Both
              magnitude and direction must match. Left-drag empty space to orbit and
              adjust depth.
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
