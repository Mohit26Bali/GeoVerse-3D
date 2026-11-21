"use client";

import { useCallback, useState } from "react";
import { Line } from "@react-three/drei";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import PlaneObject from "@/three/objects/PlaneObject";
import SphereShell from "@/three/objects/SphereShell";
import WaterFillSphere from "@/three/objects/WaterFillSphere";
import ControlPanel from "@/components/panels/ControlPanel";
import StatReadout from "@/components/panels/StatReadout";
import Equation from "@/components/ui/Equation";
import { PALETTE } from "@/constants/theme";
import { cn } from "@/utils/cn";
import type { Vec3Tuple } from "@/types/math";
import { distance as distanceBetween, normalize, scale } from "@/math/vector";
import { circlePoints3D, greatCirclePoints3D } from "@/math/geometry";
import {
  crossSectionRadius,
  sphereSurfaceArea,
  sphereVolume,
  sphericalCapVolume,
} from "@/math/sphere";
import { formatNumber } from "@/math/format";
import { SPHERE_OPS, type SphereOp } from "@/modules/sphere-geometry/types";

const ORIGIN: Vec3Tuple = [0, 0, 0];

export default function ExploreView() {
  const [op, setOp] = useState<SphereOp>("chord");
  const [radiusHandle, setRadiusHandle] = useState<Vec3Tuple>([2.5, 0, 0]);
  const [dirA, setDirA] = useState<Vec3Tuple>(normalize([1, 1, 0.4]));
  const [dirB, setDirB] = useState<Vec3Tuple>(normalize([-0.6, 0.8, 1]));
  const [sliceOffset, setSliceOffset] = useState(0);
  const [fillHeight, setFillHeight] = useState(2);

  const radius = distanceBetween(ORIGIN, radiusHandle);

  const handleRadiusDrag = useCallback((next: Vec3Tuple) => setRadiusHandle(next), []);
  const handleADrag = useCallback((next: Vec3Tuple) => setDirA(normalize(next)), []);
  const handleBDrag = useCallback((next: Vec3Tuple) => setDirB(normalize(next)), []);

  const pointA = scale(dirA, radius);
  const pointB = scale(dirB, radius);
  const chordLength = distanceBetween(pointA, pointB);

  const clampedOffset = Math.max(-radius, Math.min(radius, sliceOffset));
  const sliceRadius = crossSectionRadius(radius, clampedOffset);
  const clampedFill = Math.max(0, Math.min(2 * radius, fillHeight));
  const capVolume = sphericalCapVolume(radius, clampedFill);

  const greatCircle = greatCirclePoints3D(ORIGIN, radius, pointA, pointB);
  const sliceCircle = circlePoints3D([0, clampedOffset, 0], sliceRadius, [0, 1, 0]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        {op === "water-fill" ? (
          <WaterFillSphere radius={radius} fillHeight={clampedFill} />
        ) : (
          <SphereShell radius={radius} />
        )}

        <PointObject
          position={radiusHandle}
          label="r"
          color={PALETTE.warning}
          radius={0.12}
          draggable
          onDrag={handleRadiusDrag}
        />
        <Line
          points={[ORIGIN, radiusHandle]}
          color={PALETTE.warning}
          dashed
          dashScale={4}
          lineWidth={1.5}
        />

        {op === "chord" && (
          <>
            <PointObject
              position={pointA}
              label="A"
              color={PALETTE.primary}
              radius={0.11}
              draggable
              onDrag={handleADrag}
            />
            <PointObject
              position={pointB}
              label="B"
              color={PALETTE.secondary}
              radius={0.11}
              draggable
              onDrag={handleBDrag}
            />
            <Line points={[pointA, pointB]} color={PALETTE.accent} lineWidth={2.5} />
            <Line
              points={greatCircle}
              color={PALETTE.accent}
              transparent
              opacity={0.5}
              lineWidth={1.25}
            />
          </>
        )}

        {op === "cross-section" && (
          <>
            <PlaneObject
              point={[0, clampedOffset, 0]}
              normal={[0, 1, 0]}
              size={radius * 2.4}
              color={PALETTE.secondary}
            />
            {sliceRadius > 0.001 && (
              <Line points={sliceCircle} color={PALETTE.accent} lineWidth={2.5} />
            )}
          </>
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Sphere">
            <div className="flex flex-wrap gap-1.5">
              {SPHERE_OPS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setOp(o.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    op === o.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-hover text-muted hover:text-foreground",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatReadout label="Radius" value={radius} />
              <StatReadout label="Diameter" value={radius * 2} />
              <StatReadout label="Surface area" value={sphereSurfaceArea(radius)} />
              <StatReadout label="Volume" value={sphereVolume(radius)} />
            </div>

            {op === "chord" && (
              <>
                <Equation
                  latex={`\\text{chord length} = ${formatNumber(chordLength)}`}
                  block
                />
                <p className="text-muted text-xs leading-relaxed">
                  Drag A and B around the sphere — the chord (bright line) connects them
                  directly, while the faint circle is the great circle passing through
                  both.
                </p>
              </>
            )}

            {op === "cross-section" && (
              <>
                <label className="text-muted block text-xs">
                  Slice height: {formatNumber(clampedOffset)}
                </label>
                <input
                  type="range"
                  min={-radius}
                  max={radius}
                  step={0.05}
                  value={clampedOffset}
                  onChange={(e) => setSliceOffset(Number(e.target.value))}
                  className="accent-primary w-full"
                />
                <Equation
                  latex={`r_{\\text{slice}} = \\sqrt{r^2 - h^2} = ${formatNumber(sliceRadius)}`}
                  block
                />
              </>
            )}

            {op === "water-fill" && (
              <>
                <label className="text-muted block text-xs">
                  Fill level: {formatNumber((clampedFill / (2 * radius)) * 100, 0)}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={2 * radius}
                  step={0.05}
                  value={clampedFill}
                  onChange={(e) => setFillHeight(Number(e.target.value))}
                  className="accent-primary w-full"
                />
                <StatReadout label="Water volume" value={capVolume} />
              </>
            )}

            <p className="text-muted text-xs leading-relaxed">
              Drag the amber handle to change the radius. Left-drag empty space to orbit.
            </p>
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
