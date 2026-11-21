"use client";

import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import Button from "@/components/ui/Button";
import Equation from "@/components/ui/Equation";
import ExplainWithAI from "@/components/panels/ExplainWithAI";
import type { GuidedStep } from "@/hooks/useGuidedSequence";
import type { ExplainContext } from "@/types/explain";
import { cn } from "@/utils/cn";

interface GuidedControlsProps<T extends GuidedStep> {
  moduleTitle: string;
  step: T;
  index: number;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onGoTo: (index: number) => void;
  /** Extra live values (already formatted) fed to the AI as grounding context. */
  values?: Record<string, string>;
  latex?: string;
}

/**
 * Play/pause/step controls for a Guided-mode walkthrough, plus the
 * "Explain with AI" trigger — which only ever appears while paused, and
 * only ever calls the AI on an explicit click.
 */
export default function GuidedControls<T extends GuidedStep>({
  moduleTitle,
  step,
  index,
  totalSteps,
  isFirst,
  isLast,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onGoTo,
  values,
  latex,
}: GuidedControlsProps<T>) {
  const explainContext: ExplainContext = {
    moduleTitle,
    stepTitle: step.title,
    stepDescription: step.description,
    latex,
    values,
  };

  return (
    <div className="flex w-[26rem] max-w-[calc(100vw-2rem)] flex-col gap-3">
      <div className="glass flex flex-col gap-3 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-muted text-xs font-medium">
            Step {index + 1} of {totalSteps}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <button
                key={i}
                onClick={() => onGoTo(i)}
                aria-label={`Go to step ${i + 1}`}
                className={cn(
                  "h-1.5 w-4 rounded-full transition-colors",
                  i === index ? "bg-primary" : "bg-border hover:bg-border-strong",
                )}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-foreground text-sm font-semibold">{step.title}</h3>
          <p className="text-muted mt-1 text-xs leading-relaxed">{step.description}</p>
          {latex && (
            <div className="mt-2">
              <Equation latex={latex} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={onPrev}
            disabled={isFirst}
            aria-label="Previous step"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {isPlaying ? (
            <Button size="icon" onClick={onPause} aria-label="Pause">
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="icon" onClick={onPlay} disabled={isLast} aria-label="Play">
              <Play className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="outline"
            onClick={onNext}
            disabled={isLast}
            aria-label="Next step"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {isLast && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onGoTo(0)}
              aria-label="Restart"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {!isPlaying && <ExplainWithAI context={explainContext} resetKey={step.id} />}
    </div>
  );
}
