"use client";

import { BlockMath, InlineMath } from "react-katex";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface EquationProps {
  latex: string;
  block?: boolean;
  className?: string;
}

/**
 * KaTeX-rendered equation that cross-fades between values instead of
 * snapping when `latex` changes — satisfies "equations should transition
 * instead of updating abruptly."
 */
export default function Equation({ latex, block = false, className }: EquationProps) {
  const Renderer = block ? BlockMath : InlineMath;
  return (
    <div className={cn("text-foreground overflow-x-auto", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={latex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <Renderer math={latex} errorColor={"#ff5c72"} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
