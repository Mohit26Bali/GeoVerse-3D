import Equation from "@/components/ui/Equation";
import Panel from "@/components/ui/Panel";

const TAKEAWAYS = [
  {
    title: "Why splines",
    body: "Chaining many curve segments together lets a smooth path visit an arbitrary number of points, not just 2-4.",
    latex: "\\text{spline} = \\text{segment}_1 \\cup \\text{segment}_2 \\cup \\dots",
  },
  {
    title: "Catmull-Rom",
    body: "Every segment blends the 4 nearest anchors with a fixed matrix, built so the curve interpolates each one exactly.",
    latex:
      "Q(t) = \\tfrac{1}{2}\\begin{pmatrix}0&2&0&0\\\\-1&0&1&0\\\\2&-5&4&-1\\\\-1&3&-3&1\\end{pmatrix}",
  },
  {
    title: "Bézier splines",
    body: "A chain of cubic Bézier segments, with handles aligned at each joint for a smooth (C1) transition.",
    latex: "\\text{handle}_i = P_i \\pm \\tfrac{P_{i+1}-P_{i-1}}{6}",
  },
  {
    title: "B-splines",
    body: "Trade interpolation for locality: the curve approximates the anchors, but moving one only reshapes a local stretch.",
    latex:
      "Q(t) = \\tfrac{1}{6}\\begin{pmatrix}1&4&1&0\\\\-3&0&3&0\\\\3&-6&3&0\\\\-1&3&-3&1\\end{pmatrix}",
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
            <div className="mt-3 overflow-x-auto">
              <Equation latex={t.latex} />
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
