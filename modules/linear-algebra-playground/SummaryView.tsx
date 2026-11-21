import Equation from "@/components/ui/Equation";
import Panel from "@/components/ui/Panel";

const TAKEAWAYS = [
  {
    title: "Span",
    body: "The set of every point reachable by scaling and adding a set of vectors. Two non-parallel vectors span the whole plane.",
    latex:
      "\\text{span}\\{\\hat\\imath, \\hat\\jmath\\} = \\{a\\hat\\imath + b\\hat\\jmath : a, b \\in \\mathbb{R}\\}",
  },
  {
    title: "Column Space",
    body: "The span of a matrix's columns — exactly the set of outputs the matrix can ever produce.",
    latex: "\\text{col}(M) = \\text{span}\\{\\text{columns of } M\\}",
  },
  {
    title: "Rank",
    body: "The dimension of the column space: 2 for a full-rank matrix, 1 when it collapses to a line, 0 when it collapses to the origin.",
    latex: "\\text{rank}(M) = \\dim(\\text{col}(M))",
  },
  {
    title: "Null Space",
    body: "Every input vector the matrix sends to the exact origin. Non-trivial only when the matrix is degenerate (rank less than full).",
    latex: "\\text{null}(M) = \\{v : Mv = 0\\}",
  },
  {
    title: "Eigenvectors & Eigenvalues",
    body: "A direction the matrix doesn't rotate — only stretches or flips by the eigenvalue λ.",
    latex: "Mv = \\lambda v",
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
