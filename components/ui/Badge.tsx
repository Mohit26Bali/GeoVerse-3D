import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        primary: "bg-primary/15 text-primary",
        secondary: "bg-secondary/15 text-secondary",
        accent: "bg-accent/15 text-accent",
        success: "bg-success/15 text-success",
        warning: "bg-warning/15 text-warning",
        error: "bg-error/15 text-error",
        neutral: "bg-surface-hover text-muted",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export default function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
