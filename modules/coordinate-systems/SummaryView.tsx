import Equation from "@/components/ui/Equation";
import Panel from "@/components/ui/Panel";

const TAKEAWAYS = [
  {
    title: "The origin",
    body: "Every coordinate is measured from (0, 0, 0), where all three axes meet.",
    latex: "O = (0,\\ 0,\\ 0)",
  },
  {
    title: "Reading coordinates",
    body: "A point's (x, y, z) are its signed distances along each axis.",
    latex: "P = (x,\\ y,\\ z)",
  },
  {
    title: "Distance from the origin",
    body: "Comes from the 3D Pythagorean theorem.",
    latex: "|OP| = \\sqrt{x^2 + y^2 + z^2}",
  },
  {
    title: "Midpoint",
    body: "Average each coordinate independently.",
    latex:
      "M = \\left(\\dfrac{x_1+x_2}{2},\\ \\dfrac{y_1+y_2}{2},\\ \\dfrac{z_1+z_2}{2}\\right)",
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
