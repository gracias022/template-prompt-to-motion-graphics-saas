import { ChevronLeft, ChevronRight } from "lucide-react";
import { interpolate, spring, useVideoConfig } from "remotion";

import { MOVE_DURATION_IN_FRAMES, TOTAL_MOVES } from "../data";

interface NavigationControlsProps {
  frame: number;
  moveIndex: number;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  frame,
  moveIndex,
}) => {
  const { fps } = useVideoConfig();
  const previousEnabled = moveIndex > 0;
  const nextEnabled = moveIndex < TOTAL_MOVES - 1;
  const nextPressed = nextEnabled && frame > MOVE_DURATION_IN_FRAMES - 24;
  const previousPulse = previousEnabled && frame < 18;
  const progress = interpolate(
    frame,
    [0, MOVE_DURATION_IN_FRAMES - 1],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const pressSpring = spring({
    frame: Math.max(0, frame - (MOVE_DURATION_IN_FRAMES - 24)),
    fps,
    config: { damping: 14, stiffness: 180 },
  });

  return (
    <div
      style={{
        width: 1180,
        height: 78,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 18,
      }}
    >
      <button
        style={{
          width: 180,
          height: 54,
          border: "1px solid rgba(220,233,216,0.22)",
          borderRadius: 8,
          background: previousPulse
            ? "rgba(220,233,216,0.18)"
            : "rgba(18,23,19,0.82)",
          color: previousEnabled ? "#eef8ea" : "rgba(238,248,234,0.36)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontSize: 20,
          fontWeight: 900,
        }}
      >
        <ChevronLeft size={24} strokeWidth={3} />
        Previous
      </button>

      <div
        style={{
          flex: 1,
          height: 54,
          borderRadius: 8,
          border: "1px solid rgba(220,233,216,0.16)",
          background: "rgba(18,23,19,0.58)",
          padding: "0 18px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            color: "#f6fbf4",
            fontSize: 20,
            fontWeight: 900,
            width: 108,
          }}
        >
          Move {moveIndex + 1}/{TOTAL_MOVES}
        </div>
        <div
          style={{
            height: 12,
            flex: 1,
            borderRadius: 999,
            background: "rgba(220,233,216,0.13)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress * 100}%`,
              background: "linear-gradient(90deg, #9bdc7e, #f6d04d)",
              borderRadius: 999,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
          }}
        >
          {Array.from({ length: TOTAL_MOVES }, (_, index) => (
            <div
              key={index}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background:
                  index <= moveIndex ? "#9bdc7e" : "rgba(220,233,216,0.22)",
                boxShadow:
                  index === moveIndex
                    ? "0 0 16px rgba(155,220,126,0.68)"
                    : "none",
              }}
            />
          ))}
        </div>
      </div>

      <button
        style={{
          width: 180,
          height: 54,
          border: "1px solid rgba(220,233,216,0.22)",
          borderRadius: 8,
          background: nextPressed ? "#9bdc7e" : "rgba(18,23,19,0.82)",
          color: nextEnabled
            ? nextPressed
              ? "#101510"
              : "#eef8ea"
            : "rgba(238,248,234,0.36)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontSize: 20,
          fontWeight: 900,
          transform: `scale(${nextPressed ? interpolate(pressSpring, [0, 1], [1, 0.96]) : 1})`,
        }}
      >
        Next
        <ChevronRight size={24} strokeWidth={3} />
      </button>
    </div>
  );
};
