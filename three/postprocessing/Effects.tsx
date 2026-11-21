"use client";

import {
  EffectComposer,
  Bloom,
  SMAA,
  Vignette,
  DepthOfField,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

interface EffectsProps {
  bloom?: boolean;
  depthOfField?: boolean;
  focusDistance?: number;
}

/**
 * Shared postprocessing stack. Kept intentionally light-touch (small bloom
 * radius, subtle vignette) so it reads as "premium render" rather than a
 * bloom-drenched demo. DOF is opt-in since it's the most expensive pass.
 */
export default function Effects({
  bloom = true,
  depthOfField = false,
  focusDistance = 0.02,
}: EffectsProps) {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {bloom ? (
        <Bloom
          intensity={0.45}
          luminanceThreshold={0.35}
          luminanceSmoothing={0.25}
          mipmapBlur
          blendFunction={BlendFunction.SCREEN}
        />
      ) : (
        <></>
      )}
      {depthOfField ? (
        <DepthOfField focusDistance={focusDistance} focalLength={0.02} bokehScale={2} />
      ) : (
        <></>
      )}
      <SMAA />
      <Vignette eskil={false} offset={0.15} darkness={0.6} />
    </EffectComposer>
  );
}
