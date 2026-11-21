"use client";

import { useCallback, useEffect, useState } from "react";

export interface GuidedStep {
  id: string;
  title: string;
  description: string;
  /** Seconds this step stays on screen before auto-advancing while playing. */
  duration?: number;
}

interface UseGuidedSequenceOptions {
  defaultStepDuration?: number;
}

/**
 * Drives a linear guided walkthrough: current step, autoplay timer, and
 * navigation. Any manual navigation (next/prev/goTo) pauses autoplay, since
 * a user stepping through by hand is implicitly pausing to look — which is
 * also the moment "Explain with AI" becomes available.
 */
export function useGuidedSequence<T extends GuidedStep>(
  steps: T[],
  { defaultStepDuration = 6 }: UseGuidedSequenceOptions = {},
) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const step = steps[index];
  const isFirst = index === 0;
  const isLast = index === steps.length - 1;

  const pause = useCallback(() => setIsPlaying(false), []);
  const play = useCallback(() => {
    if (!isLast) setIsPlaying(true);
  }, [isLast]);

  const next = useCallback(() => {
    setIsPlaying(false);
    setIndex((i) => Math.min(i + 1, steps.length - 1));
  }, [steps.length]);

  const prev = useCallback(() => {
    setIsPlaying(false);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goTo = useCallback(
    (i: number) => {
      setIsPlaying(false);
      setIndex(Math.max(0, Math.min(i, steps.length - 1)));
    },
    [steps.length],
  );

  const restart = useCallback(() => {
    setIndex(0);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (!isPlaying || isLast) return;
    const ms = (step?.duration ?? defaultStepDuration) * 1000;
    const id = setTimeout(() => {
      setIndex((i) => Math.min(i + 1, steps.length - 1));
    }, ms);
    return () => clearTimeout(id);
  }, [isPlaying, isLast, step, defaultStepDuration, steps.length]);

  return {
    step,
    index,
    steps,
    isFirst,
    isLast,
    isPlaying,
    play,
    pause,
    next,
    prev,
    goTo,
    restart,
  };
}
