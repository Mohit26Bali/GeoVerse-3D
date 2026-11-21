import type { SceneObject, SceneSnapshot } from "@/store/useSceneStore";

const STORAGE_KEY = "geoverse:geometry-lab:scenes";
const MAX_SCENES = 50;
const MAX_OBJECTS = 500;
const MAX_NAME_LENGTH = 60;
const MAX_ABS_COORDINATE = 1e6;

export interface SavedScene {
  name: string;
  savedAt: string;
  snapshot: SceneSnapshot;
}

const KINDS = [
  "point",
  "vector",
  "line",
  "ray",
  "segment",
  "plane",
  "sphere",
  "cube",
] as const;

function isTuple(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every(
      (n) =>
        typeof n === "number" && Number.isFinite(n) && Math.abs(n) <= MAX_ABS_COORDINATE,
    )
  );
}

function isPositive(value: unknown): boolean {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0 &&
    value <= MAX_ABS_COORDINATE
  );
}

/** True when an object read back from storage has everything its kind needs to render. */
export function isValidObject(raw: unknown): raw is SceneObject {
  if (typeof raw !== "object" || raw === null) return false;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || o.id.length === 0 || o.id.length > 80) return false;
  if (typeof o.label !== "string" || o.label.length > 80) return false;
  if (typeof o.color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(o.color)) return false;
  if (typeof o.kind !== "string" || !(KINDS as readonly string[]).includes(o.kind))
    return false;
  switch (o.kind) {
    case "point":
      return isTuple(o.position);
    case "vector":
      return isTuple(o.origin) && isTuple(o.direction);
    case "line":
    case "ray":
      return isTuple(o.point) && isTuple(o.direction);
    case "segment":
      return isTuple(o.a) && isTuple(o.b);
    case "plane":
      return isTuple(o.point) && isTuple(o.normal);
    case "sphere":
      return isTuple(o.center) && isPositive(o.radius);
    case "cube":
      return isTuple(o.center) && isPositive(o.size);
    default:
      return false;
  }
}

/** A snapshot is usable only when every object is valid and `order` lists exactly those objects. */
export function isValidSnapshot(raw: unknown): raw is SceneSnapshot {
  if (typeof raw !== "object" || raw === null) return false;
  const s = raw as { objects?: unknown; order?: unknown };
  if (typeof s.objects !== "object" || s.objects === null || Array.isArray(s.objects))
    return false;
  if (!Array.isArray(s.order) || s.order.some((id) => typeof id !== "string"))
    return false;
  const objects = s.objects as Record<string, unknown>;
  const ids = Object.keys(objects);
  if (ids.length > MAX_OBJECTS) return false;
  if (s.order.length !== ids.length || new Set(s.order).size !== ids.length) return false;
  return ids.every(
    (id) =>
      (s.order as string[]).includes(id) &&
      isValidObject(objects[id]) &&
      (objects[id] as SceneObject).id === id,
  );
}

function isValidSaved(raw: unknown): raw is SavedScene {
  if (typeof raw !== "object" || raw === null) return false;
  const s = raw as Partial<SavedScene>;
  return (
    typeof s.name === "string" &&
    s.name.length > 0 &&
    s.name.length <= MAX_NAME_LENGTH &&
    typeof s.savedAt === "string" &&
    isValidSnapshot(s.snapshot)
  );
}

/** Reads every saved scene, silently dropping anything damaged or hand-edited into a bad shape. */
function readAll(): SavedScene[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidSaved).slice(0, MAX_SCENES);
  } catch {
    return [];
  }
}

/** Returns false when the browser refuses the write (storage full, or blocked in a private window). */
function writeAll(scenes: SavedScene[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes));
    return true;
  } catch {
    return false;
  }
}

export function listSavedScenes(): SavedScene[] {
  return readAll().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function saveScene(name: string, snapshot: SceneSnapshot): boolean {
  const clean = name.trim().slice(0, MAX_NAME_LENGTH);
  if (!clean || !isValidSnapshot(snapshot)) return false;
  const scenes = readAll().filter((s) => s.name !== clean);
  scenes.push({ name: clean, savedAt: new Date().toISOString(), snapshot });
  // keep the newest scenes if the list grows past the limit
  const kept = scenes
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    .slice(0, MAX_SCENES);
  return writeAll(kept);
}

export function loadScene(name: string): SceneSnapshot | null {
  const found = readAll().find((s) => s.name === name);
  return found ? found.snapshot : null;
}

export function deleteScene(name: string): void {
  writeAll(readAll().filter((s) => s.name !== name));
}
