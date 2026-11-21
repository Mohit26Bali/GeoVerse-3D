"use client";

import { useCallback, useMemo, useState } from "react";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import ParallelepipedMesh from "@/three/objects/ParallelepipedMesh";
import ControlPanel from "@/components/panels/ControlPanel";
import StatReadout from "@/components/panels/StatReadout";
import Equation from "@/components/ui/Equation";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { AXIS_COLORS, PALETTE } from "@/constants/theme";
import { useAnimatedPosition } from "@/hooks/useAnimatedPosition";
import type { Vec3Tuple } from "@/types/math";
import { distance as distanceBetween } from "@/math/vector";
import { matrixFromColumns } from "@/math/transform";
import { matrixToLatex } from "@/math/format";

const TOLERANCE = 0.35;

function randomBasis(): [Vec3Tuple, Vec3Tuple, Vec3Tuple] {
  const rand = (range: number) => Math.round((Math.random() * range * 2 - range) * 2) / 2;
  const nonzero = (v: number) => (v === 0 ? 0.5 : v);
  return [
    [nonzero(rand(1.5)), rand(1), rand(1)],
    [rand(1), nonzero(rand(1.5)), rand(1)],
    [rand(1), rand(1), nonzero(rand(1.5))],
  ];
}

export default function PracticeView() {
  const [target, setTarget] = useState<[Vec3Tuple, Vec3Tuple, Vec3Tuple]>(() =>
    randomBasis(),
  );
  const {
    position: i,
    setPosition: setI,
    animateTo: animateI,
  } = useAnimatedPosition([1, 0, 0]);
  const {
    position: j,
    setPosition: setJ,
    animateTo: animateJ,
  } = useAnimatedPosition([0, 1, 0]);
  const {
    position: k,
    setPosition: setK,
    animateTo: animateK,
  } = useAnimatedPosition([0, 0, 1]);
  const [solved, setSolved] = useState(false);
  const [demoed, setDemoed] = useState(false);
  const [streak, setStreak] = useState(0);

  const [targetI, targetJ, targetK] = target;
  const distI = distanceBetween(i, targetI);
  const distJ = distanceBetween(j, targetJ);
  const distK = distanceBetween(k, targetK);
  const maxDist = Math.max(distI, distJ, distK);

  const targetMatrix = useMemo(() => matrixFromColumns(...target), [target]);

  const checkSolved = useCallback(
    (nextI: Vec3Tuple, nextJ: Vec3Tuple, nextK: Vec3Tuple) => {
      const allClose =
        distanceBetween(nextI, targetI) < TOLERANCE &&
        distanceBetween(nextJ, targetJ) < TOLERANCE &&
        distanceBetween(nextK, targetK) < TOLERANCE;
      if (allClose && !solved) {
        setSolved(true);
        setDemoed(false);
        setStreak((s) => s + 1);
      }
    },
    [targetI, targetJ, targetK, solved],
  );

  const handleIDrag = useCallback(
    (next: Vec3Tuple) => {
      setI(next);
      checkSolved(next, j, k);
    },
    [setI, checkSolved, j, k],
  );
  const handleJDrag = useCallback(
    (next: Vec3Tuple) => {
      setJ(next);
      checkSolved(i, next, k);
    },
    [setJ, checkSolved, i, k],
  );
  const handleKDrag = useCallback(
    (next: Vec3Tuple) => {
      setK(next);
      checkSolved(i, j, next);
    },
    [setK, checkSolved, i, j],
  );

  const nextChallenge = useCallback(() => {
    setTarget(randomBasis());
    setI([1, 0, 0]);
    setJ([0, 1, 0]);
    setK([0, 0, 1]);
    setSolved(false);
    setDemoed(false);
  }, [setI, setJ, setK]);

  const showMe = useCallback(() => {
    animateI(targetI, 1.2);
    animateJ(targetJ, 1.2);
    animateK(targetK, 1.2, () => setDemoed(true));
  }, [animateI, animateJ, animateK, targetI, targetJ, targetK]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <ParallelepipedMesh
          a={targetI}
          b={targetJ}
          c={targetK}
          color={PALETTE.warning}
          opacity={0.12}
        />
        <ParallelepipedMesh
          a={i}
          b={j}
          c={k}
          color={solved ? PALETTE.success : PALETTE.primary}
        />
        <VectorArrow origin={[0, 0, 0]} direction={i} color={AXIS_COLORS.x} />
        <VectorArrow origin={[0, 0, 0]} direction={j} color={AXIS_COLORS.y} />
        <VectorArrow origin={[0, 0, 0]} direction={k} color={AXIS_COLORS.z} />
        <PointObject
          position={i}
          label="î"
          color={AXIS_COLORS.x}
          radius={0.13}
          draggable
          onDrag={handleIDrag}
        />
        <PointObject
          position={j}
          label="ĵ"
          color={AXIS_COLORS.y}
          radius={0.13}
          draggable
          onDrag={handleJDrag}
        />
        <PointObject
          position={k}
          label="k̂"
          color={AXIS_COLORS.z}
          radius={0.13}
          draggable
          onDrag={handleKDrag}
        />
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel
            title="Match the target matrix"
            footer={
              <Equation latex={`\\text{Target} = ${matrixToLatex(targetMatrix)}`} block />
            }
          >
            <StatReadout label="Largest vector error" value={maxDist} />
            {solved ? (
              <Badge tone="success">Solved!</Badge>
            ) : demoed ? (
              <Badge tone="neutral">Demo — now try it</Badge>
            ) : (
              <Badge tone="neutral">Streak {streak}</Badge>
            )}
            <p className="text-muted text-xs leading-relaxed">
              Drag î, ĵ, and k̂ until the solid parallelepiped fills the amber target
              outline. Left-drag empty space to orbit and adjust depth.
            </p>
            <div className="flex gap-2">
              {solved ? (
                <Button size="sm" onClick={nextChallenge}>
                  Next challenge
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={showMe}>
                  Show me
                </Button>
              )}
            </div>
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
