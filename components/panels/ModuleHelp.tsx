"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleHelp, X } from "lucide-react";
import Panel from "@/components/ui/Panel";
import type { ModuleHelpContent } from "@/types/module";

interface ModuleHelpProps {
  title: string;
  help?: ModuleHelpContent;
  fallback: string;
}

/** The "?" button in every module's top-right corner: what/why/how/usage. */
export default function ModuleHelp({ title, help, fallback }: ModuleHelpProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`About ${title}`}
        className="glass text-muted hover:text-foreground flex h-8 w-8 items-center justify-center rounded-full transition-colors"
      >
        <CircleHelp className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`About ${title}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <Panel className="w-full max-w-lg p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-foreground text-lg font-semibold">{title}</h2>
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="text-muted hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {help ? (
                  <div className="flex flex-col gap-4 text-sm leading-relaxed">
                    <Section label="What is it?" text={help.whatIsIt} />
                    <Section label="Why it matters" text={help.why} />
                    <Section label="How it works" text={help.how} />
                    <Section label="How to use this module" text={help.usage} />
                  </div>
                ) : (
                  <p className="text-muted text-sm leading-relaxed">{fallback}</p>
                )}
              </Panel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Section({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-primary mb-1 text-xs font-semibold tracking-wide uppercase">
        {label}
      </p>
      <p className="text-muted">{text}</p>
    </div>
  );
}
