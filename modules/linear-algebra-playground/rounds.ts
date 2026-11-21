import {
  apply2,
  eigenvectorDeviationDeg,
  isParallel,
  randomDiagonalizableMatrix,
  rank2x2,
  toMat2,
  type Mat2,
  type RankKind,
  type Vec2,
} from "@/math/linearAlgebra2x2";
import { randomVec2, type LinAlgTopic } from "@/modules/linear-algebra-playground/types";

export interface EigenRound {
  kind: "eigen";
  matrix: Mat2;
  prompt: string;
}

export interface RankRound {
  kind: "rank";
  targetRank: RankKind;
  prompt: string;
}

export interface NullSpaceRound {
  kind: "null-space";
  target: Vec2;
  prompt: string;
}

export interface SpanRound {
  kind: "span";
  target: Vec2;
  prompt: string;
}

export type Round = EigenRound | RankRound | NullSpaceRound | SpanRound;

const RANK_PROMPTS: Record<RankKind, string> = {
  0: "Drag î and ĵ so the matrix has rank 0 — collapse both onto the origin.",
  1: "Drag î and ĵ so the matrix has rank 1 — collapse them onto a single line (any line).",
  2: "Drag î and ĵ so the matrix has rank 2 — make sure they still span the whole plane.",
};

function generateEigenRound(): EigenRound {
  const { matrix } = randomDiagonalizableMatrix();
  return {
    kind: "eigen",
    matrix,
    prompt: "Drag the probe vector v until Mv points along the same line as v.",
  };
}

function generateRankRound(): RankRound {
  const targetRank = [0, 1, 2][Math.floor(Math.random() * 3)] as RankKind;
  return { kind: "rank", targetRank, prompt: RANK_PROMPTS[targetRank] };
}

function generateNullSpaceRound(): NullSpaceRound {
  const target = randomVec2(2.2);
  return {
    kind: "null-space",
    target,
    prompt: "Drag î and ĵ so the marked vector n lands in the null space (M·n = 0).",
  };
}

function generateSpanRound(): SpanRound {
  const target = randomVec2(3);
  return {
    kind: "span",
    target,
    prompt:
      "Drag vector v so the marked target point lies on v's span (the line through v).",
  };
}

const GENERATORS: Record<LinAlgTopic, () => Round> = {
  eigen: generateEigenRound,
  rank: generateRankRound,
  "null-space": generateNullSpaceRound,
  span: generateSpanRound,
};

const ALL_TOPICS: LinAlgTopic[] = ["eigen", "span", "rank", "null-space"];

export function randomTopic(exclude?: LinAlgTopic): LinAlgTopic {
  const pool = ALL_TOPICS.filter((t) => t !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function generateRound(topic: LinAlgTopic): Round {
  return GENERATORS[topic]();
}

const EIGEN_TOLERANCE_DEG = 6;
const NULL_SPACE_TOLERANCE = 0.3;
const SPAN_TOLERANCE = 0.06;
const DEGENERATE_EPS = 0.14;

export function checkEigenSolved(round: EigenRound, probe: Vec2): boolean {
  if (Math.hypot(probe[0], probe[1]) < 0.4) return false;
  return eigenvectorDeviationDeg(round.matrix, probe) < EIGEN_TOLERANCE_DEG;
}

export function checkRankSolved(round: RankRound, i: Vec2, j: Vec2): boolean {
  return rank2x2(toMat2(i, j), DEGENERATE_EPS) === round.targetRank;
}

export function checkNullSpaceSolved(round: NullSpaceRound, i: Vec2, j: Vec2): boolean {
  const image = apply2(toMat2(i, j), round.target);
  return Math.hypot(image[0], image[1]) < NULL_SPACE_TOLERANCE;
}

export function checkSpanSolved(round: SpanRound, v: Vec2): boolean {
  if (Math.hypot(v[0], v[1]) < 0.4) return false;
  return isParallel(v, round.target, SPAN_TOLERANCE);
}
