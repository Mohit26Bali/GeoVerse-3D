"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { MODULES } from "@/constants/modules";
import { ACCENT_HEX } from "@/constants/theme";
import { cn } from "@/utils/cn";
import { useAppStore } from "@/store/useAppStore";

/** Left-hand module navigation grouped by topic, shared across module routes. Collapsible to an icon rail. */
export default function ModuleSidebar() {
  const pathname = usePathname();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "border-border hidden shrink-0 border-r p-2 transition-[width] duration-200 lg:block",
        collapsed ? "w-14" : "w-64 p-4",
      )}
    >
      <div
        className={cn(
          "mb-3 flex items-center",
          collapsed ? "justify-center" : "justify-between px-2",
        )}
      >
        {!collapsed && (
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Modules
          </p>
        )}
        <button
          onClick={toggleSidebar}
          className="text-muted hover:text-foreground hover:bg-surface-hover rounded-md p-1.5 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </button>
      </div>
      <nav className="flex flex-col gap-1">
        {MODULES.map((mod) => {
          const href = `/modules/${mod.slug}`;
          const isActive = pathname === href;
          const Icon = mod.icon;
          return (
            <Link
              key={mod.slug}
              href={href}
              title={collapsed ? mod.title : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-surface text-foreground"
                  : "text-muted hover:bg-surface-hover hover:text-foreground",
              )}
            >
              <Icon
                className="h-4 w-4 shrink-0"
                style={{ color: isActive ? ACCENT_HEX[mod.accent] : undefined }}
              />
              {!collapsed && (
                <>
                  <span className="truncate">{mod.title}</span>
                  {mod.status === "coming-soon" && (
                    <span className="text-muted-foreground ml-auto shrink-0 text-[10px]">
                      soon
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
