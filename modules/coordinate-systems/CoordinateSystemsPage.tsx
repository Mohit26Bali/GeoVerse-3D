"use client";

import { useState } from "react";
import ModuleHeader from "@/components/layout/ModuleHeader";
import ExploreView from "@/modules/coordinate-systems/ExploreView";
import GuidedView from "@/modules/coordinate-systems/GuidedView";
import PracticeView from "@/modules/coordinate-systems/PracticeView";
import ChallengeView from "@/modules/coordinate-systems/ChallengeView";
import SummaryView from "@/modules/coordinate-systems/SummaryView";
import { MODULES } from "@/constants/modules";
import type { LearningMode } from "@/types/module";

const moduleSummary = MODULES.find((mod) => mod.slug === "coordinate-systems")!;

export default function CoordinateSystemsPage() {
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
