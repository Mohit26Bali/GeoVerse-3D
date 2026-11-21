import type { GuidedStep } from "@/hooks/useGuidedSequence";
import type { Vec3Tuple } from "@/types/math";
import type { MatrixData } from "@/math/matrix";
import { determinant, inverse, multiplyMatrices } from "@/math/matrix";
import {
  columnsOf3x3,
  linearPart,
  matrixFromColumns,
  reflectionMatrix,
  rotationMatrix,
  scaleMatrix,
} from "@/math/transform";
import { formatNumber, matrixToLatex } from "@/math/format";

export interface MatrixStep extends GuidedStep {
  cameraTarget: Vec3Tuple;
  cameraDistance: number;
  i: Vec3Tuple;
  j: Vec3Tuple;
  k: Vec3Tuple;
  latex: string;
}

const IDENTITY_COLS = columnsOf3x3(linearPart(scaleMatrix([1, 1, 1])));
const ROTATE_COLS = columnsOf3x3(linearPart(rotationMatrix("y", Math.PI / 2)));
const SCALE_COLS = columnsOf3x3(linearPart(scaleMatrix([1.7, 0.5, 1.3])));
const REFLECT_COLS = columnsOf3x3(linearPart(reflectionMatrix("x")));
const DET_DEMO_COLS = columnsOf3x3(linearPart(scaleMatrix([1.8, 1.4, 0.9])));

const detDemoMatrix = matrixFromColumns(...DET_DEMO_COLS);
const detDemoValue = determinant(detDemoMatrix);

const INVERSE_COLS = columnsOf3x3(linearPart(rotationMatrix("z", Math.PI / 4)));
const inverseDemoMatrix = matrixFromColumns(...INVERSE_COLS);
const inverseDemo = inverse(inverseDemoMatrix) as MatrixData;

const A_MATRIX = matrixFromColumns(
  ...columnsOf3x3(linearPart(rotationMatrix("y", Math.PI / 2))),
);
const B_MATRIX = matrixFromColumns(...columnsOf3x3(linearPart(scaleMatrix([1.6, 1, 1]))));
const AB_MATRIX = multiplyMatrices(A_MATRIX, B_MATRIX);
const BA_MATRIX = multiplyMatrices(B_MATRIX, A_MATRIX);
const AB_COLS = columnsOf3x3(AB_MATRIX);

export const MATRIX_GUIDED_STEPS: MatrixStep[] = [
  {
    id: "basis",
    title: "A matrix is where basis vectors land",
    description:
      "Start with î, ĵ, k̂ at their standard positions — this is the identity matrix. Every column of a matrix is simply where one basis vector ends up.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 8,
    i: IDENTITY_COLS[0],
    j: IDENTITY_COLS[1],
    k: IDENTITY_COLS[2],
    latex: matrixToLatex(matrixFromColumns(...IDENTITY_COLS)),
    duration: 6,
  },
  {
    id: "rotation",
    title: "Rotation matrix",
    description:
      "Rotating î, ĵ, k̂ together by the same angle produces a rotation matrix — lengths and angles between them are preserved.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 8,
    i: ROTATE_COLS[0],
    j: ROTATE_COLS[1],
    k: ROTATE_COLS[2],
    latex: matrixToLatex(matrixFromColumns(...ROTATE_COLS)),
    duration: 7,
  },
  {
    id: "scaling",
    title: "Scaling matrix",
    description:
      "Stretching each basis vector independently along its own axis gives a scaling matrix — diagonal, since î only affects the first column, and so on.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 9,
    i: SCALE_COLS[0],
    j: SCALE_COLS[1],
    k: SCALE_COLS[2],
    latex: matrixToLatex(matrixFromColumns(...SCALE_COLS)),
    duration: 7,
  },
  {
    id: "reflection",
    title: "Reflection matrix",
    description:
      "Flipping î to the opposite side of the origin mirrors the whole space — the parallelepiped turns red, signaling that orientation (handedness) has flipped.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 8,
    i: REFLECT_COLS[0],
    j: REFLECT_COLS[1],
    k: REFLECT_COLS[2],
    latex: matrixToLatex(matrixFromColumns(...REFLECT_COLS)),
    duration: 6,
  },
  {
    id: "determinant",
    title: "The determinant as volume",
    description:
      "The determinant is the signed volume of the parallelepiped î, ĵ, k̂ span. Here it's larger than 1, since this matrix expands space.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 9,
    i: DET_DEMO_COLS[0],
    j: DET_DEMO_COLS[1],
    k: DET_DEMO_COLS[2],
    latex: `\\det(M) = ${formatNumber(detDemoValue)}`,
    duration: 7,
  },
  {
    id: "inverse",
    title: "The inverse matrix",
    description:
      "M⁻¹ is the matrix that sends the transformed basis vectors back to î, ĵ, k̂ — undoing M exactly.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 8,
    i: INVERSE_COLS[0],
    j: INVERSE_COLS[1],
    k: INVERSE_COLS[2],
    latex: `M^{-1} = ${matrixToLatex(inverseDemo)}`,
    duration: 7,
  },
  {
    id: "composition",
    title: "Composition: order matters",
    description:
      "Applying rotation then scaling (AB) gives a different result than scaling then rotation (BA) — matrix multiplication is not commutative.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 9,
    i: AB_COLS[0],
    j: AB_COLS[1],
    k: AB_COLS[2],
    latex: `AB = ${matrixToLatex(AB_MATRIX)} \\qquad BA = ${matrixToLatex(BA_MATRIX)}`,
    duration: 8,
  },
  {
    id: "grid",
    title: "The transformed grid",
    description:
      "Zooming out, the same matrix bends the entire plane — every straight line stays straight, and the grid spacing shows the scaling and shearing at a glance.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 16,
    i: DET_DEMO_COLS[0],
    j: DET_DEMO_COLS[1],
    k: DET_DEMO_COLS[2],
    latex: matrixToLatex(detDemoMatrix),
    duration: 8,
  },
];
