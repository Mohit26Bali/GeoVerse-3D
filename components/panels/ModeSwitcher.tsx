"use client";

import { motion } from "framer-motion";
import type { LearningMode } from "@/types/module";
import { cn } from "@/utils/cn";

const MODES: { id: LearningMode; label: string }[] = [
  { id: "explore", label: "Explore" },
  { id: "guided", label: "Guided" },
  { id: "practice", label: "Practice" },
  { id: "challenge", label: "Challenge" },
  { id: "summary", label: "Summary" },
];

interface ModeSwitcherProps {
  active: LearningMode;
  onChange: (mode: LearningMode) => void;
  available?: LearningMode[];
}

/** Explore / Guided / Practice / Challenge / Summary tab switcher every module shares. */
export default function ModeSwitcher({ active, onChange, available }: ModeSwitcherProps) {
  const modes = available ? MODES.filter((m) => available.includes(m.id)) : MODES;

  return (
    <div
      className="glass relative flex max-w-[calc(100vw-1.5rem)] overflow-x-auto rounded-full p-1"
      role="group"
      aria-label="Learning mode"
    >
      {modes.map((mode) => {
        const isActive = mode.id === active;
        return (
          <button
            key={mode.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(mode.id)}
            className={cn(
              "relative z-10 shrink-0 rounded-full px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:px-4 sm:text-sm",
              isActive ? "text-primary-foreground" : "text-muted hover:text-foreground",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="mode-switcher-pill"
                className="bg-primary absolute inset-0 -z-10 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
