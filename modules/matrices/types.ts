import type { Vec3Tuple } from "@/types/math";
import {
  columnsOf3x3,
  linearPart,
  reflectionMatrix,
  rotationMatrix,
  scaleMatrix,
} from "@/math/transform";

export interface BasisPreset {
  id: string;
  label: string;
  i: Vec3Tuple;
  j: Vec3Tuple;
  k: Vec3Tuple;
}

const identity = columnsOf3x3(linearPart(scaleMatrix([1, 1, 1])));
const rotateY90 = columnsOf3x3(linearPart(rotationMatrix("y", Math.PI / 2)));
const scale = columnsOf3x3(linearPart(scaleMatrix([1.6, 0.6, 1.2])));
const reflectX = columnsOf3x3(linearPart(reflectionMatrix("x")));

export const BASIS_PRESETS: BasisPreset[] = [
  { id: "identity", label: "Identity", i: identity[0], j: identity[1], k: identity[2] },
  {
    id: "rotate",
    label: "Rotate Y 90°",
    i: rotateY90[0],
    j: rotateY90[1],
    k: rotateY90[2],
  },
  { id: "scale", label: "Scale", i: scale[0], j: scale[1], k: scale[2] },
  { id: "reflect", label: "Reflect X", i: reflectX[0], j: reflectX[1], k: reflectX[2] },
];
