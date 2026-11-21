import type { ExplainContext } from "@/types/explain";

/** Largest request body the explain route will read. */
export const MAX_BODY_BYTES = 4 * 1024;

const LIMITS = {
  moduleTitle: 80,
  stepTitle: 120,
  stepDescription: 700,
  latex: 300,
  valueKey: 40,
  valueText: 80,
  valueCount: 12,
} as const;

// Control characters (including line breaks) are never needed in these fields
// and are a common way to smuggle instructions into a prompt.
const CONTROL = /[\u0000-\u0008\u000B-\u001F\u007F]/g;

function clean(
  value: unknown,
  max: number,
  { allowNewlines = false } = {},
): string | null {
  if (typeof value !== "string") return null;
  let text = value.replace(CONTROL, "");
  if (!allowNewlines) text = text.replace(/[\r\n]+/g, " ");
  text = text.trim();
  if (text.length === 0 || text.length > max) return null;
  return text;
}

export type GuardResult =
  { ok: true; context: ExplainContext } | { ok: false; message: string };

/**
 * Validates the context the browser sends. The module must be a real GeoVerse
 * module, every field has a length limit, and nothing but short text is
 * accepted, so the route cannot be used as a free general-purpose model.
 */
export function validateExplainContext(
  input: unknown,
  knownModuleTitles: readonly string[],
): GuardResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, message: "Missing `context` in request body." };
  }
  const raw = input as Record<string, unknown>;

  const moduleTitle = clean(raw.moduleTitle, LIMITS.moduleTitle);
  if (!moduleTitle || !knownModuleTitles.includes(moduleTitle)) {
    return { ok: false, message: "Unknown module." };
  }
  const stepTitle = clean(raw.stepTitle, LIMITS.stepTitle);
  const stepDescription = clean(raw.stepDescription, LIMITS.stepDescription);
  if (!stepTitle || !stepDescription) {
    return {
      ok: false,
      message: "The step title and description are required and must be short.",
    };
  }

  const context: ExplainContext = { moduleTitle, stepTitle, stepDescription };

  if (raw.latex !== undefined) {
    const latex = clean(raw.latex, LIMITS.latex);
    if (!latex) return { ok: false, message: "The formula is too long." };
    context.latex = latex;
  }

  if (raw.values !== undefined) {
    if (
      typeof raw.values !== "object" ||
      raw.values === null ||
      Array.isArray(raw.values)
    ) {
      return { ok: false, message: "`values` must be an object." };
    }
    const entries = Object.entries(raw.values as Record<string, unknown>);
    if (entries.length > LIMITS.valueCount)
      return { ok: false, message: "Too many values." };
    const values: Record<string, string> = {};
    for (const [key, val] of entries) {
      const k = clean(key, LIMITS.valueKey);
      const v =
        typeof val === "number" && Number.isFinite(val)
          ? String(val)
          : clean(val, LIMITS.valueText);
      if (!k || v === null)
        return { ok: false, message: "A value is missing or too long." };
      values[k] = v;
    }
    if (entries.length > 0) context.values = values;
  }

  return { ok: true, context };
}

/** Never send more than this to the browser, whatever the model returns. */
export function tidyExplanation(text: string, maxChars = 1200): string {
  const trimmed = text.replace(CONTROL, "").trim();
  return trimmed.length > maxChars ? trimmed.slice(0, maxChars).trimEnd() + "…" : trimmed;
}

/** Same-origin check for a browser POST: the Origin header, when present, must match the site. */
export function isSameOrigin(
  origin: string | null,
  host: string | null,
  allowedOrigin?: string,
): boolean {
  if (!origin) return true; // not a browser cross-site request (curl, tests); the rate limit still applies
  if (allowedOrigin && origin === allowedOrigin) return true;
  try {
    return host !== null && new URL(origin).host === host;
  } catch {
    return false;
  }
}
