"use client";

import Badge from "@/components/ui/Badge";
import ModeSwitcher from "@/components/panels/ModeSwitcher";
import ModuleHelp from "@/components/panels/ModuleHelp";
import type { ModuleSummary, LearningMode } from "@/types/module";

interface ModuleHeaderProps {
  module: ModuleSummary;
  mode?: LearningMode;
  onModeChange?: (mode: LearningMode) => void;
}

/**
 * Standard header for every module page: title + status badge on the left,
 * the "?" help dialog on the right, mode switcher centered beneath. Shared
 * by both real module implementations and the "coming soon" placeholder so
 * every module route looks and behaves the same.
 */
export default function ModuleHeader({ module, mode, onModeChange }: ModuleHeaderProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex flex-col items-center gap-4 px-4">
      <div className="flex w-full items-center justify-between">
        <div className="pointer-events-auto flex items-center gap-3">
          <h1 className="text-foreground text-lg font-semibold">{module.title}</h1>
          {module.status === "coming-soon" && (
            <Badge tone="warning">In development</Badge>
          )}
        </div>
        <div className="pointer-events-auto">
          <ModuleHelp
            title={module.title}
            help={module.help}
            fallback={module.shortDescription}
          />
        </div>
      </div>
      {module.modes.length > 1 && mode && onModeChange && (
        <div className="pointer-events-auto">
          <ModeSwitcher active={mode} onChange={onModeChange} available={module.modes} />
        </div>
      )}
    </div>
  );
}
