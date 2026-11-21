"use client";

import ModuleHeader from "@/components/layout/ModuleHeader";
import ExploreView from "@/modules/real-world-applications/ExploreView";
import { MODULES } from "@/constants/modules";

const moduleSummary = MODULES.find((mod) => mod.slug === "real-world-applications")!;

export default function RealWorldApplicationsPage() {
  return (
    <div className="relative">
      <ModuleHeader module={moduleSummary} mode="explore" />
      <ExploreView />
    </div>
  );
}
