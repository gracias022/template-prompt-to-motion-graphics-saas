import type { FC, ReactNode } from "react";
import { interpolate, spring, useVideoConfig } from "remotion";

import type { MoveStep } from "../types";

type HighlightCard = "planner" | "decision" | "unit" | null;

interface ReasoningPanelProps {
  move: MoveStep;
  frame: number;
  highlight?: HighlightCard;
}

const Status: FC<{ label: string; amber?: boolean }> = ({ label, amber }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 7px",
      border: `1px solid ${amber ? "rgba(214,162,58,0.55)" : "#5f7d4b"}`,
      color: amber ? "#d6a23a" : "#8fb36a",
      background: amber ? "rgba(214,162,58,0.08)" : "rgba(143,179,106,0.08)",
      font: '700 10px "Lucida Console", "Courier New", monospace',
      textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}
  >
    <span
      style={{
        width: 7,
        height: 7,
        background: amber ? "#d6a23a" : "#8fb36a",
      }}
    />
    {label}
  </span>
);

const Card: FC<{
  title: string;
  status: string;
  amber?: boolean;
  highlighted?: boolean;
  children: ReactNode;
}> = ({ title, status, amber, highlighted, children }) => {
  const glow = highlighted ? 0.88 : 0;

  return (
    <article
      style={{
        background: "#222a25",
        border: `1px solid ${amber ? "rgba(214,162,58,0.75)" : "#687466"}`,
        boxShadow: `inset 0 0 0 1px rgba(0,0,0,0.32), 0 0 ${26 * glow}px rgba(214,162,58,${glow})`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "8px 10px",
          background: "#111612",
          borderBottom: `1px solid ${amber ? "rgba(214,162,58,0.65)" : "#687466"}`,
        }}
      >
        <h3
          style={{
            margin: 0,
            color: "#eef3e7",
            font: '700 13px "Lucida Console", "Courier New", monospace',
            textTransform: "uppercase",
            letterSpacing: 0,
          }}
        >
          {title}
        </h3>
        <Status label={status} amber={amber} />
      </div>
      <div style={{ display: "grid", gap: 9, padding: 10 }}>{children}</div>
    </article>
  );
};

export const ReasoningPanel: FC<ReasoningPanelProps> = ({
  move,
  frame,
  highlight = null,
}) => {
  const { fps } = useVideoConfig();
  const entrance = spring({
    frame: Math.max(0, frame - 4),
    fps,
    config: { damping: 20, stiffness: 130 },
  });
  const bodyOpacity = interpolate(frame, [12, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <aside
      style={{
        width: 330,
        display: "grid",
        gap: 10,
        alignContent: "start",
        transform: `translateX(${interpolate(entrance, [0, 1], [20, 0])}px)`,
        opacity: entrance,
      }}
    >
      <Card
        title="Planner Output"
        status="3 Routes"
        highlighted={highlight === "planner"}
      >
        <p
          style={{
            margin: 0,
            color: "#a7b09f",
            fontSize: 13,
            lineHeight: 1.35,
          }}
        >
          Click route overlays to inspect model reasoning. Each path represents
          one planner route recommendation.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["Maneuver", "Force", "Coordination"].map((label) => (
            <span
              key={label}
              style={{
                padding: "4px 6px",
                border: "1px solid #465147",
                color: "#d8decf",
                background: "#151b17",
                font: '700 10px "Lucida Console", "Courier New", monospace',
                textTransform: "uppercase",
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </Card>

      <Card
        title="Next Step"
        status={`Step ${String(move.index + 1).padStart(2, "0")}`}
        amber
        highlighted={highlight === "decision"}
      >
        <p
          style={{
            margin: 0,
            color: "#a7b09f",
            fontSize: 13,
            lineHeight: 1.35,
          }}
        >
          Click amber path for tactical decision reasoning.
        </p>
        <div
          style={{
            opacity: bodyOpacity,
            border: "1px solid #465147",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "58px 1fr 54px 62px",
              color: "#d6a23a",
              background: "#111612",
              font: '700 10px "Lucida Console", "Courier New", monospace',
              textTransform: "uppercase",
            }}
          >
            <div style={{ padding: "7px 6px" }}>Unit</div>
            <div style={{ padding: "7px 6px" }}>Action</div>
            <div style={{ padding: "7px 6px" }}>From</div>
            <div style={{ padding: "7px 6px" }}>To</div>
          </div>
          {move.actions.map((action) => (
            <div
              key={`${move.index}-${action.unitId}`}
              style={{
                display: "grid",
                gridTemplateColumns: "58px 1fr 54px 62px",
                borderTop: "1px solid #465147",
                color: "#d8decf",
                background: "#18201b",
                font: '700 10px "Lucida Console", "Courier New", monospace',
              }}
            >
              <div style={{ padding: "7px 6px" }}>{action.unitId}</div>
              <div style={{ padding: "7px 6px" }}>{action.action}</div>
              <div style={{ padding: "7px 6px" }}>{action.from}</div>
              <div style={{ padding: "7px 6px" }}>{action.to}</div>
            </div>
          ))}
        </div>
        <p
          style={{
            margin: 0,
            color: "#d8decf",
            fontSize: 13,
            lineHeight: 1.35,
          }}
        >
          {move.reasoning.headline}
        </p>
      </Card>

      <Card
        title="Unit Inspection"
        status="Hover"
        highlighted={highlight === "unit"}
      >
        <p
          style={{
            margin: 0,
            color: "#a7b09f",
            fontSize: 13,
            lineHeight: 1.35,
          }}
        >
          Hover friendly unit markers to show type, role, size, and command
          state.
        </p>
      </Card>
    </aside>
  );
};
