"use client";

import { animated } from "@react-spring/web";
import { useCountUp } from "@/animations/useCountUp";

interface StatReadoutProps {
  label: string;
  value: number;
  unit?: string;
  precision?: number;
}

/** A live-updating numeric readout (distance, angle, determinant, ...) that counts smoothly. */
export default function StatReadout({
  label,
  value,
  unit,
  precision = 2,
}: StatReadoutProps) {
  const display = useCountUp(value, precision);

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted text-xs">{label}</span>
      <span className="text-foreground font-mono text-lg tabular-nums">
        <animated.span>{display}</animated.span>
        {unit && <span className="text-muted ml-1 text-sm">{unit}</span>}
      </span>
    </div>
  );
}
