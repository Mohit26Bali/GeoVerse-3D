import Link from "next/link";
import { ArrowRight } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import { buttonVariants } from "@/components/ui/buttonVariants";
import HeroVideo from "@/components/layout/HeroVideo";
import FoundationDemoScene from "@/modules/foundation-demo/FoundationDemoScene";
import { MODULES } from "@/constants/modules";
import ModuleGrid from "@/components/layout/ModuleGrid";
import { cn } from "@/utils/cn";

export default function Home() {
  return (
    <>
      <TopBar transparent />
      <main className="flex flex-1 flex-col">
        <section className="relative flex min-h-[92vh] flex-col overflow-hidden px-6">
          <HeroVideo />
          {/* Legibility scrim: the video's own climax reveals the GeoVerse wordmark
              center-frame, so foreground copy stays out of that space and lives in
              the lower third instead — heavier scrim there for contrast, lighter
              through the center so the reel itself stays the visual lead. */}
          <div className="from-background/45 to-background absolute inset-0 bg-linear-to-b via-transparent" />
          <div className="from-background/90 via-background/10 absolute inset-0 bg-linear-to-t to-transparent" />

          <h1 className="sr-only">GeoVerse — Interactive 3D Geometry & Linear Algebra</h1>

          <div className="relative z-10 mt-auto flex flex-col items-center gap-6 pb-20 text-center">
            <p className="label-caps text-primary bg-background/75 rounded-sm px-3 py-1 backdrop-blur-sm">
              Interactive 3D geometry &amp; linear algebra
            </p>
            <p className="font-heading text-foreground max-w-xl text-xl text-balance drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] sm:text-2xl">
              GeoVerse turns vectors, matrices, and solids into 3D objects you drag,
              rotate, and slice — every interaction reveals the mathematics behind it.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/modules" className={cn(buttonVariants({ size: "lg" }))}>
                Explore modules <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/modules/geometry-lab"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "border-primary/60 bg-background/50 hover:bg-primary/15 backdrop-blur-sm",
                )}
              >
                Open Geometry Lab
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-24">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-foreground text-2xl font-semibold">
                See the engine live
              </h2>
              <p className="text-muted mt-1 text-sm">
                Drag a point below — every readout and equation updates in real time.
              </p>
            </div>
          </div>
          <div className="border-primary/30 h-130 w-full overflow-hidden rounded-sm border sm:h-150">
            <FoundationDemoScene />
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-24">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-foreground text-2xl font-semibold">Modules</h2>
              <p className="text-muted mt-1 text-sm">
                {MODULES.length} modules, one shared engine.
              </p>
            </div>
            <Link href="/modules" className="text-primary text-sm hover:underline">
              View all
            </Link>
          </div>
          <ModuleGrid modules={MODULES.slice(0, 6)} />
        </section>
      </main>
    </>
  );
}
