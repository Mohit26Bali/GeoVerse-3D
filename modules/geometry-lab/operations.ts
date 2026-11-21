import type { Vec3Tuple } from "@/types/math";
import {
  add,
  angleBetween,
  cross,
  distance,
  dot,
  scale,
  subtract,
  vectorProjection,
} from "@/math/vector";
import {
  closestPointOnLine,
  closestPointOnPlane,
  closestPointOnRay,
  closestPointOnSegment,
  distancePointToLine,
  distancePointToPlane,
  distancePointToRay,
  distancePointToSegment,
  lineIntersectsPlane,
  planeFromPoints,
  planeIntersectsPlane,
  segmentIntersectsPlane,
  segmentSphereIntersection,
  closestApproachBetweenLines,
  closestApproachBounded,
  rayIntersectsPlane,
  raySphereIntersection,
  LINE_BOUND,
  RAY_BOUND,
  SEGMENT_BOUND,
} from "@/math/geometry";
import { crossSectionRadius } from "@/math/sphere";
import { formatNumber } from "@/math/format";
import { createObjectId, type SceneObject } from "@/store/useSceneStore";
import { defaultColorFor, labelFor } from "@/modules/geometry-lab/types";

export interface OperationOutcome {
  latex: string;
  summary: string;
  newObject?: SceneObject;
  previewCircle?: { center: Vec3Tuple; radius: number; normal: Vec3Tuple };
  previewSegment?: [Vec3Tuple, Vec3Tuple];
}

export interface OperationDef {
  id: string;
  label: string;
  run: (selected: SceneObject[], existing: SceneObject[]) => OperationOutcome;
}

function newVector(
  origin: Vec3Tuple,
  direction: Vec3Tuple,
  existing: SceneObject[],
): SceneObject {
  return {
    id: createObjectId("vector"),
    kind: "vector",
    label: labelFor("vector", existing),
    color: defaultColorFor("vector"),
    origin,
    direction,
  };
}

function newPoint(position: Vec3Tuple, existing: SceneObject[]): SceneObject {
  return {
    id: createObjectId("point"),
    kind: "point",
    label: labelFor("point", existing),
    color: defaultColorFor("point"),
    position,
  };
}

function newLine(
  point: Vec3Tuple,
  direction: Vec3Tuple,
  existing: SceneObject[],
): SceneObject {
  return {
    id: createObjectId("line"),
    kind: "line",
    label: labelFor("line", existing),
    color: defaultColorFor("line"),
    point,
    direction,
  };
}

/** Point + direction + allowed parameter range for whichever of line/ray/segment is passed in. */
function locusOf(obj: SceneObject): {
  point: Vec3Tuple;
  direction: Vec3Tuple;
  bound: [number, number];
} {
  if (obj.kind === "line")
    return { point: obj.point, direction: obj.direction, bound: LINE_BOUND };
  if (obj.kind === "ray")
    return { point: obj.point, direction: obj.direction, bound: RAY_BOUND };
  if (obj.kind === "segment")
    return { point: obj.a, direction: subtract(obj.b, obj.a), bound: SEGMENT_BOUND };
  throw new Error("expected a line, ray, or segment");
}

/** The direction of anything that has one — a vector, or any of line/ray/segment. */
function directionOf(obj: SceneObject): Vec3Tuple {
  if (obj.kind === "vector" || obj.kind === "line" || obj.kind === "ray")
    return obj.direction;
  if (obj.kind === "segment") return subtract(obj.b, obj.a);
  throw new Error("object has no direction");
}

function angleBetweenOp(a: SceneObject, b: SceneObject): OperationOutcome {
  const deg = (angleBetween(directionOf(a), directionOf(b)) * 180) / Math.PI;
  return {
    latex: `\\theta = ${formatNumber(deg)}^\\circ`,
    summary: `Angle between ${a.label} and ${b.label}`,
  };
}

function closestApproachOp(a: SceneObject, b: SceneObject): OperationOutcome {
  const locA = locusOf(a);
  const locB = locusOf(b);
  const approach = closestApproachBounded(
    locA.point,
    locA.direction,
    locA.bound,
    locB.point,
    locB.direction,
    locB.bound,
  );
  return {
    latex: `d = ${formatNumber(approach.distance)}`,
    summary: `Shortest distance between ${a.label} and ${b.label}`,
    previewSegment: [approach.pointOnA, approach.pointOnB],
  };
}

function newPlane(
  point: Vec3Tuple,
  normal: Vec3Tuple,
  existing: SceneObject[],
): SceneObject {
  return {
    id: createObjectId("plane"),
    kind: "plane",
    label: labelFor("plane", existing),
    color: defaultColorFor("plane"),
    point,
    normal,
  };
}

const VECTOR_VECTOR_OPS: OperationDef[] = [
  {
    id: "vector-add",
    label: "Add",
    run: ([a, b], existing) => {
      if (a.kind !== "vector" || b.kind !== "vector")
        throw new Error("expected two vectors");
      const direction = add(a.direction, b.direction);
      return {
        latex: `\\vec{c} = \\vec{a} + \\vec{b} = (${direction.map((n) => formatNumber(n)).join(", ")})`,
        summary: `${a.label} + ${b.label}`,
        newObject: newVector(a.origin, direction, existing),
      };
    },
  },
  {
    id: "vector-subtract",
    label: "Subtract",
    run: ([a, b], existing) => {
      if (a.kind !== "vector" || b.kind !== "vector")
        throw new Error("expected two vectors");
      const direction = subtract(a.direction, b.direction);
      return {
        latex: `\\vec{c} = \\vec{a} - \\vec{b} = (${direction.map((n) => formatNumber(n)).join(", ")})`,
        summary: `${a.label} - ${b.label}`,
        newObject: newVector(a.origin, direction, existing),
      };
    },
  },
  {
    id: "vector-cross",
    label: "Cross Product",
    run: ([a, b], existing) => {
      if (a.kind !== "vector" || b.kind !== "vector")
        throw new Error("expected two vectors");
      const direction = cross(a.direction, b.direction);
      return {
        latex: `\\vec{a} \\times \\vec{b} = (${direction.map((n) => formatNumber(n)).join(", ")})`,
        summary: `Perpendicular to both ${a.label} and ${b.label}`,
        newObject: newVector(a.origin, direction, existing),
      };
    },
  },
  {
    id: "vector-dot",
    label: "Dot Product",
    run: ([a, b]) => {
      if (a.kind !== "vector" || b.kind !== "vector")
        throw new Error("expected two vectors");
      const value = dot(a.direction, b.direction);
      return {
        latex: `\\vec{a} \\cdot \\vec{b} = ${formatNumber(value)}`,
        summary:
          value > 0
            ? "Pointing the same general way"
            : value < 0
              ? "Pointing generally opposite"
              : "Perpendicular",
      };
    },
  },
  {
    id: "vector-angle",
    label: "Angle Between",
    run: ([a, b]) => {
      if (a.kind !== "vector" || b.kind !== "vector")
        throw new Error("expected two vectors");
      const deg = (angleBetween(a.direction, b.direction) * 180) / Math.PI;
      return {
        latex: `\\theta = ${formatNumber(deg)}^\\circ`,
        summary: `Angle between ${a.label} and ${b.label}`,
      };
    },
  },
  {
    id: "vector-projection",
    label: "Projection",
    run: ([a, b], existing) => {
      if (a.kind !== "vector" || b.kind !== "vector")
        throw new Error("expected two vectors");
      const direction = vectorProjection(a.direction, b.direction);
      return {
        latex: `\\text{proj}_{\\vec{b}}\\vec{a} = (${direction.map((n) => formatNumber(n)).join(", ")})`,
        summary: `${a.label} projected onto ${b.label}`,
        newObject: newVector(a.origin, direction, existing),
      };
    },
  },
];

const POINT_POINT_OPS: OperationDef[] = [
  {
    id: "point-midpoint",
    label: "Midpoint",
    run: ([a, b], existing) => {
      if (a.kind !== "point" || b.kind !== "point")
        throw new Error("expected two points");
      const mid = scale(add(a.position, b.position), 0.5);
      return {
        latex: `M = \\left(\\frac{${a.label}+${b.label}}{2}\\right) = (${mid.map((n) => formatNumber(n)).join(", ")})`,
        summary: `Midpoint of ${a.label} and ${b.label}`,
        newObject: newPoint(mid, existing),
      };
    },
  },
  {
    id: "point-distance",
    label: "Distance",
    run: ([a, b]) => {
      if (a.kind !== "point" || b.kind !== "point")
        throw new Error("expected two points");
      return {
        latex: `d = ${formatNumber(distance(a.position, b.position))}`,
        summary: `Distance between ${a.label} and ${b.label}`,
      };
    },
  },
];

const POINT_LINE_OPS: OperationDef[] = [
  {
    id: "point-line-distance",
    label: "Distance",
    run: (selected) => {
      const point = selected.find((o) => o.kind === "point");
      const line = selected.find((o) => o.kind === "line");
      if (!point || point.kind !== "point" || !line || line.kind !== "line")
        throw new Error("expected a point and a line");
      const d = distancePointToLine(line, point.position);
      return {
        latex: `d = ${formatNumber(d)}`,
        summary: `Distance from ${point.label} to ${line.label}`,
      };
    },
  },
  {
    id: "point-line-closest",
    label: "Closest Point",
    run: (selected, existing) => {
      const point = selected.find((o) => o.kind === "point");
      const line = selected.find((o) => o.kind === "line");
      if (!point || point.kind !== "point" || !line || line.kind !== "line")
        throw new Error("expected a point and a line");
      const closest = closestPointOnLine(line, point.position);
      return {
        latex: `(${closest.map((n) => formatNumber(n)).join(", ")})`,
        summary: `Closest point on ${line.label} to ${point.label}`,
        newObject: newPoint(closest, existing),
      };
    },
  },
];

const POINT_PLANE_OPS: OperationDef[] = [
  {
    id: "point-plane-distance",
    label: "Distance",
    run: (selected) => {
      const point = selected.find((o) => o.kind === "point");
      const plane = selected.find((o) => o.kind === "plane");
      if (!point || point.kind !== "point" || !plane || plane.kind !== "plane")
        throw new Error("expected a point and a plane");
      const d = distancePointToPlane(plane, point.position);
      return {
        latex: `d = ${formatNumber(d)}`,
        summary: `Distance from ${point.label} to ${plane.label}`,
      };
    },
  },
  {
    id: "point-plane-closest",
    label: "Closest Point",
    run: (selected, existing) => {
      const point = selected.find((o) => o.kind === "point");
      const plane = selected.find((o) => o.kind === "plane");
      if (!point || point.kind !== "point" || !plane || plane.kind !== "plane")
        throw new Error("expected a point and a plane");
      const closest = closestPointOnPlane(plane, point.position);
      return {
        latex: `(${closest.map((n) => formatNumber(n)).join(", ")})`,
        summary: `Closest point on ${plane.label} to ${point.label}`,
        newObject: newPoint(closest, existing),
      };
    },
  },
];

const PLANE_PLANE_OPS: OperationDef[] = [
  {
    id: "plane-plane-intersection",
    label: "Find Intersection",
    run: ([a, b], existing) => {
      if (a.kind !== "plane" || b.kind !== "plane")
        throw new Error("expected two planes");
      const line = planeIntersectsPlane(a, b);
      if (!line) {
        return {
          latex: "\\text{parallel}",
          summary: `${a.label} and ${b.label} are parallel — no intersection`,
        };
      }
      return {
        latex: `\\text{point} + t(${line.direction.map((n) => formatNumber(n)).join(", ")})`,
        summary: `Intersection line of ${a.label} and ${b.label}`,
        newObject: newLine(line.point, line.direction, existing),
      };
    },
  },
];

const LINE_LINE_OPS: OperationDef[] = [
  {
    id: "line-line-angle",
    label: "Angle Between",
    run: ([a, b]) => {
      if (a.kind !== "line" || b.kind !== "line") throw new Error("expected two lines");
      const deg = (angleBetween(a.direction, b.direction) * 180) / Math.PI;
      return {
        latex: `\\theta = ${formatNumber(deg)}^\\circ`,
        summary: `Angle between ${a.label} and ${b.label}`,
      };
    },
  },
  {
    id: "line-line-closest-approach",
    label: "Closest Approach",
    run: ([a, b]) => {
      if (a.kind !== "line" || b.kind !== "line") throw new Error("expected two lines");
      const approach = closestApproachBetweenLines(a, b);
      return {
        latex: `d = ${formatNumber(approach.distance)}`,
        summary: `Shortest distance between ${a.label} and ${b.label}`,
        previewSegment: [approach.pointOnA, approach.pointOnB],
      };
    },
  },
];

const PLANE_SPHERE_OPS: OperationDef[] = [
  {
    id: "plane-sphere-cross-section",
    label: "Cross Section",
    run: (selected) => {
      const plane = selected.find((o) => o.kind === "plane");
      const sphere = selected.find((o) => o.kind === "sphere");
      if (!plane || plane.kind !== "plane" || !sphere || sphere.kind !== "sphere")
        throw new Error("expected a plane and a sphere");
      const centerDistance = distancePointToPlane(plane, sphere.center);
      const radius = crossSectionRadius(sphere.radius, centerDistance);
      if (radius === 0) {
        return {
          latex: "\\text{no intersection}",
          summary: `${plane.label} doesn't reach ${sphere.label}`,
        };
      }
      const footpoint = closestPointOnPlane(plane, sphere.center);
      return {
        latex: `r = \\sqrt{R^2 - d^2} = ${formatNumber(radius)}`,
        summary: `Cross-section of ${sphere.label} sliced by ${plane.label}`,
        previewCircle: { center: footpoint, radius, normal: plane.normal },
      };
    },
  },
];

const SEGMENT_SELF_OPS: OperationDef[] = [
  {
    id: "segment-length",
    label: "Length",
    run: ([a]) => {
      if (a.kind !== "segment") throw new Error("expected a segment");
      return {
        latex: `|${a.label}| = ${formatNumber(distance(a.a, a.b))}`,
        summary: `Length of ${a.label}`,
      };
    },
  },
];

const POINT_SEGMENT_OPS: OperationDef[] = [
  {
    id: "point-segment-distance",
    label: "Distance",
    run: (selected) => {
      const point = selected.find((o) => o.kind === "point");
      const segment = selected.find((o) => o.kind === "segment");
      if (!point || point.kind !== "point" || !segment || segment.kind !== "segment")
        throw new Error("expected a point and a segment");
      const d = distancePointToSegment(segment.a, segment.b, point.position);
      return {
        latex: `d = ${formatNumber(d)}`,
        summary: `Distance from ${point.label} to ${segment.label}`,
      };
    },
  },
  {
    id: "point-segment-closest",
    label: "Closest Point",
    run: (selected, existing) => {
      const point = selected.find((o) => o.kind === "point");
      const segment = selected.find((o) => o.kind === "segment");
      if (!point || point.kind !== "point" || !segment || segment.kind !== "segment")
        throw new Error("expected a point and a segment");
      const closest = closestPointOnSegment(segment.a, segment.b, point.position);
      return {
        latex: `(${closest.map((n) => formatNumber(n)).join(", ")})`,
        summary: `Closest point on ${segment.label} to ${point.label}`,
        newObject: newPoint(closest, existing),
      };
    },
  },
];

const RAY_PLANE_OPS: OperationDef[] = [
  {
    id: "ray-plane-intersection",
    label: "Find Intersection",
    run: (selected, existing) => {
      const ray = selected.find((o) => o.kind === "ray");
      const plane = selected.find((o) => o.kind === "plane");
      if (!ray || ray.kind !== "ray" || !plane || plane.kind !== "plane")
        throw new Error("expected a ray and a plane");
      const hit = rayIntersectsPlane(ray.point, ray.direction, plane);
      if (!hit) {
        return {
          latex: "\\text{no intersection}",
          summary: `${ray.label} doesn't hit ${plane.label} — it's parallel or pointing away from it`,
        };
      }
      return {
        latex: `(${hit.map((n) => formatNumber(n)).join(", ")})`,
        summary: `Where ${ray.label} hits ${plane.label}`,
        newObject: newPoint(hit, existing),
      };
    },
  },
];

const RAY_SPHERE_OPS: OperationDef[] = [
  {
    id: "ray-sphere-intersection",
    label: "Find Intersection",
    run: (selected, existing) => {
      const ray = selected.find((o) => o.kind === "ray");
      const sphere = selected.find((o) => o.kind === "sphere");
      if (!ray || ray.kind !== "ray" || !sphere || sphere.kind !== "sphere")
        throw new Error("expected a ray and a sphere");
      const hit = raySphereIntersection(
        ray.point,
        ray.direction,
        sphere.center,
        sphere.radius,
      );
      if (!hit) {
        return {
          latex: "\\text{no intersection}",
          summary: `${ray.label} misses ${sphere.label}, or ${sphere.label} is behind its origin`,
        };
      }
      return {
        latex: `(${hit.map((n) => formatNumber(n)).join(", ")})`,
        summary: `Where ${ray.label} first hits ${sphere.label}`,
        newObject: newPoint(hit, existing),
      };
    },
  },
];

const LINE_SEGMENT_OPS: OperationDef[] = [
  {
    id: "line-segment-angle",
    label: "Angle Between",
    run: ([a, b]) => angleBetweenOp(a, b),
  },
  {
    id: "line-segment-closest-approach",
    label: "Closest Approach",
    run: ([a, b]) => closestApproachOp(a, b),
  },
];

const SEGMENT_SEGMENT_OPS: OperationDef[] = [
  {
    id: "segment-segment-angle",
    label: "Angle Between",
    run: ([a, b]) => angleBetweenOp(a, b),
  },
  {
    id: "segment-segment-closest-approach",
    label: "Closest Approach",
    run: ([a, b]) => closestApproachOp(a, b),
  },
];

const RAY_RAY_OPS: OperationDef[] = [
  { id: "ray-ray-angle", label: "Angle Between", run: ([a, b]) => angleBetweenOp(a, b) },
  {
    id: "ray-ray-closest-approach",
    label: "Closest Approach",
    run: ([a, b]) => closestApproachOp(a, b),
  },
];

const RAY_LINE_OPS: OperationDef[] = [
  { id: "ray-line-angle", label: "Angle Between", run: ([a, b]) => angleBetweenOp(a, b) },
  {
    id: "ray-line-closest-approach",
    label: "Closest Approach",
    run: ([a, b]) => closestApproachOp(a, b),
  },
];

const VECTOR_RAY_OPS: OperationDef[] = [
  {
    id: "vector-ray-angle",
    label: "Angle Between",
    run: ([a, b]) => angleBetweenOp(a, b),
  },
];

const VECTOR_SEGMENT_OPS: OperationDef[] = [
  {
    id: "vector-segment-angle",
    label: "Angle Between",
    run: ([a, b]) => angleBetweenOp(a, b),
  },
];

const VECTOR_LINE_OPS: OperationDef[] = [
  {
    id: "vector-line-angle",
    label: "Angle Between",
    run: ([a, b]) => angleBetweenOp(a, b),
  },
];

const VECTOR_PLANE_OPS: OperationDef[] = [
  {
    id: "vector-plane-angle",
    label: "Angle Between",
    run: (selected) => {
      const vector = selected.find((o) => o.kind === "vector");
      const plane = selected.find((o) => o.kind === "plane");
      if (!vector || vector.kind !== "vector" || !plane || plane.kind !== "plane")
        throw new Error("expected a vector and a plane");
      const normalAngleDeg =
        (angleBetween(vector.direction, plane.normal) * 180) / Math.PI;
      const planeAngleDeg = Math.abs(90 - normalAngleDeg);
      return {
        latex: `\\theta = ${formatNumber(planeAngleDeg)}^\\circ`,
        summary: `Angle between ${vector.label} and the plane ${plane.label} itself (not its normal)`,
      };
    },
  },
];

const LINE_PLANE_OPS: OperationDef[] = [
  {
    id: "line-plane-intersection",
    label: "Find Intersection",
    run: (selected, existing) => {
      const line = selected.find((o) => o.kind === "line");
      const plane = selected.find((o) => o.kind === "plane");
      if (!line || line.kind !== "line" || !plane || plane.kind !== "plane")
        throw new Error("expected a line and a plane");
      const hit = lineIntersectsPlane(line, plane);
      if (!hit) {
        return {
          latex: "\\text{parallel}",
          summary: `${line.label} is parallel to ${plane.label} — no intersection`,
        };
      }
      return {
        latex: `(${hit.map((n) => formatNumber(n)).join(", ")})`,
        summary: `Where ${line.label} crosses ${plane.label}`,
        newObject: newPoint(hit, existing),
      };
    },
  },
];

const POINT_RAY_OPS: OperationDef[] = [
  {
    id: "point-ray-distance",
    label: "Distance",
    run: (selected) => {
      const point = selected.find((o) => o.kind === "point");
      const ray = selected.find((o) => o.kind === "ray");
      if (!point || point.kind !== "point" || !ray || ray.kind !== "ray")
        throw new Error("expected a point and a ray");
      const d = distancePointToRay(ray.point, ray.direction, point.position);
      return {
        latex: `d = ${formatNumber(d)}`,
        summary: `Distance from ${point.label} to ${ray.label}`,
      };
    },
  },
  {
    id: "point-ray-closest",
    label: "Closest Point",
    run: (selected, existing) => {
      const point = selected.find((o) => o.kind === "point");
      const ray = selected.find((o) => o.kind === "ray");
      if (!point || point.kind !== "point" || !ray || ray.kind !== "ray")
        throw new Error("expected a point and a ray");
      const closest = closestPointOnRay(ray.point, ray.direction, point.position);
      return {
        latex: `(${closest.map((n) => formatNumber(n)).join(", ")})`,
        summary: `Closest point on ${ray.label} to ${point.label}`,
        newObject: newPoint(closest, existing),
      };
    },
  },
];

const POINT_SPHERE_OPS: OperationDef[] = [
  {
    id: "point-sphere-distance",
    label: "Distance to Surface",
    run: (selected) => {
      const point = selected.find((o) => o.kind === "point");
      const sphere = selected.find((o) => o.kind === "sphere");
      if (!point || point.kind !== "point" || !sphere || sphere.kind !== "sphere")
        throw new Error("expected a point and a sphere");
      const gap = distance(point.position, sphere.center) - sphere.radius;
      return {
        latex: `d = ${formatNumber(Math.abs(gap))}`,
        summary:
          gap < 0
            ? `${point.label} is inside ${sphere.label}`
            : `${point.label} is outside ${sphere.label}`,
      };
    },
  },
];

const RAY_SEGMENT_OPS: OperationDef[] = [
  {
    id: "ray-segment-closest-approach",
    label: "Closest Approach",
    run: ([a, b]) => closestApproachOp(a, b),
  },
];

const SEGMENT_PLANE_OPS: OperationDef[] = [
  {
    id: "segment-plane-intersection",
    label: "Find Intersection",
    run: (selected, existing) => {
      const segment = selected.find((o) => o.kind === "segment");
      const plane = selected.find((o) => o.kind === "plane");
      if (!segment || segment.kind !== "segment" || !plane || plane.kind !== "plane")
        throw new Error("expected a segment and a plane");
      const hit = segmentIntersectsPlane(segment.a, segment.b, plane);
      if (!hit) {
        return {
          latex: "\\text{no intersection}",
          summary: `${segment.label} doesn't reach ${plane.label}`,
        };
      }
      return {
        latex: `(${hit.map((n) => formatNumber(n)).join(", ")})`,
        summary: `Where ${segment.label} crosses ${plane.label}`,
        newObject: newPoint(hit, existing),
      };
    },
  },
];

const SEGMENT_SPHERE_OPS: OperationDef[] = [
  {
    id: "segment-sphere-intersection",
    label: "Find Intersection",
    run: (selected, existing) => {
      const segment = selected.find((o) => o.kind === "segment");
      const sphere = selected.find((o) => o.kind === "sphere");
      if (!segment || segment.kind !== "segment" || !sphere || sphere.kind !== "sphere")
        throw new Error("expected a segment and a sphere");
      const hit = segmentSphereIntersection(
        segment.a,
        segment.b,
        sphere.center,
        sphere.radius,
      );
      if (!hit) {
        return {
          latex: "\\text{no intersection}",
          summary: `${segment.label} doesn't reach ${sphere.label}`,
        };
      }
      return {
        latex: `(${hit.map((n) => formatNumber(n)).join(", ")})`,
        summary: `Where ${segment.label} enters ${sphere.label}`,
        newObject: newPoint(hit, existing),
      };
    },
  },
];

const SPHERE_SPHERE_OPS: OperationDef[] = [
  {
    id: "sphere-sphere-distance",
    label: "Distance Between Surfaces",
    run: ([a, b]) => {
      if (a.kind !== "sphere" || b.kind !== "sphere")
        throw new Error("expected two spheres");
      const gap = distance(a.center, b.center) - a.radius - b.radius;
      return {
        latex: `d = ${formatNumber(Math.abs(gap))}`,
        summary:
          gap < 0
            ? `${a.label} and ${b.label} overlap`
            : `Gap between ${a.label} and ${b.label}`,
      };
    },
  },
];

const THREE_POINT_OPS: OperationDef[] = [
  {
    id: "three-points-plane",
    label: "Create Plane",
    run: ([a, b, c], existing) => {
      if (a.kind !== "point" || b.kind !== "point" || c.kind !== "point")
        throw new Error("expected three points");
      const plane = planeFromPoints(a.position, b.position, c.position);
      return {
        latex: `\\text{plane through } ${a.label}, ${b.label}, ${c.label}`,
        summary: "Plane defined by the three selected points",
        newObject: newPlane(plane.point, plane.normal, existing),
      };
    },
  },
];

export function getAvailableOperations(selected: SceneObject[]): OperationDef[] {
  if (selected.length === 1) {
    return selected[0].kind === "segment" ? SEGMENT_SELF_OPS : [];
  }
  if (selected.length === 3 && selected.every((o) => o.kind === "point"))
    return THREE_POINT_OPS;
  if (selected.length !== 2) return [];

  const kinds = selected
    .map((o) => o.kind)
    .sort()
    .join("-");
  switch (kinds) {
    case "vector-vector":
      return VECTOR_VECTOR_OPS;
    case "point-point":
      return POINT_POINT_OPS;
    case "line-point":
      return POINT_LINE_OPS;
    case "plane-point":
      return POINT_PLANE_OPS;
    case "plane-plane":
      return PLANE_PLANE_OPS;
    case "line-line":
      return LINE_LINE_OPS;
    case "plane-sphere":
      return PLANE_SPHERE_OPS;
    case "point-segment":
      return POINT_SEGMENT_OPS;
    case "plane-ray":
      return RAY_PLANE_OPS;
    case "ray-sphere":
      return RAY_SPHERE_OPS;
    case "line-segment":
      return LINE_SEGMENT_OPS;
    case "segment-segment":
      return SEGMENT_SEGMENT_OPS;
    case "ray-ray":
      return RAY_RAY_OPS;
    case "line-ray":
      return RAY_LINE_OPS;
    case "ray-vector":
      return VECTOR_RAY_OPS;
    case "segment-vector":
      return VECTOR_SEGMENT_OPS;
    case "line-vector":
      return VECTOR_LINE_OPS;
    case "plane-vector":
      return VECTOR_PLANE_OPS;
    case "line-plane":
      return LINE_PLANE_OPS;
    case "point-ray":
      return POINT_RAY_OPS;
    case "point-sphere":
      return POINT_SPHERE_OPS;
    case "ray-segment":
      return RAY_SEGMENT_OPS;
    case "plane-segment":
      return SEGMENT_PLANE_OPS;
    case "segment-sphere":
      return SEGMENT_SPHERE_OPS;
    case "sphere-sphere":
      return SPHERE_SPHERE_OPS;
    default:
      return [];
  }
}
