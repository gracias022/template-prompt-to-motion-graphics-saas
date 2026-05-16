import { interpolate, spring, useVideoConfig } from "remotion";

import type { MoveStep } from "../types";

interface TooltipLayerProps {
  move: MoveStep;
  frame: number;
}

export const TooltipLayer: React.FC<TooltipLayerProps> = ({ move, frame }) => {
  const { fps } = useVideoConfig();

  if (move.tooltipStrategyId === null) {
    return null;
  }

  const strategy = move.paths.find(
    (path) => path.id === move.tooltipStrategyId,
  );

  if (!strategy) {
    return null;
  }

  const visible = interpolate(frame, [34, 44, 82, 92], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = spring({
    frame: Math.max(0, frame - 34),
    fps,
    config: { damping: 17, stiffness: 160 },
  });
  const pinned = frame >= 54;
  const cursorScale = interpolate(frame % 24, [0, 12, 23], [0.86, 1.18, 0.86], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: move.tooltipAnchor.x,
        top: move.tooltipAnchor.y,
        opacity: visible,
        transform: "translate(-12px, -12px)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 24,
          height: 24,
          borderRadius: "50%",
          transform: `scale(${cursorScale})`,
          border: `3px solid ${strategy.color}`,
          background: "rgba(255,255,255,0.86)",
          boxShadow: `0 0 24px ${strategy.color}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 18,
          top: 14,
          width: 88,
          height: 2,
          background: strategy.color,
          transform: "rotate(-12deg)",
          transformOrigin: "left center",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 92,
          top: -92,
          width: 365,
          borderRadius: 8,
          border: `2px solid ${strategy.color}`,
          background: "rgba(12, 16, 13, 0.94)",
          boxShadow: "0 24px 44px rgba(0,0,0,0.42)",
          padding: 16,
          transform: `scale(${interpolate(scale, [0, 1], [0.9, 1])})`,
          transformOrigin: "left center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              color: "#f8fff3",
              fontSize: 19,
              fontWeight: 900,
            }}
          >
            {strategy.tooltipTitle}
          </div>
          <div
            style={{
              color: "#11170f",
              background: pinned ? "#9bdc7e" : "#f6f0d8",
              borderRadius: 5,
              padding: "5px 8px",
              fontSize: 13,
              fontWeight: 900,
              flexShrink: 0,
            }}
          >
            {pinned ? "Pinned" : "Hover"}
          </div>
        </div>
        <div
          style={{
            color: "#d9e8d3",
            fontSize: 17,
            lineHeight: 1.35,
            fontWeight: 600,
          }}
        >
          {strategy.tooltipBody}
        </div>
      </div>
    </div>
  );
};
