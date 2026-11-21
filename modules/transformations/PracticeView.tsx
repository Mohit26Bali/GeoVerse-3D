"use client";

import { useCallback, useState } from "react";
import ModuleScene from "@/three/engine/ModuleScene";
import PointObject from "@/three/objects/PointObject";
import VectorArrow from "@/three/objects/VectorArrow";
import TransformShape from "@/three/objects/TransformShape";
import ControlPanel from "@/components/panels/ControlPanel";
import StatReadout from "@/components/panels/StatReadout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { PALETTE } from "@/constants/theme";
import { cn } from "@/utils/cn";
import { useAnimatedPosition } from "@/hooks/useAnimatedPosition";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import type { Vec3Tuple } from "@/types/math";
import { distance as distanceBetween } from "@/math/vector";
import { rotationMatrix, translationMatrix } from "@/math/transform";

const TRANSLATE_TOLERANCE = 0.35;
const ROTATE_TOLERANCE = 8;

type PracticeMode = "translate" | "rotate";

function randomVec(): Vec3Tuple {
  const rand = (range: number) => Math.round((Math.random() * range * 2 - range) * 2) / 2;
  return [rand(2.5), rand(1.5), rand(2.5)];
}

function randomAngle(): number {
  return Math.round(Math.random() * 35) * 10;
}

function angleDiff(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

export default function PracticeView() {
  const [mode, setMode] = useState<PracticeMode>("translate");

  const [targetVec, setTargetVec] = useState<Vec3Tuple>(() => randomVec());
  const {
    position: handle,
    setPosition,
    animateTo: animatePosTo,
  } = useAnimatedPosition([0, 0, 0]);

  const [targetAngle, setTargetAngle] = useState(() => randomAngle());
  const {
    value: angle,
    setValue: setAngle,
    animateTo: animateAngleTo,
  } = useAnimatedNumber(0);

  const [solved, setSolved] = useState(false);
  const [demoed, setDemoed] = useState(false);
  const [streak, setStreak] = useState(0);

  const translateDist = distanceBetween(handle, targetVec);
  const rotateDist = angleDiff(angle, targetAngle);

  const switchMode = useCallback((next: PracticeMode) => {
    setMode(next);
    setSolved(false);
    setDemoed(false);
  }, []);

  const handleTranslateDrag = useCallback(
    (next: Vec3Tuple) => {
      setPosition(next);
      if (distanceBetween(next, targetVec) < TRANSLATE_TOLERANCE && !solved) {
        setSolved(true);
        setDemoed(false);
        setStreak((s) => s + 1);
      }
    },
    [targetVec, solved, setPosition],
  );

  const handleAngleChange = useCallback(
    (next: number) => {
      setAngle(next);
      if (angleDiff(next, targetAngle) < ROTATE_TOLERANCE && !solved) {
        setSolved(true);
        setDemoed(false);
        setStreak((s) => s + 1);
      }
    },
    [targetAngle, solved, setAngle],
  );

  const nextChallenge = useCallback(() => {
    if (mode === "translate") {
      setTargetVec(randomVec());
      setPosition([0, 0, 0]);
    } else {
      setTargetAngle(randomAngle());
      setAngle(0);
    }
    setSolved(false);
    setDemoed(false);
  }, [mode, setPosition, setAngle]);

  const showMe = useCallback(() => {
    if (mode === "translate") {
      animatePosTo(targetVec, 1.2, () => setDemoed(true));
    } else {
      animateAngleTo(targetAngle, 1.2, () => setDemoed(true));
    }
  }, [mode, targetVec, targetAngle, animatePosTo, animateAngleTo]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <ModuleScene>
        {mode === "translate" ? (
          <>
            <TransformShape
              ghost
              ghostColor={PALETTE.warning}
              matrix={translationMatrix(targetVec)}
            />
            <TransformShape matrix={translationMatrix(handle)} />
            <VectorArrow origin={[0, 0, 0]} direction={handle} color={PALETTE.accent} />
            <PointObject
              position={handle}
              label="t"
              color={solved ? PALETTE.success : PALETTE.accent}
              radius={0.13}
              draggable
              onDrag={handleTranslateDrag}
            />
          </>
        ) : (
          <>
            <TransformShape
              ghost
              ghostColor={PALETTE.warning}
              matrix={rotationMatrix("y", (targetAngle * Math.PI) / 180)}
            />
            <TransformShape matrix={rotationMatrix("y", (angle * Math.PI) / 180)} />
          </>
        )}
      </ModuleScene>

      <div className="pointer-events-none absolute top-20 left-4 flex flex-col gap-3">
        <div className="pointer-events-auto">
          <ControlPanel title="Match the target pose">
            <div className="flex gap-1.5">
              {(["translate", "rotate"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                    mode === m
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-hover text-muted hover:text-foreground",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>

            {mode === "translate" ? (
              <StatReadout label="Distance to target" value={translateDist} />
            ) : (
              <>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={5}
                  value={angle}
                  onChange={(e) => handleAngleChange(Number(e.target.value))}
                  className="accent-primary w-full"
                />
                <StatReadout label="Angle off target" value={rotateDist} unit="°" />
              </>
            )}

            {solved ? (
              <Badge tone="success">Solved!</Badge>
            ) : demoed ? (
              <Badge tone="neutral">Demo — now try it</Badge>
            ) : (
              <Badge tone="neutral">Streak {streak}</Badge>
            )}

            <p className="text-muted text-xs leading-relaxed">
              {mode === "translate"
                ? "Drag the handle so the solid shape lands on the amber ghost target."
                : "Drag the slider so the solid shape's rotation matches the amber ghost target."}
            </p>

            <div className="flex gap-2">
              {solved ? (
                <Button size="sm" onClick={nextChallenge}>
                  Next challenge
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={showMe}>
                  Show me
                </Button>
              )}
            </div>
          </ControlPanel>
        </div>
      </div>
    </div>
  );
}
