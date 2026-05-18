import type { FC } from "react";
import { interpolate, spring, useVideoConfig } from "remotion";

import {
  END_TARGET,
  ENEMY_UNITS,
  FRIENDLY_UNITS,
  MAP_HEIGHT,
  MAP_NODES,
  MAP_WIDTH,
} from "../data";
import type { MoveStep, Point, UnitId } from "../types";

interface UnitsLayerProps {
  move: MoveStep;
  frame: number;
  selectedUnitId: UnitId | null;
  animateMove: boolean;
  hoveredEnemyId: string | null;
}

const lerp = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const lerpPoint = (from: Point, to: Point, progress: number): Point => ({
  x: lerp(from.x, to.x, progress),
  y: lerp(from.y, to.y, progress),
});

export const UnitsLayer: FC<UnitsLayerProps> = ({
  move,
  frame,
  selectedUnitId,
  animateMove,
  hoveredEnemyId,
}) => {
  const { fps } = useVideoConfig();
  const travelProgress = animateMove
    ? spring({
        frame: Math.max(0, frame - 36),
        fps,
        config: { damping: 18, stiffness: 105, mass: 0.82 },
      })
    : 0;
  const unitEntrance = spring({
    frame: Math.max(0, frame - 4),
    fps,
    config: { damping: 18, stiffness: 135 },
  });
  const enemyOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const selectedPulse = interpolate(frame % 34, [0, 17, 33], [0.72, 1, 0.72], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const activeEnemyId =
    hoveredEnemyId === "cycle"
      ? ENEMY_UNITS[Math.floor(frame / 45) % ENEMY_UNITS.length]?.id
      : hoveredEnemyId;

  return (
    <>
      {MAP_NODES.map((node) => {
        const isCritical = node.variant === "critical";
        const isEnemy = node.variant === "enemy";

        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: node.position.x,
              top: node.position.y,
              width: 54,
              height: 38,
              transform: "translate(-50%, -50%)",
              display: "grid",
              placeItems: "center",
              background: isCritical
                ? "#b25a43"
                : isEnemy
                  ? "#151b17"
                  : "#151b17",
              border: `1px solid ${isCritical ? "#d08370" : "#687466"}`,
              color: "#eef3e7",
              font: '700 12px "Lucida Console", "Courier New", monospace',
              zIndex: 9,
              boxShadow: "0 6px 14px rgba(0,0,0,0.28)",
            }}
          >
            {node.label}
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: END_TARGET.x,
          top: END_TARGET.y,
          width: 100,
          height: 96,
          transform: "translate(-26px, -88px)",
          zIndex: 18,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 24,
            top: 12,
            width: 5,
            height: 78,
            background: "#eef3e7",
            boxShadow: "0 0 12px rgba(238,243,231,0.5)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 29,
            top: 10,
            width: 58,
            height: 36,
            background: "#d6a23a",
            clipPath: "polygon(0 0, 100% 17%, 72% 50%, 100% 84%, 0 72%)",
          }}
        />
      </div>

      {ENEMY_UNITS.map((enemy) => {
        const isHovered = activeEnemyId === enemy.id;
        const tooltipOpacity = isHovered
          ? interpolate(frame, [8, 18], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          : 0;

        return (
          <div
            key={enemy.id}
            style={{
              position: "absolute",
              left: enemy.position.x,
              top: enemy.position.y,
              opacity: enemyOpacity,
              transform: "translate(-50%, -50%)",
              zIndex: isHovered ? 90 : 22,
            }}
          >
          <div
            style={{
              position: "absolute",
              left: -48,
              top: -48,
              width: 96,
              height: 96,
              borderRadius: "50%",
              border: "2px solid rgba(210, 70, 58, 0.3)",
              background: "rgba(210, 70, 58, 0.08)",
            }}
          />
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "18px solid transparent",
              borderRight: "18px solid transparent",
              borderBottom: "36px solid #d6a23a",
              filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.5))",
              transform: "translateY(-18px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -18,
              top: -11,
              width: 36,
              height: 24,
              display: "grid",
              placeItems: "center",
              color: "#111612",
              font: '900 11px "Lucida Console", "Courier New", monospace',
            }}
          >
            {enemy.label}
          </div>
            <div
              style={{
                position: "absolute",
                left: 18,
                top: 24,
                width: 260,
                opacity: tooltipOpacity,
                color: "#d8decf",
                background: "#111612",
                border: "1px solid #d6a23a",
                boxShadow: "6px 6px 0 rgba(0,0,0,0.46)",
                padding: 10,
                font: '700 12px/1.5 "Lucida Console", "Courier New", monospace',
                textTransform: "uppercase",
              }}
            >
              <strong
                style={{
                  display: "block",
                  color: "#d6a23a",
                  borderBottom: "1px solid rgba(214,162,58,0.58)",
                  paddingBottom: 6,
                  marginBottom: 7,
                }}
              >
                Enemy Unit {enemy.label}
              </strong>
              TYPE: {enemy.type}
              <br />
              ROLE: {enemy.role}
              <br />
              SIZE: {enemy.size}
              <br />
              STATE: {enemy.state}
            </div>
          </div>
        );
      })}

      {FRIENDLY_UNITS.map((unit) => {
        const position = lerpPoint(
          move.startPositions[unit.id],
          move.endPositions[unit.id],
          travelProgress,
        );
        const isFocused = selectedUnitId === unit.id;
        const isDimmed = selectedUnitId !== null && !isFocused;

        return (
          <div
            key={unit.id}
            style={{
              position: "absolute",
              left: position.x,
              top: position.y,
              transform: `translate(-50%, -50%) scale(${unitEntrance})`,
              opacity: isDimmed ? 0.34 : 1,
              zIndex: isFocused ? 40 : 32,
            }}
          >
            {isFocused ? (
              <div
                style={{
                  position: "absolute",
                  left: -24,
                  top: -24,
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  border: "3px solid #d6a23a",
                  boxShadow: `0 0 ${20 * selectedPulse}px rgba(214, 162, 58, 0.72)`,
                }}
              />
            ) : null}
            <div
              style={{
                width: 25,
                height: 25,
                borderRadius: "50%",
                border: "1px solid #c7de9f",
                background: "#8fb36a",
                boxShadow:
                  "0 0 0 1px rgba(17,22,18,0.9), 0 10px 18px rgba(0,0,0,0.34)",
                display: "grid",
                placeItems: "center",
                color: "#111612",
                font: '900 7px "Lucida Console", "Courier New", monospace',
              }}
            >
              {unit.label}
            </div>
            {isFocused ? (
              <div
                style={{
                  position: "absolute",
                  left: 18,
                  top: 30,
                  width: 240,
                  color: "#d8decf",
                  background: "#111612",
                  border: "1px solid #d6a23a",
                  boxShadow: "8px 8px 0 rgba(0,0,0,0.32)",
                  padding: 10,
                  font: '700 12px/1.45 "Lucida Console", "Courier New", monospace',
                  zIndex: 100,
                }}
              >
                <strong
                  style={{
                    display: "block",
                    color: "#d6a23a",
                    borderBottom: "1px solid #465147",
                    paddingBottom: 6,
                    marginBottom: 7,
                    textTransform: "uppercase",
                  }}
                >
                  Friendly Unit {unit.id}
                </strong>
                TYPE: {unit.type}
                <br />
                ROLE: {unit.role}
                <br />
                SIZE: {unit.size}
                <br />
                STATE: {move.index > 0 ? "Executing route" : "Available"}
              </div>
            ) : null}
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: MAP_WIDTH - 170,
          top: MAP_HEIGHT - 48,
          width: 136,
          height: 28,
          color: "rgba(238,243,231,0.68)",
          font: '700 11px "Lucida Console", "Courier New", monospace',
          display: "grid",
          placeItems: "center",
          border: "1px solid rgba(238,243,231,0.18)",
          background: "rgba(0,0,0,0.24)",
          zIndex: 10,
        }}
      >
        1 KM GRID
      </div>
    </>
  );
};
