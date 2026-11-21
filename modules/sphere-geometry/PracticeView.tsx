"use client";

import { useCallback, useMemo, useState } from "react";
import { Line } from "@react-three/drei";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import PlaneObject from "@/three/objects/PlaneObject";
import SphereShell from "@/three/objects/SphereShell";
import ControlPanel from "@/components/panels/ControlPanel";
import StatReadout from "@/components/panels/StatReadout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { cn } from "@/utils/cn";
import { useAnimatedPosition } from "@/hooks/useAnimatedPosition";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import type { Vec3Tuple } from "@/types/math";
import { distance as distanceBetween } from "@/math/vector";
import { circlePoints3D } from "@/math/geometry";
import { crossSectionRadius, sphereSurfaceArea, sphereVolume } from "@/math/sphere";
import { formatNumber } from "@/math/format";

const CROSS_SECTION_TOLERANCE = 0.15;
const METRIC_TOLERANCE_PCT = 0.06;
const FIXED_RADIUS = 2.2;

type PracticeMode = "cross-section" | "radius-match";
type Metric = "volume" | "surface-area";

function randomOffset(radius: number): number {
  const v = (Math.random() * 2 - 1) * radius * 0.85;
  return Math.round(v * 20) / 20;
}

function randomTargetRadius(): number {
  return Math.round((1 + Math.random() * 2.5) * 10) / 10;
}

export default function PracticeView() {
  const [mode, setMode] = useState<PracticeMode>("cross-section");

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

  const [solved, setSolved] = useState(false);
  const [demoed, setDemoed] = useState(false);
  const [streak, setStreak] = useState(0);

  const targetSliceRadius = crossSectionRadius(FIXED_RADIUS, targetOffset);
  const currentSliceRadius = crossSectionRadius(FIXED_RADIUS, offset);
  const sliceDiff = Math.abs(currentSliceRadius - targetSliceRadius);

  const radius = distanceBetween([0, 0, 0], handle);
  const targetValue =
    metric === "volume" ? sphereVolume(targetRadius) : sphereSurfaceArea(targetRadius);
  const currentValue =
    metric === "volume" ? sphereVolume(radius) : sphereSurfaceArea(radius);

  const switchMode = useCallback((next: PracticeMode) => {
    setMode(next);
    setSolved(false);
    setDemoed(false);
  }, []);

  const targetCircle = useMemo(
    () => circlePoints3D([0, targetOffset, 0], targetSliceRadius, [0, 1, 0]),
    [targetOffset, targetSliceRadius],
  );
  const currentCircle = useMemo(
    () => circlePoints3D([0, offset, 0], currentSliceRadius, [0, 1, 0]),
    [offset, currentSliceRadius],
  );

  const handleOffsetChange = useCallback(
    (next: number) => {
      setOffset(next);
      if (
        Math.abs(crossSectionRadius(FIXED_RADIUS, next) - targetSliceRadius) <
          CROSS_SECTION_TOLERANCE &&
        !solved
      ) {
        setSolved(true);
        setDemoed(false);
        setStreak((s) => s + 1);
      }
    },
    [setOffset, targetSliceRadius, solved],
  );

  const handleRadiusDrag = useCallback(
    (next: Vec3Tuple) => {
      setHandle(next);
      const r = distanceBetween([0, 0, 0], next);
      const val = metric === "volume" ? sphereVolume(r) : sphereSurfaceArea(r);
      if (Math.abs(val - targetValue) / targetValue < METRIC_TOLERANCE_PCT && !solved) {
        setSolved(true);
        setDemoed(false);
        setStreak((s) => s + 1);
      }
    },
    [setHandle, metric, targetValue, solved],
  );

  const nextChallenge = useCallback(() => {
    if (mode === "cross-section") {
      setTargetOffset(randomOffset(FIXED_RADIUS));
      setOffset(0);
    } else {
      setMetric(Math.random() < 0.5 ? "volume" : "surface-area");
      setTargetRadius(randomTargetRadius());
      setHandle([1, 0, 0]);
    }
    setSolved(false);
    setDemoed(false);
  }, [mode, setOffset, setHandle]);

  const showMe = useCallback(() => {
    if (mode === "cross-section") {
      animateOffsetTo(targetOffset, 1.2, () => setDemoed(true));
    } else {
      animateHandleTo([targetRadius, 0, 0], 1.2, () => setDemoed(true));
    }
  }, [mode, targetOffset, targetRadius, animateOffsetTo, animateHandleTo]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        {mode === "cross-section" ? (
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
              color={solved ? "#35d488" : "#f5b942"}
              radius={0.13}
              draggable
              onDrag={handleRadiusDrag}
            />
          </>
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Match the target">
            <div className="flex gap-1.5">
              {(["cross-section", "radius-match"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    mode === m
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-hover text-muted hover:text-foreground",
                  )}
                >
                  {m === "cross-section" ? "Cross Section" : "Volume / Area"}
                </button>
              ))}
            </div>

            {mode === "cross-section" ? (
              <>
                <input
                  type="range"
                  min={-FIXED_RADIUS}
                  max={FIXED_RADIUS}
                  step={0.05}
                  value={offset}
                  onChange={(e) => handleOffsetChange(Number(e.target.value))}
                  className="accent-primary w-full"
                />
                <StatReadout label="Cross-section radius error" value={sliceDiff} />
              </>
            ) : (
              <StatReadout
                label={`Target ${metric === "volume" ? "volume" : "surface area"}`}
                value={targetValue}
              />
            )}

            {mode === "radius-match" && (
              <StatReadout
                label={`Current ${metric === "volume" ? "volume" : "surface area"}`}
                value={currentValue}
              />
            )}

            {solved ? (
              <Badge tone="success">Solved!</Badge>
            ) : demoed ? (
              <Badge tone="neutral">Demo — now try it</Badge>
            ) : (
              <Badge tone="neutral">Streak {streak}</Badge>
            )}

            <p className="text-muted text-xs leading-relaxed">
              {mode === "cross-section"
                ? "Drag the slider so the cyan circle matches the amber target ring."
                : `Drag the amber handle so the sphere's ${metric === "volume" ? "volume" : "surface area"} matches ${formatNumber(targetValue)}.`}
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
