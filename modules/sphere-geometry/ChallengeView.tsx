"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Line } from "@react-three/drei";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import PlaneObject from "@/three/objects/PlaneObject";
import SphereShell from "@/three/objects/SphereShell";
import ControlPanel from "@/components/panels/ControlPanel";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useAnimatedPosition } from "@/hooks/useAnimatedPosition";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import type { Vec3Tuple } from "@/types/math";
import { distance as distanceBetween } from "@/math/vector";
import { circlePoints3D } from "@/math/geometry";
import { crossSectionRadius, sphereSurfaceArea, sphereVolume } from "@/math/sphere";

const CROSS_SECTION_TOLERANCE = 0.15;
const METRIC_TOLERANCE_PCT = 0.06;
const FIXED_RADIUS = 2.2;
const ROUND_SECONDS = 15;
const TOTAL_ROUNDS = 5;

type RoundType = "cross-section" | "radius-match";
type Metric = "volume" | "surface-area";
type Phase = "idle" | "playing" | "finished";

function randomOffset(radius: number): number {
  const v = (Math.random() * 2 - 1) * radius * 0.85;
  return Math.round(v * 20) / 20;
}

function randomTargetRadius(): number {
  return Math.round((1 + Math.random() * 2.5) * 10) / 10;
}

function randomRoundType(): RoundType {
  return Math.random() < 0.5 ? "cross-section" : "radius-match";
}

export default function ChallengeView() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [roundType, setRoundType] = useState<RoundType>(() => randomRoundType());
  const [targetOffset, setTargetOffset] = useState(() => randomOffset(FIXED_RADIUS));
  const {
    value: offset,
    setValue: setOffset,
    animateTo: animateOffsetTo,
  } = useAnimatedNumber(0);
  const [metric, setMetric] = useState<Metric>("volume");
  const [targetRadius, setTargetRadius] = useState(() => randomTargetRadius());
  const {
    position: handle,
    setPosition: setHandle,
    animateTo: animateHandleTo,
  } = useAnimatedPosition([1, 0, 0]);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);

  const setupRound = useCallback(() => {
    setRoundType(randomRoundType());
    setTargetOffset(randomOffset(FIXED_RADIUS));
    setOffset(0);
    setMetric(Math.random() < 0.5 ? "volume" : "surface-area");
    setTargetRadius(randomTargetRadius());
    setHandle([1, 0, 0]);
    setSecondsLeft(ROUND_SECONDS);
  }, [setOffset, setHandle]);

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

  const targetSliceRadius = crossSectionRadius(FIXED_RADIUS, targetOffset);
  const targetValue =
    metric === "volume" ? sphereVolume(targetRadius) : sphereSurfaceArea(targetRadius);

  const targetCircle = useMemo(
    () => circlePoints3D([0, targetOffset, 0], targetSliceRadius, [0, 1, 0]),
    [targetOffset, targetSliceRadius],
  );
  const currentSliceRadius = crossSectionRadius(FIXED_RADIUS, offset);
  const currentCircle = useMemo(
    () => circlePoints3D([0, offset, 0], currentSliceRadius, [0, 1, 0]),
    [offset, currentSliceRadius],
  );

  const handleOffsetChange = useCallback(
    (next: number) => {
      if (phase !== "playing") return;
      setOffset(next);
      if (
        Math.abs(crossSectionRadius(FIXED_RADIUS, next) - targetSliceRadius) <
        CROSS_SECTION_TOLERANCE
      ) {
        advanceRound(true);
      }
    },
    [phase, setOffset, targetSliceRadius, advanceRound],
  );

  const handleRadiusDrag = useCallback(
    (next: Vec3Tuple) => {
      if (phase !== "playing") return;
      setHandle(next);
      const r = distanceBetween([0, 0, 0], next);
      const val = metric === "volume" ? sphereVolume(r) : sphereSurfaceArea(r);
      if (Math.abs(val - targetValue) / targetValue < METRIC_TOLERANCE_PCT) {
        advanceRound(true);
      }
    },
    [phase, setHandle, metric, targetValue, advanceRound],
  );

  const skipWithDemo = useCallback(() => {
    if (roundType === "cross-section") {
      animateOffsetTo(targetOffset, 1, () => advanceRound(false));
    } else {
      animateHandleTo([targetRadius, 0, 0], 1, () => advanceRound(false));
    }
  }, [
    roundType,
    targetOffset,
    targetRadius,
    animateOffsetTo,
    animateHandleTo,
    advanceRound,
  ]);

  const radius = distanceBetween([0, 0, 0], handle);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        {phase === "playing" &&
          (roundType === "cross-section" ? (
            <>
              <SphereShell radius={FIXED_RADIUS} />
              <Line
                points={targetCircle}
                color="#f5b942"
                transparent
                opacity={0.6}
                lineWidth={2}
              />
              <PlaneObject
                point={[0, offset, 0]}
                normal={[0, 1, 0]}
                size={FIXED_RADIUS * 2.4}
                color="#4c7cff"
              />
              {currentSliceRadius > 0.001 && (
                <Line points={currentCircle} color="#35e0e0" lineWidth={2.5} />
              )}
            </>
          ) : (
            <>
              <SphereShell radius={targetRadius} color="#f5b942" opacity={0.12} />
              <SphereShell radius={radius} />
              <PointObject
                position={handle}
                label="r"
                color="#f5b942"
                radius={0.13}
                draggable
                onDrag={handleRadiusDrag}
              />
            </>
          ))}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Sphere challenge">
            {phase === "idle" && (
              <>
                <p className="text-muted text-xs leading-relaxed">
                  {TOTAL_ROUNDS} rounds, {ROUND_SECONDS}s each, mixing cross-section
                  matching and volume/area matching.
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
                    Round {round + 1} / {TOTAL_ROUNDS} ·{" "}
                    {roundType === "cross-section" ? "slice" : metric}
                  </span>
                  <Badge tone={secondsLeft <= 5 ? "error" : "neutral"}>
                    {secondsLeft}s
                  </Badge>
                  <Badge tone="primary">Score {score}</Badge>
                </div>
                {roundType === "cross-section" && (
                  <input
                    type="range"
                    min={-FIXED_RADIUS}
                    max={FIXED_RADIUS}
                    step={0.05}
                    value={offset}
                    onChange={(e) => handleOffsetChange(Number(e.target.value))}
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
