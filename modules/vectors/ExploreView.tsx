"use client";

import { useCallback, useState } from "react";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import ParallelogramMesh from "@/three/objects/ParallelogramMesh";
import ControlPanel from "@/components/panels/ControlPanel";
import StatReadout from "@/components/panels/StatReadout";
import Equation from "@/components/ui/Equation";
import { PALETTE } from "@/constants/theme";
import { cn } from "@/utils/cn";
import type { Vec3Tuple } from "@/types/math";
import {
  add,
  subtract,
  scale,
  magnitude,
  dot,
  cross,
  angleBetween,
  vectorProjection,
} from "@/math/vector";
import { formatNumber, vectorToLatex } from "@/math/format";
import { VECTOR_OPS, type VectorOp } from "@/modules/vectors/types";
import { Line } from "@react-three/drei";

const START_A: Vec3Tuple = [2.5, 1, 0.5];
const START_B: Vec3Tuple = [0.5, 1.5, 2];

export default function ExploreView() {
  const [a, setA] = useState<Vec3Tuple>(START_A);
  const [b, setB] = useState<Vec3Tuple>(START_B);
  const [op, setOp] = useState<VectorOp>("add");
  const [k, setK] = useState(1.5);

  const handleDragA = useCallback((next: Vec3Tuple) => setA(next), []);
  const handleDragB = useCallback((next: Vec3Tuple) => setB(next), []);

  const sum = add(a, b);
  const diff = subtract(a, b);
  const scaled = scale(a, k);
  const dotProduct = dot(a, b);
  const angleDeg = (angleBetween(a, b) * 180) / Math.PI;
  const projection = vectorProjection(a, b);
  const crossVec = cross(a, b);
  const crossMag = magnitude(crossVec);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <PointObject
          position={a}
          label="A"
          color={PALETTE.primary}
          radius={0.13}
          draggable
          onDrag={handleDragA}
        />
        <PointObject
          position={b}
          label="B"
          color={PALETTE.secondary}
          radius={0.13}
          draggable
          onDrag={handleDragB}
        />
        <VectorArrow origin={[0, 0, 0]} direction={a} color={PALETTE.primary} />
        <VectorArrow origin={[0, 0, 0]} direction={b} color={PALETTE.secondary} />

        {op === "add" && (
          <>
            <Line
              points={[a, sum]}
              color={PALETTE.border}
              dashed
              dashScale={4}
              lineWidth={1.25}
            />
            <Line
              points={[b, sum]}
              color={PALETTE.border}
              dashed
              dashScale={4}
              lineWidth={1.25}
            />
            <VectorArrow
              origin={[0, 0, 0]}
              direction={sum}
              color={PALETTE.accent}
              label="A+B"
              animateKey={`add-${sum.join(",")}`}
            />
          </>
        )}

        {op === "subtract" && (
          <>
            <Line
              points={[b, a]}
              color={PALETTE.border}
              dashed
              dashScale={4}
              lineWidth={1.25}
            />
            <VectorArrow
              origin={[0, 0, 0]}
              direction={diff}
              color={PALETTE.accent}
              label="A-B"
              animateKey={`sub-${diff.join(",")}`}
            />
          </>
        )}

        {op === "scale" && (
          <VectorArrow
            origin={[0, 0, 0]}
            direction={scaled}
            color={PALETTE.accent}
            label="kA"
            animateKey={`scale-${k}-${a.join(",")}`}
          />
        )}

        {op === "dot" && (
          <Line
            points={[a, b]}
            color={PALETTE.accent}
            dashed
            dashScale={4}
            lineWidth={1.5}
          />
        )}

        {op === "project" && (
          <>
            <VectorArrow
              origin={[0, 0, 0]}
              direction={projection}
              color={PALETTE.accent}
              label="proj"
              animateKey={`proj-${projection.join(",")}`}
            />
            <Line
              points={[a, projection]}
              color={PALETTE.border}
              dashed
              dashScale={4}
              lineWidth={1.25}
            />
          </>
        )}

        {op === "cross" && (
          <>
            <ParallelogramMesh a={a} b={b} color={PALETTE.accent} />
            <VectorArrow
              origin={[0, 0, 0]}
              direction={crossVec}
              color={PALETTE.accent}
              label="A×B"
              animateKey={`cross-${crossVec.join(",")}`}
            />
          </>
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Vectors A and B">
            <div className="flex flex-wrap gap-1.5">
              {VECTOR_OPS.map((o) => (
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
              <StatReadout label="|A|" value={magnitude(a)} />
              <StatReadout label="|B|" value={magnitude(b)} />
            </div>

            {op === "add" && <Equation latex={`A+B = ${vectorToLatex(sum)}`} block />}
            {op === "subtract" && (
              <Equation latex={`A-B = ${vectorToLatex(diff)}`} block />
            )}
            {op === "scale" && (
              <>
                <input
                  type="range"
                  min={-3}
                  max={3}
                  step={0.1}
                  value={k}
                  onChange={(e) => setK(Number(e.target.value))}
                  className="accent-primary w-full"
                />
                <Equation
                  latex={`k = ${formatNumber(k)},\\ \\ kA = ${vectorToLatex(scaled)}`}
                  block
                />
              </>
            )}
            {op === "dot" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <StatReadout label="A · B" value={dotProduct} />
                  <StatReadout label="Angle" value={angleDeg} unit="°" />
                </div>
                <Equation
                  latex={`A \\cdot B = |A||B|\\cos\\theta = ${formatNumber(dotProduct)}`}
                  block
                />
              </>
            )}
            {op === "project" && (
              <Equation
                latex={`\\text{proj}_B A = \\dfrac{A\\cdot B}{B\\cdot B}B = ${vectorToLatex(projection)}`}
                block
              />
            )}
            {op === "cross" && (
              <>
                <StatReadout label="|A×B| (parallelogram area)" value={crossMag} />
                <Equation latex={`A \\times B = ${vectorToLatex(crossVec)}`} block />
              </>
            )}

            <p className="text-muted text-xs leading-relaxed">
              Drag the tips of A and B. Left-drag empty space to orbit and adjust depth.
            </p>
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
