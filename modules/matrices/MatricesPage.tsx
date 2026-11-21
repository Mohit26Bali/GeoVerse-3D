"use client";

import { useState } from "react";
import ModuleHeader from "@/components/layout/ModuleHeader";
import ExploreView from "@/modules/matrices/ExploreView";
import GuidedView from "@/modules/matrices/GuidedView";
import PracticeView from "@/modules/matrices/PracticeView";
import ChallengeView from "@/modules/matrices/ChallengeView";
import SummaryView from "@/modules/matrices/SummaryView";
import { MODULES } from "@/constants/modules";
import type { LearningMode } from "@/types/module";

const moduleSummary = MODULES.find((mod) => mod.slug === "matrices")!;

export default function MatricesPage() {
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
