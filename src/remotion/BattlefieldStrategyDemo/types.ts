export type UnitId = "alpha" | "bravo" | "charlie";

export type StrategyId = "flank" | "screen" | "breach";

export interface Point {
  x: number;
  y: number;
}

export interface FriendlyUnit {
  id: UnitId;
  label: string;
  callSign: string;
  role: string;
}

export interface EnemyUnit {
  id: string;
  label: string;
  position: Point;
  strength: string;
  range: number;
}

export interface StrategyPath {
  id: StrategyId;
  label: string;
  color: string;
  unitPaths: Record<UnitId, Point[]>;
  tooltipTitle: string;
  tooltipBody: string;
}

export interface MoveReasoning {
  headline: string;
  bestMove: string;
  explanation: string;
  factors: string[];
}

export interface MoveStep {
  index: number;
  label: string;
  tacticalState: string;
  previousPositions: Record<UnitId, Point>;
  unitPositions: Record<UnitId, Point>;
  bestStrategyId: StrategyId | null;
  tooltipStrategyId: StrategyId | null;
  tooltipAnchor: Point;
  paths: StrategyPath[];
  reasoning: MoveReasoning;
}
