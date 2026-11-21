/** Plain [x, y, z] tuple used at API boundaries (serializable, framework-agnostic). */
export type Vec3Tuple = [number, number, number];

export type Vec2Tuple = [number, number];

/** 3x3 matrix stored row-major as a flat 9-length array. */
export type Mat3 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

/** 4x4 matrix stored row-major as a flat 16-length array. */
export type Mat4 = number[];

export interface Point3 {
  id: string;
  position: Vec3Tuple;
  label?: string;
}

export interface Vector3Def {
  id: string;
  origin: Vec3Tuple;
  direction: Vec3Tuple;
  label?: string;
}

export interface LineDef {
  id: string;
  point: Vec3Tuple;
  direction: Vec3Tuple;
  label?: string;
}

export interface PlaneDef {
  id: string;
  point: Vec3Tuple;
  normal: Vec3Tuple;
  label?: string;
}
