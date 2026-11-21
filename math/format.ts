import type { Vec3Tuple } from "@/types/math";

/** Formatting helpers that turn numeric results into KaTeX-ready strings. */

export function formatNumber(n: number, precision = 2): string {
  const rounded = Number(n.toFixed(precision));
  return Object.is(rounded, -0) ? "0" : rounded.toString();
}

export function vectorToLatex(v: Vec3Tuple, precision = 2): string {
  return `\\begin{pmatrix} ${formatNumber(v[0], precision)} \\\\ ${formatNumber(
    v[1],
    precision,
  )} \\\\ ${formatNumber(v[2], precision)} \\end{pmatrix}`;
}

export function matrixToLatex(m: number[][], precision = 2): string {
  const rows = m
    .map((row) => row.map((n) => formatNumber(n, precision)).join(" & "))
    .join(" \\\\ ");
  return `\\begin{pmatrix} ${rows} \\end{pmatrix}`;
}

export function lineParametricLatex(
  point: Vec3Tuple,
  direction: Vec3Tuple,
  precision = 2,
): string {
  const [px, py, pz] = point.map((n) => formatNumber(n, precision));
  const [dx, dy, dz] = direction.map((n) => formatNumber(n, precision));
  return `(x, y, z) = (${px}, ${py}, ${pz}) + t(${dx}, ${dy}, ${dz})`;
}

export function planeEquationLatex(
  point: Vec3Tuple,
  normal: Vec3Tuple,
  precision = 2,
): string {
  const [a, b, c] = normal.map((n) => formatNumber(n, precision));
  const d = formatNumber(
    normal[0] * point[0] + normal[1] * point[1] + normal[2] * point[2],
    precision,
  );
  return `${a}x + ${b}y + ${c}z = ${d}`;
}
