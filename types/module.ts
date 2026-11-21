import type { LucideIcon } from "lucide-react";

export type LearningMode = "explore" | "guided" | "practice" | "challenge" | "summary";

export type ModuleCategory =
  | "foundation"
  | "coordinate-systems"
  | "vectors"
  | "lines"
  | "planes"
  | "transformations"
  | "matrices"
  | "polyhedra"
  | "spheres"
  | "conics"
  | "bezier"
  | "splines"
  | "computational-geometry"
  | "linear-algebra"
  | "applications"
  | "geometry-lab";

export interface ModuleHelpContent {
  whatIsIt: string;
  why: string;
  how: string;
  usage: string;
}

export interface ModuleSummary {
  slug: string;
  title: string;
  shortDescription: string;
  category: ModuleCategory;
  icon: LucideIcon;
  accent: "primary" | "secondary" | "accent" | "success" | "warning";
  /** Modules ship incrementally; unimplemented ones render a "coming soon" state. */
  status: "available" | "coming-soon";
  modes: LearningMode[];
  /** Content for the "?" help dialog. Falls back to `shortDescription` when absent. */
  help?: ModuleHelpContent;
}
