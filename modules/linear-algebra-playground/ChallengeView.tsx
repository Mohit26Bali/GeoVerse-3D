"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

const ROUND_SECONDS = 25;
const TOTAL_ROUNDS = 6;

type Phase = "idle" | "playing" | "finished";

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

export default function ChallengeView() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState<Round>(() => generateRound(randomTopic()));
  const [roundIndex, setRoundIndex] = useState(0);
  const [a, setA] = useState<Vec2>(() => randomVec2(1.8));
  const [b, setB] = useState<Vec2>(() => randomVec2(1.8));
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);

  const usesBothVectors = round.kind === "rank" || round.kind === "null-space";
  const matrix = useMemo(() => toMat2(a, b), [a, b]);
  const embedded = useMemo(() => embedMat2InXZPlane(matrix), [matrix]);

  const setupRound = useCallback((excludeTopic?: Round["kind"]) => {
    setRound(generateRound(randomTopic(excludeTopic)));
    setA(randomVec2(1.8));
    setB(randomVec2(1.8));
    setSecondsLeft(ROUND_SECONDS);
  }, []);

  const startGame = useCallback(() => {
    setPhase("playing");
    setRoundIndex(0);
    setScore(0);
    setupRound();
  }, [setupRound]);

  const advanceRound = useCallback(
    (won: boolean) => {
      setScore((s) => s + (won ? 1 : 0));
      const next = roundIndex + 1;
      setRoundIndex(next);
      if (next >= TOTAL_ROUNDS) {
        setPhase("finished");
      } else {
        setupRound(round.kind);
      }
    },
    [roundIndex, round.kind, setupRound],
  );

  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          advanceRound(false);
          return ROUND_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, advanceRound]);

  const handleDragA = useCallback(
    (next: Vec2) => {
      if (phase !== "playing") return;
      setA(next);
      if (isSolved(round, next, b)) advanceRound(true);
    },
    [phase, round, b, advanceRound],
  );

  const handleDragB = useCallback(
    (next: Vec2) => {
      if (phase !== "playing") return;
      setB(next);
      if (isSolved(round, a, next)) advanceRound(true);
    },
    [phase, round, a, advanceRound],
  );

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        {phase === "playing" &&
          (usesBothVectors ? (
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
                color={PALETTE.primary}
                radius={0.12}
                draggable
                dragOnGroundPlane
                onDrag={(next) => handleDragA([next[0], next[2]])}
              />
              <PointObject
                position={toVec3(b)}
                label="ĵ"
                color={PALETTE.secondary}
                radius={0.12}
                draggable
                dragOnGroundPlane
                onDrag={(next) => handleDragB([next[0], next[2]])}
              />
              {round.kind === "null-space" && (
                <VectorArrow
                  origin={[0, 0, 0]}
                  direction={toVec3(round.target)}
                  color={PALETTE.warning}
                  label="n"
                />
              )}
            </>
          ) : (
            <>
              {round.kind === "eigen" && (
                <>
                  <TransformedGrid
                    matrix={embedMat2InXZPlane(round.matrix)}
                    color={PALETTE.border}
                  />
                  <VectorArrow
                    origin={[0, 0, 0]}
                    direction={toVec3(apply2(round.matrix, a))}
                    color={PALETTE.accent}
                  />
                </>
              )}
              {round.kind === "span" && (
                <>
                  <LineObject
                    point={[0, 0, 0]}
                    direction={toVec3(round.target)}
                    color={PALETTE.warning}
                    dashed
                  />
                  <PointObject
                    position={toVec3(round.target)}
                    label="target"
                    color={PALETTE.warning}
                    radius={0.1}
                  />
                </>
              )}
              <PointObject
                position={toVec3(a)}
                label="v"
                color={PALETTE.primary}
                radius={0.12}
                draggable
                dragOnGroundPlane
                onDrag={(next) => handleDragA([next[0], next[2]])}
              />
            </>
          ))}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Linear algebra challenge">
            {phase === "idle" && (
              <>
                <p className="text-muted text-xs leading-relaxed">
                  {TOTAL_ROUNDS} rounds, {ROUND_SECONDS}s each, mixing eigenvectors, span,
                  rank, and null space. Solve each by dragging.
                </p>
                <Button size="sm" onClick={startGame}>
                  Start challenge
                </Button>
              </>
            )}
            {phase === "playing" && (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted text-xs">
                    Round {roundIndex + 1} / {TOTAL_ROUNDS}
                  </span>
                  <Badge tone={secondsLeft <= 6 ? "error" : "neutral"}>
                    {secondsLeft}s
                  </Badge>
                  <Badge tone="primary">Score {score}</Badge>
                </div>
                <p className="text-foreground text-sm leading-relaxed">{round.prompt}</p>
              </>
            )}
            {phase === "finished" && (
              <>
                <p className="text-foreground text-sm">
                  You scored <span className="text-primary font-semibold">{score}</span> /{" "}
                  {TOTAL_ROUNDS}.
                </p>
                <Button size="sm" onClick={startGame}>
                  Play again
                </Button>
              </>
            )}
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
