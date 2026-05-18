import { MousePointer2, X } from "lucide-react";
import type { FC } from "react";
import { interpolate, spring, useVideoConfig } from "remotion";

import { UNIT_ORDER } from "../data";
import type { MoveStep, Point, StrategyId, TooltipKind, TooltipMode } from "../types";

interface TooltipLayerProps {
  move: MoveStep;
  frame: number;
  tooltipStrategyId: StrategyId | null;
  tooltipMode: TooltipMode;
  tooltipKind: TooltipKind;
}

export const TooltipLayer: FC<TooltipLayerProps> = ({
  move,
  frame,
  tooltipStrategyId,
  tooltipMode,
  tooltipKind,
}) => {
  const { fps } = useVideoConfig();

  if (tooltipMode === "hidden") {
    return null;
  }

  const strategy =
    tooltipKind === "strategy" && tooltipStrategyId !== null
      ? move.paths.find((path) => path.id === tooltipStrategyId)
      : null;
  const bestPath = move.paths.find((path) => path.id === move.bestStrategyId);
  const decisionUnitId = UNIT_ORDER.find(
    (unitId) =>
      move.actions.find((action) => action.unitId === unitId)?.action !== "WAIT",
  );
  const decisionPoints =
    decisionUnitId && bestPath ? bestPath.unitPaths[decisionUnitId] : null;
  const decisionAnchor: Point =
    decisionPoints && decisionPoints.length > 1
      ? {
          x: (decisionPoints[0].x + decisionPoints[1].x) / 2,
          y: (decisionPoints[0].y + decisionPoints[1].y) / 2,
        }
      : { x: 430, y: 320 };
  const decisionOffset: Point =
    decisionAnchor.x > 700 ? { x: -438, y: -150 } : { x: 118, y: -116 };
  const tooltip =
    tooltipKind === "decision"
      ? {
          color: "#d6a23a",
          title: "Tactical Decision Reasoning",
          body: `${move.reasoning.chosenMove} ${move.reasoning.explanation}`,
          anchor: decisionAnchor,
          offset: decisionOffset,
        }
      : strategy
        ? {
            color: strategy.color,
            title: strategy.tooltipTitle,
            body: strategy.tooltipBody,
            anchor: strategy.tooltipAnchor,
            offset: strategy.tooltipOffset,
          }
        : null;

  if (!tooltip) {
    return null;
  }

  const visible =
    tooltipMode === "hover"
      ? interpolate(frame, [4, 14, 50, 61], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : interpolate(frame, [2, 12, 54, 69], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const scale = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 16, stiffness: 150 },
  });
  const closePress =
    tooltipMode === "pinned"
      ? interpolate(frame, [50, 56, 62], [0, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;
  const pathCursorOpacity =
    tooltipMode === "hover"
      ? visible
      : interpolate(frame, [0, 10, 20], [0, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const closeCursorOpacity =
    tooltipMode === "pinned"
      ? interpolate(frame, [46, 54, 63, 69], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;
  const offset = tooltip.offset;
  const lineEnd = { x: offset.x, y: offset.y + 88 };
  const lineLength = Math.sqrt(lineEnd.x ** 2 + lineEnd.y ** 2);
  const lineAngle = (Math.atan2(lineEnd.y, lineEnd.x) * 180) / Math.PI;

  return (
    <div
      style={{
        position: "absolute",
        left: tooltip.anchor.x,
        top: tooltip.anchor.y,
        opacity: visible,
        zIndex: 80,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -13,
          top: -13,
          width: 26,
          height: 26,
          borderRadius: "50%",
          border: `3px solid ${tooltip.color}`,
          background: "#eef3e7",
          boxShadow: `0 0 22px ${tooltip.color}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: lineLength,
          height: 2,
          background: tooltip.color,
          transform: `rotate(${lineAngle}deg)`,
          transformOrigin: "left center",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: offset.x,
          top: offset.y,
          width: 398,
          border: `2px solid ${tooltip.color}`,
          background: "rgba(17, 22, 18, 0.96)",
          boxShadow: "8px 8px 0 rgba(0,0,0,0.34)",
          padding: "14px 16px 16px",
          transform: `scale(${interpolate(scale, [0, 1], [0.92, 1])})`,
          transformOrigin: "left center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            paddingBottom: 9,
            marginBottom: 10,
            borderBottom: "1px solid #465147",
          }}
        >
          <div
            style={{
              color: "#d6a23a",
              font: '900 13px/1.24 "Lucida Console", "Courier New", monospace',
              textTransform: "uppercase",
              letterSpacing: 0,
            }}
          >
            {tooltip.title}
          </div>
          <div
            style={{
              width: 24,
              height: 24,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              border: "1px solid rgba(214,162,58,0.78)",
              background:
                closePress > 0.25 ? "#d6a23a" : "rgba(214,162,58,0.08)",
              color: closePress > 0.25 ? "#111612" : "#d6a23a",
              transform: `scale(${interpolate(closePress, [0, 1], [1, 0.9])})`,
            }}
          >
            <X size={15} strokeWidth={3} />
          </div>
        </div>
        <p
          style={{
            margin: 0,
            color: "#eef3e7",
            font: '700 13px/1.48 "Lucida Console", "Courier New", monospace',
          }}
        >
          {tooltip.body}
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            marginTop: 12,
            padding: "5px 7px",
            color: tooltipMode === "pinned" ? "#111612" : "#d8decf",
            background:
              tooltipMode === "pinned"
                ? "#8fb36a"
                : "rgba(238,243,231,0.08)",
            border: "1px solid rgba(143,179,106,0.48)",
            font: '900 10px "Lucida Console", "Courier New", monospace',
            textTransform: "uppercase",
          }}
        >
          {tooltipMode === "pinned" ? "Pinned on click" : "Hover preview"}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 18,
          top: 18,
          opacity: pathCursorOpacity,
          color: "#eef3e7",
          filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.55))",
          transform: `translate(${interpolate(frame, [0, 18], [-18, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px, ${interpolate(frame, [0, 18], [-14, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px)`,
        }}
      >
        <MousePointer2 size={26} strokeWidth={2.8} />
      </div>
      <div
        style={{
          position: "absolute",
          left: offset.x + 362,
          top: offset.y + 2,
          opacity: closeCursorOpacity,
          color: "#eef3e7",
          filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.55))",
          transform: `translate(${interpolate(closePress, [0, 1], [0, -6])}px, ${interpolate(
            closePress,
            [0, 1],
            [0, -4],
          )}px)`,
        }}
      >
        <MousePointer2 size={24} strokeWidth={2.8} />
      </div>
    </div>
  );
};
