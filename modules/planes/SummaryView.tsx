import Equation from "@/components/ui/Equation";
import Panel from "@/components/ui/Panel";

const TAKEAWAYS = [
  {
    title: "The plane equation",
    body: "A point P₀ the plane passes through, plus a normal vector n perpendicular to it.",
    latex: "ax + by + cz = d",
  },
  {
    title: "Plane through three points",
    body: "The normal comes from the cross product of two edge vectors.",
    latex: "n = (B-A)\\times(C-A)",
  },
  {
    title: "Distance from a point to a plane",
    body: "Project the offset from P₀ to the target onto the normal.",
    latex: "\\text{dist} = \\dfrac{|(Q-P_0)\\cdot n|}{|n|}",
  },
  {
    title: "Line-plane intersection",
    body: "Solve for the parameter t where the line's equation satisfies the plane's equation.",
    latex: "t = \\dfrac{n\\cdot(P_0-L_0)}{n\\cdot d}",
  },
  {
    title: "Plane-plane intersection",
    body: "Two non-parallel planes always meet in a line, running perpendicular to both normals.",
    latex: "d_{\\text{line}} = n_1 \\times n_2",
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
