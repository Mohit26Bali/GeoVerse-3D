"use client";

import { useCallback, useState } from "react";
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

export default function PracticeView() {
  const [scenario, setScenario] = useState<QuizScenario>(() =>
    generateScenario(randomTopic()),
  );
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const revealed = userAnswer !== null;
  const correct = revealed && userAnswer === scenario.answer;

  const answer = useCallback(
    (value: boolean) => {
      if (revealed) return;
      setUserAnswer(value);
      setAttempts((a) => a + 1);
      setStreak((s) => (value === scenario.answer ? s + 1 : 0));
    },
    [revealed, scenario.answer],
  );

  const nextRound = useCallback(() => {
    setScenario(generateScenario(randomTopic(scenario.topic)));
    setUserAnswer(null);
  }, [scenario.topic]);

  const activeTopic = TOPICS.find((t) => t.id === scenario.topic)!;

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <QuizScene scenario={scenario} revealed={revealed} />
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title={activeTopic.label}>
            <p className="text-foreground text-sm leading-relaxed">{scenario.question}</p>

            {!revealed ? (
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
                <Button size="sm" onClick={nextRound}>
                  Next
                </Button>
              </>
            )}

            <div className="flex items-center gap-2">
              <Badge tone="neutral">Streak {streak}</Badge>
              <Badge tone="neutral">Attempts {attempts}</Badge>
            </div>
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
