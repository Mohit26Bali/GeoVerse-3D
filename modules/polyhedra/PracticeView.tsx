"use client";

import { useCallback, useMemo, useState } from "react";
import ModuleScene from "@/three/engine/ModuleScene";
import PolyhedronMesh from "@/three/objects/PolyhedronMesh";
import ControlPanel from "@/components/panels/ControlPanel";
import StatReadout from "@/components/panels/StatReadout";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import {
  POLYHEDRA,
  polyhedronInfo,
  type PolyhedronType,
} from "@/modules/polyhedra/types";

function randomSolid(exclude?: PolyhedronType): PolyhedronType {
  const pool = POLYHEDRA.filter((p) => p.id !== exclude);
  return pool[Math.floor(Math.random() * pool.length)].id;
}

function buildChoices(correct: PolyhedronType): PolyhedronType[] {
  const others = POLYHEDRA.map((p) => p.id).filter((id) => id !== correct);
  const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
  return [correct, ...shuffled].sort(() => Math.random() - 0.5);
}

export default function PracticeView() {
  const [type, setType] = useState<PolyhedronType>(() => randomSolid());
  const [choices, setChoices] = useState<PolyhedronType[]>(() => buildChoices(type));
  const [picked, setPicked] = useState<PolyhedronType | null>(null);
  const [streak, setStreak] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const info = polyhedronInfo(type);
  const solved = picked === type;

  const handlePick = useCallback(
    (choice: PolyhedronType) => {
      if (picked) return;
      setPicked(choice);
      if (choice === type) setStreak((s) => s + 1);
    },
    [picked, type],
  );

  const reveal = useCallback(() => setRevealed(true), []);

  const nextChallenge = useCallback(() => {
    const next = randomSolid(type);
    setType(next);
    setChoices(buildChoices(next));
    setPicked(null);
    setRevealed(false);
  }, [type]);

  const choiceInfos = useMemo(() => choices.map((c) => polyhedronInfo(c)), [choices]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        <PolyhedronMesh type={type} explode={revealed ? 0.5 : 0} />
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Which solid is this?">
            <div className="grid grid-cols-3 gap-3">
              <StatReadout label="Vertices" value={info.vertices} />
              <StatReadout label="Edges" value={info.edges} />
              <StatReadout label="Faces" value={info.faces} />
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
                      !showState && "bg-surface-hover text-foreground hover:bg-surface",
                    )}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>

            <p className="text-muted text-xs leading-relaxed">
              Left-drag empty space to orbit and inspect the solid from every angle.
            </p>

            <div className="flex items-center justify-between">
              <Badge tone="neutral">Streak {streak}</Badge>
              <div className="flex gap-2">
                {!picked && !revealed && (
                  <Button size="sm" variant="outline" onClick={reveal}>
                    Explode to reveal
                  </Button>
                )}
                {picked && (
                  <Button size="sm" onClick={nextChallenge}>
                    {solved ? "Next" : "Try another"}
                  </Button>
                )}
              </div>
            </div>
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
