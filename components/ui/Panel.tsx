import { type HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

/** Glassmorphic surface used for control panels, HUD readouts, and cards. */
export default function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("glass rounded-sm shadow-[0_8px_30px_rgba(0,0,0,0.45)]", className)}
      {...props}
    />
  );
}
