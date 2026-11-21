"use client";

import { useMemo, useState } from "react";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import LineObject from "@/three/objects/LineObject";
import TransformedGrid from "@/three/objects/TransformedGrid";
import FilledPolygon from "@/three/objects/FilledPolygon";
import ControlPanel from "@/components/panels/ControlPanel";
import StatReadout from "@/components/panels/StatReadout";
import Badge from "@/components/ui/Badge";
import { cn } from "@/utils/cn";
import { PALETTE } from "@/constants/theme";
import {
  apply2,
  eigenvectorDeviationDeg,
  isParallel,
  nullSpace2x2,
  columnSpace2x2,
  rank2x2,
  realEigen2x2,
  toMat2,
  type Vec2,
} from "@/math/linearAlgebra2x2";
import {
  embedMat2InXZPlane,
  toVec3,
  TOPICS,
  type LinAlgTopic,
} from "@/modules/linear-algebra-playground/types";

export default function ExploreView() {
  const [topic, setTopic] = useState<LinAlgTopic>("eigen");
  const [i, setI] = useState<Vec2>([1.6, 0.4]);
  const [j, setJ] = useState<Vec2>([0.3, 1.3]);
  const [probe, setProbe] = useState<Vec2>([1, 1.5]);
  const [testPoint, setTestPoint] = useState<Vec2>([2, 1]);

  const matrix = useMemo(() => toMat2(i, j), [i, j]);
  const embedded = useMemo(() => embedMat2InXZPlane(matrix), [matrix]);
  const rank = useMemo(() => rank2x2(matrix), [matrix]);
  const eigen = useMemo(() => realEigen2x2(matrix), [matrix]);
  const nullSpace = useMemo(() => nullSpace2x2(matrix), [matrix]);
  const columnSpace = useMemo(() => columnSpace2x2(matrix), [matrix]);

  const probeImage = useMemo(() => apply2(matrix, probe), [matrix, probe]);
  const probeDeviation = useMemo(
    () => eigenvectorDeviationDeg(matrix, probe),
    [matrix, probe],
  );

  const testPointReachable = useMemo(() => {
    if (rank === 2) return true;
    if (rank === 0) return Math.hypot(testPoint[0], testPoint[1]) < 0.2;
    return columnSpace.direction
      ? isParallel(testPoint, columnSpace.direction, 0.06)
      : false;
  }, [rank, testPoint, columnSpace]);

  const activeTopic = TOPICS.find((t) => t.id === topic)!;

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <TransformedGrid matrix={embedded} color={PALETTE.border} />
        <FilledPolygon
          points={[[0, 0, 0], toVec3(i), toVec3([i[0] + j[0], i[1] + j[1]]), toVec3(j)]}
          color={PALETTE.primary}
          opacity={0.14}
        />
        <VectorArrow origin={[0, 0, 0]} direction={toVec3(i)} color={PALETTE.primary} />
        <VectorArrow origin={[0, 0, 0]} direction={toVec3(j)} color={PALETTE.secondary} />
        <PointObject
          position={toVec3(i)}
          label="î"
          color={PALETTE.primary}
          radius={0.12}
          draggable
          dragOnGroundPlane
          onDrag={(next) => setI([next[0], next[2]])}
        />
        <PointObject
          position={toVec3(j)}
          label="ĵ"
          color={PALETTE.secondary}
          radius={0.12}
          draggable
          dragOnGroundPlane
          onDrag={(next) => setJ([next[0], next[2]])}
        />

        {topic === "eigen" && eigen && (
          <>
            <LineObject
              point={[0, 0, 0]}
              direction={toVec3(eigen.vectors[0])}
              color={PALETTE.warning}
              dashed
            />
            <LineObject
              point={[0, 0, 0]}
              direction={toVec3(eigen.vectors[1])}
              color={PALETTE.success}
              dashed
            />
            <VectorArrow
              origin={[0, 0, 0]}
              direction={toVec3(probeImage)}
              color={PALETTE.accent}
            />
            <PointObject
              position={toVec3(probe)}
              label="v"
              color={PALETTE.foreground}
              radius={0.11}
              draggable
              dragOnGroundPlane
              onDrag={(next) => setProbe([next[0], next[2]])}
            />
          </>
        )}

        {topic === "span" && (
          <PointObject
            position={toVec3(testPoint)}
            label="T"
            color={testPointReachable ? PALETTE.success : PALETTE.error}
            radius={0.12}
            draggable
            dragOnGroundPlane
            onDrag={(next) => setTestPoint([next[0], next[2]])}
          />
        )}

        {topic === "null-space" && (
          <>
            {nullSpace.kind === "line" && nullSpace.direction && (
              <LineObject
                point={[0, 0, 0]}
                direction={toVec3(nullSpace.direction)}
                color={PALETTE.error}
                dashed
              />
            )}
            <VectorArrow
              origin={[0, 0, 0]}
              direction={toVec3(probeImage)}
              color={PALETTE.accent}
            />
            <PointObject
              position={toVec3(probe)}
              label="n"
              color={PALETTE.foreground}
              radius={0.11}
              draggable
              dragOnGroundPlane
              onDrag={(next) => setProbe([next[0], next[2]])}
            />
          </>
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Linear Algebra Playground">
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

            {topic === "eigen" &&
              (eigen ? (
                <>
                  <StatReadout label="λ₁" value={eigen.values[0]} />
                  <StatReadout label="λ₂" value={eigen.values[1]} />
                  <Badge tone={probeDeviation < 6 ? "success" : "neutral"}>
                    {probeDeviation < 6
                      ? "v is (approximately) an eigenvector"
                      : `Direction changes by ${probeDeviation.toFixed(1)}°`}
                  </Badge>
                </>
              ) : (
                <Badge tone="warning">
                  Complex eigenvalues — this matrix rotates, so no real eigenvector
                  exists.
                </Badge>
              ))}

            {topic === "span" && (
              <>
                <Badge tone="primary">
                  {columnSpace.kind === "plane"
                    ? "Column space: the whole plane"
                    : columnSpace.kind === "line"
                      ? "Column space: a single line"
                      : "Column space: just the origin"}
                </Badge>
                <Badge tone={testPointReachable ? "success" : "error"}>
                  T is {testPointReachable ? "" : "not "}reachable as a combination of î
                  and ĵ
                </Badge>
              </>
            )}

            {topic === "rank" && (
              <>
                <StatReadout label="Rank" value={rank} />
                <StatReadout
                  label="Determinant"
                  value={matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]}
                />
                <Badge tone={rank === 2 ? "success" : rank === 1 ? "warning" : "error"}>
                  {rank === 2
                    ? "Full rank — the plane stays 2D"
                    : rank === 1
                      ? "Rank 1 — collapsed onto a line"
                      : "Rank 0 — collapsed onto the origin"}
                </Badge>
              </>
            )}

            {topic === "null-space" && (
              <Badge tone={nullSpace.kind === "trivial" ? "success" : "warning"}>
                {nullSpace.kind === "trivial"
                  ? "Null space is trivial — only the origin maps to itself"
                  : nullSpace.kind === "line"
                    ? "Null space is a line — everything on it maps to the origin"
                    : "Null space is the whole plane — every point maps to the origin"}
              </Badge>
            )}

            <p className="text-muted text-xs leading-relaxed">
              Drag î or ĵ to change the matrix. Left-drag empty space to orbit.
            </p>
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
