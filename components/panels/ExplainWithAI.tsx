"use client";

import { useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import { useExplainWithAI } from "@/hooks/useExplainWithAI";
import type { ExplainContext } from "@/types/explain";
import Panel from "@/components/ui/Panel";
import Button from "@/components/ui/Button";
import InlineMathText from "@/components/ui/InlineMathText";

interface ExplainWithAIProps {
  context: ExplainContext;
  /** Closes any open explanation and returns to the trigger button when this changes. */
  resetKey?: unknown;
}

/**
 * The "explain this exact paused step" trigger. Renders as a small button
 * that only calls the AI when clicked (never automatically) and streams the
 * response into a panel beneath it.
 */
export default function ExplainWithAI({ context, resetKey }: ExplainWithAIProps) {
  const { status, text, errorMessage, explain, reset } = useExplainWithAI();

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  if (status === "idle") {
    return (
      <Button
        size="sm"
        variant="outline"
        className="border-secondary/40 bg-secondary/10 text-secondary hover:bg-secondary/20"
        onClick={() => explain(context)}
      >
        <Sparkles className="h-3.5 w-3.5" />
        Explain with AI
      </Button>
    );
  }

  return (
    <Panel className="w-80 max-w-[calc(100vw-2rem)] p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-secondary flex items-center gap-1.5 text-xs font-medium">
          <Sparkles className="h-3.5 w-3.5" /> Explain with AI
        </span>
        <button
          onClick={reset}
          aria-label="Close explanation"
          className="text-muted hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {status === "loading" && (
        <div className="flex gap-1 py-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="bg-secondary h-1.5 w-1.5 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      )}

      {status === "error" && (
        <p className="text-error text-xs leading-relaxed">{errorMessage}</p>
      )}

      {(status === "streaming" || status === "done") && (
        <p className="text-foreground text-xs leading-relaxed whitespace-pre-wrap">
          <InlineMathText text={text} />
          {status === "streaming" && <span className="animate-pulse">▍</span>}
        </p>
      )}
    </Panel>
  );
}
