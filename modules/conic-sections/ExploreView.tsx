"use client";

import { useCallback, useMemo, useState } from "react";
import ModuleScene from "@/three/engine/ModuleScene";
import DoubleCone from "@/three/objects/DoubleCone";
import PlaneObject from "@/three/objects/PlaneObject";
import ConicCurveLines from "@/three/objects/ConicCurveLines";
import ControlPanel from "@/components/panels/ControlPanel";
import StatReadout from "@/components/panels/StatReadout";
import Badge from "@/components/ui/Badge";
import { cn } from "@/utils/cn";
import type { Vec3Tuple } from "@/types/math";
import { orthonormalBasis } from "@/math/vector";
import {
  classifyConic,
  conicCoefficients,
  planeConeIntersection,
  type ConicKind,
} from "@/math/conic";
import { formatNumber } from "@/math/format";
import { CONE_K, CONIC_PRESETS } from "@/modules/conic-sections/types";

const KIND_LABEL: Record<ConicKind, string> = {
  circle: "Circle",
  ellipse: "Ellipse",
  parabola: "Parabola",
  hyperbola: "Hyperbola",
};

const KIND_TONE: Record<ConicKind, "primary" | "secondary" | "accent" | "warning"> = {
  circle: "primary",
  ellipse: "secondary",
  parabola: "warning",
  hyperbola: "accent",
};

export default function ExploreView() {
  const [tilt, setTilt] = useState(0);
  const [offset, setOffset] = useState(1);

  const tiltRad = (tilt * Math.PI) / 180;
  const normal: Vec3Tuple = [Math.sin(tiltRad), Math.cos(tiltRad), 0];
  const planeOrigin: Vec3Tuple = [0, offset, 0];

  const [u, v] = orthonormalBasis(normal);
  const coefficients = conicCoefficients(u, v, CONE_K);
  const kind = classifyConic(coefficients);
  const discriminant =
    coefficients.b * coefficients.b - 4 * coefficients.a * coefficients.c;

  const segments = useMemo(
    () => planeConeIntersection(planeOrigin, normal, CONE_K),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tilt, offset],
  );

  const applyPreset = useCallback((presetTilt: number, presetOffset: number) => {
    setTilt(presetTilt);
    setOffset(presetOffset);
  }, []);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <DoubleCone halfAngleTan={CONE_K} />
        <PlaneObject point={planeOrigin} normal={normal} size={7} />
        <ConicCurveLines segments={segments} />
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Slice the cone">
            <div className="flex flex-wrap gap-1.5">
              {CONIC_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.tilt, p.offset)}
                  className="bg-surface-hover text-muted hover:text-foreground rounded-full px-3 py-1 text-xs font-medium transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div>
              <label className="text-muted mb-1 block text-xs">
                Tilt: {formatNumber(tilt, 1)}°
              </label>
              <input
                type="range"
                min={0}
                max={89}
                step={0.5}
                value={tilt}
                onChange={(e) => setTilt(Number(e.target.value))}
                className="accent-primary w-full"
              />
            </div>

            <div>
              <label className="text-muted mb-1 block text-xs">
                Offset along axis: {formatNumber(offset)}
              </label>
              <input
                type="range"
                min={-2.5}
                max={2.5}
                step={0.05}
                value={offset}
                onChange={(e) => setOffset(Number(e.target.value))}
                className="accent-primary w-full"
              />
            </div>

            <div className={cn("flex items-center justify-between")}>
              <span className="text-muted text-xs">Curve type</span>
              <Badge tone={KIND_TONE[kind]}>{KIND_LABEL[kind]}</Badge>
            </div>

            <StatReadout label="Discriminant (B² - 4AC)" value={discriminant} />

            <p className="text-muted text-xs leading-relaxed">
              Tilt the plane from horizontal (circle) toward vertical (hyperbola) — the
              curve transitions through an ellipse, a single parabola, then a two-branched
              hyperbola. Left-drag empty space to orbit.
            </p>
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
