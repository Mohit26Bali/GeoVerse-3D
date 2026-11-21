import Equation from "@/components/ui/Equation";
import Panel from "@/components/ui/Panel";
import { POLYHEDRA } from "@/modules/polyhedra/types";

const TAKEAWAYS = [
  {
    title: "Euler's formula",
    body: "For any convex polyhedron: vertices minus edges plus faces always equals 2.",
    latex: "V - E + F = 2",
  },
  {
    title: "The five Platonic solids",
    body: "The only solids where every face is the same regular polygon and every vertex is identical: tetrahedron, cube, octahedron, dodecahedron, icosahedron.",
    latex: "\\{4, 6, 8, 12, 20\\}\\ \\text{faces}",
  },
  {
    title: "Duality",
    body: "The cube and octahedron are duals (swap faces ↔ vertices); so are the dodecahedron and icosahedron. The tetrahedron is its own dual.",
    latex: "\\text{cube} \\leftrightarrow \\text{octahedron}",
  },
  {
    title: "Exploded views",
    body: "Pushing each face outward along its own normal reveals how a solid decomposes into flat pieces — the same mechanism works for any solid.",
    latex: "\\vec{p}' = \\vec{p} + t\\,\\hat{n}_{\\text{face}}",
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
        <Panel className="p-5">
          <h3 className="text-foreground text-sm font-semibold">
            Every solid, at a glance
          </h3>
          <div className="text-muted mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            {POLYHEDRA.map((p) => (
              <div key={p.id} className="bg-surface-hover flex flex-col rounded-md p-2">
                <span className="text-foreground font-medium">{p.label}</span>
                <span>
                  V{p.vertices} E{p.edges} F{p.faces}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
