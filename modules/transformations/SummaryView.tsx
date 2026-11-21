import Equation from "@/components/ui/Equation";
import Panel from "@/components/ui/Panel";

const TAKEAWAYS = [
  {
    title: "Translation",
    body: "Shifts every point by the same vector t. Needs a 4th homogeneous coordinate to be a matrix multiply.",
    latex: "\\begin{pmatrix}1&0&0&t_x\\\\0&1&0&t_y\\\\0&0&1&t_z\\\\0&0&0&1\\end{pmatrix}",
  },
  {
    title: "Scaling",
    body: "Stretches or shrinks along each axis independently — a diagonal matrix.",
    latex: "\\text{diag}(s_x,\\ s_y,\\ s_z)",
  },
  {
    title: "Rotation",
    body: "Turns the shape about an axis, preserving size and shape.",
    latex:
      "R_y(\\theta) = \\begin{pmatrix}\\cos\\theta&0&\\sin\\theta\\\\0&1&0\\\\-\\sin\\theta&0&\\cos\\theta\\end{pmatrix}",
  },
  {
    title: "Reflection",
    body: "Mirrors across a plane — scaling by -1 along the perpendicular axis.",
    latex: "\\text{diag}(-1,\\ 1,\\ 1)",
  },
  {
    title: "Shear",
    body: "Shifts one axis in proportion to another, skewing without changing volume.",
    latex: "x' = x + k\\,y",
  },
  {
    title: "Homogeneous coordinates & composition",
    body: "A 4th w=1 coordinate folds translation into the same matrix form as the linear maps — so a whole chain of transforms is just matrix multiplication, applied right-to-left.",
    latex: "M = T \\cdot R \\cdot S",
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
