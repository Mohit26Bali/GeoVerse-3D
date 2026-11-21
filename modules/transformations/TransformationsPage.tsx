"use client";

import { useState } from "react";
import ModuleHeader from "@/components/layout/ModuleHeader";
import ExploreView from "@/modules/transformations/ExploreView";
import GuidedView from "@/modules/transformations/GuidedView";
import PracticeView from "@/modules/transformations/PracticeView";
import ChallengeView from "@/modules/transformations/ChallengeView";
import SummaryView from "@/modules/transformations/SummaryView";
import { MODULES } from "@/constants/modules";
import type { LearningMode } from "@/types/module";

const moduleSummary = MODULES.find((mod) => mod.slug === "transformations")!;

export default function TransformationsPage() {
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
