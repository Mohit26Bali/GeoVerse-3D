"use client";

import { useCallback, useEffect, useState } from "react";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import ControlPanel from "@/components/panels/ControlPanel";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { PALETTE } from "@/constants/theme";
import { useAnimatedPosition } from "@/hooks/useAnimatedPosition";
import type { Vec3Tuple } from "@/types/math";
import { distance as distanceBetween, subtract } from "@/math/vector";

const TOLERANCE = 0.4;
const ROUND_SECONDS = 15;
const TOTAL_ROUNDS = 5;

function randomTarget(): Vec3Tuple {
  const rand = (range: number) => Math.round((Math.random() * range * 2 - range) * 2) / 2;
  return [rand(3), rand(2), rand(3)];
}

type Phase = "idle" | "playing" | "finished";

export default function ChallengeView() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState<Vec3Tuple>(() => randomTarget());
  const { position: point, setPosition, animateTo } = useAnimatedPosition([0, 0, 0]);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);

  const startGame = useCallback(() => {
    setPhase("playing");
    setRound(0);
    setScore(0);
    setTarget(randomTarget());
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
        setTarget(randomTarget());
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
      if (distanceBetween(next, target) < TOLERANCE) {
        advanceRound(true);
      }
    },
    [phase, target, advanceRound, setPosition],
  );

  const skipWithDemo = useCallback(() => {
    animateTo(target, 1, () => advanceRound(false));
  }, [animateTo, target, advanceRound]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        {phase === "playing" && (
          <>
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
              color={PALETTE.warning}
              radius={0.16}
            />
            <VectorArrow
              origin={point}
              direction={subtract(target, point)}
              color={PALETTE.muted}
              animateKey={`${point.join(",")}-${target.join(",")}`}
            />
          </>
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Coordinate challenge">
            {phase === "idle" && (
              <>
                <p className="text-muted text-xs leading-relaxed">
                  {TOTAL_ROUNDS} rounds, {ROUND_SECONDS}s each. Drag P to match each
                  target coordinate as fast as you can — the gray arrow points the way.
                  Left-drag empty space to orbit and adjust the axis facing the camera.
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
