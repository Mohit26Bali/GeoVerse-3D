"use client";

import { useState } from "react";
import ModuleHeader from "@/components/layout/ModuleHeader";
import ExploreView from "@/modules/sphere-geometry/ExploreView";
import GuidedView from "@/modules/sphere-geometry/GuidedView";
import PracticeView from "@/modules/sphere-geometry/PracticeView";
import ChallengeView from "@/modules/sphere-geometry/ChallengeView";
import SummaryView from "@/modules/sphere-geometry/SummaryView";
import { MODULES } from "@/constants/modules";
import type { LearningMode } from "@/types/module";

const moduleSummary = MODULES.find((mod) => mod.slug === "sphere-geometry")!;

export default function SphereGeometryPage() {
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
