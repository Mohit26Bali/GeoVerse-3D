"use client";

import { useCallback, useState } from "react";
import ModuleScene from "@/three/engine/ModuleScene";
import ToolPalette from "@/modules/geometry-lab/ToolPalette";
import ObjectList from "@/modules/geometry-lab/ObjectList";
import PropertiesPanel from "@/modules/geometry-lab/PropertiesPanel";
import OperationsPanel from "@/modules/geometry-lab/OperationsPanel";
import EquationEditor from "@/modules/geometry-lab/EquationEditor";
import SceneContent from "@/modules/geometry-lab/SceneContent";
import PreviewOverlay from "@/modules/geometry-lab/PreviewOverlay";
import { distance, subtract } from "@/math/vector";
import { planeFromPoints } from "@/math/geometry";
import type { Vec3Tuple } from "@/types/math";
import { useSceneStore, createObjectId, type SceneObject } from "@/store/useSceneStore";
import {
  TOOLS,
  defaultColorFor,
  labelFor,
  type PreviewData,
  type ToolId,
} from "@/modules/geometry-lab/types";
import type { ParsedShape } from "@/modules/geometry-lab/equationParser";
import { getAvailableOperations } from "@/modules/geometry-lab/operations";

function objectFromParsedShape(shape: ParsedShape, existing: SceneObject[]): SceneObject {
  const label = labelFor(shape.kind, existing);
  const color = defaultColorFor(shape.kind);
  const id = createObjectId(shape.kind);

  switch (shape.kind) {
    case "point":
      return { id, kind: "point", label, color, position: shape.position };
    case "vector":
      return {
        id,
        kind: "vector",
        label,
        color,
        origin: [0, 0, 0],
        direction: shape.direction,
      };
    case "line":
      return {
        id,
        kind: "line",
        label,
        color,
        point: shape.point,
        direction: shape.direction,
      };
    case "plane":
      return {
        id,
        kind: "plane",
        label,
        color,
        point: shape.point,
        normal: shape.normal,
      };
    case "sphere":
      return {
        id,
        kind: "sphere",
        label,
        color,
        center: shape.center,
        radius: shape.radius,
      };
  }
}

function commitObject(
  tool: ToolId,
  points: Vec3Tuple[],
  existing: SceneObject[],
): SceneObject | null {
  const label = labelFor(tool as Exclude<ToolId, "select">, existing);
  const color = defaultColorFor(tool as Exclude<ToolId, "select">);
  const id = createObjectId(tool as Exclude<ToolId, "select">);

  switch (tool) {
    case "point":
      return { id, kind: "point", label, color, position: points[0] };
    case "vector":
      return {
        id,
        kind: "vector",
        label,
        color,
        origin: points[0],
        direction: subtract(points[1], points[0]),
      };
    case "line":
      return {
        id,
        kind: "line",
        label,
        color,
        point: points[0],
        direction: subtract(points[1], points[0]),
      };
    case "ray":
      return {
        id,
        kind: "ray",
        label,
        color,
        point: points[0],
        direction: subtract(points[1], points[0]),
      };
    case "segment":
      return { id, kind: "segment", label, color, a: points[0], b: points[1] };
    case "plane": {
      const [a, b, c] = points;
      const plane = planeFromPoints(a, b, c);
      return {
        id,
        kind: "plane",
        label,
        color,
        point: plane.point,
        normal: plane.normal,
      };
    }
    case "sphere":
      return {
        id,
        kind: "sphere",
        label,
        color,
        center: points[0],
        radius: Math.max(0.15, distance(points[0], points[1])),
      };
    case "cube": {
      const size = Math.max(0.3, (2 * distance(points[0], points[1])) / Math.sqrt(3));
      return { id, kind: "cube", label, color, center: points[0], size };
    }
    default:
      return null;
  }
}

export default function GeometryLabView() {
  const [tool, setTool] = useState<ToolId>("select");
  const [pendingPoints, setPendingPoints] = useState<Vec3Tuple[]>([]);
  const [preview, setPreview] = useState<{
    data: PreviewData;
    forSelection: string;
  } | null>(null);

  const objects = useSceneStore((s) => s.objects);
  const selectedIds = useSceneStore((s) => s.selectedIds);
  const addObject = useSceneStore((s) => s.addObject);

  const selectionKey = [...selectedIds].sort().join(",");
  // A preview result only makes sense for the selection that produced it — once
  // selection changes, it's stale, so it's filtered out here rather than cleared
  // via an effect (which would cause an extra render).
  const activePreview =
    preview && preview.forSelection === selectionKey ? preview.data : null;

  const handleToolChange = useCallback((next: ToolId) => {
    setTool(next);
    setPendingPoints([]);
  }, []);

  const handlePlaceClick = useCallback(
    (point: Vec3Tuple) => {
      const toolDef = TOOLS.find((t) => t.id === tool)!;
      const next = [...pendingPoints, point];
      if (next.length >= toolDef.clicks) {
        const object = commitObject(tool, next, Object.values(objects));
        if (object) addObject(object);
        setPendingPoints([]);
        setTool("select");
      } else {
        setPendingPoints(next);
      }
    },
    [tool, pendingPoints, objects, addObject],
  );

  const selectedObjects = selectedIds
    .map((id) => objects[id])
    .filter((o): o is SceneObject => Boolean(o));
  const availableOps = getAvailableOperations(selectedObjects);

  const handleEquationCreate = useCallback(
    (shape: ParsedShape) => {
      addObject(objectFromParsedShape(shape, Object.values(objects)));
    },
    [objects, addObject],
  );

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <SceneContent
          tool={tool}
          pendingPoints={pendingPoints}
          onPlaceClick={handlePlaceClick}
        />
        {activePreview && <PreviewOverlay preview={activePreview} />}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ToolPalette
            tool={tool}
            onToolChange={handleToolChange}
            placementStep={pendingPoints.length}
          />
        </div>
        <div className="pointer-events-auto">
          <EquationEditor onCreate={handleEquationCreate} />
        </div>
      </div>

      <div className="pointer-events-none absolute top-20 right-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ObjectList />
        </div>
        {selectedObjects.length === 1 && (
          <div className="pointer-events-auto">
            <PropertiesPanel object={selectedObjects[0]} />
          </div>
        )}
        {availableOps.length > 0 && (
          <div className="pointer-events-auto">
            <OperationsPanel
              selected={selectedObjects}
              onPreview={(data) =>
                setPreview(data ? { data, forSelection: selectionKey } : null)
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
