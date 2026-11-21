/** Grounding context sent to /api/explain so the model explains the exact
 * paused step instead of the module in general. */
export interface ExplainContext {
  moduleTitle: string;
  stepTitle: string;
  stepDescription: string;
  /** Formula shown on screen for this step, if any (plain LaTeX, no $ delimiters). */
  latex?: string;
  /** Current numeric readouts (already formatted strings), e.g. { "x": "2.50" }. */
  values?: Record<string, string>;
}
