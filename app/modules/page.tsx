import TopBar from "@/components/layout/TopBar";
import ModuleGrid from "@/components/layout/ModuleGrid";
import { MODULES } from "@/constants/modules";

export default function ModulesPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
        <h1 className="text-foreground text-3xl font-semibold">All modules</h1>
        <p className="text-muted mt-2 max-w-xl text-sm">
          Every module follows the same architecture: Scene → Objects → Animations →
          Mathematical Engine → Explanation Layer → Interactive Controls → Challenge Mode.
        </p>
        <div className="mt-10">
          <ModuleGrid modules={MODULES} />
        </div>
      </main>
    </>
  );
}
