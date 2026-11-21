import { evaluate } from "mathjs";

/**
 * Evaluates a number typed into the Geometry Lab equation box.
 *
 * mathjs can do far more than arithmetic (it can redefine functions, build huge
 * matrices, loop through factorials), so the input is held to a small whitelist:
 * short text, only names from the list below, and a finite result of sensible size.
 */
export const MAX_EXPRESSION_LENGTH = 120;
export const MAX_ABS_VALUE = 1e6;

const ALLOWED_NAMES = new Set([
  "x",
  "y",
  "z",
  "pi",
  "e",
  "sqrt",
  "cbrt",
  "abs",
  "sign",
  "round",
  "floor",
  "ceil",
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "atan2",
  "exp",
  "log",
  "log10",
  "log2",
  "pow",
  "min",
  "max",
]);

/** Characters that can appear in a plain arithmetic expression. */
const ALLOWED_CHARS = /^[0-9A-Za-z_+\-*/^().,\s]*$/;

export function evaluateNumber(
  expression: string,
  scope: Record<string, number> = {},
): number {
  const text = expression.trim();
  if (text.length === 0) throw new Error("Enter a number or a simple expression.");
  if (text.length > MAX_EXPRESSION_LENGTH)
    throw new Error("That expression is too long.");
  if (!ALLOWED_CHARS.test(text))
    throw new Error("Use only numbers, + - * / ^, brackets and simple functions.");

  // number literals (including 1e3 and 2.5e-2) are removed first so their exponent letter is not mistaken for a name
  const withoutNumbers = text.replace(/(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g, " ");
  const names = withoutNumbers.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? [];
  for (const name of names) {
    // 'e' and 'pi' are constants; scientific notation such as 1e3 has no letters on their own
    if (!ALLOWED_NAMES.has(name)) throw new Error(`"${name}" is not allowed here.`);
  }

  let result: unknown;
  try {
    result = evaluate(text, scope);
  } catch {
    throw new Error(`Couldn't evaluate "${text}".`);
  }
  const value = typeof result === "number" ? result : Number(result);
  if (!Number.isFinite(value)) throw new Error(`"${text}" is not a finite number.`);
  if (Math.abs(value) > MAX_ABS_VALUE)
    throw new Error("That number is too large for the scene (limit 1,000,000).");
  return value;
}
