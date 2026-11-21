"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import PointObject from "@/three/objects/PointObject";
import FilledPolygon from "@/three/objects/FilledPolygon";
import ShapeOutline from "@/modules/computational-geometry/ShapeOutline";
import { PALETTE } from "@/constants/theme";
import type { Vec3Tuple } from "@/types/math";
import type { QuizRender, QuizScenario } from "@/modules/computational-geometry/quiz";

const CELL_COLORS = [
  PALETTE.primary,
  PALETTE.secondary,
  PALETTE.accent,
  PALETTE.warning,
  PALETTE.success,
];

interface QuizSceneProps {
  scenario: QuizScenario;
  revealed: boolean;
}

export default function QuizScene({ scenario, revealed }: QuizSceneProps) {
  const highlight = !revealed
    ? PALETTE.warning
    : scenario.answer
      ? PALETTE.success
      : PALETTE.error;
  const render: QuizRender = scenario.render;

  const rayEnd: Vec3Tuple = useMemo(() => {
    if (render.topic !== "ray-casting") return [0, 0, 0];
    return [
      render.origin[0] + render.dir[0] * 14,
      0,
      render.origin[2] + render.dir[2] * 14,
    ];
  }, [render]);

  if (render.topic === "convex-hull") {
    return (
      <>
        <FilledPolygon points={render.hull} color={PALETTE.primary} opacity={0.15} />
        <Line
          points={[...render.hull, render.hull[0]]}
          color={PALETTE.primary}
          lineWidth={2.25}
        />
        {render.points.map((p, i) => (
          <PointObject
            key={i}
            position={p}
            label={i === render.markedIndex ? "?" : undefined}
            color={i === render.markedIndex ? highlight : PALETTE.border}
            radius={i === render.markedIndex ? 0.16 : 0.09}
          />
        ))}
      </>
    );
  }

  if (render.topic === "voronoi") {
    return (
      <>
        {render.cells.map((cell, i) => (
          <FilledPolygon
            key={i}
            points={cell}
            color={
              i === render.candidateSiteIndex
                ? highlight
                : CELL_COLORS[i % CELL_COLORS.length]
            }
            opacity={i === render.candidateSiteIndex ? 0.35 : 0.15}
          />
        ))}
        {render.cells.map((cell, i) => (
          <Line
            key={i}
            points={[...cell, cell[0]]}
            color={
              i === render.candidateSiteIndex
                ? highlight
                : CELL_COLORS[i % CELL_COLORS.length]
            }
            lineWidth={i === render.candidateSiteIndex ? 2.5 : 1.5}
          />
        ))}
        {render.sites.map((p, i) => (
          <PointObject
            key={i}
            label={`S${i}`}
            position={p}
            color={CELL_COLORS[i % CELL_COLORS.length]}
            radius={0.1}
          />
        ))}
        <PointObject
          position={render.query}
          label="?"
          color={PALETTE.foreground}
          radius={0.13}
        />
      </>
    );
  }

  if (render.topic === "delaunay") {
    return (
      <>
        {render.edges.map(([a, b], i) => (
          <Line
            key={i}
            points={[a, b]}
            color={PALETTE.border}
            lineWidth={1.5}
            transparent
            opacity={0.6}
          />
        ))}
        <Line
          points={render.candidateEdge}
          color={highlight}
          lineWidth={3}
          dashed
          dashScale={3}
        />
        {render.points.map((p, i) => (
          <PointObject key={i} position={p} color={PALETTE.primary} radius={0.1} />
        ))}
      </>
    );
  }

  if (render.topic === "bounding-box") {
    return (
      <>
        <FilledPolygon points={render.box} color={highlight} opacity={0.18} />
        <Line
          points={[...render.box, render.box[0]]}
          color={highlight}
          lineWidth={2.5}
          dashed
          dashScale={4}
        />
        {render.points.map((p, i) => (
          <PointObject key={i} position={p} color={PALETTE.primary} radius={0.1} />
        ))}
      </>
    );
  }

  if (render.topic === "ray-casting") {
    return (
      <>
        <FilledPolygon points={render.polygon} color={PALETTE.accent} opacity={0.18} />
        <Line
          points={[...render.polygon, render.polygon[0]]}
          color={PALETTE.accent}
          lineWidth={2.25}
        />
        <Line points={[render.origin, rayEnd]} color={highlight} lineWidth={2.5} />
        <PointObject
          position={render.origin}
          label="origin"
          color={PALETTE.warning}
          radius={0.12}
        />
      </>
    );
  }

  return (
    <>
      <ShapeOutline shape={render.shapeA} color={highlight} />
      <ShapeOutline shape={render.shapeB} color={highlight} />
    </>
  );
}
