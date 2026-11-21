"use client";

import { useState } from "react";
import ControlPanel from "@/components/panels/ControlPanel";
import Button from "@/components/ui/Button";
import Equation from "@/components/ui/Equation";
import { useSceneStore, type SceneObject } from "@/store/useSceneStore";
import {
  getAvailableOperations,
  type OperationOutcome,
} from "@/modules/geometry-lab/operations";
import type { PreviewData } from "@/modules/geometry-lab/types";

interface OperationsPanelProps {
  selected: SceneObject[];
  onPreview: (preview: PreviewData | null) => void;
}

export default function OperationsPanel({ selected, onPreview }: OperationsPanelProps) {
  const objects = useSceneStore((s) => s.objects);
  const addObject = useSceneStore((s) => s.addObject);
  const [outcome, setOutcome] = useState<OperationOutcome | null>(null);

  const ops = getAvailableOperations(selected);

  const run = (opId: string) => {
    const op = ops.find((o) => o.id === opId);
    if (!op) return;
    const result = op.run(selected, Object.values(objects));
    setOutcome(result);
    if (result.newObject) addObject(result.newObject);
    if (result.previewCircle) onPreview({ type: "circle", ...result.previewCircle });
    else if (result.previewSegment)
      onPreview({ type: "segment", points: result.previewSegment });
    else onPreview(null);
  };

  return (
    <ControlPanel title="Operations">
      <div className="flex flex-wrap gap-1.5">
        {ops.map((op) => (
          <Button key={op.id} size="sm" variant="outline" onClick={() => run(op.id)}>
            {op.label}
          </Button>
        ))}
      </div>
      {outcome && (
        <div className="border-border border-t pt-3">
          <Equation latex={outcome.latex} />
          <p className="text-muted mt-1 text-xs leading-relaxed">{outcome.summary}</p>
        </div>
      )}
    </ControlPanel>
  );
}
