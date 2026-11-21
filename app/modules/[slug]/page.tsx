import { notFound } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import ModuleSidebar from "@/components/layout/ModuleSidebar";
import { MODULES } from "@/constants/modules";
import ModulePlaceholder from "@/modules/_shared/ModulePlaceholder";
import { MODULE_COMPONENTS } from "@/modules/_registry";

export function generateStaticParams() {
  return MODULES.map((mod) => ({ slug: mod.slug }));
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!MODULES.some((mod) => mod.slug === slug)) notFound();

  const ModuleComponent = MODULE_COMPONENTS[slug];

  return (
    <>
      <TopBar />
      <div className="flex flex-1">
        <ModuleSidebar />
        <main className="flex-1">
          {ModuleComponent ? <ModuleComponent /> : <ModulePlaceholder slug={slug} />}
        </main>
      </div>
    </>
  );
}
