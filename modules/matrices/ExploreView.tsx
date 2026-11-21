"use client";

import { useCallback, useMemo, useState } from "react";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import ParallelepipedMesh from "@/three/objects/ParallelepipedMesh";
import TransformedGrid from "@/three/objects/TransformedGrid";
import ControlPanel from "@/components/panels/ControlPanel";
import StatReadout from "@/components/panels/StatReadout";
import Equation from "@/components/ui/Equation";
import Badge from "@/components/ui/Badge";
import { AXIS_COLORS, PALETTE } from "@/constants/theme";
import { determinant, inverse } from "@/math/matrix";
import { matrixFromColumns } from "@/math/transform";
import { matrixToLatex } from "@/math/format";
import { BASIS_PRESETS } from "@/modules/matrices/types";
import type { Vec3Tuple } from "@/types/math";

export default function ExploreView() {
  const [i, setI] = useState<Vec3Tuple>([1, 0, 0]);
  const [j, setJ] = useState<Vec3Tuple>([0, 1, 0]);
  const [k, setK] = useState<Vec3Tuple>([0, 0, 1]);

  const matrix = useMemo(() => matrixFromColumns(i, j, k), [i, j, k]);
  const det = useMemo(() => determinant(matrix), [matrix]);
  const inv = useMemo(() => inverse(matrix), [matrix]);

  const applyPreset = useCallback((preset: (typeof BASIS_PRESETS)[number]) => {
    setI(preset.i);
    setJ(preset.j);
    setK(preset.k);
  }, []);

  const orientationBadge =
    Math.abs(det) < 0.05 ? (
      <Badge tone="warning">Degenerate — squishes to a plane or line</Badge>
    ) : det > 0 ? (
      <Badge tone="success">Orientation preserved</Badge>
    ) : (
      <Badge tone="error">Orientation flipped</Badge>
    );

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <TransformedGrid matrix={matrix} color={PALETTE.border} />
        <ParallelepipedMesh
          a={i}
          b={j}
          c={k}
          color={det >= 0 ? PALETTE.success : PALETTE.error}
        />
        <VectorArrow origin={[0, 0, 0]} direction={i} color={AXIS_COLORS.x} />
        <VectorArrow origin={[0, 0, 0]} direction={j} color={AXIS_COLORS.y} />
        <VectorArrow origin={[0, 0, 0]} direction={k} color={AXIS_COLORS.z} />
        <PointObject
          position={i}
          label="î"
          color={AXIS_COLORS.x}
          radius={0.12}
          draggable
          onDrag={setI}
        />
        <PointObject
          position={j}
          label="ĵ"
          color={AXIS_COLORS.y}
          radius={0.12}
          draggable
          onDrag={setJ}
        />
        <PointObject
          position={k}
          label="k̂"
          color={AXIS_COLORS.z}
          radius={0.12}
          draggable
          onDrag={setK}
        />
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Matrix from basis vectors">
            <div className="flex flex-wrap gap-1.5">
              {BASIS_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className="bg-surface-hover text-muted hover:text-foreground rounded-full px-3 py-1 text-xs font-medium transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <Equation latex={matrixToLatex(matrix)} block />
            <StatReadout label="Determinant (signed volume)" value={det} />
            {orientationBadge}

            {inv ? (
              <details className="text-muted text-xs">
                <summary className="text-foreground cursor-pointer select-none">
                  Inverse matrix
                </summary>
                <div className="mt-2">
                  <Equation latex={`M^{-1} = ${matrixToLatex(inv)}`} block />
                  <p className="mt-1 leading-relaxed">
                    Applying M⁻¹ to the parallelepiped above would bring it exactly back
                    to the unit cube.
                  </p>
                </div>
              </details>
            ) : (
              <p className="text-error text-xs">
                No inverse — the matrix is singular (det ≈ 0).
              </p>
            )}

            <p className="text-muted text-xs leading-relaxed">
              Drag î, ĵ, or k̂ — the matrix is simply their columns. The colored volume is
              the unit cube&apos;s image; the faint grid shows how the whole plane bends.
            </p>
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
