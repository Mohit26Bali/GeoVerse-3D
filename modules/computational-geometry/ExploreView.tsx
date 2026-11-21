"use client";

import { useCallback, useMemo, useState } from "react";
import { Line } from "@react-three/drei";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import FilledPolygon from "@/three/objects/FilledPolygon";
import ControlPanel from "@/components/panels/ControlPanel";
import Badge from "@/components/ui/Badge";
import { PALETTE } from "@/constants/theme";
import { cn } from "@/utils/cn";
import type { Vec3Tuple } from "@/types/math";
import {
  convexHull2D,
  delaunayTriangulation,
  fromXZAll,
  rayIntersectsPolygon,
  toXZ,
  toXZAll,
  triangleEdges,
  voronoiCells,
  circlesOverlap,
  circleAabbOverlap,
  aabbsOverlap,
} from "@/math/computationalGeometry";
import {
  DEFAULT_BBOX_POINTS,
  DEFAULT_DELAUNAY_POINTS,
  DEFAULT_HULL_POINTS,
  DEFAULT_RAY_POLYGON_POINTS,
  DEFAULT_VORONOI_SITES,
  POINT_LABELS,
  TOPICS,
  type GeometryTopic,
} from "@/modules/computational-geometry/types";
import ShapeOutline from "@/modules/computational-geometry/ShapeOutline";
import type { Shape } from "@/modules/computational-geometry/quiz";

const CELL_COLORS = [
  PALETTE.primary,
  PALETTE.secondary,
  PALETTE.accent,
  PALETTE.warning,
  PALETTE.success,
];

function useDraggablePoints(initial: () => Vec3Tuple[]) {
  const [points, setPoints] = useState<Vec3Tuple[]>(initial);
  const handleDrag = useCallback((index: number, next: Vec3Tuple) => {
    setPoints((prev) => {
      const updated = [...prev];
      updated[index] = next;
      return updated;
    });
  }, []);
  return [points, handleDrag] as const;
}

export default function ExploreView() {
  const [topic, setTopic] = useState<GeometryTopic>("convex-hull");

  const [hullPoints, dragHullPoint] = useDraggablePoints(() => DEFAULT_HULL_POINTS);
  const [voronoiSites, dragVoronoiSite] = useDraggablePoints(() => DEFAULT_VORONOI_SITES);
  const [delaunayPoints, dragDelaunayPoint] = useDraggablePoints(
    () => DEFAULT_DELAUNAY_POINTS,
  );
  const [bboxPoints, dragBboxPoint] = useDraggablePoints(() => DEFAULT_BBOX_POINTS);
  const [rayOrigin, setRayOrigin] = useState<Vec3Tuple>([-5, 0, -2]);
  const [rayAim, setRayAim] = useState<Vec3Tuple>([0, 0, 0]);
  const [shapePoints, dragShapePoint] = useDraggablePoints(
    () => DEFAULT_RAY_POLYGON_POINTS,
  );
  const [shapeACenter, setShapeACenter] = useState<Vec3Tuple>([-2, 0, 0]);
  const [shapeBCenter, setShapeBCenter] = useState<Vec3Tuple>([1.5, 0, 0]);
  const [shapeAKind, setShapeAKind] = useState<"circle" | "box">("circle");
  const [shapeBKind, setShapeBKind] = useState<"circle" | "box">("box");

  const hull = useMemo(() => fromXZAll(convexHull2D(toXZAll(hullPoints))), [hullPoints]);

  const voronoiCellPolygons = useMemo(
    () => voronoiCells(toXZAll(voronoiSites), 6).map(fromXZAll),
    [voronoiSites],
  );

  const triangles = useMemo(
    () => delaunayTriangulation(toXZAll(delaunayPoints)),
    [delaunayPoints],
  );
  const delaunayEdges = useMemo(
    () =>
      triangles.flatMap((t) =>
        triangleEdges(t).map(
          ([a, b]) => [fromXZAll([a])[0], fromXZAll([b])[0]] as [Vec3Tuple, Vec3Tuple],
        ),
      ),
    [triangles],
  );

  const box = useMemo(() => {
    const xs = bboxPoints.map((p) => p[0]);
    const zs = bboxPoints.map((p) => p[2]);
    const min = [Math.min(...xs), Math.min(...zs)];
    const max = [Math.max(...xs), Math.max(...zs)];
    return [
      [min[0], 0, min[1]],
      [max[0], 0, min[1]],
      [max[0], 0, max[1]],
      [min[0], 0, max[1]],
    ] as Vec3Tuple[];
  }, [bboxPoints]);

  const rayPolygon = useMemo(
    () => fromXZAll(convexHull2D(toXZAll(shapePoints))),
    [shapePoints],
  );
  const rayDir = useMemo(() => {
    const dx = rayAim[0] - rayOrigin[0];
    const dz = rayAim[2] - rayOrigin[2];
    const len = Math.hypot(dx, dz) || 1;
    return [dx / len, 0, dz / len] as Vec3Tuple;
  }, [rayOrigin, rayAim]);
  const rayHit = useMemo(
    () => rayIntersectsPolygon(toXZ(rayOrigin), toXZ(rayDir), toXZAll(rayPolygon)),
    [rayOrigin, rayDir, rayPolygon],
  );
  const rayEndpoint: Vec3Tuple = rayHit
    ? [rayHit[0], 0, rayHit[1]]
    : [rayOrigin[0] + rayDir[0] * 14, 0, rayOrigin[2] + rayDir[2] * 14];

  const shapeA: Shape = { kind: shapeAKind, center: shapeACenter, radius: 1 };
  const shapeB: Shape = { kind: shapeBKind, center: shapeBCenter, radius: 1 };
  const colliding = useMemo(() => {
    const centerA = toXZ(shapeACenter);
    const centerB = toXZ(shapeBCenter);
    if (shapeAKind === "circle" && shapeBKind === "circle")
      return circlesOverlap(centerA, 1, centerB, 1);
    if (shapeAKind === "box" && shapeBKind === "box")
      return aabbsOverlap(
        { min: [centerA[0] - 1, centerA[1] - 1], max: [centerA[0] + 1, centerA[1] + 1] },
        { min: [centerB[0] - 1, centerB[1] - 1], max: [centerB[0] + 1, centerB[1] + 1] },
      );
    const circleCenter = shapeAKind === "circle" ? centerA : centerB;
    const boxCenter = shapeAKind === "box" ? centerA : centerB;
    return circleAabbOverlap(circleCenter, 1, {
      min: [boxCenter[0] - 1, boxCenter[1] - 1],
      max: [boxCenter[0] + 1, boxCenter[1] + 1],
    });
  }, [shapeACenter, shapeBCenter, shapeAKind, shapeBKind]);

  const activeTopic = TOPICS.find((t) => t.id === topic)!;

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        {topic === "convex-hull" && (
          <>
            <FilledPolygon points={hull} color={PALETTE.primary} opacity={0.18} />
            <Line points={[...hull, hull[0]]} color={PALETTE.primary} lineWidth={2.5} />
            {hullPoints.map((p, i) => (
              <PointObject
                key={i}
                position={p}
                label={POINT_LABELS[i]}
                color={PALETTE.primary}
                radius={0.11}
                draggable
                dragOnGroundPlane
                onDrag={(next) => dragHullPoint(i, next)}
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
            {voronoiSites.map((p, i) => (
              <PointObject
                key={i}
                position={p}
                label={`S${i}`}
                color={CELL_COLORS[i % CELL_COLORS.length]}
                radius={0.12}
                draggable
                dragOnGroundPlane
                onDrag={(next) => dragVoronoiSite(i, next)}
              />
            ))}
          </>
        )}

        {topic === "delaunay" && (
          <>
            {delaunayEdges.map(([a, b], i) => (
              <Line key={i} points={[a, b]} color={PALETTE.primary} lineWidth={1.75} />
            ))}
            {delaunayPoints.map((p, i) => (
              <PointObject
                key={i}
                position={p}
                label={POINT_LABELS[i]}
                color={PALETTE.primary}
                radius={0.11}
                draggable
                dragOnGroundPlane
                onDrag={(next) => dragDelaunayPoint(i, next)}
              />
            ))}
          </>
        )}

        {topic === "bounding-box" && (
          <>
            <FilledPolygon points={box} color={PALETTE.secondary} opacity={0.15} />
            <Line
              points={[...box, box[0]]}
              color={PALETTE.secondary}
              lineWidth={2.5}
              dashed
              dashScale={4}
            />
            {bboxPoints.map((p, i) => (
              <PointObject
                key={i}
                position={p}
                label={POINT_LABELS[i]}
                color={PALETTE.primary}
                radius={0.11}
                draggable
                dragOnGroundPlane
                onDrag={(next) => dragBboxPoint(i, next)}
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
              points={[rayOrigin, rayEndpoint]}
              color={rayHit ? PALETTE.success : PALETTE.error}
              lineWidth={2.5}
            />
            {shapePoints.map((p, i) => (
              <PointObject
                key={i}
                position={p}
                label={POINT_LABELS[i]}
                color={PALETTE.accent}
                radius={0.1}
                draggable
                dragOnGroundPlane
                onDrag={(next) => dragShapePoint(i, next)}
              />
            ))}
            <PointObject
              position={rayOrigin}
              label="origin"
              color={PALETTE.warning}
              radius={0.13}
              draggable
              dragOnGroundPlane
              onDrag={setRayOrigin}
            />
            <PointObject
              position={rayAim}
              label="aim"
              color={PALETTE.warning}
              radius={0.11}
              draggable
              dragOnGroundPlane
              onDrag={setRayAim}
            />
          </>
        )}

        {topic === "collision" && (
          <>
            <ShapeOutline
              shape={shapeA}
              color={colliding ? PALETTE.error : PALETTE.primary}
            />
            <ShapeOutline
              shape={shapeB}
              color={colliding ? PALETTE.error : PALETTE.secondary}
            />
            <PointObject
              position={shapeACenter}
              label="A"
              color={PALETTE.primary}
              radius={0.12}
              draggable
              dragOnGroundPlane
              onDrag={setShapeACenter}
            />
            <PointObject
              position={shapeBCenter}
              label="B"
              color={PALETTE.secondary}
              radius={0.12}
              draggable
              dragOnGroundPlane
              onDrag={setShapeBCenter}
            />
          </>
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Computational Geometry">
            <div className="flex flex-wrap gap-1.5">
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTopic(t.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    topic === t.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-hover text-muted hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <p className="text-muted text-xs leading-relaxed">
              {activeTopic.description}
            </p>

            {topic === "convex-hull" && (
              <Badge tone="primary">
                {hull.length} hull vertices of {hullPoints.length} points
              </Badge>
            )}
            {topic === "voronoi" && (
              <Badge tone="primary">{voronoiSites.length} sites / cells</Badge>
            )}
            {topic === "delaunay" && (
              <Badge tone="primary">{triangles.length} triangles</Badge>
            )}
            {topic === "bounding-box" && (
              <Badge tone="primary">
                {(box[1][0] - box[0][0]).toFixed(2)} ×{" "}
                {(box[2][2] - box[1][2]).toFixed(2)}
              </Badge>
            )}
            {topic === "ray-casting" && (
              <Badge tone={rayHit ? "success" : "error"}>{rayHit ? "Hit" : "Miss"}</Badge>
            )}
            {topic === "collision" && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  {(["circle", "box"] as const).map((k) => (
                    <button
                      key={k}
                      onClick={() => setShapeAKind(k)}
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        shapeAKind === k
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface-hover text-muted",
                      )}
                    >
                      A:{k}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  {(["circle", "box"] as const).map((k) => (
                    <button
                      key={k}
                      onClick={() => setShapeBKind(k)}
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        shapeBKind === k
                          ? "bg-secondary text-primary-foreground"
                          : "bg-surface-hover text-muted",
                      )}
                    >
                      B:{k}
                    </button>
                  ))}
                </div>
                <Badge tone={colliding ? "error" : "success"}>
                  {colliding ? "Colliding" : "Clear"}
                </Badge>
              </div>
            )}

            <p className="text-muted text-xs leading-relaxed">
              Drag any labeled point. Left-drag empty space to orbit.
            </p>
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
