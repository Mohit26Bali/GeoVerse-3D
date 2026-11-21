"use client";

import { useState } from "react";
import ModuleHeader from "@/components/layout/ModuleHeader";
import ExploreView from "@/modules/computational-geometry/ExploreView";
import GuidedView from "@/modules/computational-geometry/GuidedView";
import PracticeView from "@/modules/computational-geometry/PracticeView";
import ChallengeView from "@/modules/computational-geometry/ChallengeView";
import SummaryView from "@/modules/computational-geometry/SummaryView";
import { MODULES } from "@/constants/modules";
import type { LearningMode } from "@/types/module";

const moduleSummary = MODULES.find((mod) => mod.slug === "computational-geometry")!;

export default function ComputationalGeometryPage() {
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
