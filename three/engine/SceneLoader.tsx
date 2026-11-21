"use client";

import { useProgress } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";

/** HTML overlay (outside the WebGL canvas) shown while scene assets load. */
export default function SceneLoader() {
  const { active, progress } = useProgress();

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-background pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="border-border border-t-primary h-10 w-10 animate-spin rounded-full border-2" />
            <span className="text-muted font-mono text-xs">
              Loading scene · {Math.round(progress)}%
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
