"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { PALETTE } from "@/constants/theme";
import { circlePoints3D } from "@/math/geometry";
import type { PreviewData } from "@/modules/geometry-lab/types";

/** Renders an operation's non-persisted result (a cross-section circle or a closest-approach segment). */
export default function PreviewOverlay({ preview }: { preview: PreviewData }) {
  const points = useMemo(() => {
    if (preview.type === "circle")
      return circlePoints3D(preview.center, preview.radius, preview.normal);
    return preview.points;
  }, [preview]);

  return (
    <Line points={points} color={PALETTE.accent} lineWidth={2.5} dashed dashScale={3} />
  );
}
