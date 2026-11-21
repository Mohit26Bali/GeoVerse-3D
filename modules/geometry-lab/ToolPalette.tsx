"use client";

import { useState } from "react";
import ControlPanel from "@/components/panels/ControlPanel";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { cn } from "@/utils/cn";
import { useSceneStore } from "@/store/useSceneStore";
import { TOOLS, type ToolId } from "@/modules/geometry-lab/types";
import {
  deleteScene,
  listSavedScenes,
  loadScene,
  saveScene,
} from "@/modules/geometry-lab/persistence";

interface ToolPaletteProps {
  tool: ToolId;
  onToolChange: (tool: ToolId) => void;
  placementStep: number;
}

export default function ToolPalette({
  tool,
  onToolChange,
  placementStep,
}: ToolPaletteProps) {
  const objects = useSceneStore((s) => s.objects);
  const order = useSceneStore((s) => s.order);
  const selectedIds = useSceneStore((s) => s.selectedIds);
  const undo = useSceneStore((s) => s.undo);
  const redo = useSceneStore((s) => s.redo);
  const past = useSceneStore((s) => s.past);
  const future = useSceneStore((s) => s.future);
  const removeSelected = useSceneStore((s) => s.removeSelected);
  const duplicateObject = useSceneStore((s) => s.duplicateObject);
  const loadSnapshot = useSceneStore((s) => s.loadSnapshot);
  const resetScene = useSceneStore((s) => s.resetScene);

  const [showSaves, setShowSaves] = useState(false);
  const [sceneName, setSceneName] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);

  const activeToolDef = TOOLS.find((t) => t.id === tool)!;

  const handleSave = () => {
    if (!sceneName.trim()) return;
    const saved = saveScene(sceneName.trim(), { objects, order });
    setSaveError(saved ? null : "Could not save. Browser storage is full or blocked.");
    if (saved) setSceneName("");
  };

  const handleLoad = (name: string) => {
    const snapshot = loadScene(name);
    if (snapshot) loadSnapshot(snapshot);
    setShowSaves(false);
  };

  const duplicateSelected = () => {
    selectedIds.forEach((id) => duplicateObject(id));
  };

  return (
    <ControlPanel title="Geometry Lab">
      <div className="flex flex-wrap gap-1.5">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => onToolChange(t.id)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              tool === t.id
                ? "bg-primary text-primary-foreground"
                : "bg-surface-hover text-muted hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeToolDef.clicks > 0 && (
        <Badge tone="warning">
          {
            activeToolDef.instructions[
              Math.min(placementStep, activeToolDef.instructions.length - 1)
            ]
          }
        </Badge>
      )}

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={undo} disabled={past.length === 0}>
          Undo
        </Button>
        <Button size="sm" variant="outline" onClick={redo} disabled={future.length === 0}>
          Redo
        </Button>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={duplicateSelected}>
          Duplicate
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={removeSelected}
          disabled={selectedIds.length === 0}
        >
          Delete
        </Button>
      </div>

      <details className="text-muted text-xs" open={showSaves}>
        <summary
          className="text-foreground cursor-pointer select-none"
          onClick={(e) => {
            e.preventDefault();
            setShowSaves((v) => !v);
          }}
        >
          Save / Load scene
        </summary>
        <div className="mt-2 flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={sceneName}
              onChange={(e) => setSceneName(e.target.value)}
              placeholder="Scene name"
              aria-label="Scene name"
              maxLength={60}
              className="bg-surface-hover text-foreground w-full rounded-md px-2 py-1 text-xs outline-none"
            />
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!sceneName.trim() || order.length === 0}
            >
              Save
            </Button>
          </div>
          {saveError && (
            <p role="alert" className="text-error text-xs">
              {saveError}
            </p>
          )}
          <div className="flex flex-col gap-1">
            {listSavedScenes().map((scene) => (
              <div key={scene.name} className="flex items-center justify-between gap-2">
                <button
                  onClick={() => handleLoad(scene.name)}
                  className="text-foreground hover:text-primary truncate text-left text-xs"
                >
                  {scene.name}
                </button>
                <button
                  aria-label={`Delete scene ${scene.name}`}
                  onClick={() => {
                    deleteScene(scene.name);
                    setSceneName((n) => n);
                  }}
                  className="text-error text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
            {listSavedScenes().length === 0 && (
              <p className="text-muted text-xs">No saved scenes yet.</p>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={resetScene}>
            Clear scene
          </Button>
        </div>
      </details>
    </ControlPanel>
  );
}
