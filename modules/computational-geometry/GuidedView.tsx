"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import type { Vec3Tuple } from "@/types/math";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import FilledPolygon from "@/three/objects/FilledPolygon";
import CameraDirector from "@/modules/_shared/CameraDirector";
import GuidedControls from "@/components/panels/GuidedControls";
import { useGuidedSequence } from "@/hooks/useGuidedSequence";
import { PALETTE } from "@/constants/theme";
import {
  convexHull2D,
  delaunayTriangulation,
  fromXZAll,
  rayIntersectsPolygon,
  toXZ,
  toXZAll,
  triangleEdges,
  voronoiCells,
} from "@/math/computationalGeometry";
import {
  DEFAULT_BBOX_POINTS,
  DEFAULT_DELAUNAY_POINTS,
  DEFAULT_HULL_POINTS,
  DEFAULT_RAY_AIM,
  DEFAULT_RAY_ORIGIN,
  DEFAULT_RAY_POLYGON_POINTS,
  DEFAULT_SHAPE_A_CENTER,
  DEFAULT_SHAPE_B_CENTER,
  DEFAULT_VORONOI_SITES,
  POINT_LABELS,
} from "@/modules/computational-geometry/types";
import ShapeOutline from "@/modules/computational-geometry/ShapeOutline";
import { COMP_GEO_GUIDED_STEPS } from "@/modules/computational-geometry/steps";

const CELL_COLORS = [
  PALETTE.primary,
  PALETTE.secondary,
  PALETTE.accent,
  PALETTE.warning,
  PALETTE.success,
];

export default function GuidedView() {
  const seq = useGuidedSequence(COMP_GEO_GUIDED_STEPS);
  const { topic } = seq.step;

  const hull = useMemo(() => fromXZAll(convexHull2D(toXZAll(DEFAULT_HULL_POINTS))), []);
  const voronoiCellPolygons = useMemo(
    () => voronoiCells(toXZAll(DEFAULT_VORONOI_SITES), 6).map(fromXZAll),
    [],
  );
  const triangles = useMemo(
    () => delaunayTriangulation(toXZAll(DEFAULT_DELAUNAY_POINTS)),
    [],
  );
  const delaunayEdges = useMemo<[Vec3Tuple, Vec3Tuple][]>(
    () =>
      triangles.flatMap((t) =>
        triangleEdges(t).map(([a, b]): [Vec3Tuple, Vec3Tuple] => [
          fromXZAll([a])[0],
          fromXZAll([b])[0],
        ]),
      ),
    [triangles],
  );
  const box = useMemo<Vec3Tuple[]>(() => {
    const xs = DEFAULT_BBOX_POINTS.map((p) => p[0]);
    const zs = DEFAULT_BBOX_POINTS.map((p) => p[2]);
    const min = [Math.min(...xs), Math.min(...zs)];
    const max = [Math.max(...xs), Math.max(...zs)];
    return [
      [min[0], 0, min[1]],
      [max[0], 0, min[1]],
      [max[0], 0, max[1]],
      [min[0], 0, max[1]],
    ];
  }, []);
  const rayPolygon = useMemo(
    () => fromXZAll(convexHull2D(toXZAll(DEFAULT_RAY_POLYGON_POINTS))),
    [],
  );
  const rayDir = useMemo<Vec3Tuple>(() => {
    const dx = DEFAULT_RAY_AIM[0] - DEFAULT_RAY_ORIGIN[0];
    const dz = DEFAULT_RAY_AIM[2] - DEFAULT_RAY_ORIGIN[2];
    const len = Math.hypot(dx, dz) || 1;
    return [dx / len, 0, dz / len];
  }, []);
  const rayHit = useMemo(
    () =>
      rayIntersectsPolygon(toXZ(DEFAULT_RAY_ORIGIN), toXZ(rayDir), toXZAll(rayPolygon)),
    [rayDir, rayPolygon],
  );
  const rayEndpoint = useMemo<Vec3Tuple>(
    () =>
      rayHit
        ? [rayHit[0], 0, rayHit[1]]
        : [
            DEFAULT_RAY_ORIGIN[0] + rayDir[0] * 14,
            0,
            DEFAULT_RAY_ORIGIN[2] + rayDir[2] * 14,
          ],
    [rayHit, rayDir],
  );

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <CameraDirector
          target={seq.step.cameraTarget}
          distance={seq.step.cameraDistance}
        />

        {topic === "convex-hull" && (
          <>
            <FilledPolygon points={hull} color={PALETTE.primary} opacity={0.18} />
            <Line points={[...hull, hull[0]]} color={PALETTE.primary} lineWidth={2.5} />
            {DEFAULT_HULL_POINTS.map((p, i) => (
              <PointObject
                key={i}
                position={p}
                label={POINT_LABELS[i]}
                color={PALETTE.primary}
                radius={0.11}
              />
            ))}
          </>
        )}

        {topic === "voronoi" && (
          <>
            {voronoiCellPolygons.map((cell, i) => (
              <FilledPolygon
                key={i}
                points={cell}
                color={CELL_COLORS[i % CELL_COLORS.length]}
                opacity={0.22}
              />
            ))}
            {voronoiCellPolygons.map((cell, i) => (
              <Line
                key={i}
                points={[...cell, cell[0]]}
                color={CELL_COLORS[i % CELL_COLORS.length]}
                lineWidth={2}
              />
            ))}
            {DEFAULT_VORONOI_SITES.map((p, i) => (
              <PointObject
                key={i}
                position={p}
                label={`S${i}`}
                color={CELL_COLORS[i % CELL_COLORS.length]}
                radius={0.12}
              />
            ))}
          </>
        )}

        {topic === "delaunay" && (
          <>
            {delaunayEdges.map(([a, b], i) => (
              <Line key={i} points={[a, b]} color={PALETTE.primary} lineWidth={1.75} />
            ))}
            {DEFAULT_DELAUNAY_POINTS.map((p, i) => (
              <PointObject
                key={i}
                position={p}
                label={POINT_LABELS[i]}
                color={PALETTE.primary}
                radius={0.11}
              />
            ))}
          </>
        )}

        {topic === "bounding-box" && (
          <>
            <FilledPolygon points={[...box]} color={PALETTE.secondary} opacity={0.15} />
            <Line
              points={[...box, box[0]]}
              color={PALETTE.secondary}
              lineWidth={2.5}
              dashed
              dashScale={4}
            />
            {DEFAULT_BBOX_POINTS.map((p, i) => (
              <PointObject
                key={i}
                position={p}
                label={POINT_LABELS[i]}
                color={PALETTE.primary}
                radius={0.11}
              />
            ))}
          </>
        )}

        {topic === "ray-casting" && (
          <>
            <FilledPolygon points={rayPolygon} color={PALETTE.accent} opacity={0.2} />
            <Line
              points={[...rayPolygon, rayPolygon[0]]}
              color={PALETTE.accent}
              lineWidth={2.25}
            />
            <Line
              points={[DEFAULT_RAY_ORIGIN, rayEndpoint]}
              color={rayHit ? PALETTE.success : PALETTE.error}
              lineWidth={2.5}
            />
            <PointObject
              position={DEFAULT_RAY_ORIGIN}
              label="origin"
              color={PALETTE.warning}
              radius={0.13}
            />
          </>
        )}

        {topic === "collision" && (
          <>
            <ShapeOutline
              shape={{ kind: "circle", center: DEFAULT_SHAPE_A_CENTER, radius: 1 }}
              color={PALETTE.primary}
            />
            <ShapeOutline
              shape={{ kind: "box", center: DEFAULT_SHAPE_B_CENTER, radius: 1 }}
              color={PALETTE.secondary}
            />
          </>
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="pointer-events-auto">
          <GuidedControls
            moduleTitle="Computational Geometry"
            step={seq.step}
            index={seq.index}
            totalSteps={seq.steps.length}
            isFirst={seq.isFirst}
            isLast={seq.isLast}
            isPlaying={seq.isPlaying}
            onPlay={seq.play}
            onPause={seq.pause}
            onNext={seq.next}
            onPrev={seq.prev}
            onGoTo={seq.goTo}
          />
        </div>
      </div>
    </div>
  );
}
