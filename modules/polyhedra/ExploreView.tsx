"use client";

import { useCallback, useState } from "react";
import ModuleScene from "@/three/engine/ModuleScene";
import PolyhedronMesh from "@/three/objects/PolyhedronMesh";
import ControlPanel from "@/components/panels/ControlPanel";
import StatReadout from "@/components/panels/StatReadout";
import Equation from "@/components/ui/Equation";
import { cn } from "@/utils/cn";
import {
  POLYHEDRA,
  polyhedronInfo,
  type PolyhedronType,
} from "@/modules/polyhedra/types";

export default function ExploreView() {
  const [type, setType] = useState<PolyhedronType>("cube");
  const [explode, setExplode] = useState(0);
  const [selectedFace, setSelectedFace] = useState<number | null>(null);

  const info = polyhedronInfo(type);
  const euler = info.vertices - info.edges + info.faces;

  const handleTypeChange = useCallback((next: PolyhedronType) => {
    setType(next);
    setSelectedFace(null);
  }, []);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <PolyhedronMesh type={type} explode={explode} onSelectFace={setSelectedFace} />
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Polyhedra">
            <div className="flex flex-wrap gap-1.5">
              {POLYHEDRA.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleTypeChange(p.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    type === p.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-hover text-muted hover:text-foreground",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div>
              <label className="text-muted mb-1 block text-xs">
                Explode: {Math.round(explode * 100)}%
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={explode}
                onChange={(e) => setExplode(Number(e.target.value))}
                className="accent-primary w-full"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <StatReadout label="Vertices" value={info.vertices} />
              <StatReadout label="Edges" value={info.edges} />
              <StatReadout label="Faces" value={info.faces} />
            </div>

            <Equation
              latex={`V - E + F = ${info.vertices} - ${info.edges} + ${info.faces} = ${euler}`}
              block
            />

            <p className="text-muted text-xs leading-relaxed">
              {info.faces} {info.faceShape} in total
              {selectedFace !== null && ` — face #${selectedFace + 1} selected`}. Click
              any face to select it; drag the slider to explode the solid outward.
            </p>
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
