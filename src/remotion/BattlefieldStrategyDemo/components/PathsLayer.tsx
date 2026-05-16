import { interpolate, spring, useVideoConfig } from "remotion";

import { MAP_HEIGHT, MAP_WIDTH } from "../data";
import type { MoveStep, Point, StrategyPath, UnitId } from "../types";

interface PathsLayerProps {
  move: MoveStep;
  frame: number;
}

interface Segment {
  from: Point;
  to: Point;
  unitId: UnitId;
  strategy: StrategyPath;
  segmentIndex: number;
}

const unitOrder: UnitId[] = ["alpha", "bravo", "charlie"];

const distance = (from: Point, to: Point) =>
  Math.hypot(to.x - from.x, to.y - from.y);

const getSegments = (strategyPath: StrategyPath): Segment[] =>
  unitOrder.flatMap((unitId) => {
    const points = strategyPath.unitPaths[unitId];

    return points.slice(0, -1).map((point, index) => ({
      from: point,
      to: points[index + 1],
      unitId,
      strategy: strategyPath,
      segmentIndex: index,
    }));
  });

const ArrowSegment: React.FC<{
  segment: Segment;
  markerId: string;
  opacity: number;
  strokeWidth: number;
  progress: number;
  dashed: boolean;
}> = ({ segment, markerId, opacity, strokeWidth, progress, dashed }) => {
  const length = distance(segment.from, segment.to);
  const dashArray = dashed ? "12 16" : length;
  const dashOffset = dashed ? 0 : length * (1 - progress);

  return (
    <line
      x1={segment.from.x}
      y1={segment.from.y}
      x2={segment.to.x}
      y2={segment.to.y}
      stroke={segment.strategy.color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      markerEnd={`url(#${markerId})`}
      opacity={opacity}
      strokeDasharray={dashArray}
      strokeDashoffset={dashOffset}
      filter={strokeWidth > 8 ? "url(#bestArrowGlow)" : undefined}
    />
  );
};

export const PathsLayer: React.FC<PathsLayerProps> = ({ move, frame }) => {
  const { fps } = useVideoConfig();

  if (move.paths.length === 0 || move.bestStrategyId === null) {
    return null;
  }

  const reveal = interpolate(frame, [8, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bestReveal = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 16, stiffness: 150 },
  });
  const labelOpacity = interpolate(frame, [18, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bestPath = move.paths.find(
    (pathOption) => pathOption.id === move.bestStrategyId,
  );

  return (
    <svg
      width={MAP_WIDTH}
      height={MAP_HEIGHT}
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "visible",
      }}
    >
      <defs>
        {move.paths.map((pathOption) => (
          <marker
            key={pathOption.id}
            id={`arrow-${move.index}-${pathOption.id}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={pathOption.color} />
          </marker>
        ))}
        <marker
          id={`best-arrow-${move.index}`}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={bestPath?.color ?? "#ffffff"} />
        </marker>
        <filter id="bestArrowGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="4"
            floodColor={bestPath?.color ?? "#ffffff"}
            floodOpacity="0.7"
          />
        </filter>
      </defs>

      {move.paths.flatMap((strategyPath, strategyIndex) =>
        getSegments(strategyPath).map((segment, segmentIndex) => {
          const stagger = strategyIndex * 4 + segmentIndex * 2;
          const segmentProgress = interpolate(
            frame,
            [10 + stagger, 34 + stagger],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          );
          const isBest = strategyPath.id === move.bestStrategyId;

          return (
            <ArrowSegment
              key={`${strategyPath.id}-${segment.unitId}-${segment.segmentIndex}`}
              segment={segment}
              markerId={`arrow-${move.index}-${strategyPath.id}`}
              opacity={reveal * (isBest ? 0.58 : 0.27)}
              strokeWidth={isBest ? 6 : 4}
              progress={segmentProgress}
              dashed={!isBest}
            />
          );
        }),
      )}

      {bestPath
        ? unitOrder.map((unitId, unitIndex) => {
            const points = bestPath.unitPaths[unitId];
            const segment = {
              from: points[0],
              to: points[1],
              unitId,
              strategy: bestPath,
              segmentIndex: 0,
            };
            const pulse = interpolate(
              frame % 28,
              [0, 14, 27],
              [0.86, 1, 0.86],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            );

            return (
              <ArrowSegment
                key={`best-${unitId}`}
                segment={segment}
                markerId={`best-arrow-${move.index}`}
                opacity={bestReveal * pulse}
                strokeWidth={11 + unitIndex * 0.3}
                progress={bestReveal}
                dashed={false}
              />
            );
          })
        : null}

      {move.paths.map((pathOption, index) => {
        const alphaPath = pathOption.unitPaths.alpha;
        const labelPosition = alphaPath[Math.min(1, alphaPath.length - 1)];
        const isBest = pathOption.id === move.bestStrategyId;

        return (
          <g
            key={`label-${pathOption.id}`}
            opacity={labelOpacity * (isBest ? 1 : 0.72)}
            transform={`translate(${labelPosition.x + 18}, ${
              labelPosition.y - 34 + index * 18
            })`}
          >
            <rect
              x="0"
              y="0"
              width={isBest ? 178 : 154}
              height="34"
              rx="6"
              fill="rgba(12, 16, 13, 0.78)"
              stroke={pathOption.color}
              strokeOpacity={isBest ? 0.95 : 0.46}
            />
            <text
              x="12"
              y="22"
              fill="#f6fbf4"
              fontSize="15"
              fontWeight="800"
              style={{ letterSpacing: 0 }}
            >
              {isBest ? "BEST: " : ""}
              {pathOption.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
