"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ModuleScene from "@/three/engine/ModuleScene";
import PolyhedronMesh from "@/three/objects/PolyhedronMesh";
import ControlPanel from "@/components/panels/ControlPanel";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { cn } from "@/utils/cn";
import {
  POLYHEDRA,
  polyhedronInfo,
  type PolyhedronType,
} from "@/modules/polyhedra/types";

const ROUND_SECONDS = 10;
const TOTAL_ROUNDS = 5;

function randomSolid(exclude?: PolyhedronType): PolyhedronType {
  const pool = POLYHEDRA.filter((p) => p.id !== exclude);
  return pool[Math.floor(Math.random() * pool.length)].id;
}

function buildChoices(correct: PolyhedronType): PolyhedronType[] {
  const others = POLYHEDRA.map((p) => p.id).filter((id) => id !== correct);
  const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
  return [correct, ...shuffled].sort(() => Math.random() - 0.5);
}

type Phase = "idle" | "playing" | "finished";

export default function ChallengeView() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [type, setType] = useState<PolyhedronType>(() => randomSolid());
  const [choices, setChoices] = useState<PolyhedronType[]>(() => buildChoices(type));
  const [picked, setPicked] = useState<PolyhedronType | null>(null);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);

  const setupRound = useCallback(() => {
    const next = randomSolid(type);
    setType(next);
    setChoices(buildChoices(next));
    setPicked(null);
    setSecondsLeft(ROUND_SECONDS);
  }, [type]);

  const startGame = useCallback(() => {
    setPhase("playing");
    setRound(0);
    setScore(0);
    setupRound();
  }, [setupRound]);

  const advanceRound = useCallback(
    (won: boolean) => {
      setScore((s) => s + (won ? 1 : 0));
      const nextRound = round + 1;
      setRound(nextRound);
      if (nextRound >= TOTAL_ROUNDS) {
        setPhase("finished");
      } else {
        setupRound();
      }
    },
    [round, setupRound],
  );

  useEffect(() => {
    if (phase !== "playing" || picked !== null) return;
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
  }, [phase, round, picked, advanceRound]);

  const handlePick = useCallback(
    (choice: PolyhedronType) => {
      if (picked) return;
      setPicked(choice);
      const won = choice === type;
      setTimeout(() => advanceRound(won), 500);
    },
    [picked, type, advanceRound],
  );

  const choiceInfos = useMemo(() => choices.map((c) => polyhedronInfo(c)), [choices]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>{phase === "playing" && <PolyhedronMesh type={type} />}</ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Polyhedron challenge">
            {phase === "idle" && (
              <>
                <p className="text-muted text-xs leading-relaxed">
                  {TOTAL_ROUNDS} rounds, {ROUND_SECONDS}s each. Name the solid before time
                  runs out.
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
                    Round {round + 1} / {TOTAL_ROUNDS}
                  </span>
                  <Badge tone={secondsLeft <= 3 ? "error" : "neutral"}>
                    {secondsLeft}s
                  </Badge>
                  <Badge tone="primary">Score {score}</Badge>
                </div>
                <div className="flex flex-col gap-1.5">
                  {choiceInfos.map((c) => {
                    const isPicked = picked === c.id;
                    const isCorrectChoice = c.id === type;
                    const showState = picked !== null;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handlePick(c.id)}
                        disabled={picked !== null}
                        className={cn(
                          "rounded-md px-3 py-1.5 text-left text-xs font-medium transition-colors",
                          showState && isCorrectChoice && "bg-success/20 text-success",
                          showState &&
                            isPicked &&
                            !isCorrectChoice &&
                            "bg-error/20 text-error",
                          !showState &&
                            "bg-surface-hover text-foreground hover:bg-surface",
                        )}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
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
