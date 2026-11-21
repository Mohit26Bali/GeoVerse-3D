import Equation from "@/components/ui/Equation";
import Panel from "@/components/ui/Panel";

const TAKEAWAYS = [
  {
    title: "A matrix is its columns",
    body: "Each column shows exactly where a basis vector lands under the transformation.",
    latex:
      "M = \\begin{pmatrix} | & | & | \\\\ \\hat{i}\\, & \\hat{j}\\, & \\hat{k} \\\\ | & | & | \\end{pmatrix}",
  },
  {
    title: "Determinant",
    body: "The signed volume of the parallelepiped the basis vectors span — negative means orientation flipped.",
    latex: "\\det(M) = \\hat{i}\\cdot(\\hat{j}\\times\\hat{k})",
  },
  {
    title: "Inverse",
    body: "The matrix that sends the transformed basis vectors back to î, ĵ, k̂ — undoing M exactly. Only exists when det(M) ≠ 0.",
    latex: "M M^{-1} = I",
  },
  {
    title: "Composition & order",
    body: "Applying two matrices in sequence is matrix multiplication — and AB usually differs from BA.",
    latex: "AB \\neq BA",
  },
  {
    title: "The grid warp",
    body: "Since linear maps preserve straight lines, transforming just the grid's corners is enough to see how the whole plane bends.",
    latex: "\\vec{v}' = M\\vec{v}",
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
