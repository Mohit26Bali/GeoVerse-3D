import type { ReactNode } from "react";
import Panel from "@/components/ui/Panel";
import { cn } from "@/utils/cn";

interface ControlPanelProps {
  title: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

/**
 * Standard shell for a module's floating control panel: title, body slot
 * for sliders/toggles/draggable-value inputs, optional footer (e.g. live
 * equation or stat readouts). Every module's Interactive Controls layer
 * should render inside one of these for visual consistency.
 */
export default function ControlPanel({
  title,
  children,
  footer,
  className,
}: ControlPanelProps) {
  return (
    <Panel className={cn("flex w-72 flex-col gap-4 p-4", className)}>
      <h3 className="text-foreground text-sm font-semibold tracking-wide">{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
      {footer && <div className="border-border border-t pt-3">{footer}</div>}
    </Panel>
  );
}
