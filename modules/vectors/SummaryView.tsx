import Equation from "@/components/ui/Equation";
import Panel from "@/components/ui/Panel";

const TAKEAWAYS = [
  {
    title: "Magnitude",
    body: "A vector's length, from the 3D Pythagorean theorem.",
    latex: "|A| = \\sqrt{a_x^2+a_y^2+a_z^2}",
  },
  {
    title: "Addition & subtraction",
    body: "Add or subtract component-wise; addition completes a parallelogram.",
    latex: "A \\pm B = (a_x\\pm b_x,\\ a_y\\pm b_y,\\ a_z\\pm b_z)",
  },
  {
    title: "Dot product",
    body: "Measures alignment — zero when perpendicular. Recovers the angle between two vectors.",
    latex: "A \\cdot B = |A||B|\\cos\\theta",
  },
  {
    title: "Projection",
    body: "The component of A that points along B — A's \"shadow\" on B's line.",
    latex: "\\text{proj}_B A = \\dfrac{A\\cdot B}{B\\cdot B}B",
  },
  {
    title: "Cross product",
    body: "A new vector perpendicular to both A and B, with length equal to the parallelogram area they span.",
    latex: "|A\\times B| = |A||B|\\sin\\theta",
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
