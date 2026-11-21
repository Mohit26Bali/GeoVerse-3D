import Equation from "@/components/ui/Equation";
import Panel from "@/components/ui/Panel";

const TAKEAWAYS = [
  {
    title: "One surface, four curves",
    body: "Circle, ellipse, parabola, and hyperbola all come from slicing the same double cone at different tilts.",
    latex: "x^2 + z^2 = (ky)^2",
  },
  {
    title: "Circle & ellipse",
    body: "A plane perpendicular to the axis gives a circle; any shallower tilt (up to the critical angle) stretches it into an ellipse.",
    latex: "B^2 - 4AC < 0",
  },
  {
    title: "Parabola",
    body: "The exact tilt parallel to the cone's own slant line — the single knife-edge case between closed and open curves.",
    latex: "B^2 - 4AC = 0",
  },
  {
    title: "Hyperbola",
    body: "Tilt past the critical angle and the plane cuts both nappes, producing two mirrored open branches.",
    latex: "B^2 - 4AC > 0",
  },
  {
    title: "The discriminant",
    body: "Substituting the plane's own coordinates into the cone equation gives a quadratic curve equation — its discriminant alone decides the type.",
    latex: "Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0",
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
