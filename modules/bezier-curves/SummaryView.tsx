import Equation from "@/components/ui/Equation";
import Panel from "@/components/ui/Panel";

const TAKEAWAYS = [
  {
    title: "De Casteljau's algorithm",
    body: "Repeatedly lerp each consecutive pair of control points by t until one point remains — that point traces the curve.",
    latex: "\\text{lerp}(P_i, P_{i+1}, t)",
  },
  {
    title: "Linear Bézier",
    body: "Two control points; the curve is just the straight line between them.",
    latex: "B(t) = (1-t)P_0 + tP_1",
  },
  {
    title: "Quadratic Bézier",
    body: "Three control points, one level of nested interpolation.",
    latex: "B(t) = (1-t)^2P_0 + 2(1-t)tP_1 + t^2P_2",
  },
  {
    title: "Cubic Bézier",
    body: "Four control points, two levels of nesting — the curve type behind fonts and vector graphics.",
    latex: "B(t) = (1-t)^3P_0 + 3(1-t)^2tP_1 + 3(1-t)t^2P_2 + t^3P_3",
  },
  {
    title: "Tangents",
    body: "The derivative of a degree-n curve is n times a degree-(n-1) curve built from the differences between consecutive control points.",
    latex: "B'(t) = n \\cdot \\text{Bézier}(P_{i+1}-P_i,\\ t)",
  },
];

export default function SummaryView() {
  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] w-full max-w-2xl flex-col items-center gap-6 overflow-y-auto px-6 py-24 text-center">
      <h2 className="text-foreground text-2xl font-semibold">Key takeaways</h2>
      <div className="flex w-full flex-col gap-4 text-left">
        {TAKEAWAYS.map((t) => (
          <Panel key={t.title} className="p-5">
            <h3 className="text-foreground text-sm font-semibold">{t.title}</h3>
            <p className="text-muted mt-1 text-sm">{t.body}</p>
            <div className="mt-3">
              <Equation latex={t.latex} />
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
