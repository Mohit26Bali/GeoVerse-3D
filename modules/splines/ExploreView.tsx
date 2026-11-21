"use client";

import { useCallback, useMemo, useState } from "react";
import { Line } from "@react-three/drei";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import ControlPanel from "@/components/panels/ControlPanel";
import Badge from "@/components/ui/Badge";
import { PALETTE } from "@/constants/theme";
import { cn } from "@/utils/cn";
import type { Vec3Tuple } from "@/types/math";
import {
  bSplinePoints,
  bezierSplineHandles,
  bezierSplinePoints,
  catmullRomPoints,
} from "@/math/spline";
import {
  ANCHOR_LABELS,
  DEFAULT_ANCHORS,
  SPLINE_KINDS,
  type SplineKind,
} from "@/modules/splines/types";

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

export default function ExploreView() {
  const [kind, setKind] = useState<SplineKind>("catmull-rom");
  const [anchors, setAnchors] = useState<Vec3Tuple[]>(DEFAULT_ANCHORS);

  const handleDrag = useCallback((index: number, next: Vec3Tuple) => {
    setAnchors((prev) => {
      const updated = [...prev];
      updated[index] = next;
      return updated;
    });
  }, []);

  const curvePoints = useMemo(() => curveFor(kind, anchors), [kind, anchors]);
  const handles = useMemo(() => bezierSplineHandles(anchors), [anchors]);
  const activeKind = SPLINE_KINDS.find((k) => k.id === kind)!;

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <Line
          points={anchors}
          color={PALETTE.border}
          dashed
          dashScale={4}
          lineWidth={1.25}
        />
        <Line points={curvePoints} color={PALETTE.primary} lineWidth={2.5} />

        {kind === "bezier-spline" &&
          handles.map((h, i) => (
            <group key={i}>
              <Line
                points={[h.in, anchors[i]]}
                color={PALETTE.secondary}
                transparent
                opacity={0.6}
                lineWidth={1}
              />
              <Line
                points={[anchors[i], h.out]}
                color={PALETTE.secondary}
                transparent
                opacity={0.6}
                lineWidth={1}
              />
            </group>
          ))}

        {anchors.map((p, i) => (
          <PointObject
            key={i}
            position={p}
            label={ANCHOR_LABELS[i]}
            color={PALETTE.primary}
            radius={0.11}
            draggable
            onDrag={(next) => handleDrag(i, next)}
          />
        ))}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Splines">
            <div className="flex flex-wrap gap-1.5">
              {SPLINE_KINDS.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setKind(k.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    kind === k.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-hover text-muted hover:text-foreground",
                  )}
                >
                  {k.label}
                </button>
              ))}
            </div>

            <Badge tone={activeKind.passesThroughAnchors ? "success" : "warning"}>
              {activeKind.passesThroughAnchors
                ? "Passes through every anchor"
                : "Approximates — doesn't touch the anchors"}
            </Badge>

            <p className="text-muted text-xs leading-relaxed">
              {kind === "catmull-rom" &&
                "Each segment blends the 4 nearest anchors so the curve interpolates every point exactly."}
              {kind === "bezier-spline" &&
                "A chain of cubic Bézier segments (thin lines show each anchor's handles) — smoothly joined so there's no visible kink."}
              {kind === "b-spline" &&
                "The curve stays near the anchors but glides past them — moving one anchor only reshapes a local stretch of the curve."}
            </p>

            <p className="text-muted text-xs leading-relaxed">
              Drag any anchor point. Left-drag empty space to orbit.
            </p>
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
