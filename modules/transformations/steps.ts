import type { GuidedStep } from "@/hooks/useGuidedSequence";
import type { Vec3Tuple } from "@/types/math";
import type { MatrixData } from "@/math/matrix";
import {
  IDENTITY_4,
  composeMatrices,
  reflectionMatrix,
  rotationMatrix,
  scaleMatrix,
  shearMatrix,
  translationMatrix,
} from "@/math/transform";
import { matrixToLatex } from "@/math/format";

export interface TransformStep extends GuidedStep {
  cameraTarget: Vec3Tuple;
  cameraDistance: number;
  matrix: MatrixData;
  latex: string;
}

const TRANSLATE_VEC: Vec3Tuple = [1.5, 0.8, 1];
const SCALE_VEC: Vec3Tuple = [1.6, 0.5, 1.2];
const ROTATE_ANGLE = (75 * Math.PI) / 180;

export const TRANSFORM_GUIDED_STEPS: TransformStep[] = [
  {
    id: "intro",
    title: "What is a transformation?",
    description:
      "A transformation moves every point of a shape at once, following one consistent rule. This tetrahedron's colored vertices make it easy to track how each point moves.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 8,
    matrix: IDENTITY_4,
    latex: matrixToLatex(IDENTITY_4),
    duration: 6,
  },
  {
    id: "translation",
    title: "Translation",
    description:
      'Translation shifts every point by the same vector t. It\'s the simplest transform, but — as the last step shows — not technically "linear" on its own.',
    cameraTarget: TRANSLATE_VEC,
    cameraDistance: 9,
    matrix: translationMatrix(TRANSLATE_VEC),
    latex: matrixToLatex(translationMatrix(TRANSLATE_VEC)),
    duration: 7,
  },
  {
    id: "scaling",
    title: "Scaling",
    description:
      "Scaling stretches or shrinks along each axis independently — a diagonal matrix, since each output coordinate depends only on the matching input coordinate.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 9,
    matrix: scaleMatrix(SCALE_VEC),
    latex: matrixToLatex(scaleMatrix(SCALE_VEC)),
    duration: 7,
  },
  {
    id: "rotation",
    title: "Rotation",
    description:
      "Rotation turns the shape about an axis, preserving its size and shape. Notice the off-diagonal sine/cosine terms that mix the two perpendicular axes.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 9,
    matrix: rotationMatrix("y", ROTATE_ANGLE),
    latex: matrixToLatex(rotationMatrix("y", ROTATE_ANGLE)),
    duration: 7,
  },
  {
    id: "reflection",
    title: "Reflection",
    description:
      "Reflection mirrors the shape across a plane — the same as scaling by -1 along the perpendicular axis, flipping its orientation (handedness).",
    cameraTarget: [0, 0, 0],
    cameraDistance: 9,
    matrix: reflectionMatrix("x"),
    latex: matrixToLatex(reflectionMatrix("x")),
    duration: 6,
  },
  {
    id: "shear",
    title: "Shearing",
    description:
      "Shear shifts one axis in proportion to another, skewing the shape without changing its volume — the off-diagonal entry does all the work.",
    cameraTarget: [0, 0, 0],
    cameraDistance: 9,
    matrix: shearMatrix("xy", 1),
    latex: matrixToLatex(shearMatrix("xy", 1)),
    duration: 7,
  },
  {
    id: "homogeneous",
    title: "Homogeneous coordinates",
    description:
      'Adding a 4th "w = 1" coordinate lets translation join the linear transforms in one 4x4 matrix — so a whole chain of transforms is just matrix multiplication, in order.',
    cameraTarget: TRANSLATE_VEC,
    cameraDistance: 10,
    matrix: composeMatrices(
      translationMatrix(TRANSLATE_VEC),
      rotationMatrix("y", ROTATE_ANGLE),
    ),
    latex: matrixToLatex(
      composeMatrices(
        translationMatrix(TRANSLATE_VEC),
        rotationMatrix("y", ROTATE_ANGLE),
      ),
    ),
    duration: 8,
  },
];
