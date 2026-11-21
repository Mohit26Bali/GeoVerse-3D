"use client";

import { useState } from "react";
import ModuleHeader from "@/components/layout/ModuleHeader";
import ExploreView from "@/modules/bezier-curves/ExploreView";
import GuidedView from "@/modules/bezier-curves/GuidedView";
import PracticeView from "@/modules/bezier-curves/PracticeView";
import ChallengeView from "@/modules/bezier-curves/ChallengeView";
import SummaryView from "@/modules/bezier-curves/SummaryView";
import { MODULES } from "@/constants/modules";
import type { LearningMode } from "@/types/module";

const moduleSummary = MODULES.find((mod) => mod.slug === "bezier-curves")!;

export default function BezierCurvesPage() {
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
