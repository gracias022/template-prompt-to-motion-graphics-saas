import { interpolate, spring, useVideoConfig } from "remotion";

import { MAP_HEIGHT, MAP_WIDTH } from "../data";
import type { MoveStep } from "../types";
import { PathsLayer } from "./PathsLayer";
import { TooltipLayer } from "./TooltipLayer";
import { UnitsLayer } from "./UnitsLayer";

interface MapSceneProps {
  move: MoveStep;
  frame: number;
}

const terrainPatch = (
  left: number,
  top: number,
  width: number,
  height: number,
  color: string,
  radius: number,
) => ({
  position: "absolute" as const,
  left,
  top,
  width,
  height,
  borderRadius: radius,
  background: color,
});

export const MapScene: React.FC<MapSceneProps> = ({ move, frame }) => {
  const { fps } = useVideoConfig();
  const entrance = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 120 },
  });
  const pathLegendOpacity = interpolate(frame, [14, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: MAP_WIDTH,
        transform: `translateY(${interpolate(entrance, [0, 1], [18, 0])}px)`,
        opacity: entrance,
      }}
    >
      <div
        style={{
          height: 54,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
          borderRadius: "8px 8px 0 0",
          border: "1px solid rgba(220,233,216,0.18)",
          borderBottom: "none",
          background: "rgba(24, 29, 24, 0.92)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 14,
          }}
        >
          <div
            style={{
              color: "#f4f7ef",
              fontSize: 23,
              fontWeight: 900,
            }}
          >
            Tactical Map
          </div>
          <div
            style={{
              color: "#aebca8",
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {move.tacticalState}
          </div>
        </div>
        <div
          style={{
            opacity: move.paths.length === 0 ? 0 : pathLegendOpacity,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          {move.paths.map((pathOption) => (
            <div
              key={pathOption.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                color: "#dce9d8",
                fontSize: 15,
                fontWeight: 800,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 6,
                  borderRadius: 999,
                  background: pathOption.color,
                  opacity: pathOption.id === move.bestStrategyId ? 1 : 0.55,
                }}
              />
              {pathOption.label}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: "relative",
          width: MAP_WIDTH,
          height: MAP_HEIGHT,
          overflow: "hidden",
          borderRadius: "0 0 8px 8px",
          border: "1px solid rgba(220,233,216,0.18)",
          background:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px), #283025",
          backgroundSize: "64px 64px, 64px 64px, auto",
          boxShadow: "0 24px 48px rgba(0,0,0,0.28)",
        }}
      >
        <div
          style={terrainPatch(92, 72, 286, 112, "rgba(116, 145, 83, 0.34)", 62)}
        />
        <div
          style={terrainPatch(
            656,
            122,
            356,
            104,
            "rgba(108, 118, 98, 0.42)",
            54,
          )}
        />
        <div
          style={terrainPatch(116, 606, 552, 62, "rgba(92, 105, 95, 0.5)", 20)}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 614,
            width: MAP_WIDTH,
            height: 46,
            background: "rgba(92, 94, 74, 0.42)",
            transform: "rotate(-5deg)",
            transformOrigin: "left center",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 506,
            top: -74,
            width: 70,
            height: MAP_HEIGHT + 180,
            background: "rgba(84, 103, 107, 0.38)",
            transform: "rotate(18deg)",
            transformOrigin: "top center",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 686,
            top: 76,
            width: 356,
            height: 286,
            border: "2px dashed rgba(246, 208, 77, 0.24)",
            borderRadius: 24,
            background: "rgba(246, 208, 77, 0.035)",
          }}
        />
        <PathsLayer move={move} frame={frame} />
        <UnitsLayer move={move} frame={frame} />
        <TooltipLayer move={move} frame={frame} />
      </div>
    </div>
  );
};
