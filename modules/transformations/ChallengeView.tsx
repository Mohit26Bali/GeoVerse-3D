"use client";

import { useCallback, useEffect, useState } from "react";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import TransformShape from "@/three/objects/TransformShape";
import ControlPanel from "@/components/panels/ControlPanel";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { PALETTE } from "@/constants/theme";
import { useAnimatedPosition } from "@/hooks/useAnimatedPosition";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import type { Vec3Tuple } from "@/types/math";
import { distance as distanceBetween } from "@/math/vector";
import { rotationMatrix, translationMatrix } from "@/math/transform";

const TRANSLATE_TOLERANCE = 0.4;
const ROTATE_TOLERANCE = 10;
const ROUND_SECONDS = 15;
const TOTAL_ROUNDS = 5;

type RoundType = "translate" | "rotate";
type Phase = "idle" | "playing" | "finished";

function randomVec(): Vec3Tuple {
  const rand = (range: number) => Math.round((Math.random() * range * 2 - range) * 2) / 2;
  return [rand(2.5), rand(1.5), rand(2.5)];
}

function randomAngle(): number {
  return Math.round(Math.random() * 35) * 10;
}

function angleDiff(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function randomRoundType(): RoundType {
  return Math.random() < 0.5 ? "translate" : "rotate";
}

export default function ChallengeView() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [roundType, setRoundType] = useState<RoundType>(() => randomRoundType());
  const [targetVec, setTargetVec] = useState<Vec3Tuple>(() => randomVec());
  const [targetAngle, setTargetAngle] = useState(() => randomAngle());
  const {
    position: handle,
    setPosition,
    animateTo: animatePosTo,
  } = useAnimatedPosition([0, 0, 0]);
  const {
    value: angle,
    setValue: setAngle,
    animateTo: animateAngleTo,
  } = useAnimatedNumber(0);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);

  const setupRound = useCallback(() => {
    const type = randomRoundType();
    setRoundType(type);
    setTargetVec(randomVec());
    setTargetAngle(randomAngle());
    setPosition([0, 0, 0]);
    setAngle(0);
    setSecondsLeft(ROUND_SECONDS);
  }, [setPosition, setAngle]);

  const startGame = useCallback(() => {
    setPhase("playing");
    setRound(0);
    setScore(0);
    setupRound();
  }, [setupRound]);

  const advanceRound = useCallback(
    (won: boolean) => {
      setScore((s) => s + (won ? 1 : 0));
      const nextRound = round + 1;
      setRound(nextRound);
      if (nextRound >= TOTAL_ROUNDS) {
        setPhase("finished");
      } else {
        setupRound();
      }
    },
    [round, setupRound],
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

  const handleTranslateDrag = useCallback(
    (next: Vec3Tuple) => {
      if (phase !== "playing") return;
      setPosition(next);
      if (distanceBetween(next, targetVec) < TRANSLATE_TOLERANCE) {
        advanceRound(true);
      }
    },
    [phase, targetVec, advanceRound, setPosition],
  );

  const handleAngleChange = useCallback(
    (next: number) => {
      if (phase !== "playing") return;
      setAngle(next);
      if (angleDiff(next, targetAngle) < ROTATE_TOLERANCE) {
        advanceRound(true);
      }
    },
    [phase, targetAngle, advanceRound, setAngle],
  );

  const skipWithDemo = useCallback(() => {
    if (roundType === "translate") {
      animatePosTo(targetVec, 1, () => advanceRound(false));
    } else {
      animateAngleTo(targetAngle, 1, () => advanceRound(false));
    }
  }, [roundType, targetVec, targetAngle, animatePosTo, animateAngleTo, advanceRound]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        {phase === "playing" &&
          (roundType === "translate" ? (
            <>
              <TransformShape
                ghost
                ghostColor={PALETTE.warning}
                matrix={translationMatrix(targetVec)}
              />
              <TransformShape matrix={translationMatrix(handle)} />
              <VectorArrow origin={[0, 0, 0]} direction={handle} color={PALETTE.accent} />
              <PointObject
                position={handle}
                label="t"
                color={PALETTE.accent}
                radius={0.13}
                draggable
                onDrag={handleTranslateDrag}
              />
            </>
          ) : (
            <>
              <TransformShape
                ghost
                ghostColor={PALETTE.warning}
                matrix={rotationMatrix("y", (targetAngle * Math.PI) / 180)}
              />
              <TransformShape matrix={rotationMatrix("y", (angle * Math.PI) / 180)} />
            </>
          ))}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Transformation challenge">
            {phase === "idle" && (
              <>
                <p className="text-muted text-xs leading-relaxed">
                  {TOTAL_ROUNDS} rounds, {ROUND_SECONDS}s each, mixing translation and
                  rotation matching.
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
                    Round {round + 1} / {TOTAL_ROUNDS} · {roundType}
                  </span>
                  <Badge tone={secondsLeft <= 5 ? "error" : "neutral"}>
                    {secondsLeft}s
                  </Badge>
                  <Badge tone="primary">Score {score}</Badge>
                </div>
                {roundType === "rotate" && (
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={5}
                    value={angle}
                    onChange={(e) => handleAngleChange(Number(e.target.value))}
                    className="accent-primary w-full"
                  />
                )}
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
