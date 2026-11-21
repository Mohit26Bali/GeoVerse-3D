"use client";

import { Fragment } from "react";
import { InlineMath } from "react-katex";

interface InlineMathTextProps {
  text: string;
  className?: string;
}

/**
 * Renders prose that may contain inline `$...$` LaTeX segments (e.g. AI-
 * generated explanations) as real math instead of literal dollar signs and
 * backslashes. Plain text outside `$...$` passes through untouched.
 */
export default function InlineMathText({ text, className }: InlineMathTextProps) {
  const parts = text.split(/(\$[^$]+\$)/g);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.length > 2 && part.startsWith("$") && part.endsWith("$")) {
          return <InlineMath key={i} math={part.slice(1, -1)} errorColor="#ff5c72" />;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </span>
  );
}
