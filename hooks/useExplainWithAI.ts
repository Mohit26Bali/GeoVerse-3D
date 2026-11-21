"use client";

import { useCallback, useRef, useState } from "react";
import type { ExplainContext } from "@/types/explain";

type Status = "idle" | "loading" | "streaming" | "done" | "error";

/**
 * Calls /api/explain and streams the response into `text` token-by-token.
 * Never touches the Groq key directly — that stays server-side in the route.
 */
export function useExplainWithAI() {
  const [status, setStatus] = useState<Status>("idle");
  const [text, setText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const explain = useCallback(async (context: ExplainContext) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setText("");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ context }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const payload = await res.json().catch(() => null);
        setErrorMessage(payload?.message ?? "Explain with AI is unavailable right now.");
        setStatus("error");
        return;
      }

      setStatus("streaming");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setText((prev) => prev + chunk);
      }
      setStatus("done");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setErrorMessage("Explain with AI is unavailable right now.");
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
    setText("");
    setErrorMessage(null);
  }, []);

  return { status, text, errorMessage, explain, reset };
}
