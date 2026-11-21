"use client";

import { useCallback, useEffect, useState } from "react";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import ParallelepipedMesh from "@/three/objects/ParallelepipedMesh";
import ControlPanel from "@/components/panels/ControlPanel";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { AXIS_COLORS, PALETTE } from "@/constants/theme";
import { useAnimatedPosition } from "@/hooks/useAnimatedPosition";
import type { Vec3Tuple } from "@/types/math";
import { distance as distanceBetween } from "@/math/vector";

const TOLERANCE = 0.4;
const ROUND_SECONDS = 20;
const TOTAL_ROUNDS = 5;

function randomBasis(): [Vec3Tuple, Vec3Tuple, Vec3Tuple] {
  const rand = (range: number) => Math.round((Math.random() * range * 2 - range) * 2) / 2;
  const nonzero = (v: number) => (v === 0 ? 0.5 : v);
  return [
    [nonzero(rand(1.5)), rand(1), rand(1)],
    [rand(1), nonzero(rand(1.5)), rand(1)],
    [rand(1), rand(1), nonzero(rand(1.5))],
  ];
}

type Phase = "idle" | "playing" | "finished";

export default function ChallengeView() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState<[Vec3Tuple, Vec3Tuple, Vec3Tuple]>(() =>
    randomBasis(),
  );
  const {
    position: i,
    setPosition: setI,
    animateTo: animateI,
  } = useAnimatedPosition([1, 0, 0]);
  const {
    position: j,
    setPosition: setJ,
    animateTo: animateJ,
  } = useAnimatedPosition([0, 1, 0]);
  const {
    position: k,
    setPosition: setK,
    animateTo: animateK,
  } = useAnimatedPosition([0, 0, 1]);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);

  const [targetI, targetJ, targetK] = target;

  const resetVectors = useCallback(() => {
    setI([1, 0, 0]);
    setJ([0, 1, 0]);
    setK([0, 0, 1]);
  }, [setI, setJ, setK]);

  const startGame = useCallback(() => {
    setPhase("playing");
    setRound(0);
    setScore(0);
    setTarget(randomBasis());
    resetVectors();
    setSecondsLeft(ROUND_SECONDS);
  }, [resetVectors]);

  const advanceRound = useCallback(
    (won: boolean) => {
      setScore((s) => s + (won ? 1 : 0));
      const nextRound = round + 1;
      setRound(nextRound);
      if (nextRound >= TOTAL_ROUNDS) {
        setPhase("finished");
      } else {
        setTarget(randomBasis());
        resetVectors();
        setSecondsLeft(ROUND_SECONDS);
      }
    },
    [round, resetVectors],
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

  const checkSolved = useCallback(
    (nextI: Vec3Tuple, nextJ: Vec3Tuple, nextK: Vec3Tuple) => {
      if (phase !== "playing") return;
      const allClose =
        distanceBetween(nextI, targetI) < TOLERANCE &&
        distanceBetween(nextJ, targetJ) < TOLERANCE &&
        distanceBetween(nextK, targetK) < TOLERANCE;
      if (allClose) advanceRound(true);
    },
    [phase, targetI, targetJ, targetK, advanceRound],
  );

  const handleIDrag = useCallback(
    (next: Vec3Tuple) => {
      setI(next);
      checkSolved(next, j, k);
    },
    [setI, checkSolved, j, k],
  );
  const handleJDrag = useCallback(
    (next: Vec3Tuple) => {
      setJ(next);
      checkSolved(i, next, k);
    },
    [setJ, checkSolved, i, k],
  );
  const handleKDrag = useCallback(
    (next: Vec3Tuple) => {
      setK(next);
      checkSolved(i, j, next);
    },
    [setK, checkSolved, i, j],
  );

  const skipWithDemo = useCallback(() => {
    animateI(targetI, 1);
    animateJ(targetJ, 1);
    animateK(targetK, 1, () => advanceRound(false));
  }, [animateI, animateJ, animateK, targetI, targetJ, targetK, advanceRound]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        {phase === "playing" && (
          <>
            <ParallelepipedMesh
              a={targetI}
              b={targetJ}
              c={targetK}
              color={PALETTE.warning}
              opacity={0.12}
            />
            <ParallelepipedMesh a={i} b={j} c={k} color={PALETTE.primary} />
            <VectorArrow origin={[0, 0, 0]} direction={i} color={AXIS_COLORS.x} />
            <VectorArrow origin={[0, 0, 0]} direction={j} color={AXIS_COLORS.y} />
            <VectorArrow origin={[0, 0, 0]} direction={k} color={AXIS_COLORS.z} />
            <PointObject
              position={i}
              label="î"
              color={AXIS_COLORS.x}
              radius={0.13}
              draggable
              onDrag={handleIDrag}
            />
            <PointObject
              position={j}
              label="ĵ"
              color={AXIS_COLORS.y}
              radius={0.13}
              draggable
              onDrag={handleJDrag}
            />
            <PointObject
              position={k}
              label="k̂"
              color={AXIS_COLORS.z}
              radius={0.13}
              draggable
              onDrag={handleKDrag}
            />
          </>
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Matrix challenge">
            {phase === "idle" && (
              <>
                <p className="text-muted text-xs leading-relaxed">
                  {TOTAL_ROUNDS} rounds, {ROUND_SECONDS}s each. Drag î, ĵ, k̂ to match the
                  target matrix as fast as you can.
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
