"use client";

import ControlPanel from "@/components/panels/ControlPanel";
import { cn } from "@/utils/cn";
import { useSceneStore } from "@/store/useSceneStore";

export default function ObjectList() {
  const objects = useSceneStore((s) => s.objects);
  const order = useSceneStore((s) => s.order);
  const selectedIds = useSceneStore((s) => s.selectedIds);
  const select = useSceneStore((s) => s.select);
  const toggleSelect = useSceneStore((s) => s.toggleSelect);
  const removeObject = useSceneStore((s) => s.removeObject);

  if (order.length === 0) {
    return (
      <ControlPanel title="Scene">
        <p className="text-muted text-xs leading-relaxed">
          Nothing here yet — pick a tool and click in the scene to place your first
          object.
        </p>
      </ControlPanel>
    );
  }

  return (
    <ControlPanel title={`Scene (${order.length})`}>
      <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
        {order.map((id) => {
          const obj = objects[id];
          if (!obj) return null;
          const isSelected = selectedIds.includes(id);
          return (
            <div
              key={id}
              className={cn(
                "group flex items-center justify-between gap-2 rounded-md px-2 py-1 text-xs transition-colors",
                isSelected
                  ? "bg-primary/15 text-foreground"
                  : "text-muted hover:bg-surface-hover",
              )}
            >
              <button
                onClick={(e) => (e.shiftKey ? toggleSelect(id) : select(id))}
                className="flex flex-1 items-center gap-2 truncate text-left"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: obj.color }}
                />
                <span className="truncate">{obj.label}</span>
                <span className="text-muted-foreground ml-auto shrink-0 text-[10px]">
                  {obj.kind}
                </span>
              </button>
              <button
                onClick={() => removeObject(id)}
                className="text-error shrink-0 opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-muted text-xs leading-relaxed">
        Shift-click to select two (or three) objects and see available operations.
      </p>
    </ControlPanel>
  );
}
