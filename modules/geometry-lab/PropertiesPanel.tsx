"use client";

import ControlPanel from "@/components/panels/ControlPanel";
import { PALETTE } from "@/constants/theme";
import { cn } from "@/utils/cn";
import type { Vec3Tuple } from "@/types/math";
import { useSceneStore, type SceneObject } from "@/store/useSceneStore";

const SWATCHES = [
  PALETTE.primary,
  PALETTE.secondary,
  PALETTE.accent,
  PALETTE.success,
  PALETTE.warning,
  PALETTE.error,
  PALETTE.foreground,
];

function Vec3Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Vec3Tuple;
  onChange: (next: Vec3Tuple) => void;
}) {
  return (
    <div>
      <label className="text-muted mb-1 block text-xs">{label}</label>
      <div className="grid grid-cols-3 gap-1.5">
        {(["x", "y", "z"] as const).map((axis, i) => (
          <input
            key={axis}
            type="number"
            step={0.1}
            value={Number(value[i].toFixed(2))}
            onChange={(e) => {
              const next: Vec3Tuple = [...value];
              next[i] = Number(e.target.value) || 0;
              onChange(next);
            }}
            className="bg-surface-hover text-foreground w-full rounded-md px-1.5 py-1 text-xs outline-none"
          />
        ))}
      </div>
    </div>
  );
}

export default function PropertiesPanel({ object }: { object: SceneObject }) {
  const updateObject = useSceneStore((s) => s.updateObject);
  const patch = (p: Partial<SceneObject>) => updateObject(object.id, p);

  return (
    <ControlPanel title="Properties">
      <div>
        <label className="text-muted mb-1 block text-xs">Label</label>
        <input
          type="text"
          value={object.label}
          onChange={(e) => patch({ label: e.target.value })}
          className="bg-surface-hover text-foreground w-full rounded-md px-2 py-1 text-xs outline-none"
        />
      </div>

      <div>
        <label className="text-muted mb-1 block text-xs">Color</label>
        <div className="flex gap-1.5">
          {SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => patch({ color: c })}
              className={cn(
                "h-5 w-5 rounded-full border-2 transition-transform",
                object.color === c ? "scale-110 border-white" : "border-transparent",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {object.kind === "point" && (
        <Vec3Input
          label="Position"
          value={object.position}
          onChange={(v) => patch({ position: v })}
        />
      )}

      {object.kind === "vector" && (
        <>
          <Vec3Input
            label="Origin"
            value={object.origin}
            onChange={(v) => patch({ origin: v })}
          />
          <Vec3Input
            label="Direction"
            value={object.direction}
            onChange={(v) => patch({ direction: v })}
          />
        </>
      )}

      {object.kind === "line" && (
        <>
          <Vec3Input
            label="Point"
            value={object.point}
            onChange={(v) => patch({ point: v })}
          />
          <Vec3Input
            label="Direction"
            value={object.direction}
            onChange={(v) => patch({ direction: v })}
          />
        </>
      )}

      {object.kind === "plane" && (
        <>
          <Vec3Input
            label="Point"
            value={object.point}
            onChange={(v) => patch({ point: v })}
          />
          <Vec3Input
            label="Normal"
            value={object.normal}
            onChange={(v) => patch({ normal: v })}
          />
        </>
      )}

      {object.kind === "sphere" && (
        <>
          <Vec3Input
            label="Center"
            value={object.center}
            onChange={(v) => patch({ center: v })}
          />
          <div>
            <label className="text-muted mb-1 block text-xs">Radius</label>
            <input
              type="number"
              step={0.1}
              min={0.1}
              value={Number(object.radius.toFixed(2))}
              onChange={(e) =>
                patch({ radius: Math.max(0.1, Number(e.target.value) || 0.1) })
              }
              className="bg-surface-hover text-foreground w-full rounded-md px-2 py-1 text-xs outline-none"
            />
          </div>
        </>
      )}

      {object.kind === "cube" && (
        <>
          <Vec3Input
            label="Center"
            value={object.center}
            onChange={(v) => patch({ center: v })}
          />
          <div>
            <label className="text-muted mb-1 block text-xs">Size</label>
            <input
              type="number"
              step={0.1}
              min={0.1}
              value={Number(object.size.toFixed(2))}
              onChange={(e) =>
                patch({ size: Math.max(0.1, Number(e.target.value) || 0.1) })
              }
              className="bg-surface-hover text-foreground w-full rounded-md px-2 py-1 text-xs outline-none"
            />
          </div>
        </>
      )}
    </ControlPanel>
  );
}
