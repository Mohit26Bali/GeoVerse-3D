"use client";

import { useState } from "react";
import ModuleHeader from "@/components/layout/ModuleHeader";
import ExploreView from "@/modules/linear-algebra-playground/ExploreView";
import GuidedView from "@/modules/linear-algebra-playground/GuidedView";
import PracticeView from "@/modules/linear-algebra-playground/PracticeView";
import ChallengeView from "@/modules/linear-algebra-playground/ChallengeView";
import SummaryView from "@/modules/linear-algebra-playground/SummaryView";
import { MODULES } from "@/constants/modules";
import type { LearningMode } from "@/types/module";

const moduleSummary = MODULES.find((mod) => mod.slug === "linear-algebra-playground")!;

export default function LinearAlgebraPlaygroundPage() {
  const [mode, setMode] = useState<LearningMode>("explore");

  return (
    <div className="relative">
      <ModuleHeader module={moduleSummary} mode={mode} onModeChange={setMode} />
      {mode === "explore" && <ExploreView />}
      {mode === "guided" && <GuidedView />}
      {mode === "practice" && <PracticeView />}
      {mode === "challenge" && <ChallengeView />}
      {mode === "summary" && <SummaryView />}
    </div>
  );
}
