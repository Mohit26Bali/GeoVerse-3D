"use client";

import { useCallback, useMemo, useState } from "react";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import LineObject from "@/three/objects/LineObject";
import TransformedGrid from "@/three/objects/TransformedGrid";
import ControlPanel from "@/components/panels/ControlPanel";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { PALETTE } from "@/constants/theme";
import { apply2, toMat2, type Vec2 } from "@/math/linearAlgebra2x2";
import {
  embedMat2InXZPlane,
  toVec3,
  randomVec2,
} from "@/modules/linear-algebra-playground/types";
import {
  checkEigenSolved,
  checkNullSpaceSolved,
  checkRankSolved,
  checkSpanSolved,
  generateRound,
  randomTopic,
  type Round,
} from "@/modules/linear-algebra-playground/rounds";

function isSolved(round: Round, a: Vec2, b: Vec2): boolean {
  switch (round.kind) {
    case "eigen":
      return checkEigenSolved(round, a);
    case "span":
      return checkSpanSolved(round, a);
    case "rank":
      return checkRankSolved(round, a, b);
    case "null-space":
      return checkNullSpaceSolved(round, a, b);
  }
}

export default function PracticeView() {
  const [round, setRound] = useState<Round>(() => generateRound(randomTopic()));
  const [a, setA] = useState<Vec2>(() => randomVec2(1.8));
  const [b, setB] = useState<Vec2>(() => randomVec2(1.8));
  const [solved, setSolved] = useState(false);
  const [streak, setStreak] = useState(0);

  const usesBothVectors = round.kind === "rank" || round.kind === "null-space";
  const matrix = useMemo(() => toMat2(a, b), [a, b]);
  const embedded = useMemo(() => embedMat2InXZPlane(matrix), [matrix]);

  const handleDragA = useCallback(
    (next: Vec2) => {
      setA(next);
      const nowSolved = isSolved(round, next, b);
      if (nowSolved && !solved) {
        setSolved(true);
        setStreak((s) => s + 1);
      }
    },
    [round, b, solved],
  );

  const handleDragB = useCallback(
    (next: Vec2) => {
      setB(next);
      const nowSolved = isSolved(round, a, next);
      if (nowSolved && !solved) {
        setSolved(true);
        setStreak((s) => s + 1);
      }
    },
    [round, a, solved],
  );

  const nextRound = useCallback(() => {
    const nextTopic = randomTopic(round.kind);
    setRound(generateRound(nextTopic));
    setA(randomVec2(1.8));
    setB(randomVec2(1.8));
    setSolved(false);
  }, [round.kind]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        {usesBothVectors ? (
          <>
            <TransformedGrid matrix={embedded} color={PALETTE.border} />
            <VectorArrow
              origin={[0, 0, 0]}
              direction={toVec3(a)}
              color={PALETTE.primary}
            />
            <VectorArrow
              origin={[0, 0, 0]}
              direction={toVec3(b)}
              color={PALETTE.secondary}
            />
            <PointObject
              position={toVec3(a)}
              label="î"
              color={solved ? PALETTE.success : PALETTE.primary}
              radius={0.12}
              draggable
              dragOnGroundPlane
              onDrag={(next) => handleDragA([next[0], next[2]])}
            />
            <PointObject
              position={toVec3(b)}
              label="ĵ"
              color={solved ? PALETTE.success : PALETTE.secondary}
              radius={0.12}
              draggable
              dragOnGroundPlane
              onDrag={(next) => handleDragB([next[0], next[2]])}
            />
            {round.kind === "null-space" && (
              <>
                <VectorArrow
                  origin={[0, 0, 0]}
                  direction={toVec3(round.target)}
                  color={PALETTE.warning}
                  label="n"
                />
                <VectorArrow
                  origin={[0, 0, 0]}
                  direction={toVec3(apply2(matrix, round.target))}
                  color={PALETTE.accent}
                />
              </>
            )}
          </>
        ) : (
          <>
            {round.kind === "eigen" && (
              <TransformedGrid
                matrix={embedMat2InXZPlane(round.matrix)}
                color={PALETTE.border}
              />
            )}
            {round.kind === "span" && (
              <LineObject
                point={[0, 0, 0]}
                direction={toVec3(round.target)}
                color={PALETTE.warning}
                dashed
              />
            )}
            {round.kind === "eigen" && (
              <VectorArrow
                origin={[0, 0, 0]}
                direction={toVec3(apply2(round.matrix, a))}
                color={PALETTE.accent}
              />
            )}
            <PointObject
              position={toVec3(a)}
              label="v"
              color={solved ? PALETTE.success : PALETTE.primary}
              radius={0.12}
              draggable
              dragOnGroundPlane
              onDrag={(next) => handleDragA([next[0], next[2]])}
            />
            {round.kind === "span" && (
              <PointObject
                position={toVec3(round.target)}
                label="target"
                color={PALETTE.warning}
                radius={0.1}
              />
            )}
          </>
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Linear algebra practice">
            <p className="text-foreground text-sm leading-relaxed">{round.prompt}</p>

            {solved ? (
              <>
                <Badge tone="success">Solved!</Badge>
                <Button size="sm" onClick={nextRound}>
                  Next
                </Button>
              </>
            ) : (
              <Badge tone="neutral">Streak {streak}</Badge>
            )}
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
