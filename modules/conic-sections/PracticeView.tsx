"use client";

import { useCallback, useMemo, useState } from "react";
import ModuleScene from "@/three/engine/ModuleScene";
import DoubleCone from "@/three/objects/DoubleCone";
import PlaneObject from "@/three/objects/PlaneObject";
import ConicCurveLines from "@/three/objects/ConicCurveLines";
import ControlPanel from "@/components/panels/ControlPanel";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
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

export default function PracticeView() {
  const [target, setTarget] = useState<ConicKind>(() => randomTarget());
  const { value: tilt, setValue: setTilt, animateTo } = useAnimatedNumber(45);
  const [solved, setSolved] = useState(false);
  const [demoed, setDemoed] = useState(false);
  const [streak, setStreak] = useState(0);

  const tiltRad = (tilt * Math.PI) / 180;
  const normal: Vec3Tuple = [Math.sin(tiltRad), Math.cos(tiltRad), 0];
  const planeOrigin: Vec3Tuple = [0, OFFSET, 0];
  const [u, v] = orthonormalBasis(normal);
  const currentKind = classifyConic(conicCoefficients(u, v, CONE_K));

  const segments = useMemo(
    () => planeConeIntersection(planeOrigin, normal, CONE_K),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tilt],
  );

  const handleTiltChange = useCallback(
    (next: number) => {
      setTilt(next);
      const rad = (next * Math.PI) / 180;
      const n: Vec3Tuple = [Math.sin(rad), Math.cos(rad), 0];
      const [uu, vv] = orthonormalBasis(n);
      const kind = classifyConic(conicCoefficients(uu, vv, CONE_K));
      if (kind === target && !solved) {
        setSolved(true);
        setDemoed(false);
        setStreak((s) => s + 1);
      }
    },
    [setTilt, target, solved],
  );

  const nextChallenge = useCallback(() => {
    setTarget(randomTarget(target));
    setTilt(45);
    setSolved(false);
    setDemoed(false);
  }, [target, setTilt]);

  const showMe = useCallback(() => {
    animateTo(representativeTilt(target), 1.2, () => setDemoed(true));
  }, [animateTo, target]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <DoubleCone halfAngleTan={CONE_K} />
        <PlaneObject point={planeOrigin} normal={normal} size={7} />
        <ConicCurveLines segments={segments} color={solved ? "#35d488" : "#35e0e0"} />
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Produce this curve">
            <div className="flex items-center justify-between">
              <span className="text-muted text-xs">Target</span>
              <Badge tone="warning">{KIND_LABEL[target]}</Badge>
            </div>

            <div>
              <label className="text-muted mb-1 block text-xs">
                Tilt: {tilt.toFixed(1)}° (currently a{" "}
                {KIND_LABEL[currentKind].toLowerCase()})
              </label>
              <input
                type="range"
                min={0}
                max={89}
                step={0.5}
                value={tilt}
                onChange={(e) => handleTiltChange(Number(e.target.value))}
                className="accent-primary w-full"
              />
            </div>

            {solved ? (
              <Badge tone="success">Solved!</Badge>
            ) : demoed ? (
              <Badge tone="neutral">Demo — now try it</Badge>
            ) : (
              <Badge tone="neutral">Streak {streak}</Badge>
            )}

            <p className="text-muted text-xs leading-relaxed">
              Drag the tilt slider until the slice becomes a{" "}
              {KIND_LABEL[target].toLowerCase()}.
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
