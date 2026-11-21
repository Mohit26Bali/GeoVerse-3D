"use client";

import { useState } from "react";
import ModuleHeader from "@/components/layout/ModuleHeader";
import ExploreView from "@/modules/conic-sections/ExploreView";
import GuidedView from "@/modules/conic-sections/GuidedView";
import PracticeView from "@/modules/conic-sections/PracticeView";
import ChallengeView from "@/modules/conic-sections/ChallengeView";
import SummaryView from "@/modules/conic-sections/SummaryView";
import { MODULES } from "@/constants/modules";
import type { LearningMode } from "@/types/module";

const moduleSummary = MODULES.find((mod) => mod.slug === "conic-sections")!;

export default function ConicSectionsPage() {
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
