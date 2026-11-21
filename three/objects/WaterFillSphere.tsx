"use client";

import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { DoubleSide, Plane, Vector3 } from "three";
import { PALETTE } from "@/constants/theme";
import { crossSectionRadius } from "@/math/sphere";

interface WaterFillSphereProps {
  radius: number;
  /** 0 = empty, 2*radius = full, measured from the bottom of the sphere. */
  fillHeight: number;
  color?: string;
}

/**
 * A glass sphere with "water" filled to `fillHeight`. The water's curved
 * shell uses a material clipping plane (three.js's built-in cross-section
 * feature) so it cuts off exactly at the waterline; a separate flat disc at
 * that same height fills in the cut with a water-surface cap.
 */
export default function WaterFillSphere({
  radius,
  fillHeight,
  color = PALETTE.accent,
}: WaterFillSphereProps) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const prev = gl.localClippingEnabled;
    // WebGLRenderer.localClippingEnabled is a plain imperative renderer
    // setting (like object3D.visible) — there is no non-mutating way to
    // toggle it, so it's exempt from the "don't mutate a hook return" rule.
    // eslint-disable-next-line react-hooks/immutability
    gl.localClippingEnabled = true;
    return () => {
      gl.localClippingEnabled = prev;
    };
  }, [gl]);

  const plane = useMemo(
    () => new Plane(new Vector3(0, -1, 0), fillHeight - radius),
    [fillHeight, radius],
  );
  const capRadius = crossSectionRadius(radius, radius - fillHeight);
  const capY = fillHeight - radius;

  return (
    <group>
      <mesh>
        <sphereGeometry args={[radius, 48, 32]} />
        <meshStandardMaterial
          color={PALETTE.foreground}
          roughness={0.05}
          metalness={0.1}
          transparent
          opacity={0.08}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {fillHeight > 0.001 && (
        <mesh>
          <sphereGeometry args={[radius, 48, 32]} />
          <meshStandardMaterial
            color={color}
            roughness={0.15}
            metalness={0.05}
            transparent
            opacity={0.85}
            side={DoubleSide}
            clippingPlanes={[plane]}
          />
        </mesh>
      )}

      {capRadius > 0.001 && (
        <mesh position={[0, capY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[capRadius, 48]} />
          <meshStandardMaterial
            color={color}
            roughness={0.05}
            metalness={0.1}
            transparent
            opacity={0.95}
            side={DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
