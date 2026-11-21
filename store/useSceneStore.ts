import { create } from "zustand";
import type { Vec3Tuple } from "@/types/math";

/**
 * Geometry Lab's scene graph: a flat map of user-placed objects, editable
 * via a small set of primitive kinds. Every object type keeps just enough
 * data to both render itself (via the existing three/objects components)
 * and feed straight into the same math functions the rest of GeoVerse uses.
 */

export type SceneObjectKind =
  "point" | "vector" | "line" | "ray" | "segment" | "plane" | "sphere" | "cube";

interface BaseObject {
  id: string;
  label: string;
  color: string;
}

export interface PointObject extends BaseObject {
  kind: "point";
  position: Vec3Tuple;
}

export interface VectorObject extends BaseObject {
  kind: "vector";
  origin: Vec3Tuple;
  direction: Vec3Tuple;
}

export interface LineObjectData extends BaseObject {
  kind: "line";
  point: Vec3Tuple;
  direction: Vec3Tuple;
}

export interface RayObjectData extends BaseObject {
  kind: "ray";
  point: Vec3Tuple;
  direction: Vec3Tuple;
}

export interface SegmentObjectData extends BaseObject {
  kind: "segment";
  a: Vec3Tuple;
  b: Vec3Tuple;
}

export interface PlaneObjectData extends BaseObject {
  kind: "plane";
  point: Vec3Tuple;
  normal: Vec3Tuple;
}

export interface SphereObjectData extends BaseObject {
  kind: "sphere";
  center: Vec3Tuple;
  radius: number;
}

export interface CubeObjectData extends BaseObject {
  kind: "cube";
  center: Vec3Tuple;
  size: number;
}

export type SceneObject =
  | PointObject
  | VectorObject
  | LineObjectData
  | RayObjectData
  | SegmentObjectData
  | PlaneObjectData
  | SphereObjectData
  | CubeObjectData;

export interface SceneSnapshot {
  objects: Record<string, SceneObject>;
  order: string[];
}

interface SceneState extends SceneSnapshot {
  selectedIds: string[];
  hoveredId: string | null;
  past: SceneSnapshot[];
  future: SceneSnapshot[];

  addObject: (object: SceneObject) => void;
  updateObject: (id: string, patch: Partial<SceneObject>) => void;
  removeObject: (id: string) => void;
  removeSelected: () => void;
  duplicateObject: (id: string) => void;

  select: (id: string | null) => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  setHovered: (id: string | null) => void;

  undo: () => void;
  redo: () => void;
  loadSnapshot: (snapshot: SceneSnapshot) => void;
  resetScene: () => void;
}

const EMPTY_SNAPSHOT: SceneSnapshot = { objects: {}, order: [] };
const MAX_HISTORY = 50;

function snapshotOf(state: SceneState): SceneSnapshot {
  return { objects: state.objects, order: [...state.order] };
}

export const useSceneStore = create<SceneState>((set) => ({
  ...EMPTY_SNAPSHOT,
  selectedIds: [],
  hoveredId: null,
  past: [],
  future: [],

  addObject: (object) =>
    set((s) => ({
      objects: { ...s.objects, [object.id]: object },
      order: [...s.order, object.id],
      past: [...s.past.slice(-MAX_HISTORY + 1), snapshotOf(s)],
      future: [],
      selectedIds: [object.id],
    })),

  updateObject: (id, patch) =>
    set((s) => {
      const existing = s.objects[id];
      if (!existing) return s;
      return {
        objects: { ...s.objects, [id]: { ...existing, ...patch } as SceneObject },
      };
    }),

  removeObject: (id) =>
    set((s) => {
      if (!s.objects[id]) return s;
      const objects = { ...s.objects };
      delete objects[id];
      return {
        objects,
        order: s.order.filter((o) => o !== id),
        selectedIds: s.selectedIds.filter((sid) => sid !== id),
        past: [...s.past.slice(-MAX_HISTORY + 1), snapshotOf(s)],
        future: [],
      };
    }),

  removeSelected: () =>
    set((s) => {
      if (s.selectedIds.length === 0) return s;
      const objects = { ...s.objects };
      s.selectedIds.forEach((id) => delete objects[id]);
      return {
        objects,
        order: s.order.filter((id) => !s.selectedIds.includes(id)),
        selectedIds: [],
        past: [...s.past.slice(-MAX_HISTORY + 1), snapshotOf(s)],
        future: [],
      };
    }),

  duplicateObject: (id) =>
    set((s) => {
      const source = s.objects[id];
      if (!source) return s;
      const newId = `${source.kind}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const offset = (v: Vec3Tuple): Vec3Tuple => [v[0] + 0.6, v[1], v[2] + 0.6];
      let copy: SceneObject;
      switch (source.kind) {
        case "point":
          copy = { ...source, id: newId, position: offset(source.position) };
          break;
        case "vector":
          copy = { ...source, id: newId, origin: offset(source.origin) };
          break;
        case "line":
          copy = { ...source, id: newId, point: offset(source.point) };
          break;
        case "ray":
          copy = { ...source, id: newId, point: offset(source.point) };
          break;
        case "segment":
          copy = { ...source, id: newId, a: offset(source.a), b: offset(source.b) };
          break;
        case "plane":
          copy = { ...source, id: newId, point: offset(source.point) };
          break;
        case "sphere":
          copy = { ...source, id: newId, center: offset(source.center) };
          break;
        case "cube":
          copy = { ...source, id: newId, center: offset(source.center) };
          break;
      }
      return {
        objects: { ...s.objects, [newId]: copy },
        order: [...s.order, newId],
        selectedIds: [newId],
        past: [...s.past.slice(-MAX_HISTORY + 1), snapshotOf(s)],
        future: [],
      };
    }),

  select: (id) => set({ selectedIds: id ? [id] : [] }),
  toggleSelect: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((sid) => sid !== id)
        : [...s.selectedIds, id],
    })),
  clearSelection: () => set({ selectedIds: [] }),
  setHovered: (id) => set({ hoveredId: id }),

  undo: () =>
    set((s) => {
      const previous = s.past[s.past.length - 1];
      if (!previous) return s;
      return {
        objects: previous.objects,
        order: previous.order,
        past: s.past.slice(0, -1),
        future: [...s.future, snapshotOf(s)],
        selectedIds: [],
      };
    }),

  redo: () =>
    set((s) => {
      const next = s.future[s.future.length - 1];
      if (!next) return s;
      return {
        objects: next.objects,
        order: next.order,
        future: s.future.slice(0, -1),
        past: [...s.past, snapshotOf(s)],
        selectedIds: [],
      };
    }),

  loadSnapshot: (snapshot) =>
    set((s) => ({
      objects: snapshot.objects,
      order: snapshot.order,
      selectedIds: [],
      past: [...s.past.slice(-MAX_HISTORY + 1), snapshotOf(s)],
      future: [],
    })),

  resetScene: () =>
    set((s) => ({
      ...EMPTY_SNAPSHOT,
      selectedIds: [],
      past: [...s.past.slice(-MAX_HISTORY + 1), snapshotOf(s)],
      future: [],
    })),
}));

export function createObjectId(kind: SceneObjectKind): string {
  return `${kind}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
