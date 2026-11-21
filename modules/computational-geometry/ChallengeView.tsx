"use client";

import { useCallback, useEffect, useState } from "react";
import ModuleScene from "@/three/engine/ModuleScene";
import ControlPanel from "@/components/panels/ControlPanel";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import QuizScene from "@/modules/computational-geometry/QuizScene";
import {
  generateScenario,
  randomTopic,
  type QuizScenario,
} from "@/modules/computational-geometry/quiz";
import { TOPICS } from "@/modules/computational-geometry/types";

const ROUND_SECONDS = 12;
const TOTAL_ROUNDS = 8;

type Phase = "idle" | "playing" | "revealed" | "finished";

export default function ChallengeView() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [scenario, setScenario] = useState<QuizScenario>(() =>
    generateScenario(randomTopic()),
  );
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);

  const setupRound = useCallback((excludeTopic?: QuizScenario["topic"]) => {
    setScenario(generateScenario(randomTopic(excludeTopic)));
    setUserAnswer(null);
    setSecondsLeft(ROUND_SECONDS);
  }, []);

  const startGame = useCallback(() => {
    setPhase("playing");
    setRound(0);
    setScore(0);
    setupRound();
  }, [setupRound]);

  const advance = useCallback(() => {
    const nextRound = round + 1;
    setRound(nextRound);
    if (nextRound >= TOTAL_ROUNDS) {
      setPhase("finished");
    } else {
      setPhase("playing");
      setupRound(scenario.topic);
    }
  }, [round, scenario.topic, setupRound]);

  const answer = useCallback(
    (value: boolean | null) => {
      if (phase !== "playing") return;
      setUserAnswer(value);
      if (value === scenario.answer) setScore((s) => s + 1);
      setPhase("revealed");
    },
    [phase, scenario.answer],
  );

  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          answer(null);
          return ROUND_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, answer]);

  const activeTopic = TOPICS.find((t) => t.id === scenario.topic)!;
  const revealed = phase === "revealed";
  const correct = revealed && userAnswer === scenario.answer;

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        {(phase === "playing" || phase === "revealed") && (
          <QuizScene scenario={scenario} revealed={revealed} />
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Computational Geometry challenge">
            {phase === "idle" && (
              <>
                <p className="text-muted text-xs leading-relaxed">
                  {TOTAL_ROUNDS} rounds, {ROUND_SECONDS}s each, mixing all six topics.
                  Predict Yes/No, then see the reveal.
                </p>
                <Button size="sm" onClick={startGame}>
                  Start challenge
                </Button>
              </>
            )}

            {(phase === "playing" || phase === "revealed") && (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted text-xs">
                    Round {round + 1} / {TOTAL_ROUNDS} · {activeTopic.label}
                  </span>
                  <Badge tone={secondsLeft <= 4 ? "error" : "neutral"}>
                    {secondsLeft}s
                  </Badge>
                  <Badge tone="primary">Score {score}</Badge>
                </div>
                <p className="text-foreground text-sm leading-relaxed">
                  {scenario.question}
                </p>

                {phase === "playing" ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => answer(true)}>
                      Yes
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => answer(false)}>
                      No
                    </Button>
                  </div>
                ) : (
                  <>
                    <Badge tone={correct ? "success" : "error"}>
                      {correct ? "Correct" : "Incorrect"} — answer is{" "}
                      {scenario.answer ? "Yes" : "No"}
                    </Badge>
                    <Button size="sm" onClick={advance}>
                      {round + 1 >= TOTAL_ROUNDS ? "See results" : "Next round"}
                    </Button>
                  </>
                )}
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
