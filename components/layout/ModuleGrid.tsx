import Link from "next/link";
import type { ModuleSummary } from "@/types/module";
import Panel from "@/components/ui/Panel";
import Badge from "@/components/ui/Badge";
import { ACCENT_HEX } from "@/constants/theme";

interface ModuleGridProps {
  modules: ModuleSummary[];
}

/** Card grid used on the home page and /modules listing. */
export default function ModuleGrid({ modules }: ModuleGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((mod) => {
        const Icon = mod.icon;
        return (
          <Link key={mod.slug} href={`/modules/${mod.slug}`}>
            <Panel className="group hover:border-border-strong flex h-full flex-col gap-4 p-5 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${ACCENT_HEX[mod.accent]}22` }}
                >
                  <Icon
                    className="h-4.5 w-4.5"
                    style={{ color: ACCENT_HEX[mod.accent] }}
                  />
                </div>
                {mod.status === "coming-soon" && (
                  <Badge tone="neutral">Coming soon</Badge>
                )}
              </div>
              <div>
                <h3 className="text-foreground text-sm font-semibold">{mod.title}</h3>
                <p className="text-muted mt-1 text-sm">{mod.shortDescription}</p>
              </div>
            </Panel>
          </Link>
        );
      })}
    </div>
  );
}
