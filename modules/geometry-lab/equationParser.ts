import { evaluateNumber } from "@/utils/safeMath";
import type { Vec3Tuple } from "@/types/math";

/**
 * Parses a small set of canonical equation forms into geometry — not a
 * general CAS, just enough that typing the equation you'd write on paper
 * produces the matching object. mathjs handles arbitrary numeric
 * expressions inside each slot (e.g. "sqrt(2)", "3/2"), so the forms
 * themselves stay simple while the numbers don't have to be.
 */

export type ParsedShape =
  | { kind: "point"; position: Vec3Tuple }
  | { kind: "vector"; direction: Vec3Tuple }
  | { kind: "line"; point: Vec3Tuple; direction: Vec3Tuple }
  | { kind: "plane"; point: Vec3Tuple; normal: Vec3Tuple }
  | { kind: "sphere"; center: Vec3Tuple; radius: number };

function evalNumber(expr: string): number {
  return evaluateNumber(expr);
}

/** Removes one pair of surrounding brackets, only when they really wrap the whole text: "(1,2,3)" and "<1,2,3>" yes, "sqrt(2)" and "(1)+(2)" no. */
function stripOuterBrackets(text: string): string {
  const pairs: Record<string, string> = { "(": ")", "<": ">" };
  const open = text[0];
  if (!(open in pairs) || text[text.length - 1] !== pairs[open]) return text;
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "(" || text[i] === "<") depth++;
    else if (text[i] === ")" || text[i] === ">") depth--;
    // the first bracket closes before the end, so it does not wrap the whole text
    if (depth === 0 && i < text.length - 1) return text;
  }
  return text.slice(1, -1);
}

/** Splits on commas that are not inside brackets, so "max(1, 2), 3, 4" has three parts. */
function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") depth--;
    else if (text[i] === "," && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

function parseVec3(input: string): Vec3Tuple {
  const parts = splitTopLevel(stripOuterBrackets(input.trim()));
  if (parts.length !== 3)
    throw new Error("Expected exactly three comma-separated components, e.g. (1, 2, 3)");
  return [evalNumber(parts[0]), evalNumber(parts[1]), evalNumber(parts[2])];
}

function parsePoint(input: string): ParsedShape {
  return { kind: "point", position: parseVec3(input) };
}

function parseVector(input: string): ParsedShape {
  return { kind: "vector", direction: parseVec3(input) };
}

function parseLine(input: string): ParsedShape {
  const match = input.match(/\(([^)]+)\)\s*\+\s*t\s*\*?\s*\(([^)]+)\)/i);
  if (!match) throw new Error("Expected the form (x0, y0, z0) + t(dx, dy, dz)");
  return { kind: "line", point: parseVec3(match[1]), direction: parseVec3(match[2]) };
}

/** Linear plane equation, e.g. "x+y+z=5" or "2x - y = 3" — coefficients extracted by finite differencing, so any linear expression in x/y/z works. */
function parsePlane(input: string): ParsedShape {
  const [lhsRaw, rhsRaw] = input.split("=");
  if (rhsRaw === undefined) throw new Error("Expected an equation like x + y + z = 5");
  const lhs = lhsRaw.trim();
  const rhs = evalNumber(rhsRaw);

  const base = withScope(lhs, 0, 0, 0);
  const a = withScope(lhs, 1, 0, 0) - base;
  const b = withScope(lhs, 0, 1, 0) - base;
  const c = withScope(lhs, 0, 0, 1) - base;
  if (Math.abs(a) < 1e-9 && Math.abs(b) < 1e-9 && Math.abs(c) < 1e-9) {
    throw new Error("That equation doesn't depend on x, y, or z");
  }

  const d = rhs - base;
  const point: Vec3Tuple =
    Math.abs(a) > 1e-9
      ? [d / a, 0, 0]
      : Math.abs(b) > 1e-9
        ? [0, d / b, 0]
        : [0, 0, d / c];
  return { kind: "plane", point, normal: [a, b, c] };
}

function withScope(expr: string, x: number, y: number, z: number): number {
  return evaluateNumber(expr, { x, y, z });
}

/** Sphere equation in the canonical form (x-h)^2+(y-k)^2+(z-l)^2=r^2 — a fixed template, matched with a per-axis regex. */
function parseSphere(input: string): ParsedShape {
  const [lhsRaw, rhsRaw] = input.split("=");
  if (rhsRaw === undefined)
    throw new Error("Expected the form (x-h)^2 + (y-k)^2 + (z-l)^2 = r^2");
  const centerAxis = (axis: "x" | "y" | "z") => {
    const re = new RegExp(
      `\\(?\\s*${axis}\\s*([+-]\\s*[0-9.]+)?\\s*\\)?\\s*\\^\\s*2`,
      "i",
    );
    const match = lhsRaw.match(re);
    if (!match) return 0;
    const offset = match[1] ? evalNumber(match[1].replace(/\s+/g, "")) : 0;
    return offset === 0 ? 0 : -offset; // never -0
  };

  const center: Vec3Tuple = [centerAxis("x"), centerAxis("y"), centerAxis("z")];
  const rSquared = evalNumber(rhsRaw);
  if (rSquared <= 0)
    throw new Error("The right-hand side must be a positive number (r²)");
  return { kind: "sphere", center, radius: Math.sqrt(rSquared) };
}

export type EquationKind = "point" | "vector" | "line" | "plane" | "sphere";

export const EQUATION_EXAMPLES: Record<EquationKind, string> = {
  point: "1, 2, 3",
  vector: "<3, 5, 1>",
  line: "(1, 2, 3) + t(4, 5, 6)",
  plane: "x + y + z = 5",
  sphere: "(x-2)^2 + (y-1)^2 + z^2 = 9",
};

const PARSERS: Record<EquationKind, (input: string) => ParsedShape> = {
  point: parsePoint,
  vector: parseVector,
  line: parseLine,
  plane: parsePlane,
  sphere: parseSphere,
};

export const MAX_EQUATION_LENGTH = 200;

export function parseEquation(kind: EquationKind, input: string): ParsedShape {
  if (input.length > MAX_EQUATION_LENGTH)
    throw new Error(`Keep the equation under ${MAX_EQUATION_LENGTH} characters.`);
  return PARSERS[kind](input);
}
