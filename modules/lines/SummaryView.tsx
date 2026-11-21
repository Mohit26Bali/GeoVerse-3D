import Equation from "@/components/ui/Equation";
import Panel from "@/components/ui/Panel";

const TAKEAWAYS = [
  {
    title: "Defining a line",
    body: "A point P₀ the line passes through, plus a direction vector d.",
    latex: "P_0,\\ \\ d",
  },
  {
    title: "Parametric equations",
    body: "Every point on the line, as the parameter t sweeps all real numbers.",
    latex: "(x, y, z) = P_0 + t\\,d",
  },
  {
    title: "Closest point on a line",
    body: "Project the offset from P₀ to the target onto the direction vector.",
    latex: "t^* = \\dfrac{(Q-P_0)\\cdot d}{d\\cdot d}",
  },
  {
    title: "Line through two points",
    body: "Anchor at one point; the direction is the difference between them.",
    latex: "P_0 = A,\\ \\ d = B - A",
  },
  {
    title: "Closest approach between two lines",
    body: "Two 3D lines are usually skew — their shortest connecting segment is perpendicular to both directions.",
    latex: "\\min |P_A(s) - P_B(t)|",
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
