import type { Vec3Tuple } from "@/types/math";
import { PALETTE } from "@/constants/theme";
import type { SceneObject, SceneObjectKind } from "@/store/useSceneStore";

export type ToolId = "select" | SceneObjectKind;

export type PreviewData =
  | { type: "circle"; center: Vec3Tuple; radius: number; normal: Vec3Tuple }
  | { type: "segment"; points: [Vec3Tuple, Vec3Tuple] };

export interface ToolDef {
  id: ToolId;
  label: string;
  /** Number of clicks needed to place this object (unused for "select"). */
  clicks: number;
  instructions: string[];
}

export const TOOLS: ToolDef[] = [
  { id: "select", label: "Select", clicks: 0, instructions: [] },
  { id: "point", label: "Point", clicks: 1, instructions: ["Click to place the point"] },
  {
    id: "vector",
    label: "Vector",
    clicks: 2,
    instructions: ["Click the vector's origin", "Click to set its tip"],
  },
  {
    id: "line",
    label: "Line",
    clicks: 2,
    instructions: [
      "Click the line's first point",
      "Click a second point to set its direction",
    ],
  },
  {
    id: "ray",
    label: "Ray",
    clicks: 2,
    instructions: ["Click the ray's starting point", "Click to set its direction"],
  },
  {
    id: "segment",
    label: "Segment",
    clicks: 2,
    instructions: ["Click the first endpoint", "Click the second endpoint"],
  },
  {
    id: "plane",
    label: "Plane",
    clicks: 3,
    instructions: [
      "Click the first point",
      "Click a second point",
      "Click a third point to define the plane",
    ],
  },
  {
    id: "sphere",
    label: "Sphere",
    clicks: 2,
    instructions: ["Click the center", "Click to set the radius"],
  },
  {
    id: "cube",
    label: "Cube",
    clicks: 2,
    instructions: ["Click the center", "Click to set the size"],
  },
];

const DEFAULT_COLOR: Record<SceneObjectKind, string> = {
  point: PALETTE.foreground,
  vector: PALETTE.primary,
  line: PALETTE.accent,
  ray: PALETTE.accent,
  segment: PALETTE.primary,
  plane: PALETTE.secondary,
  sphere: PALETTE.warning,
  cube: PALETTE.success,
};

export function defaultColorFor(kind: SceneObjectKind): string {
  return DEFAULT_COLOR[kind];
}

export function labelFor(kind: SceneObjectKind, existing: SceneObject[]): string {
  const count = existing.filter((o) => o.kind === kind).length + 1;
  const name = kind.charAt(0).toUpperCase() + kind.slice(1);
  return `${name} ${count}`;
}

/** Every "grabbable" anchor point across all objects, used for point-snapping while placing new ones. */
export function anchorPointsOf(objects: Record<string, SceneObject>): Vec3Tuple[] {
  const points: Vec3Tuple[] = [];
  for (const obj of Object.values(objects)) {
    switch (obj.kind) {
      case "point":
        points.push(obj.position);
        break;
      case "vector":
        points.push(obj.origin, [
          obj.origin[0] + obj.direction[0],
          obj.origin[1] + obj.direction[1],
          obj.origin[2] + obj.direction[2],
        ]);
        break;
      case "line":
        points.push(obj.point);
        break;
      case "ray":
        points.push(obj.point, [
          obj.point[0] + obj.direction[0],
          obj.point[1] + obj.direction[1],
          obj.point[2] + obj.direction[2],
        ]);
        break;
      case "segment":
        points.push(obj.a, obj.b);
        break;
      case "plane":
        points.push(obj.point);
        break;
      case "sphere":
        points.push(obj.center);
        break;
      case "cube":
        points.push(obj.center);
        break;
    }
  }
  return points;
}
