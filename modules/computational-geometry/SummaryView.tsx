import Panel from "@/components/ui/Panel";

const TAKEAWAYS = [
  {
    title: "Convex Hull",
    body: "The smallest convex polygon enclosing a point set — found by keeping only points where every other point stays on one side (monotone chain / gift wrapping).",
  },
  {
    title: "Voronoi Diagram",
    body: "Partitions the plane into regions, one per site, by nearest distance. Every cell boundary is a perpendicular bisector between two sites.",
  },
  {
    title: "Delaunay Triangulation",
    body: "The triangulation where no point lies inside another triangle's circumcircle — it's the dual of the Voronoi diagram and avoids thin sliver triangles.",
  },
  {
    title: "Bounding Box",
    body: "The tightest axis-aligned rectangle around a point set — a cheap first-pass test before exact collision or intersection checks.",
  },
  {
    title: "Ray Casting",
    body: "Firing a ray and finding its first intersection with a shape's edges — the basis of mouse picking, line-of-sight, and point-in-polygon tests.",
  },
  {
    title: "Collision Detection",
    body: "Testing shape overlap: circle-circle compares a distance to a radius sum, box-box compares per-axis ranges, and general convex polygons need the separating axis theorem.",
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
          </Panel>
        ))}
      </div>
    </div>
  );
}
