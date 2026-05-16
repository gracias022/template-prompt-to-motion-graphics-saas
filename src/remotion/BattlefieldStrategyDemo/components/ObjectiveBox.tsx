import { interpolate, spring, useVideoConfig } from "remotion";

import { OBJECTIVE_TEXT } from "../data";

interface ObjectiveBoxProps {
  frame: number;
  moveIndex: number;
}

export const ObjectiveBox: React.FC<ObjectiveBoxProps> = ({
  frame,
  moveIndex,
}) => {
  const { fps } = useVideoConfig();
  const entrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const cursorOpacity = interpolate(frame % 30, [0, 12, 29], [1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: 740,
        transform: `translateY(${interpolate(entrance, [0, 1], [-12, 0])}px)`,
        opacity: entrance,
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#dce9d8",
          marginBottom: 8,
          letterSpacing: 0,
        }}
      >
        Objective
      </div>
      <div
        style={{
          height: 58,
          borderRadius: 8,
          border: "1px solid rgba(220,233,216,0.26)",
          background: "rgba(17, 22, 18, 0.9)",
          boxShadow: "0 16px 36px rgba(0,0,0,0.28)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
          gap: 16,
        }}
      >
        <div
          style={{
            fontSize: 24,
            color: "#f4f7ef",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flex: 1,
          }}
        >
          {OBJECTIVE_TEXT}
          <span style={{ opacity: moveIndex === 0 ? cursorOpacity : 0 }}>
            |
          </span>
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#101510",
            background: moveIndex === 0 ? "#dce9d8" : "#9bdc7e",
            borderRadius: 6,
            padding: "8px 12px",
            flexShrink: 0,
          }}
        >
          {moveIndex === 0 ? "Ready" : "Running"}
        </div>
      </div>
    </div>
  );
};
