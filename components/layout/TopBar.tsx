"use client";

import Link from "next/link";
import { Boxes } from "lucide-react";
import { cn } from "@/utils/cn";

interface TopBarProps {
  /** Renders over a hero video/scene instead of the opaque glass bar. */
  transparent?: boolean;
}

/** Persistent top bar: brand mark + primary nav. Kept minimal per the Apple/Linear-inspired brief. */
export default function TopBar({ transparent = false }: TopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-14 items-center justify-between px-6 transition-colors",
        transparent
          ? "border-b border-transparent bg-linear-to-b from-black/40 to-transparent"
          : "glass",
      )}
    >
      <Link href="/" className="flex items-center gap-2">
        <Boxes className="text-primary h-5 w-5" />
        <span className="text-foreground text-sm font-semibold tracking-wide">
          GeoVerse
        </span>
      </Link>
      <nav className="text-muted flex items-center gap-6 text-sm">
        <Link href="/modules" className="hover:text-foreground transition-colors">
          Modules
        </Link>
        <Link
          href="/modules/geometry-lab"
          className="hover:text-foreground transition-colors"
        >
          Geometry Lab
        </Link>
      </nav>
    </header>
  );
}
