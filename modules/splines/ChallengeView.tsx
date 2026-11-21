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
import { bSplinePoints, bezierSplinePoints, catmullRomPoints } from "@/math/spline";
import {
  ANCHOR_LABELS,
  SPLINE_KINDS,
  randomAnchors,
  type SplineKind,
} from "@/modules/splines/types";

const TOLERANCE = 0.45;
const ROUND_SECONDS = 20;
const TOTAL_ROUNDS = 5;

function curveFor(kind: SplineKind, anchors: Vec3Tuple[]): Vec3Tuple[] {
  switch (kind) {
    case "catmull-rom":
      return catmullRomPoints(anchors);
    case "bezier-spline":
      return bezierSplinePoints(anchors);
    case "b-spline":
      return bSplinePoints(anchors);
  }
}

function randomKind(exclude?: SplineKind): SplineKind {
  const pool = SPLINE_KINDS.map((k) => k.id).filter((id) => id !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

type Phase = "idle" | "playing" | "finished";

export default function ChallengeView() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [kind, setKind] = useState<SplineKind>(() => randomKind());
  const [target, setTarget] = useState<Vec3Tuple[]>(() => randomAnchors());
  const [anchors, setAnchors] = useState<Vec3Tuple[]>(() => randomAnchors());
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);

  const setupRound = useCallback(() => {
    setKind((prev) => randomKind(prev));
    setTarget(randomAnchors());
    setAnchors(randomAnchors());
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
      setAnchors((prev) => {
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
    const proxies = anchors.map((p) => ({ x: p[0], y: p[1], z: p[2] }));
    let completed = 0;
    proxies.forEach((proxy, i) => {
      gsap.to(proxy, {
        x: target[i][0],
        y: target[i][1],
        z: target[i][2],
        duration: 1,
        ease: "power2.inOut",
        onUpdate: () => {
          setAnchors((prev) => {
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
  }, [anchors, target, advanceRound]);

  const curvePoints = useMemo(() => curveFor(kind, anchors), [kind, anchors]);
  const targetCurvePoints = useMemo(() => curveFor(kind, target), [kind, target]);
  const activeKind = SPLINE_KINDS.find((k) => k.id === kind)!;

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
              points={anchors}
              color={PALETTE.border}
              dashed
              dashScale={4}
              lineWidth={1.25}
            />
            <Line points={curvePoints} color={PALETTE.primary} lineWidth={2.5} />
            {anchors.map((p, i) => (
              <PointObject
                key={i}
                position={p}
                label={ANCHOR_LABELS[i]}
                color={PALETTE.primary}
                radius={0.12}
                draggable
                onDrag={(next) => handleDrag(i, next)}
              />
            ))}
          </>
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Spline challenge">
            {phase === "idle" && (
              <>
                <p className="text-muted text-xs leading-relaxed">
                  {TOTAL_ROUNDS} rounds, {ROUND_SECONDS}s each, mixing Catmull-Rom, Bézier
                  spline, and B-spline. Match the target curve as fast as you can.
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
                    Round {round + 1} / {TOTAL_ROUNDS} · {activeKind.label}
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
