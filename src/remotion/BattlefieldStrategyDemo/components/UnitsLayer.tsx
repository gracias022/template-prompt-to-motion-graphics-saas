import { interpolate, spring, useVideoConfig } from "remotion";

import {
  ENEMY_UNITS,
  FRIENDLY_UNITS,
  MAP_HEIGHT,
  MAP_WIDTH,
  OBJECTIVE_POSITION,
} from "../data";
import type { MoveStep, Point } from "../types";

interface UnitsLayerProps {
  move: MoveStep;
  frame: number;
}

const lerp = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const lerpPoint = (from: Point, to: Point, progress: number): Point => ({
  x: lerp(from.x, to.x, progress),
  y: lerp(from.y, to.y, progress),
});

export const UnitsLayer: React.FC<UnitsLayerProps> = ({ move, frame }) => {
  const { fps } = useVideoConfig();
  const travelProgress =
    move.index === 0
      ? 1
      : spring({
          frame: Math.max(0, frame - 58),
          fps,
          config: { damping: 18, stiffness: 105, mass: 0.8 },
        });
  const unitScale = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 16, stiffness: 130 },
  });
  const enemyOpacity = interpolate(frame, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: OBJECTIVE_POSITION.x,
          top: OBJECTIVE_POSITION.y,
          width: 92,
          height: 92,
          transform: "translate(-18px, -72px)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 18,
            top: 12,
            width: 5,
            height: 72,
            background: "#f8faf6",
            boxShadow: "0 0 12px rgba(248,250,246,0.48)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 23,
            top: 10,
            width: 54,
            height: 34,
            background: "#f6d04d",
            clipPath: "polygon(0 0, 100% 18%, 72% 50%, 100% 84%, 0 72%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -8,
            top: 80,
            color: "#f6d04d",
            fontSize: 18,
            fontWeight: 800,
            textShadow: "0 2px 8px rgba(0,0,0,0.8)",
            whiteSpace: "nowrap",
          }}
        >
          Hill 482
        </div>
      </div>

      {ENEMY_UNITS.map((enemy) => (
        <div
          key={enemy.id}
          style={{
            position: "absolute",
            left: enemy.position.x,
            top: enemy.position.y,
            opacity: enemyOpacity,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -enemy.range,
              top: -enemy.range,
              width: enemy.range * 2,
              height: enemy.range * 2,
              borderRadius: "50%",
              border: "2px solid rgba(239, 68, 68, 0.23)",
              background: "rgba(239, 68, 68, 0.07)",
            }}
          />
          <div
            style={{
              width: 52,
              height: 52,
              transform: "rotate(45deg)",
              borderRadius: 8,
              border: "3px solid #ffc9c9",
              background: "#d53434",
              boxShadow: "0 12px 24px rgba(0,0,0,0.36)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              color: "#fff3f3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 900,
            }}
          >
            {enemy.label}
          </div>
          <div
            style={{
              position: "absolute",
              left: 34,
              top: 30,
              minWidth: 92,
              color: "#ffd8d8",
              fontSize: 15,
              fontWeight: 700,
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
            }}
          >
            {enemy.strength}
          </div>
        </div>
      ))}

      {FRIENDLY_UNITS.map((unit) => {
        const unitPosition = lerpPoint(
          move.previousPositions[unit.id],
          move.unitPositions[unit.id],
          travelProgress,
        );

        return (
          <div
            key={unit.id}
            style={{
              position: "absolute",
              left: unitPosition.x,
              top: unitPosition.y,
              transform: `translate(-50%, -50%) scale(${unitScale})`,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                border: "4px solid #cae6ff",
                background: "linear-gradient(145deg, #1f84ff, #1050bd)",
                boxShadow:
                  "0 16px 28px rgba(0,0,0,0.35), 0 0 20px rgba(31,132,255,0.36)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: 19,
                fontWeight: 900,
              }}
            >
              {unit.label}
            </div>
            <div
              style={{
                position: "absolute",
                left: 42,
                top: -10,
                minWidth: 118,
                color: "#d9ecff",
                background: "rgba(12, 24, 34, 0.78)",
                border: "1px solid rgba(202,230,255,0.24)",
                borderRadius: 6,
                padding: "6px 8px",
                fontSize: 16,
                fontWeight: 800,
                lineHeight: 1.1,
              }}
            >
              {unit.callSign}
              <span
                style={{
                  display: "block",
                  marginTop: 2,
                  fontSize: 12,
                  color: "#9bc9f7",
                  fontWeight: 700,
                }}
              >
                {unit.role}
              </span>
            </div>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: MAP_WIDTH - 162,
          top: MAP_HEIGHT - 54,
          width: 128,
          height: 28,
          color: "rgba(244,247,239,0.68)",
          fontSize: 14,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(244,247,239,0.18)",
          borderRadius: 4,
          background: "rgba(0,0,0,0.22)",
        }}
      >
        1 km grid
      </div>
    </>
  );
};
