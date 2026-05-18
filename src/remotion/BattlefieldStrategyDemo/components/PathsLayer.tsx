import type { FC } from "react";
import { interpolate, spring, useVideoConfig } from "remotion";

import { MAP_HEIGHT, MAP_WIDTH, UNIT_ORDER } from "../data";
import type { MoveStep, Point, StrategyPath, UnitId } from "../types";

interface PathsLayerProps {
  move: MoveStep;
  frame: number;
  selectedUnitId: UnitId | null;
  showPaths: boolean;
}

interface Segment {
  from: Point;
  to: Point;
  unitId: UnitId;
  strategy: StrategyPath;
  segmentIndex: number;
}

const BEST_ARROW_COLOR = "#f6d04d";

const distance = (from: Point, to: Point) =>
  Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);

const segmentsForStrategy = (
  strategy: StrategyPath,
  visibleUnitIds: UnitId[],
): Segment[] =>
  visibleUnitIds.flatMap((unitId) => {
    const points = strategy.unitPaths[unitId];

    return points.slice(0, -1).map((point, index) => ({
      from: point,
      to: points[index + 1],
      unitId,
      strategy,
      segmentIndex: index,
    }));
  });

const ArrowSegment: FC<{
  segment: Segment;
  markerId: string;
  opacity: number;
  strokeWidth: number;
  color: string;
  progress: number;
  dashed: boolean;
  glow: boolean;
}> = ({
  segment,
  markerId,
  opacity,
  strokeWidth,
  color,
  progress,
  dashed,
  glow,
}) => {
  const length = distance(segment.from, segment.to);
  const strokeDasharray = dashed ? segment.strategy.dash : `${length}`;
  const strokeDashoffset = dashed ? 0 : length * (1 - progress);

  return (
    <line
      x1={segment.from.x}
      y1={segment.from.y}
      x2={segment.to.x}
      y2={segment.to.y}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      markerEnd={`url(#${markerId})`}
      opacity={opacity}
      strokeDasharray={strokeDasharray}
      strokeDashoffset={strokeDashoffset}
      filter={glow ? "url(#bestArrowGlow)" : undefined}
    />
  );
};

export const PathsLayer: FC<PathsLayerProps> = ({
  move,
  frame,
  selectedUnitId,
  showPaths,
}) => {
  const { fps } = useVideoConfig();
  const visibleUnitIds = selectedUnitId ? [selectedUnitId] : UNIT_ORDER;
  const reveal = showPaths
    ? spring({
        frame: Math.max(0, frame - 4),
        fps,
        config: { damping: 18, stiffness: 120 },
      })
    : 0;
  const bestReveal = showPaths
    ? spring({
        frame: Math.max(0, frame - 28),
        fps,
        config: { damping: 15, stiffness: 170 },
      })
    : 0;
  const labelOpacity = interpolate(frame, [18, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const focusOpacity = selectedUnitId ? 1 : 0;
  const bestPath = move.paths.find((path) => path.id === move.bestStrategyId);
  const actionForUnit = (unitId: UnitId) =>
    move.actions.find((action) => action.unitId === unitId);

  if (!showPaths) {
    return null;
  }

  return (
    <svg
      width={MAP_WIDTH}
      height={MAP_HEIGHT}
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <defs>
        {move.paths.map((path) => (
          <marker
            key={path.id}
            id={`arrow-${move.index}-${path.id}`}
            viewBox="0 0 12 12"
            refX="10.2"
            refY="6"
            markerWidth="4.6"
            markerHeight="4.6"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M 0 0 L 12 6 L 0 12 z" fill={path.color} />
          </marker>
        ))}
        <marker
          id={`best-arrow-${move.index}`}
          viewBox="0 0 12 12"
          refX="10.2"
          refY="6"
          markerWidth="5.6"
          markerHeight="5.6"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M 0 0 L 12 6 L 0 12 z" fill={BEST_ARROW_COLOR} />
        </marker>
        <filter id="bestArrowGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="4"
            floodColor={BEST_ARROW_COLOR}
            floodOpacity="0.74"
          />
        </filter>
      </defs>

      {visibleUnitIds.map((unitId) => {
        const start = move.startPositions[unitId];

        return (
          <g key={`start-${unitId}`} opacity={reveal}>
            <circle
              cx={start.x}
              cy={start.y}
              r={13}
              fill="rgba(17, 22, 18, 0.8)"
              stroke="#eef3e7"
              strokeWidth={2}
            />
            <circle cx={start.x} cy={start.y} r={5} fill="#eef3e7" />
            <text
              x={start.x + 18}
              y={start.y - 14}
              fill="#eef3e7"
              fontFamily='"Lucida Console", "Courier New", monospace'
              fontSize="11"
              fontWeight="700"
            >
              START {unitId}
            </text>
          </g>
        );
      })}

      {selectedUnitId ? (
        <g
          opacity={interpolate(focusOpacity, [0, 1], [0, 1])}
          transform="translate(24 36)"
        >
          <rect
            width="238"
            height="34"
            fill="rgba(17, 22, 18, 0.86)"
            stroke="#d6a23a"
          />
          <text
            x="12"
            y="22"
            fill="#d6a23a"
            fontFamily='"Lucida Console", "Courier New", monospace'
            fontSize="12"
            fontWeight="700"
          >
            FOCUS: UNIT {selectedUnitId} PATHS ONLY
          </text>
        </g>
      ) : null}

      {move.paths.flatMap((strategy, strategyIndex) =>
        segmentsForStrategy(strategy, visibleUnitIds).map((segment, index) => {
          const stagger = strategyIndex * 5 + index * 2;
          const segmentOpacity =
            reveal *
            interpolate(frame, [8 + stagger, 26 + stagger], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

          return (
            <ArrowSegment
              key={`${strategy.id}-${segment.unitId}-${segment.segmentIndex}`}
              segment={segment}
              markerId={`arrow-${move.index}-${strategy.id}`}
              opacity={segmentOpacity}
              strokeWidth={3.4}
              color={strategy.color}
              progress={1}
              dashed
              glow={false}
            />
          );
        }),
      )}

      {bestPath
        ? visibleUnitIds.map((unitId, index) => {
            const points = bestPath.unitPaths[unitId];
            const action = actionForUnit(unitId);
            const isWait = action?.action === "WAIT";

            if (isWait) {
              const start = move.startPositions[unitId];

              return (
                <g key={`best-wait-${unitId}`} opacity={bestReveal}>
                  <circle
                    cx={start.x}
                    cy={start.y}
                    r={22}
                    fill="rgba(214,162,58,0.08)"
                    stroke={BEST_ARROW_COLOR}
                    strokeWidth="4"
                    strokeDasharray="5 5"
                    filter="url(#bestArrowGlow)"
                  />
                  <text
                    x={start.x + 28}
                    y={start.y + 5}
                    fill={BEST_ARROW_COLOR}
                    fontFamily='"Lucida Console", "Courier New", monospace'
                    fontSize="12"
                    fontWeight="900"
                  >
                    WAIT
                  </text>
                </g>
              );
            }

            const segment: Segment = {
              from: points[0],
              to: points[1],
              unitId,
              strategy: bestPath,
              segmentIndex: 0,
            };
            const pulse = interpolate(frame % 30, [0, 15, 29], [0.88, 1, 0.88], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <ArrowSegment
                key={`best-next-${unitId}`}
                segment={segment}
                markerId={`best-arrow-${move.index}`}
                opacity={bestReveal * pulse}
                strokeWidth={8.8 + index * 0.25}
                color={BEST_ARROW_COLOR}
                progress={bestReveal}
                dashed={false}
                glow
              />
            );
          })
        : null}

      {move.paths.map((strategy, index) => {
        const labelPath = strategy.unitPaths[selectedUnitId ?? "331"];
        const anchor = labelPath[Math.min(1, labelPath.length - 1)];
        const isBest = strategy.id === move.bestStrategyId;

        return (
          <g
            key={`strategy-label-${strategy.id}`}
            opacity={reveal * labelOpacity * (isBest ? 1 : 0.72)}
            transform={`translate(${anchor.x + 18}, ${anchor.y - 38 + index * 22})`}
          >
            <rect
              width={isBest ? 184 : 156}
              height="32"
              fill="rgba(17, 22, 18, 0.88)"
              stroke={isBest ? BEST_ARROW_COLOR : strategy.color}
              strokeOpacity={isBest ? 1 : 0.64}
            />
            <text
              x="10"
              y="21"
              fill="#eef3e7"
              fontFamily='"Lucida Console", "Courier New", monospace'
              fontSize="12"
              fontWeight="700"
            >
              {isBest ? "BEST: " : ""}
              {strategy.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
