"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Line } from "@react-three/drei";
import gsap from "gsap";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import ControlPanel from "@/components/panels/ControlPanel";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { PALETTE } from "@/constants/theme";
import type { Vec3Tuple } from "@/types/math";
import { distance as distanceBetween } from "@/math/vector";
import { bezierCurvePoints } from "@/math/bezier";
import {
  POINT_LABELS,
  randomControlPoints,
  type BezierDegree,
} from "@/modules/bezier-curves/types";

const TOLERANCE = 0.45;
const ROUND_SECONDS = 20;
const TOTAL_ROUNDS = 5;

function randomDegree(): Extract<BezierDegree, "quadratic" | "cubic"> {
  return Math.random() < 0.5 ? "quadratic" : "cubic";
}

type Phase = "idle" | "playing" | "finished";

export default function ChallengeView() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [degree, setDegree] = useState<BezierDegree>(() => randomDegree());
  const [target, setTarget] = useState<Vec3Tuple[]>(() => randomControlPoints(degree));
  const [points, setPoints] = useState<Vec3Tuple[]>(() => randomControlPoints(degree));
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);

  const setupRound = useCallback(() => {
    const nextDegree = randomDegree();
    setDegree(nextDegree);
    setTarget(randomControlPoints(nextDegree));
    setPoints(randomControlPoints(nextDegree));
    setSecondsLeft(ROUND_SECONDS);
  }, []);

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

  const handleDrag = useCallback(
    (index: number, next: Vec3Tuple) => {
      if (phase !== "playing") return;
      setPoints((prev) => {
        const updated = [...prev];
        updated[index] = next;
        const allClose = updated.every(
          (p, i) => distanceBetween(p, target[i]) < TOLERANCE,
        );
        if (allClose) advanceRound(true);
        return updated;
      });
    },
    [phase, target, advanceRound],
  );

  const skipWithDemo = useCallback(() => {
    const proxies = points.map((p) => ({ x: p[0], y: p[1], z: p[2] }));
    let completed = 0;
    proxies.forEach((proxy, i) => {
      gsap.to(proxy, {
        x: target[i][0],
        y: target[i][1],
        z: target[i][2],
        duration: 1,
        ease: "power2.inOut",
        onUpdate: () => {
          setPoints((prev) => {
            const next = [...prev];
            next[i] = [proxy.x, proxy.y, proxy.z];
            return next;
          });
        },
        onComplete: () => {
          completed++;
          if (completed === proxies.length) advanceRound(false);
        },
      });
    });
  }, [points, target, advanceRound]);

  const curvePoints = useMemo(() => bezierCurvePoints(points), [points]);
  const targetCurvePoints = useMemo(() => bezierCurvePoints(target), [target]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        {phase === "playing" && (
          <>
            <Line
              points={targetCurvePoints}
              color={PALETTE.warning}
              transparent
              opacity={0.6}
              lineWidth={2}
            />
            <Line
              points={points}
              color={PALETTE.border}
              dashed
              dashScale={4}
              lineWidth={1.25}
            />
            <Line points={curvePoints} color={PALETTE.primary} lineWidth={2.5} />
            {points.map((p, i) => (
              <PointObject
                key={i}
                position={p}
                label={POINT_LABELS[i]}
                color={PALETTE.primary}
                radius={0.13}
                draggable
                onDrag={(next) => handleDrag(i, next)}
              />
            ))}
          </>
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Bézier challenge">
            {phase === "idle" && (
              <>
                <p className="text-muted text-xs leading-relaxed">
                  {TOTAL_ROUNDS} rounds, {ROUND_SECONDS}s each, mixing quadratic and cubic
                  curves. Match the target curve as fast as you can.
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
                    Round {round + 1} / {TOTAL_ROUNDS} · {degree}
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
