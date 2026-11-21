import Equation from "@/components/ui/Equation";
import Panel from "@/components/ui/Panel";

const TAKEAWAYS = [
  {
    title: "Radius and diameter",
    body: "Every point on the sphere is one radius from the center; the diameter is twice that.",
    latex: "d = 2r",
  },
  {
    title: "Surface area",
    body: "Grows with the square of the radius.",
    latex: "A = 4\\pi r^2",
  },
  {
    title: "Volume",
    body: "Grows with the cube of the radius — faster than surface area as the sphere expands.",
    latex: "V = \\dfrac{4}{3}\\pi r^3",
  },
  {
    title: "Chords and great circles",
    body: "A chord connects two surface points directly; a great circle is the largest circle that fits on the sphere, centered on the sphere's own center.",
    latex: "\\text{great circle radius} = r",
  },
  {
    title: "Cross sections",
    body: "Slicing at height h from center produces a circle whose radius shrinks by the Pythagorean theorem.",
    latex: "r_{\\text{slice}} = \\sqrt{r^2 - h^2}",
  },
  {
    title: "Spherical cap volume",
    body: "The volume filled to height h in a spherical tank — the water-fill formula.",
    latex: "V_{\\text{cap}} = \\dfrac{\\pi h^2(3r - h)}{3}",
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
