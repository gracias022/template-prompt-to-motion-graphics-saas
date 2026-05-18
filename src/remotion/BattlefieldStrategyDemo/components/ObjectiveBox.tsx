import type { FC } from "react";
import { interpolate, spring, useVideoConfig } from "remotion";

import { OBJECTIVE_TEXT } from "../data";
import type { ObjectiveMode } from "../types";

interface ObjectiveBoxProps {
  frame: number;
  mode: ObjectiveMode;
  highlight?: boolean;
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

export const ObjectiveBox: FC<ObjectiveBoxProps> = ({
  frame,
  mode,
  highlight = false,
}) => {
  const { fps } = useVideoConfig();
  const entrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const characterCount =
    mode === "typing"
      ? Math.round(
          interpolate(frame, [18, 72], [0, OBJECTIVE_TEXT.length], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        )
      : OBJECTIVE_TEXT.length;
  const displayedText = OBJECTIVE_TEXT.slice(0, characterCount);
  const cursorOpacity = interpolate(frame % 28, [0, 14, 27], [1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const extractPress =
    mode === "typing"
      ? interpolate(frame, [72, 80, 87], [0, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;
  const highlightGlow = highlight
    ? interpolate(frame % 36, [0, 18, 35], [0.42, 0.9, 0.42], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <aside
      style={{
        width: 350,
        background: "#2a322c",
        border: "1px solid #687466",
        boxShadow: `inset 0 0 0 1px rgba(0,0,0,0.32), 0 0 ${28 * highlightGlow}px rgba(214,162,58,${highlightGlow})`,
        transform: `translateY(${interpolate(entrance, [0, 1], [18, 0])}px)`,
        opacity: entrance,
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
          borderBottom: "1px solid #687466",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#eef3e7",
            font: '700 15px "Lucida Console", "Courier New", monospace',
            textTransform: "uppercase",
            letterSpacing: 0,
          }}
        >
          01 Assess
        </h2>
        <Status label={mode === "typing" ? "Ready" : "Extracted"} />
      </div>

      <div style={{ padding: 10 }}>
        <p
          style={{
            margin: "6px 0 0",
            color: "#a7b09f",
            fontSize: 13,
            lineHeight: 1.35,
          }}
        >
          Enter operator intent. The model extracts a strategy profile used by
          route planners and tactical decision.
        </p>

        <div style={{ display: "grid", gap: 9, marginTop: 10 }}>
          <label
            style={{
              display: "grid",
              gap: 5,
              color: "#a7b09f",
              font: '700 11px "Lucida Console", "Courier New", monospace',
              textTransform: "uppercase",
              letterSpacing: 0,
            }}
          >
            OCA Selection
            <select
              defaultValue="LILY"
              style={{
                width: "100%",
                border: "1px solid #465147",
                borderRadius: 0,
                padding: 8,
                background: "#18201b",
                color: "#d8decf",
                font: '13px/1.35 "Lucida Console", "Courier New", monospace',
                outline: "none",
              }}
            >
              <option>LILY</option>
              <option>LESTER</option>
            </select>
          </label>

          <label
            style={{
              display: "grid",
              gap: 5,
              color: "#a7b09f",
              font: '700 11px "Lucida Console", "Courier New", monospace',
              textTransform: "uppercase",
              letterSpacing: 0,
            }}
          >
            Mission Strategy
            <textarea
              value={`${displayedText}${mode === "typing" ? (cursorOpacity > 0.35 ? "|" : "") : ""}`}
              readOnly
              style={{
                width: "100%",
                minHeight: 156,
                border: "1px solid #465147",
                borderRadius: 0,
                padding: 8,
                background: "#18201b",
                color: "#d8decf",
                font: '13px/1.35 "Lucida Console", "Courier New", monospace',
                outline: "none",
                resize: "none",
              }}
            />
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            <button
              type="button"
              style={{
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                border: "1px solid #5f7d4b",
                borderRadius: 0,
                padding: "8px 10px",
                color: "#111612",
                background: "#8fb36a",
                font: '700 11px "Lucida Console", "Courier New", monospace',
                textTransform: "uppercase",
                transform: `scale(${interpolate(extractPress, [0, 1], [1, 0.96])})`,
                filter: extractPress > 0.2 ? "brightness(1.12)" : "none",
              }}
            >
              Extract
            </button>
            <span
              style={{
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                border: "1px solid #5f7d4b",
                borderRadius: 0,
                padding: "8px 10px",
                color: "#8fb36a",
                background: "transparent",
                font: '700 11px "Lucida Console", "Courier New", monospace',
                textTransform: "uppercase",
              }}
            >
              Clarify
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: 10,
            border: "1px solid #465147",
            background: "#222a25",
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
              borderBottom: "1px solid #687466",
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
              Strategy Profile
            </h3>
            <Status label="Low Risk" amber />
          </div>
          <div style={{ display: "grid", gap: 9, padding: 10 }}>
            <h3
              style={{
                margin: 0,
                color: "#eef3e7",
                font: '700 13px "Lucida Console", "Courier New", monospace',
                textTransform: "uppercase",
              }}
            >
              Coordinated Critical Entry
            </h3>
            <p
              style={{
                margin: 0,
                color: "#a7b09f",
                fontSize: 13,
                lineHeight: 1.35,
              }}
            >
              Secure approach paths and consolidate friendly units before
              committing into the critical point.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Split then sync", "Full-force entry", "Avoid solo engage"].map(
                (tag) => (
                  <span
                    key={tag}
                    style={{
                      border: "1px solid #465147",
                      padding: "4px 6px",
                      color: "#d8decf",
                      background: "#1a211c",
                      font: '700 10px "Lucida Console", "Courier New", monospace',
                      textTransform: "uppercase",
                    }}
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>
            {[
              ["Coordination", 50, "0.50"],
              ["Preservation", 35, "0.35"],
              ["Speed", 15, "0.15"],
            ].map(([label, width, value]) => (
              <div
                key={label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "116px 1fr 42px",
                  gap: 8,
                  alignItems: "center",
                  color: "#a7b09f",
                  font: '700 11px "Lucida Console", "Courier New", monospace',
                  textTransform: "uppercase",
                }}
              >
                <span>{label}</span>
                <div
                  style={{
                    height: 10,
                    background: "#121713",
                    border: "1px solid #465147",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${width}%`,
                      background: "#8fb36a",
                    }}
                  />
                </div>
                <b>{value}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
