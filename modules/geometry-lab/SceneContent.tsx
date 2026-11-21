"use client";

import { Fragment, useEffect, useState } from "react";
import { Line } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import LineObject from "@/three/objects/LineObject";
import PlaneObject from "@/three/objects/PlaneObject";
import { PALETTE } from "@/constants/theme";
import { add, subtract, distance } from "@/math/vector";
import type { Vec3Tuple } from "@/types/math";
import { useSceneStore, type SceneObject } from "@/store/useSceneStore";
import type { ToolId } from "@/modules/geometry-lab/types";
import { anchorPointsOf } from "@/modules/geometry-lab/types";
import { snapPoint } from "@/modules/geometry-lab/snapping";

interface SceneContentProps {
  tool: ToolId;
  pendingPoints: Vec3Tuple[];
  onPlaceClick: (point: Vec3Tuple) => void;
}

const HANDLE_RADIUS = 0.1;
const SELECT_HIGHLIGHT = PALETTE.accent;

/** Tracks the shift key as state so handle clicks can multi-select without threading a native event through PointObject's onSelect. */
function useShiftKeyDown() {
  const [shiftDown, setShiftDown] = useState(false);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftDown(true);
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftDown(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  return shiftDown;
}

export default function SceneContent({
  tool,
  pendingPoints,
  onPlaceClick,
}: SceneContentProps) {
  const objects = useSceneStore((s) => s.objects);
  const order = useSceneStore((s) => s.order);
  const selectedIds = useSceneStore((s) => s.selectedIds);
  const select = useSceneStore((s) => s.select);
  const toggleSelect = useSceneStore((s) => s.toggleSelect);
  const updateObject = useSceneStore((s) => s.updateObject);
  const shiftDown = useShiftKeyDown();

  const isPlacing = tool !== "select";

  const selectWithModifier = (id: string) => {
    if (shiftDown) toggleSelect(id);
    else select(id);
  };

  const handleBodyClick = (e: ThreeEvent<PointerEvent>, id: string) => {
    e.stopPropagation();
    if (isPlacing) {
      const snapped = snapPoint(
        [e.point.x, e.point.y, e.point.z],
        anchorPointsOf(objects),
      );
      onPlaceClick(snapped);
      return;
    }
    selectWithModifier(id);
  };

  const groundClick = (e: ThreeEvent<PointerEvent>) => {
    if (!isPlacing) {
      select(null);
      return;
    }
    e.stopPropagation();
    const snapped = snapPoint([e.point.x, e.point.y, e.point.z], anchorPointsOf(objects));
    onPlaceClick(snapped);
  };

  return (
    <>
      {/* Invisible ground catcher: click-to-deselect in Select mode, click-to-place otherwise. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} onPointerDown={groundClick} visible={false}>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial />
      </mesh>

      {pendingPoints.length > 0 && (
        <>
          <Line
            points={[...pendingPoints, pendingPoints[pendingPoints.length - 1]]}
            color={PALETTE.warning}
            dashed
          />
          {pendingPoints.map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.07, 12, 12]} />
              <meshBasicMaterial color={PALETTE.warning} />
            </mesh>
          ))}
        </>
      )}

      {order.map((id) => {
        const obj = objects[id];
        if (!obj) return null;
        const isSelected = selectedIds.includes(id);
        const color = isSelected ? SELECT_HIGHLIGHT : obj.color;
        return (
          <Fragment key={id}>
            {renderObject(obj, color, isSelected, {
              onBodyClick: (e) => handleBodyClick(e, id),
              onSelect: () => selectWithModifier(id),
              onDrag: (patch) => updateObject(id, patch),
            })}
          </Fragment>
        );
      })}
    </>
  );
}

interface RenderCallbacks {
  onBodyClick: (e: ThreeEvent<PointerEvent>) => void;
  onSelect: () => void;
  onDrag: (patch: Partial<SceneObject>) => void;
}

function renderObject(
  obj: SceneObject,
  color: string,
  isSelected: boolean,
  { onBodyClick, onSelect, onDrag }: RenderCallbacks,
) {
  switch (obj.kind) {
    case "point":
      return (
        <PointObject
          position={obj.position}
          label={obj.label}
          color={color}
          radius={isSelected ? 0.15 : 0.12}
          draggable
          onSelect={onSelect}
          onDrag={(next) => onDrag({ position: next })}
        />
      );

    case "vector": {
      const tip = add(obj.origin, obj.direction);
      return (
        <>
          <VectorArrow
            origin={obj.origin}
            direction={obj.direction}
            color={color}
            label={obj.label}
          />
          <PointObject
            position={obj.origin}
            color={color}
            radius={HANDLE_RADIUS}
            draggable
            onSelect={onSelect}
            onDrag={(next) => onDrag({ origin: next, direction: subtract(tip, next) })}
          />
          <PointObject
            position={tip}
            color={color}
            radius={HANDLE_RADIUS}
            draggable
            onSelect={onSelect}
            onDrag={(next) => onDrag({ direction: subtract(next, obj.origin) })}
          />
        </>
      );
    }

    case "line": {
      const second = add(obj.point, obj.direction);
      return (
        <>
          <LineObject point={obj.point} direction={obj.direction} color={color} />
          <PointObject
            position={obj.point}
            color={color}
            radius={HANDLE_RADIUS}
            label={obj.label}
            draggable
            onSelect={onSelect}
            onDrag={(next) => onDrag({ point: next, direction: subtract(second, next) })}
          />
          <PointObject
            position={second}
            color={color}
            radius={HANDLE_RADIUS}
            draggable
            onSelect={onSelect}
            onDrag={(next) => onDrag({ direction: subtract(next, obj.point) })}
          />
        </>
      );
    }

    case "ray": {
      const tip = add(obj.point, obj.direction);
      const far: Vec3Tuple = [
        obj.point[0] + obj.direction[0] * 8,
        obj.point[1] + obj.direction[1] * 8,
        obj.point[2] + obj.direction[2] * 8,
      ];
      return (
        <>
          <Line points={[obj.point, far]} color={color} lineWidth={2} />
          <PointObject
            position={obj.point}
            color={color}
            radius={HANDLE_RADIUS}
            label={obj.label}
            draggable
            onSelect={onSelect}
            onDrag={(next) => onDrag({ point: next, direction: subtract(tip, next) })}
          />
          <PointObject
            position={tip}
            color={color}
            radius={HANDLE_RADIUS}
            draggable
            onSelect={onSelect}
            onDrag={(next) => onDrag({ direction: subtract(next, obj.point) })}
          />
        </>
      );
    }

    case "segment": {
      return (
        <>
          <Line points={[obj.a, obj.b]} color={color} lineWidth={2.5} />
          <PointObject
            position={obj.a}
            color={color}
            radius={HANDLE_RADIUS}
            label={obj.label}
            draggable
            onSelect={onSelect}
            onDrag={(next) => onDrag({ a: next })}
          />
          <PointObject
            position={obj.b}
            color={color}
            radius={HANDLE_RADIUS}
            draggable
            onSelect={onSelect}
            onDrag={(next) => onDrag({ b: next })}
          />
        </>
      );
    }

    case "plane": {
      const handle = add(obj.point, obj.normal);
      return (
        <>
          <PlaneObject point={obj.point} normal={obj.normal} color={color} size={3.5} />
          <PointObject
            position={obj.point}
            color={color}
            radius={HANDLE_RADIUS}
            label={obj.label}
            draggable
            onSelect={onSelect}
            onDrag={(next) => onDrag({ point: next })}
          />
          <PointObject
            position={handle}
            color={color}
            radius={HANDLE_RADIUS}
            draggable
            onSelect={onSelect}
            onDrag={(next) => onDrag({ normal: subtract(next, obj.point) })}
          />
        </>
      );
    }

    case "sphere": {
      const handle: Vec3Tuple = [
        obj.center[0] + obj.radius,
        obj.center[1],
        obj.center[2],
      ];
      return (
        <>
          <mesh
            position={obj.center}
            onPointerDown={onBodyClick}
            castShadow
            receiveShadow
          >
            <sphereGeometry args={[obj.radius, 40, 28]} />
            <meshStandardMaterial
              color={color}
              roughness={0.45}
              transparent
              opacity={0.65}
            />
          </mesh>
          <PointObject
            position={obj.center}
            color={color}
            radius={HANDLE_RADIUS}
            label={obj.label}
            draggable
            onSelect={onSelect}
            onDrag={(next) => onDrag({ center: next })}
          />
          <PointObject
            position={handle}
            color={color}
            radius={HANDLE_RADIUS}
            draggable
            onSelect={onSelect}
            onDrag={(next) =>
              onDrag({ radius: Math.max(0.15, distance(next, obj.center)) })
            }
          />
        </>
      );
    }

    case "cube": {
      const half = obj.size / 2;
      const handle: Vec3Tuple = [
        obj.center[0] + half,
        obj.center[1] + half,
        obj.center[2] + half,
      ];
      return (
        <>
          <mesh
            position={obj.center}
            onPointerDown={onBodyClick}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[obj.size, obj.size, obj.size]} />
            <meshStandardMaterial
              color={color}
              roughness={0.5}
              transparent
              opacity={0.65}
            />
          </mesh>
          <PointObject
            position={obj.center}
            color={color}
            radius={HANDLE_RADIUS}
            label={obj.label}
            draggable
            onSelect={onSelect}
            onDrag={(next) => onDrag({ center: next })}
          />
          <PointObject
            position={handle}
            color={color}
            radius={HANDLE_RADIUS}
            draggable
            onSelect={onSelect}
            onDrag={(next) =>
              onDrag({
                size: Math.max(0.3, (2 * distance(next, obj.center)) / Math.sqrt(3)),
              })
            }
          />
        </>
      );
    }
  }
}
