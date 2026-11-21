"use client";

import { useEffect, useMemo, useState } from "react";
import { Edges } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  OctahedronGeometry,
  TetrahedronGeometry,
  Vector3,
} from "three";
import { PALETTE } from "@/constants/theme";
import type { PolyhedronType } from "@/modules/polyhedra/types";

const EXPLODE_DISTANCE = 1.1;

function buildBaseGeometry(type: PolyhedronType): BufferGeometry {
  switch (type) {
    case "tetrahedron":
      return new TetrahedronGeometry(1.4);
    case "cube":
      return new BoxGeometry(1.8, 1.8, 1.8);
    case "octahedron":
      return new OctahedronGeometry(1.5);
    case "dodecahedron":
      return new DodecahedronGeometry(1.25);
    case "icosahedron":
      return new IcosahedronGeometry(1.4);
    case "prism":
      return new CylinderGeometry(1.1, 1.1, 1.7, 6);
    case "pyramid":
      return new ConeGeometry(1.3, 1.9, 4);
  }
}

interface FaceGroup {
  id: number;
  triangles: number[];
  direction: Vector3;
}

interface ProcessedGeometry {
  positions: Float32Array;
  triToGroup: number[];
  groups: FaceGroup[];
}

/**
 * Groups a primitive's triangles into logical polyhedron faces by rounding
 * each flat triangle normal to a shared key — two triangles with (almost)
 * the same outward normal are the same face (e.g. a cube's 2 triangles per
 * side, or a dodecahedron pentagon's 3-triangle fan). This lets one
 * mechanism drive face highlighting and explosion for every solid, without
 * hand-authoring per-solid face/vertex tables.
 */
function processGeometry(base: BufferGeometry): ProcessedGeometry {
  const nonIndexed = base.index ? base.toNonIndexed() : base;
  const posAttr = nonIndexed.getAttribute("position") as BufferAttribute;
  const triCount = posAttr.count / 3;

  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  const keyToGroup = new Map<string, FaceGroup>();
  const triToGroup: number[] = new Array(triCount);

  for (let t = 0; t < triCount; t++) {
    a.fromBufferAttribute(posAttr, t * 3);
    b.fromBufferAttribute(posAttr, t * 3 + 1);
    c.fromBufferAttribute(posAttr, t * 3 + 2);
    const normal = new Vector3()
      .subVectors(b, a)
      .cross(new Vector3().subVectors(c, a))
      .normalize();
    const key = `${normal.x.toFixed(2)},${normal.y.toFixed(2)},${normal.z.toFixed(2)}`;

    let group = keyToGroup.get(key);
    if (!group) {
      group = { id: keyToGroup.size, triangles: [], direction: normal.clone() };
      keyToGroup.set(key, group);
    }
    group.triangles.push(t);
    triToGroup[t] = group.id;
  }

  return {
    positions: (posAttr.array as Float32Array).slice(),
    triToGroup,
    groups: Array.from(keyToGroup.values()),
  };
}

interface PolyhedronMeshProps {
  type: PolyhedronType;
  /** 0 = intact solid, 1 = faces fully separated outward. */
  explode?: number;
  color?: string;
  highlightColor?: string;
  onFaceCountChange?: (count: number) => void;
  onSelectFace?: (faceId: number | null) => void;
}

/**
 * Renders any of the app's seven solids from one shared mechanism: build the
 * primitive geometry, group its triangles into logical faces, then offset
 * each face's vertices along its own normal by `explode` and tint the
 * hovered/selected face via per-vertex color.
 */
export default function PolyhedronMesh({
  type,
  explode = 0,
  color = PALETTE.primary,
  highlightColor = PALETTE.accent,
  onFaceCountChange,
  onSelectFace,
}: PolyhedronMeshProps) {
  const processed = useMemo(() => {
    const base = buildBaseGeometry(type);
    const result = processGeometry(base);
    base.dispose();
    return result;
  }, [type]);

  const [hoveredFace, setHoveredFace] = useState<number | null>(null);
  const [selectedFace, setSelectedFace] = useState<number | null>(null);

  const geometry = useMemo(() => {
    const { positions, triToGroup, groups } = processed;
    const out = new Float32Array(positions.length);
    const colors = new Float32Array(positions.length);
    const normals = new Float32Array(positions.length);

    const base = { r: 0, g: 0, b: 0 };
    const hi = { r: 0, g: 0, b: 0 };
    hexToRgb(color, base);
    hexToRgb(highlightColor, hi);

    const triCount = positions.length / 9;
    for (let t = 0; t < triCount; t++) {
      const groupId = triToGroup[t];
      const group = groups[groupId];
      const isActive = groupId === selectedFace || groupId === hoveredFace;
      const offset = explode * EXPLODE_DISTANCE;

      for (let k = 0; k < 3; k++) {
        const idx = (t * 3 + k) * 3;
        out[idx] = positions[idx] + group.direction.x * offset;
        out[idx + 1] = positions[idx + 1] + group.direction.y * offset;
        out[idx + 2] = positions[idx + 2] + group.direction.z * offset;

        normals[idx] = group.direction.x;
        normals[idx + 1] = group.direction.y;
        normals[idx + 2] = group.direction.z;

        const c = isActive ? hi : base;
        colors[idx] = c.r;
        colors[idx + 1] = c.g;
        colors[idx + 2] = c.b;
      }
    }

    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(out, 3));
    geo.setAttribute("normal", new Float32BufferAttribute(normals, 3));
    geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
    return geo;
  }, [processed, explode, selectedFace, hoveredFace, color, highlightColor]);

  useEffect(() => {
    onFaceCountChange?.(processed.groups.length);
  }, [processed, onFaceCountChange]);

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const faceIndex = e.faceIndex;
    if (faceIndex == null) return;
    setHoveredFace(processed.triToGroup[faceIndex]);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const faceIndex = e.faceIndex;
    if (faceIndex == null) return;
    const groupId = processed.triToGroup[faceIndex];
    const next = selectedFace === groupId ? null : groupId;
    setSelectedFace(next);
    onSelectFace?.(next);
  };

  return (
    <mesh
      geometry={geometry}
      castShadow
      receiveShadow
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setHoveredFace(null)}
      onClick={handleClick}
    >
      <meshStandardMaterial vertexColors roughness={0.4} metalness={0.15} />
      <Edges color={PALETTE.foreground} threshold={5} />
    </mesh>
  );
}

function hexToRgb(hex: string, out: { r: number; g: number; b: number }) {
  const clean = hex.replace("#", "");
  out.r = parseInt(clean.slice(0, 2), 16) / 255;
  out.g = parseInt(clean.slice(2, 4), 16) / 255;
  out.b = parseInt(clean.slice(4, 6), 16) / 255;
}
