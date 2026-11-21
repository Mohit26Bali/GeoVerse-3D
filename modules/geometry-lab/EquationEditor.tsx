"use client";

import { useState } from "react";
import ControlPanel from "@/components/panels/ControlPanel";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { cn } from "@/utils/cn";
import {
  EQUATION_EXAMPLES,
  parseEquation,
  type EquationKind,
  type ParsedShape,
} from "@/modules/geometry-lab/equationParser";

const KINDS: { id: EquationKind; label: string }[] = [
  { id: "point", label: "Point" },
  { id: "vector", label: "Vector" },
  { id: "line", label: "Line" },
  { id: "plane", label: "Plane" },
  { id: "sphere", label: "Sphere" },
];

interface EquationEditorProps {
  onCreate: (shape: ParsedShape) => void;
}

export default function EquationEditor({ onCreate }: EquationEditorProps) {
  const [kind, setKind] = useState<EquationKind>("plane");
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    if (!input.trim()) return;
    try {
      const shape = parseEquation(kind, input);
      onCreate(shape);
      setError(null);
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't parse that");
    }
  };

  return (
    <ControlPanel title="Equation Editor">
      <div className="flex flex-wrap gap-1.5">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            aria-pressed={kind === k.id}
            onClick={() => {
              setKind(k.id);
              setError(null);
            }}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
              kind === k.id
                ? "bg-primary text-primary-foreground"
                : "bg-surface-hover text-muted hover:text-foreground",
            )}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder={EQUATION_EXAMPLES[kind]}
          aria-label={`${kind} equation`}
          maxLength={200}
          spellCheck={false}
          autoComplete="off"
          className="bg-surface-hover text-foreground w-full rounded-md px-2 py-1 font-mono text-xs outline-none"
        />
        <Button size="sm" onClick={handleCreate} disabled={!input.trim()}>
          Create
        </Button>
      </div>

      <p className="text-muted font-mono text-xs">e.g. {EQUATION_EXAMPLES[kind]}</p>
      {error && (
        <div role="alert">
          <Badge tone="error">{error}</Badge>
        </div>
      )}
    </ControlPanel>
  );
}
