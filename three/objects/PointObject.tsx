"use client";

import { useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Mesh, Plane, Vector3 } from "three";
import type { Vec3Tuple } from "@/types/math";
import { PALETTE } from "@/constants/theme";
import { cn } from "@/utils/cn";

interface PointObjectProps {
  position: Vec3Tuple;
  label?: string;
  color?: string;
  radius?: number;
  draggable?: boolean;
  /** Constrain dragging to the world XZ ground plane (y stays fixed) instead of a camera-facing plane. */
  dragOnGroundPlane?: boolean;
  /** Constrain dragging to a fixed plane through the point with this normal (overrides `dragOnGroundPlane`). */
  dragPlaneNormal?: Vec3Tuple;
  onDrag?: (next: Vec3Tuple) => void;
  onDragEnd?: (next: Vec3Tuple) => void;
  /** Fired the instant this handle is pressed, before any drag — for "clicking a handle also selects it" UIs. */
  onSelect?: () => void;
}

/**
 * Draggable point primitive shared by every module. Drag is implemented by
 * raycasting onto a plane facing the camera through the point's current
 * position — the standard R3F pattern for constrained free-form dragging
 * without pulling in a physics engine.
 */
export default function PointObject({
  position,
  label,
  color = PALETTE.primary,
  radius = 0.12,
  draggable = false,
  dragOnGroundPlane = false,
  dragPlaneNormal,
  onDrag,
  onDragEnd,
  onSelect,
}: PointObjectProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const { camera, raycaster, pointer } = useThree();
  const dragPlane = useRef(new Plane());
  const targetScale = useRef(1);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    targetScale.current = hovered || dragging ? 1.35 : 1;
    meshRef.current.scale.lerp(
      new Vector3(targetScale.current, targetScale.current, targetScale.current),
      Math.min(1, delta * 10),
    );
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!draggable) return;
    e.stopPropagation();
    onSelect?.();
    dragPlane.current.setFromNormalAndCoplanarPoint(
      dragPlaneNormal
        ? new Vector3(...dragPlaneNormal)
        : dragOnGroundPlane
          ? new Vector3(0, 1, 0)
          : camera.getWorldDirection(new Vector3()).negate(),
      new Vector3(...position),
    );
    setDragging(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging || !draggable) return;
    e.stopPropagation();
    raycaster.setFromCamera(pointer, camera);
    const hit = new Vector3();
    if (raycaster.ray.intersectPlane(dragPlane.current, hit)) {
      onDrag?.([hit.x, hit.y, hit.z]);
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging) return;
    e.stopPropagation();
    setDragging(false);
    onDragEnd?.(position);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        castShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = draggable ? "grab" : "default";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "default";
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered || dragging ? 0.9 : 0.35}
          roughness={0.3}
        />
      </mesh>
      {label && (
        <Html distanceFactor={10} position={[radius + 0.15, radius + 0.15, 0]}>
          <span
            className={cn(
              "bg-background/80 text-foreground rounded-md px-1.5 py-0.5 font-mono text-xs backdrop-blur-sm select-none",
            )}
          >
            {label}
          </span>
        </Html>
      )}
    </group>
  );
}
