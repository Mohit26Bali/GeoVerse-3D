"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { SCENE_DEFAULTS } from "@/constants/scene";

interface LightingRigProps {
  /** Skip the HDRI environment on low-power devices / when only flat shading matters. */
  environment?: boolean;
}

/**
 * Standard three-point-ish lighting shared by every scene: soft ambient
 * fill, a shadow-casting key light, and a rim light for edge definition,
 * plus an HDRI for physically plausible reflections on metallic materials.
 */
export default function LightingRig({ environment = true }: LightingRigProps) {
  return (
    <>
      <ambientLight intensity={0.45} color="#aab4ff" />
      <directionalLight
        position={[6, 10, 6]}
        intensity={1.4}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={SCENE_DEFAULTS.shadowMapSize}
        shadow-mapSize-height={SCENE_DEFAULTS.shadowMapSize}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-8, 4, -6]} intensity={0.35} color="#4c7cff" />
      <hemisphereLight args={["#1c2140", "#05060a", 0.5]} />
      {environment && (
        // A procedural studio environment: no HDR file is downloaded, so there is no third-party request.
        <Environment resolution={256} environmentIntensity={0.4}>
          <Lightformer
            form="rect"
            intensity={2.2}
            color="#fff3d6"
            position={[0, 6, -4]}
            scale={[12, 3, 1]}
          />
          <Lightformer
            form="rect"
            intensity={1.2}
            color="#9fb4ff"
            position={[-6, 2, 3]}
            rotation-y={Math.PI / 2}
            scale={[8, 3, 1]}
          />
          <Lightformer
            form="ring"
            intensity={1.4}
            color="#ffffff"
            position={[5, 3, 4]}
            scale={4}
          />
        </Environment>
      )}
    </>
  );
}
