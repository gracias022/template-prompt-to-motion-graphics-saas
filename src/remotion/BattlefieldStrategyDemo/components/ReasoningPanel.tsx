import { interpolate, spring, useVideoConfig } from "remotion";

import type { MoveStep } from "../types";

interface ReasoningPanelProps {
  move: MoveStep;
  frame: number;
}

export const ReasoningPanel: React.FC<ReasoningPanelProps> = ({
  move,
  frame,
}) => {
  const { fps } = useVideoConfig();
  const entrance = spring({
    frame: Math.max(0, frame - 4),
    fps,
    config: { damping: 20, stiffness: 130 },
  });
  const detailOpacity = interpolate(frame, [20, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scoreFill = interpolate(
    frame,
    [18, 62],
    [0, move.index === 0 ? 68 : 82],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <aside
      style={{
        width: 548,
        height: 888,
        borderRadius: 8,
        border: "1px solid rgba(220,233,216,0.2)",
        background: "rgba(18, 23, 19, 0.94)",
        boxShadow: "0 24px 54px rgba(0,0,0,0.34)",
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 22,
        transform: `translateX(${interpolate(entrance, [0, 1], [26, 0])}px)`,
        opacity: entrance,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 18,
        }}
      >
        <div>
          <div
            style={{
              color: "#9bdc7e",
              fontSize: 17,
              fontWeight: 900,
              marginBottom: 8,
            }}
          >
            Agent Reasoning
          </div>
          <div
            style={{
              color: "#f6fbf4",
              fontSize: 34,
              lineHeight: 1.05,
              fontWeight: 900,
            }}
          >
            {move.label}
          </div>
        </div>
        <div
          style={{
            width: 104,
            height: 104,
            borderRadius: "50%",
            border: "10px solid rgba(220,233,216,0.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#f6fbf4",
            fontSize: 26,
            fontWeight: 900,
            background: `conic-gradient(#9bdc7e ${scoreFill}%, rgba(220,233,216,0.16) 0)`,
          }}
        >
          {Math.round(scoreFill)}
        </div>
      </div>

      <div
        style={{
          borderRadius: 8,
          border: "1px solid rgba(155,220,126,0.26)",
          background: "rgba(155, 220, 126, 0.08)",
          padding: 18,
        }}
      >
        <div
          style={{
            color: "#f6fbf4",
            fontSize: 25,
            lineHeight: 1.18,
            fontWeight: 900,
            marginBottom: 12,
          }}
        >
          {move.reasoning.headline}
        </div>
        <div
          style={{
            color: "#dce9d8",
            fontSize: 20,
            lineHeight: 1.35,
            fontWeight: 700,
          }}
        >
          {move.reasoning.bestMove}
        </div>
      </div>

      <div
        style={{
          opacity: detailOpacity,
          color: "#d8e4d1",
          fontSize: 20,
          lineHeight: 1.42,
          fontWeight: 600,
        }}
      >
        {move.reasoning.explanation}
      </div>

      <div
        style={{
          opacity: detailOpacity,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {move.reasoning.factors.map((factor, index) => (
          <div
            key={factor}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              borderRadius: 7,
              background: "rgba(244,247,239,0.06)",
              border: "1px solid rgba(244,247,239,0.1)",
              padding: "13px 14px",
              transform: `translateY(${interpolate(
                frame,
                [28 + index * 6, 44 + index * 6],
                [12, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              )}px)`,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "#9bdc7e",
                color: "#101510",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 16,
                fontWeight: 900,
              }}
            >
              {index + 1}
            </div>
            <div
              style={{
                color: "#eef8ea",
                fontSize: 18,
                lineHeight: 1.28,
                fontWeight: 700,
              }}
            >
              {factor}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "auto",
          borderTop: "1px solid rgba(220,233,216,0.12)",
          paddingTop: 18,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          color: "#aebca8",
          fontSize: 16,
          fontWeight: 800,
        }}
      >
        <div>
          Threat model
          <span style={{ display: "block", color: "#f6fbf4", marginTop: 6 }}>
            Live scored
          </span>
        </div>
        <div>
          Next action
          <span style={{ display: "block", color: "#f6fbf4", marginTop: 6 }}>
            Deterministic
          </span>
        </div>
      </div>
    </aside>
  );
};
