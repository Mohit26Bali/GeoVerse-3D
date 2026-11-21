"use client";

import { useState } from "react";
import ModuleHeader from "@/components/layout/ModuleHeader";
import ExploreView from "@/modules/vectors/ExploreView";
import GuidedView from "@/modules/vectors/GuidedView";
import PracticeView from "@/modules/vectors/PracticeView";
import ChallengeView from "@/modules/vectors/ChallengeView";
import SummaryView from "@/modules/vectors/SummaryView";
import { MODULES } from "@/constants/modules";
import type { LearningMode } from "@/types/module";

const moduleSummary = MODULES.find((mod) => mod.slug === "vectors")!;

export default function VectorsPage() {
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
