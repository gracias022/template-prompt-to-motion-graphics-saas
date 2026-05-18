import { ChevronLeft, ChevronRight } from "lucide-react";
import type { FC } from "react";
import { interpolate, spring, useVideoConfig } from "remotion";

import { MOVE_STEP_FRAMES, MOVES } from "../data";
import type { NavigationAction } from "../types";

interface NavigationControlsProps {
  frame: number;
  moveIndex: number;
  action: NavigationAction;
}

export const NavigationControls: FC<NavigationControlsProps> = ({
  frame,
  moveIndex,
  action,
}) => {
  const { fps } = useVideoConfig();
  const totalMoves = MOVES.length;
  const previousEnabled = moveIndex > 0;
  const nextEnabled = moveIndex < totalMoves - 1;
  const previousPressed =
    action === "previous" || (action === "both" && frame >= 8 && frame <= 24);
  const nextPressed =
    action === "next" || (action === "both" && frame >= 42 && frame <= 62);
  const pressSpring = spring({
    frame: Math.max(0, frame - 42),
    fps,
    config: { damping: 14, stiffness: 180 },
  });
  const stepProgress = interpolate(
    frame,
    [0, MOVE_STEP_FRAMES - 1],
    [0, action === "next" || action === "both" ? 1 : 0.35],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const overallProgress =
    ((moveIndex + Math.min(stepProgress, 1)) / totalMoves) * 100;

  return (
    <section
      style={{
        width: "100%",
        height: 64,
        display: "grid",
        gridTemplateColumns: "174px 1fr 174px",
        alignItems: "center",
        gap: 12,
      }}
    >
      <button
        type="button"
        style={{
          height: 46,
          border: "1px solid #465147",
          background: previousPressed
            ? "rgba(214,162,58,0.18)"
            : "rgba(17,22,18,0.88)",
          color: previousEnabled ? "#d6a23a" : "rgba(216,222,207,0.34)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          font: '900 12px "Lucida Console", "Courier New", monospace',
          textTransform: "uppercase",
          transform: `scale(${previousPressed ? 0.965 : 1})`,
        }}
      >
        <ChevronLeft size={20} strokeWidth={3} />
        Previous
      </button>

      <div
        style={{
          height: 46,
          border: "1px solid #465147",
          background: "rgba(17,22,18,0.82)",
          display: "grid",
          gridTemplateColumns: "118px 1fr 126px",
          alignItems: "center",
          gap: 12,
          padding: "0 12px",
        }}
      >
        <div
          style={{
            color: "#eef3e7",
            font: '900 12px "Lucida Console", "Courier New", monospace',
            textTransform: "uppercase",
          }}
        >
          Move {moveIndex + 1} / {totalMoves}
        </div>
        <div
          style={{
            height: 10,
            border: "1px solid #465147",
            background: "#111612",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${overallProgress}%`,
              background: "linear-gradient(90deg, #8fb36a, #d6a23a)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 6,
          }}
        >
          {MOVES.map((move) => (
            <div
              key={move.index}
              style={{
                width: 12,
                height: 12,
                background:
                  move.index <= moveIndex ? "#8fb36a" : "rgba(216,222,207,0.22)",
                boxShadow:
                  move.index === moveIndex
                    ? "0 0 12px rgba(143,179,106,0.7)"
                    : "none",
              }}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        style={{
          height: 46,
          border: "1px solid #5f7d4b",
          background: nextPressed ? "#8fb36a" : "rgba(17,22,18,0.88)",
          color: nextEnabled
            ? nextPressed
              ? "#111612"
              : "#eef3e7"
            : "rgba(216,222,207,0.34)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          font: '900 12px "Lucida Console", "Courier New", monospace',
          textTransform: "uppercase",
          transform: `scale(${nextPressed ? interpolate(pressSpring, [0, 1], [1, 0.965]) : 1})`,
        }}
      >
        Next
        <ChevronRight size={20} strokeWidth={3} />
      </button>
    </section>
  );
};
