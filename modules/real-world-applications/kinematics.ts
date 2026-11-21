import type { Vec3Tuple } from "@/types/math";
import {
  applyMatrixToPoint,
  composeMatrices,
  rotationMatrix,
  translationMatrix,
} from "@/math/transform";

export interface ArmPose {
  theta1: number;
  theta2: number;
  joint1: Vec3Tuple;
  end: Vec3Tuple;
  reachable: boolean;
}

/**
 * Forward kinematics for a 2-link planar arm swinging in the ground (x, z) plane,
 * built from the same homogeneous rotation/translation matrices as the
 * Transformations module — theta2 is relative to link 1's own frame.
 */
export function forwardKinematics(
  theta1: number,
  theta2: number,
  l1: number,
  l2: number,
): {
  joint1: Vec3Tuple;
  end: Vec3Tuple;
} {
  const joint1 = applyMatrixToPoint(rotationMatrix("y", theta1), [l1, 0, 0]);
  const totalTransform = composeMatrices(
    translationMatrix(joint1),
    rotationMatrix("y", theta1 + theta2),
  );
  const end = applyMatrixToPoint(totalTransform, [l2, 0, 0]);
  return { joint1, end };
}

/** Analytic (law-of-cosines) inverse kinematics for a 2-link planar arm, elbow-up solution. */
export function solveTwoLinkIK(
  targetX: number,
  targetZ: number,
  l1: number,
  l2: number,
): ArmPose {
  const rawDistance = Math.hypot(targetX, targetZ);
  const reachable = rawDistance <= l1 + l2 && rawDistance >= Math.abs(l1 - l2);
  const distance = Math.min(
    l1 + l2 - 1e-4,
    Math.max(Math.abs(l1 - l2) + 1e-4, rawDistance),
  );

  const cosTheta2 = (distance * distance - l1 * l1 - l2 * l2) / (2 * l1 * l2);
  const theta2 = Math.acos(Math.max(-1, Math.min(1, cosTheta2)));

  const targetAngle = Math.atan2(targetZ, targetX);
  const theta1 =
    targetAngle - Math.atan2(l2 * Math.sin(theta2), l1 + l2 * Math.cos(theta2));

  const { joint1, end } = forwardKinematics(theta1, theta2, l1, l2);
  return { theta1, theta2, joint1, end, reachable };
}
