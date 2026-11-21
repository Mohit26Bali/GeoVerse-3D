"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ModuleScene from "@/three/engine/ModuleScene";
import DoubleCone from "@/three/objects/DoubleCone";
import PlaneObject from "@/three/objects/PlaneObject";
import ConicCurveLines from "@/three/objects/ConicCurveLines";
import ControlPanel from "@/components/panels/ControlPanel";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import type { Vec3Tuple } from "@/types/math";
import { orthonormalBasis } from "@/math/vector";
import {
  classifyConic,
  conicCoefficients,
  planeConeIntersection,
  type ConicKind,
} from "@/math/conic";
import { CONE_K, PARABOLA_TILT_DEG } from "@/modules/conic-sections/types";

const OFFSET = 1;
const ROUND_SECONDS = 15;
const TOTAL_ROUNDS = 5;
const KINDS: ConicKind[] = ["circle", "ellipse", "parabola", "hyperbola"];
const KIND_LABEL: Record<ConicKind, string> = {
  circle: "Circle",
  ellipse: "Ellipse",
  parabola: "Parabola",
  hyperbola: "Hyperbola",
};

function representativeTilt(kind: ConicKind): number {
  switch (kind) {
    case "circle":
      return 0;
    case "ellipse":
      return PARABOLA_TILT_DEG * 0.5;
    case "parabola":
      return PARABOLA_TILT_DEG;
    case "hyperbola":
      return Math.min(89, PARABOLA_TILT_DEG + 20);
  }
}

function randomTarget(exclude?: ConicKind): ConicKind {
  const pool = KINDS.filter((k) => k !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

function kindAtTilt(tiltDeg: number): ConicKind {
  const rad = (tiltDeg * Math.PI) / 180;
  const normal: Vec3Tuple = [Math.sin(rad), Math.cos(rad), 0];
  const [u, v] = orthonormalBasis(normal);
  return classifyConic(conicCoefficients(u, v, CONE_K));
}

type Phase = "idle" | "playing" | "finished";

export default function ChallengeView() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState<ConicKind>(() => randomTarget());
  const { value: tilt, setValue: setTilt, animateTo } = useAnimatedNumber(45);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);

  const setupRound = useCallback(() => {
    setTarget((prev) => randomTarget(prev));
    setTilt(45);
    setSecondsLeft(ROUND_SECONDS);
  }, [setTilt]);

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

  const handleTiltChange = useCallback(
    (next: number) => {
      if (phase !== "playing") return;
      setTilt(next);
      if (kindAtTilt(next) === target) {
        advanceRound(true);
      }
    },
    [phase, setTilt, target, advanceRound],
  );

  const skipWithDemo = useCallback(() => {
    animateTo(representativeTilt(target), 1, () => advanceRound(false));
  }, [animateTo, target, advanceRound]);

  const tiltRad = (tilt * Math.PI) / 180;
  const normal: Vec3Tuple = [Math.sin(tiltRad), Math.cos(tiltRad), 0];
  const planeOrigin: Vec3Tuple = [0, OFFSET, 0];
  const segments = useMemo(
    () => planeConeIntersection(planeOrigin, normal, CONE_K),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tilt],
  );

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        {phase === "playing" && (
          <>
            <DoubleCone halfAngleTan={CONE_K} />
            <PlaneObject point={planeOrigin} normal={normal} size={7} />
            <ConicCurveLines segments={segments} />
          </>
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Conic challenge">
            {phase === "idle" && (
              <>
                <p className="text-muted text-xs leading-relaxed">
                  {TOTAL_ROUNDS} rounds, {ROUND_SECONDS}s each. Dial in the tilt to
                  produce each named curve as fast as you can.
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
                <div className="flex items-center justify-between">
                  <span className="text-muted text-xs">Target</span>
                  <Badge tone="warning">{KIND_LABEL[target]}</Badge>
                </div>
                <input
                  type="range"
                  min={0}
                  max={89}
                  step={0.5}
                  value={tilt}
                  onChange={(e) => handleTiltChange(Number(e.target.value))}
                  className="accent-primary w-full"
                />
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
