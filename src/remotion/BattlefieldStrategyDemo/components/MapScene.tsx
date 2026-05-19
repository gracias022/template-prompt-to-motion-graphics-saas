import type { FC } from "react";
import { interpolate, spring, useVideoConfig } from "remotion";

import { MAP_HEIGHT, MAP_WIDTH } from "../data";
import type {
  MoveStep,
  StrategyId,
  TooltipKind,
  TooltipMode,
  UnitId,
} from "../types";
import { PathsLayer } from "./PathsLayer";
import { TooltipLayer } from "./TooltipLayer";
import { UnitsLayer } from "./UnitsLayer";

interface MapSceneProps {
  move: MoveStep;
  frame: number;
  showPaths: boolean;
  selectedUnitId: UnitId | null;
  tooltipStrategyId: StrategyId | null;
  tooltipMode: TooltipMode;
  tooltipKind: TooltipKind;
  animateMove: boolean;
  isGenerating: boolean;
  durationInFrames: number;
  hoveredEnemyId: string | null;
  highlight?: boolean;
}

const LegendStroke: FC<{
  color: string;
  label: string;
  dash?: string;
}> = ({ color, label, dash }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      color: "#a7b09f",
      font: '700 10px "Lucida Console", "Courier New", monospace',
      textTransform: "uppercase",
    }}
  >
    <svg width="34" height="10" viewBox="0 0 34 10">
      <line
        x1="0"
        y1="5"
        x2="34"
        y2="5"
        stroke={color}
        strokeWidth="3"
        strokeDasharray={dash}
      />
    </svg>
    {label}
  </div>
);

export const MapScene: FC<MapSceneProps> = ({
  move,
  frame,
  showPaths,
  selectedUnitId,
  tooltipStrategyId,
  tooltipMode,
  tooltipKind,
  animateMove,
  isGenerating,
  durationInFrames,
  hoveredEnemyId,
  highlight = false,
}) => {
  const { fps } = useVideoConfig();
  const entrance = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 120 },
  });
  const highlightGlow = highlight
    ? interpolate(frame % 36, [0, 18, 35], [0.35, 0.9, 0.35], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const scanOpacity = isGenerating
    ? interpolate(frame, [6, 16, 58, 70], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const scanY = interpolate(frame, [8, 66], [52, MAP_HEIGHT - 86], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "relative",
        width: MAP_WIDTH,
        height: MAP_HEIGHT,
        overflow: "hidden",
        background: "#1f2a25",
        border: "1px solid #687466",
        boxShadow: `inset 0 0 0 1px rgba(0,0,0,0.32), 0 0 ${28 * highlightGlow}px rgba(214,162,58,${highlightGlow})`,
        transform: `translateY(${interpolate(entrance, [0, 1], [16, 0])}px)`,
        opacity: entrance,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 10,
          top: 8,
          zIndex: 34,
          color: "rgba(216,222,207,0.46)",
          font: '700 10px "Lucida Console", "Courier New", monospace',
          textTransform: "uppercase",
        }}
      >
        Tactical route overlay // not to scale
      </div>

      <div
        style={{
          position: "absolute",
          right: 10,
          top: 8,
          zIndex: 60,
          display: "grid",
          gridTemplateColumns: "auto auto auto",
          alignItems: "center",
          border: "1px solid #687466",
          background: "rgba(17,22,18,0.94)",
          fontFamily: '"Lucida Console", "Courier New", monospace',
        }}
      >
        <button
          type="button"
          style={{
            width: 34,
            height: 28,
            border: 0,
            borderRight: "1px solid #465147",
            color: "#d6a23a",
            background: "transparent",
            font: '700 14px "Lucida Console", "Courier New", monospace',
            padding: 0,
          }}
        >
          &lt;
        </button>
        <div
          style={{
            minWidth: 148,
            padding: "0 10px",
            color: "#d8decf",
            font: '700 10px/28px "Lucida Console", "Courier New", monospace',
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          Decision Step {String(move.index + 1).padStart(2, "0")} / 05
        </div>
        <button
          type="button"
          style={{
            width: 34,
            height: 28,
            border: 0,
            borderLeft: "1px solid #465147",
            color: "#d6a23a",
            background: "transparent",
            font: '700 14px "Lucida Console", "Courier New", monospace',
            padding: 0,
          }}
        >
          &gt;
        </button>
      </div>

      <div
        style={{
          position: "absolute",
          right: 10,
          top: 43,
          zIndex: 60,
          maxWidth: 354,
          padding: "7px 9px",
          border: "1px solid #465147",
          color: "#a7b09f",
          background: "rgba(17,22,18,0.88)",
          font: '700 10px/1.35 "Lucida Console", "Courier New", monospace',
          textTransform: "uppercase",
        }}
      >
        Current model next-step output: {move.reasoning.chosenMove}
      </div>

      <div
        style={{
          position: "absolute",
          left: 10,
          bottom: 10,
          zIndex: 70,
          display: "grid",
          gridTemplateColumns: "30px 30px",
          border: "1px solid #687466",
          background: "rgba(17,22,18,0.94)",
          boxShadow: "5px 5px 0 rgba(0,0,0,0.32)",
        }}
      >
        {["+", "-"].map((label) => (
          <button
            key={label}
            type="button"
            style={{
              width: 30,
              height: 30,
              padding: 0,
              border: 0,
              borderRight: label === "+" ? "1px solid #465147" : 0,
              color: "#d6a23a",
              background: "transparent",
              font: '700 16px "Lucida Console", "Courier New", monospace',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(rgba(143,179,106,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(143,179,106,0.09) 1px, transparent 1px)",
          backgroundSize: "32px 32px, 32px 32px",
          mixBlendMode: "screen",
          opacity: 0.84,
          zIndex: 0,
        }}
      />

      <svg
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
      >
        <path
          d="M78 332 C98 238, 206 198, 314 154 C428 108, 508 86, 632 112 C770 140, 892 198, 982 302 C1058 392, 1010 516, 884 580 C756 646, 572 662, 426 628 C270 592, 112 506, 78 332 Z"
          fill="#6f7f4b"
          stroke="#93885a"
          strokeWidth="2"
          opacity="0.96"
        />
      </svg>

      <PathsLayer
        move={move}
        frame={frame}
        selectedUnitId={selectedUnitId}
        showPaths={showPaths}
      />
      <UnitsLayer
        move={move}
        frame={frame}
        selectedUnitId={selectedUnitId}
        animateMove={animateMove}
        hoveredEnemyId={hoveredEnemyId}
      />
      <TooltipLayer
        move={move}
        frame={frame}
        tooltipStrategyId={tooltipStrategyId}
        tooltipMode={tooltipMode}
        tooltipKind={tooltipKind}
        durationInFrames={durationInFrames}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          top: scanY,
          width: "100%",
          height: 3,
          opacity: scanOpacity,
          background:
            "linear-gradient(90deg, transparent, rgba(214,162,58,0.95), transparent)",
          boxShadow: "0 0 18px rgba(214,162,58,0.7)",
          zIndex: 75,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 82,
          right: 10,
          bottom: 10,
          zIndex: 20,
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "6px 12px",
          padding: 9,
          background: "rgba(17,22,18,0.90)",
          border: "1px solid #465147",
        }}
      >
        <LegendStroke color="#d985ff" label="Maneuver planner path" />
        <LegendStroke color="#c8e889" label="Force planner path" dash="1 7" />
        <LegendStroke color="#91c7dc" label="Coordination planner path" dash="9 7" />
        <LegendStroke color="#d6a23a" label="Tactical decision path" />
      </div>
    </div>
  );
};
