"use client";

import { useMemo, useState, type MouseEvent as ReactMouseEvent } from "react";
import { Line } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import ControlPanel from "@/components/panels/ControlPanel";
import StatReadout from "@/components/panels/StatReadout";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { PALETTE } from "@/constants/theme";
import type { Vec3Tuple } from "@/types/math";
import { dot, normalize, subtract } from "@/math/vector";
import {
  classifyOrbit,
  orbitPath,
  projectileTrajectory,
  type OrbitKind,
} from "@/math/physics";
import { solveTwoLinkIK } from "@/modules/real-world-applications/kinematics";
import MovingMarker from "@/modules/real-world-applications/MovingMarker";
import { SCENES, type SceneId } from "@/modules/real-world-applications/types";

const L1 = 2.2;
const L2 = 1.8;
const ARM_SEGMENTS = 64;

function circlePoints(radius: number): Vec3Tuple[] {
  const points: Vec3Tuple[] = [];
  for (let i = 0; i <= ARM_SEGMENTS; i++) {
    const a = (i / ARM_SEGMENTS) * Math.PI * 2;
    points.push([Math.cos(a) * radius, 0, Math.sin(a) * radius]);
  }
  return points;
}

const OUTER_REACH = circlePoints(L1 + L2);
const INNER_REACH = circlePoints(Math.abs(L1 - L2));

const GRAVITY = 9.8;
const ORBIT_MU = 6;

const ORBIT_KIND_LABEL: Record<OrbitKind, string> = {
  ellipse: "Ellipse — a bound orbit",
  parabola: "Parabola — exactly escaping",
  hyperbola: "Hyperbola — escaping with energy to spare",
};

const ORBIT_KIND_TONE: Record<OrbitKind, "success" | "warning" | "error"> = {
  ellipse: "success",
  parabola: "warning",
  hyperbola: "error",
};

const SATELLITE_START: Vec3Tuple = [3.5, 0, 0];

export default function ExploreView() {
  const [scene, setScene] = useState<SceneId>("robotics");

  // Robotics
  const [target, setTarget] = useState<Vec3Tuple>([2.6, 0, 1.2]);
  const pose = useMemo(() => solveTwoLinkIK(target[0], target[2], L1, L2), [target]);

  // Physics — projectile
  const [physicsMode, setPhysicsMode] = useState<"projectile" | "orbit">("projectile");
  const [launch, setLaunch] = useState<Vec3Tuple>([3, 2.2, 0]);
  const launchSpeed = Math.hypot(launch[0], launch[1]);
  const launchAngle = Math.atan2(launch[1], launch[0]);
  const projectile = useMemo(
    () => projectileTrajectory(launchSpeed, launchAngle, GRAVITY),
    [launchSpeed, launchAngle],
  );

  // Physics — orbit
  const [satVelocity, setSatVelocity] = useState<Vec3Tuple>([0, 0, 1.6]);
  const satPosition = SATELLITE_START;
  const orbitClass = useMemo(
    () =>
      classifyOrbit(
        [satPosition[0], satPosition[2]],
        [satVelocity[0], satVelocity[2]],
        ORBIT_MU,
      ),
    [satVelocity, satPosition],
  );
  const orbitPoints = useMemo(
    () =>
      orbitPath(
        [satPosition[0], satPosition[2]],
        [satVelocity[0], satVelocity[2]],
        ORBIT_MU,
        900,
        0.03,
      ),
    [satVelocity, satPosition],
  );

  // Graphics
  const [lightPos, setLightPos] = useState<Vec3Tuple>([2.5, 3, 2]);
  const [samplePoint, setSamplePoint] = useState<Vec3Tuple | null>(null);
  const sphereCenter: Vec3Tuple = [0, 1.4, 0];
  const sphereRadius = 1.4;
  const normalAtSample = samplePoint
    ? normalize(subtract(samplePoint, sphereCenter))
    : null;
  const lightDirAtSample = samplePoint
    ? normalize(subtract(lightPos, samplePoint))
    : null;
  const brightness =
    normalAtSample && lightDirAtSample
      ? Math.max(0, dot(normalAtSample, lightDirAtSample))
      : null;

  const handleSphereClick = (e: ThreeEvent<ReactMouseEvent>) => {
    e.stopPropagation();
    setSamplePoint([e.point.x, e.point.y, e.point.z]);
  };

  const activeScene = SCENES.find((s) => s.id === scene)!;

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        {scene === "robotics" && (
          <>
            <Line
              points={OUTER_REACH}
              color={PALETTE.border}
              transparent
              opacity={0.5}
              dashed
              dashScale={3}
            />
            <Line
              points={INNER_REACH}
              color={PALETTE.border}
              transparent
              opacity={0.3}
              dashed
              dashScale={3}
            />
            <Line
              points={[[0, 0, 0], pose.joint1]}
              color={PALETTE.primary}
              lineWidth={4}
            />
            <Line
              points={[pose.joint1, pose.end]}
              color={PALETTE.secondary}
              lineWidth={4}
            />
            <PointObject
              position={[0, 0, 0]}
              label="base"
              color={PALETTE.foreground}
              radius={0.14}
            />
            <PointObject
              position={pose.joint1}
              label="joint"
              color={PALETTE.primary}
              radius={0.13}
            />
            <PointObject
              position={pose.end}
              label="end effector"
              color={pose.reachable ? PALETTE.success : PALETTE.warning}
              radius={0.13}
            />
            <PointObject
              position={target}
              label="target"
              color={pose.reachable ? PALETTE.success : PALETTE.error}
              radius={0.14}
              draggable
              dragOnGroundPlane
              onDrag={setTarget}
            />
          </>
        )}

        {scene === "physics" && physicsMode === "projectile" && (
          <>
            <Line points={projectile.points} color={PALETTE.accent} lineWidth={2} />
            <VectorArrow
              origin={[0, 0, 0]}
              direction={launch}
              color={PALETTE.primary}
              label="launch"
            />
            <MovingMarker
              points={projectile.points}
              durationSeconds={projectile.timeOfFlight || 1}
              color={PALETTE.warning}
            />
            <PointObject
              position={launch}
              label="v₀"
              color={PALETTE.primary}
              radius={0.13}
              draggable
              dragPlaneNormal={[0, 0, 1]}
              onDrag={(next) =>
                setLaunch([Math.max(0.2, next[0]), Math.max(0.2, next[1]), 0])
              }
            />
          </>
        )}

        {scene === "physics" && physicsMode === "orbit" && (
          <>
            <PointObject
              position={[0, 0, 0]}
              label="mass"
              color={PALETTE.warning}
              radius={0.3}
            />
            <Line
              points={orbitPoints}
              color={
                ORBIT_KIND_TONE[orbitClass.kind] === "error"
                  ? PALETTE.error
                  : PALETTE.accent
              }
              lineWidth={2}
            />
            <VectorArrow
              origin={satPosition}
              direction={satVelocity}
              color={PALETTE.primary}
              label="v"
            />
            <MovingMarker
              points={orbitPoints}
              durationSeconds={6}
              color={PALETTE.success}
            />
            <PointObject
              position={[
                satPosition[0] + satVelocity[0],
                0,
                satPosition[2] + satVelocity[2],
              ]}
              label="drag me"
              color={PALETTE.primary}
              radius={0.12}
              draggable
              dragOnGroundPlane
              onDrag={(next) =>
                setSatVelocity([next[0] - satPosition[0], 0, next[2] - satPosition[2]])
              }
            />
          </>
        )}

        {scene === "graphics" && (
          <>
            <mesh
              position={sphereCenter}
              castShadow
              receiveShadow
              onPointerDown={handleSphereClick}
            >
              <sphereGeometry args={[sphereRadius, 48, 32]} />
              <meshStandardMaterial
                color={PALETTE.primary}
                roughness={0.55}
                metalness={0.05}
              />
            </mesh>
            <pointLight
              position={lightPos}
              intensity={12}
              distance={20}
              color="#ffffff"
            />
            <PointObject
              position={lightPos}
              label="light"
              color={PALETTE.warning}
              radius={0.15}
              draggable
              onDrag={setLightPos}
            />
            {samplePoint && normalAtSample && lightDirAtSample && (
              <>
                <PointObject
                  position={samplePoint}
                  color={PALETTE.foreground}
                  radius={0.08}
                />
                <VectorArrow
                  origin={samplePoint}
                  direction={[
                    normalAtSample[0] * 0.8,
                    normalAtSample[1] * 0.8,
                    normalAtSample[2] * 0.8,
                  ]}
                  color={PALETTE.success}
                  label="normal"
                />
                <VectorArrow
                  origin={samplePoint}
                  direction={[
                    lightDirAtSample[0] * 0.8,
                    lightDirAtSample[1] * 0.8,
                    lightDirAtSample[2] * 0.8,
                  ]}
                  color={PALETTE.warning}
                  label="to light"
                />
              </>
            )}
          </>
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Real-World Applications">
            <div className="flex flex-wrap gap-1.5">
              {SCENES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScene(s.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    scene === s.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-hover text-muted hover:text-foreground",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <p className="text-muted text-xs leading-relaxed">
              {activeScene.description}
            </p>

            {scene === "robotics" && (
              <>
                <StatReadout
                  label="θ₁ (base joint)"
                  value={(pose.theta1 * 180) / Math.PI}
                />
                <StatReadout
                  label="θ₂ (elbow joint)"
                  value={(pose.theta2 * 180) / Math.PI}
                />
                <Badge tone={pose.reachable ? "success" : "warning"}>
                  {pose.reachable
                    ? "Target reachable"
                    : "Out of reach — arm stretches toward it"}
                </Badge>
              </>
            )}

            {scene === "physics" && (
              <>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setPhysicsMode("projectile")}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs",
                      physicsMode === "projectile"
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-hover text-muted",
                    )}
                  >
                    Projectile
                  </button>
                  <button
                    onClick={() => setPhysicsMode("orbit")}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs",
                      physicsMode === "orbit"
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-hover text-muted",
                    )}
                  >
                    Orbit
                  </button>
                </div>

                {physicsMode === "projectile" ? (
                  <>
                    <StatReadout label="Range" value={projectile.range} />
                    <StatReadout label="Max height" value={projectile.maxHeight} />
                    <StatReadout label="Time of flight" value={projectile.timeOfFlight} />
                    <p className="text-muted text-xs leading-relaxed">
                      Drag the launch vector — the path it traces is a parabola, the same
                      curve family from Conic Sections.
                    </p>
                  </>
                ) : (
                  <>
                    <Badge tone={ORBIT_KIND_TONE[orbitClass.kind]}>
                      {ORBIT_KIND_LABEL[orbitClass.kind]}
                    </Badge>
                    <StatReadout
                      label="Specific orbital energy"
                      value={orbitClass.specificEnergy}
                    />
                    <p className="text-muted text-xs leading-relaxed">
                      Drag the velocity handle — negative energy stays bound as an
                      ellipse, zero energy exactly escapes as a parabola, positive energy
                      escapes as a hyperbola.
                    </p>
                  </>
                )}
              </>
            )}

            {scene === "graphics" && (
              <>
                {samplePoint && brightness !== null ? (
                  <>
                    <StatReadout label="normal · light direction" value={brightness} />
                    <Badge
                      tone={
                        brightness > 0.5
                          ? "success"
                          : brightness > 0.1
                            ? "warning"
                            : "neutral"
                      }
                    >
                      Brightness {(brightness * 100).toFixed(0)}%
                    </Badge>
                  </>
                ) : (
                  <Badge tone="neutral">Click the sphere to sample a point</Badge>
                )}
                <p className="text-muted text-xs leading-relaxed">
                  That click cast a ray from your cursor — the same ray casting from
                  Computational Geometry. Drag the light to change the dot product between
                  the surface normal and the light direction, which is exactly the
                  brightness a renderer computes.
                </p>
                {samplePoint && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSamplePoint(null)}
                  >
                    Clear sample
                  </Button>
                )}
              </>
            )}

            <p className="text-muted text-xs leading-relaxed">
              Left-drag empty space to orbit.
            </p>
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
