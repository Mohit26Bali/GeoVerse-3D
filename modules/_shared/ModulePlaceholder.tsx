"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { MODULES } from "@/constants/modules";
import ModuleScene from "@/three/engine/ModuleScene";
import ModuleHeader from "@/components/layout/ModuleHeader";
import ControlPanel from "@/components/panels/ControlPanel";
import type { LearningMode } from "@/types/module";

interface ModulePlaceholderProps {
  slug: string;
}

/**
 * Renders for any module whose content hasn't shipped yet. Still mounts the
 * real ModuleScene (camera, lights, grid, axes, postprocessing) so the
 * engine is exercised on every route, not just the ones with finished
 * content — and so this becomes a real module page the moment content is
 * added, not a dead end.
 *
 * Takes a `slug` (not the full ModuleSummary) and resolves it against
 * MODULES locally: ModuleSummary.icon is a component reference, and
 * component references can't cross the server->client prop boundary from
 * the server-rendered [slug]/page.tsx.
 */
export default function ModulePlaceholder({ slug }: ModulePlaceholderProps) {
  const activeModule = MODULES.find((mod) => mod.slug === slug);
  const [mode, setMode] = useState<LearningMode>(activeModule?.modes[0] ?? "explore");

  if (!activeModule) notFound();

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene />
      <ModuleHeader module={activeModule} mode={mode} onModeChange={setMode} />

      {activeModule.status === "coming-soon" && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="pointer-events-auto">
            <ControlPanel title="Coming soon">
              <p className="text-muted text-xs leading-relaxed">
                {activeModule.shortDescription} This module&apos;s content is still being
                built on top of the Foundation Engine — the scene, camera, and lighting
                you see here are already fully wired up.
              </p>
            </ControlPanel>
          </div>
        </div>
      )}
    </div>
  );
}
