"use client";

import { useCallback, useMemo, useState } from "react";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import TransformShape from "@/three/objects/TransformShape";
import ControlPanel from "@/components/panels/ControlPanel";
import Equation from "@/components/ui/Equation";
import { PALETTE } from "@/constants/theme";
import { cn } from "@/utils/cn";
import type { Vec3Tuple } from "@/types/math";
import {
  reflectionMatrix,
  rotationMatrix,
  scaleMatrix,
  shearMatrix,
  translationMatrix,
  type Axis,
  type ShearPair,
} from "@/math/transform";
import { matrixToLatex } from "@/math/format";
import { TRANSFORM_OPS, type TransformOp } from "@/modules/transformations/types";

const AXES: Axis[] = ["x", "y", "z"];
const SHEAR_PAIRS: { id: ShearPair; label: string }[] = [
  { id: "xy", label: "X by Y" },
  { id: "xz", label: "X by Z" },
  { id: "yz", label: "Y by Z" },
];

function PillGroup<T extends string>({
  options,
  active,
  onChange,
}: {
  options: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            active === o.id
              ? "bg-primary text-primary-foreground"
              : "bg-surface-hover text-muted hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function ExploreView() {
  const [op, setOp] = useState<TransformOp>("translate");

  const [translateVec, setTranslateVec] = useState<Vec3Tuple>([1.5, 0.8, 1]);
  const [scaleVec, setScaleVec] = useState<Vec3Tuple>([1.4, 0.7, 1]);
  const [rotateAxis, setRotateAxis] = useState<Axis>("y");
  const [rotateAngle, setRotateAngle] = useState(60);
  const [reflectAxis, setReflectAxis] = useState<Axis>("x");
  const [shearPair, setShearPair] = useState<ShearPair>("xy");
  const [shearAmount, setShearAmount] = useState(0.8);

  const handleTranslateDrag = useCallback((next: Vec3Tuple) => setTranslateVec(next), []);

  const matrix = useMemo(() => {
    switch (op) {
      case "translate":
        return translationMatrix(translateVec);
      case "scale":
        return scaleMatrix(scaleVec);
      case "rotate":
        return rotationMatrix(rotateAxis, (rotateAngle * Math.PI) / 180);
      case "reflect":
        return reflectionMatrix(reflectAxis);
      case "shear":
        return shearMatrix(shearPair, shearAmount);
    }
  }, [
    op,
    translateVec,
    scaleVec,
    rotateAxis,
    rotateAngle,
    reflectAxis,
    shearPair,
    shearAmount,
  ]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <TransformShape ghost />
        <TransformShape matrix={matrix} />

        {op === "translate" && (
          <>
            <VectorArrow
              origin={[0, 0, 0]}
              direction={translateVec}
              color={PALETTE.accent}
            />
            <PointObject
              position={translateVec}
              label="t"
              color={PALETTE.accent}
              radius={0.12}
              draggable
              onDrag={handleTranslateDrag}
            />
          </>
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Transform the shape">
            <PillGroup options={TRANSFORM_OPS} active={op} onChange={setOp} />

            <Equation latex={matrixToLatex(matrix)} block />

            {op === "translate" && (
              <p className="text-muted text-xs leading-relaxed">
                Drag the amber handle — it is the translation vector t. Every vertex
                shifts by the same amount.
              </p>
            )}

            {op === "scale" && (
              <div className="flex flex-col gap-2">
                {(["X", "Y", "Z"] as const).map((label, i) => (
                  <label
                    key={label}
                    className="text-muted flex items-center gap-2 text-xs"
                  >
                    <span className="w-4">{label}</span>
                    <input
                      type="range"
                      min={-2}
                      max={2}
                      step={0.1}
                      value={scaleVec[i]}
                      onChange={(e) => {
                        const next: Vec3Tuple = [...scaleVec];
                        next[i] = Number(e.target.value);
                        setScaleVec(next);
                      }}
                      className="accent-primary w-full"
                    />
                  </label>
                ))}
              </div>
            )}

            {op === "rotate" && (
              <>
                <PillGroup
                  options={AXES.map((a) => ({ id: a, label: a.toUpperCase() }))}
                  active={rotateAxis}
                  onChange={setRotateAxis}
                />
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={5}
                  value={rotateAngle}
                  onChange={(e) => setRotateAngle(Number(e.target.value))}
                  className="accent-primary w-full"
                />
                <p className="text-muted text-xs">
                  {rotateAngle}° about the {rotateAxis.toUpperCase()} axis
                </p>
              </>
            )}

            {op === "reflect" && (
              <>
                <PillGroup
                  options={AXES.map((a) => ({ id: a, label: `Flip ${a.toUpperCase()}` }))}
                  active={reflectAxis}
                  onChange={setReflectAxis}
                />
                <p className="text-muted text-xs leading-relaxed">
                  Mirrors the shape across the plane perpendicular to the chosen axis.
                </p>
              </>
            )}

            {op === "shear" && (
              <>
                <PillGroup
                  options={SHEAR_PAIRS}
                  active={shearPair}
                  onChange={setShearPair}
                />
                <input
                  type="range"
                  min={-2}
                  max={2}
                  step={0.1}
                  value={shearAmount}
                  onChange={(e) => setShearAmount(Number(e.target.value))}
                  className="accent-primary w-full"
                />
              </>
            )}

            <p className="text-muted text-xs leading-relaxed">
              The dim outline is the original shape. Left-drag empty space to orbit.
            </p>
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
