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
import { bSplinePoints, bezierSplinePoints, catmullRomPoints } from "@/math/spline";
import {
  ANCHOR_LABELS,
  SPLINE_KINDS,
  randomAnchors,
  type SplineKind,
} from "@/modules/splines/types";

const TOLERANCE = 0.4;

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

export default function PracticeView() {
  const [kind, setKind] = useState<SplineKind>(() => randomKind());
  const [target, setTarget] = useState<Vec3Tuple[]>(() => randomAnchors());
  const [anchors, setAnchors] = useState<Vec3Tuple[]>(() => randomAnchors());
  const [solved, setSolved] = useState(false);
  const [demoed, setDemoed] = useState(false);
  const [streak, setStreak] = useState(0);

  const maxError = Math.max(...anchors.map((p, i) => distanceBetween(p, target[i])));
  const curvePoints = useMemo(() => curveFor(kind, anchors), [kind, anchors]);
  const targetCurvePoints = useMemo(() => curveFor(kind, target), [kind, target]);

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
      setAnchors((prev) => {
        const updated = [...prev];
        updated[index] = next;
        checkSolved(updated);
        return updated;
      });
    },
    [checkSolved],
  );

  const nextChallenge = useCallback(() => {
    const nextKind = randomKind(kind);
    setKind(nextKind);
    setTarget(randomAnchors());
    setAnchors(randomAnchors());
    setSolved(false);
    setDemoed(false);
  }, [kind]);

  const showMe = useCallback(() => {
    const proxies = anchors.map((p) => ({ x: p[0], y: p[1], z: p[2] }));
    let completed = 0;
    proxies.forEach((proxy, i) => {
      gsap.to(proxy, {
        x: target[i][0],
        y: target[i][1],
        z: target[i][2],
        duration: 1.2,
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
          if (completed === proxies.length) setDemoed(true);
        },
      });
    });
  }, [anchors, target]);

  const activeKind = SPLINE_KINDS.find((k) => k.id === kind)!;

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
          points={anchors}
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

        {anchors.map((p, i) => (
          <PointObject
            key={i}
            position={p}
            label={ANCHOR_LABELS[i]}
            color={solved ? PALETTE.success : PALETTE.primary}
            radius={0.12}
            draggable
            onDrag={(next) => handleDrag(i, next)}
          />
        ))}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title={`Match the target (${activeKind.label})`}>
            <StatReadout label="Largest anchor error" value={maxError} />
            {solved ? (
              <Badge tone="success">Solved!</Badge>
            ) : demoed ? (
              <Badge tone="neutral">Demo — now try it</Badge>
            ) : (
              <Badge tone="neutral">Streak {streak}</Badge>
            )}
            <p className="text-muted text-xs leading-relaxed">
              Drag your anchors (blue) so the curve matches the amber target curve.
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
