"use client";

import { useCallback, useMemo, useState } from "react";
import { Line } from "@react-three/drei";
import gsap from "gsap";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import ControlPanel from "@/components/panels/ControlPanel";
import StatReadout from "@/components/panels/StatReadout";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { PALETTE } from "@/constants/theme";
import type { Vec3Tuple } from "@/types/math";
import { distance as distanceBetween } from "@/math/vector";
import { bezierCurvePoints } from "@/math/bezier";
import {
  POINT_LABELS,
  randomControlPoints,
  type BezierDegree,
} from "@/modules/bezier-curves/types";

const TOLERANCE = 0.4;

function randomDegree(): Extract<BezierDegree, "quadratic" | "cubic"> {
  return Math.random() < 0.5 ? "quadratic" : "cubic";
}

export default function PracticeView() {
  const [degree, setDegree] = useState<BezierDegree>(() => randomDegree());
  const [target, setTarget] = useState<Vec3Tuple[]>(() => randomControlPoints(degree));
  const [points, setPoints] = useState<Vec3Tuple[]>(() => randomControlPoints(degree));
  const [solved, setSolved] = useState(false);
  const [demoed, setDemoed] = useState(false);
  const [streak, setStreak] = useState(0);

  const maxError = Math.max(...points.map((p, i) => distanceBetween(p, target[i])));
  const curvePoints = useMemo(() => bezierCurvePoints(points), [points]);
  const targetCurvePoints = useMemo(() => bezierCurvePoints(target), [target]);

  const checkSolved = useCallback(
    (candidate: Vec3Tuple[]) => {
      const allClose = candidate.every(
        (p, i) => distanceBetween(p, target[i]) < TOLERANCE,
      );
      if (allClose && !solved) {
        setSolved(true);
        setDemoed(false);
        setStreak((s) => s + 1);
      }
    },
    [target, solved],
  );

  const handleDrag = useCallback(
    (index: number, next: Vec3Tuple) => {
      setPoints((prev) => {
        const updated = [...prev];
        updated[index] = next;
        checkSolved(updated);
        return updated;
      });
    },
    [checkSolved],
  );

  const nextChallenge = useCallback(() => {
    const nextDegree = randomDegree();
    setDegree(nextDegree);
    setTarget(randomControlPoints(nextDegree));
    setPoints(randomControlPoints(nextDegree));
    setSolved(false);
    setDemoed(false);
  }, []);

  const showMe = useCallback(() => {
    const proxies = points.map((p) => ({ x: p[0], y: p[1], z: p[2] }));
    let completed = 0;
    proxies.forEach((proxy, i) => {
      gsap.to(proxy, {
        x: target[i][0],
        y: target[i][1],
        z: target[i][2],
        duration: 1.2,
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
          if (completed === proxies.length) setDemoed(true);
        },
      });
    });
  }, [points, target]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
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
        <Line
          points={curvePoints}
          color={solved ? PALETTE.success : PALETTE.primary}
          lineWidth={2.5}
        />

        {points.map((p, i) => (
          <PointObject
            key={i}
            position={p}
            label={POINT_LABELS[i]}
            color={solved ? PALETTE.success : PALETTE.primary}
            radius={0.13}
            draggable
            onDrag={(next) => handleDrag(i, next)}
          />
        ))}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title={`Match the target curve (${degree})`}>
            <StatReadout label="Largest point error" value={maxError} />
            {solved ? (
              <Badge tone="success">Solved!</Badge>
            ) : demoed ? (
              <Badge tone="neutral">Demo — now try it</Badge>
            ) : (
              <Badge tone="neutral">Streak {streak}</Badge>
            )}
            <p className="text-muted text-xs leading-relaxed">
              Drag your control points (blue) so the curve matches the amber target curve.
              Left-drag empty space to orbit and adjust depth.
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
