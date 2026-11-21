"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Line } from "@react-three/drei";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import PlaneObject from "@/three/objects/PlaneObject";
import ControlPanel from "@/components/panels/ControlPanel";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { PALETTE } from "@/constants/theme";
import { useAnimatedPosition } from "@/hooks/useAnimatedPosition";
import type { PlaneDef, Vec3Tuple } from "@/types/math";
import { distance as distanceBetween } from "@/math/vector";
import { closestPointOnPlane } from "@/math/geometry";

const TOLERANCE = 0.4;
const ROUND_SECONDS = 15;
const TOTAL_ROUNDS = 5;

function randomPlane(): PlaneDef {
  const rand = (range: number) => Math.round((Math.random() * range * 2 - range) * 2) / 2;
  return {
    id: "challenge-plane",
    point: [rand(1.5), rand(1), rand(1.5)],
    normal: [rand(1) || 0.5, rand(1) || 1, rand(1) || 0.5],
  };
}

function randomPoint(): Vec3Tuple {
  const rand = (range: number) => Math.round((Math.random() * range * 2 - range) * 2) / 2;
  return [rand(3), rand(2.5), rand(3)];
}

type Phase = "idle" | "playing" | "finished";

export default function ChallengeView() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [plane, setPlane] = useState<PlaneDef>(() => randomPlane());
  const [q, setQ] = useState<Vec3Tuple>(() => randomPoint());
  const { position: marker, setPosition, animateTo } = useAnimatedPosition([0, 0, 0]);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);

  const foot = useMemo(() => closestPointOnPlane(plane, q), [plane, q]);

  const startGame = useCallback(() => {
    setPhase("playing");
    setRound(0);
    setScore(0);
    setPlane(randomPlane());
    setQ(randomPoint());
    setPosition([0, 0, 0]);
    setSecondsLeft(ROUND_SECONDS);
  }, [setPosition]);

  const advanceRound = useCallback(
    (won: boolean) => {
      setScore((s) => s + (won ? 1 : 0));
      const nextRound = round + 1;
      setRound(nextRound);
      if (nextRound >= TOTAL_ROUNDS) {
        setPhase("finished");
      } else {
        setPlane(randomPlane());
        setQ(randomPoint());
        setPosition([0, 0, 0]);
        setSecondsLeft(ROUND_SECONDS);
      }
    },
    [round, setPosition],
  );

  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          advanceRound(false);
          return ROUND_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, round, advanceRound]);

  const handleDrag = useCallback(
    (next: Vec3Tuple) => {
      if (phase !== "playing") return;
      setPosition(next);
      if (distanceBetween(next, foot) < TOLERANCE) {
        advanceRound(true);
      }
    },
    [phase, foot, advanceRound, setPosition],
  );

  const skipWithDemo = useCallback(() => {
    animateTo(foot, 1, () => advanceRound(false));
  }, [animateTo, foot, advanceRound]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        {phase === "playing" && (
          <>
            <PlaneObject
              point={plane.point}
              normal={plane.normal}
              color={PALETTE.primary}
            />
            <PointObject position={q} label="Q" color={PALETTE.secondary} radius={0.13} />
            <PointObject
              position={marker}
              label="Your guess"
              color={PALETTE.warning}
              radius={0.14}
              draggable
              onDrag={handleDrag}
            />
            <Line
              points={[q, foot]}
              color={PALETTE.border}
              dashed
              dashScale={4}
              lineWidth={1.5}
            />
          </>
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Plane challenge">
            {phase === "idle" && (
              <>
                <p className="text-muted text-xs leading-relaxed">
                  {TOTAL_ROUNDS} rounds, {ROUND_SECONDS}s each. Drag the marker onto the
                  closest point on the plane to Q, as fast as you can.
                </p>
                <Button size="sm" onClick={startGame}>
                  Start challenge
                </Button>
              </>
            )}
            {phase === "playing" && (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted text-xs">
                    Round {round + 1} / {TOTAL_ROUNDS}
                  </span>
                  <Badge tone={secondsLeft <= 5 ? "error" : "neutral"}>
                    {secondsLeft}s
                  </Badge>
                  <Badge tone="primary">Score {score}</Badge>
                </div>
                <Button size="sm" variant="outline" onClick={skipWithDemo}>
                  Show me (skips round, no point)
                </Button>
              </>
            )}
            {phase === "finished" && (
              <>
                <p className="text-foreground text-sm">
                  You scored <span className="text-primary font-semibold">{score}</span> /{" "}
                  {TOTAL_ROUNDS}.
                </p>
                <Button size="sm" onClick={startGame}>
                  Play again
                </Button>
              </>
            )}
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
