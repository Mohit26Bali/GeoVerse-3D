"use client";

import ModuleHeader from "@/components/layout/ModuleHeader";
import GeometryLabView from "@/modules/geometry-lab/GeometryLabView";
import { MODULES } from "@/constants/modules";

const moduleSummary = MODULES.find((mod) => mod.slug === "geometry-lab")!;

export default function GeometryLabPage() {
  return (
    <div className="relative">
      <ModuleHeader module={moduleSummary} mode="explore" />
      <GeometryLabView />
    </div>
  );
}
