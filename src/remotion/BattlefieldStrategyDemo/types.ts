export type UnitId = "331" | "332" | "333";

export type StrategyId = "maneuver" | "force" | "coordination";

export type ObjectiveMode = "typing" | "submitted" | "running";

export type TooltipMode = "hidden" | "hover" | "pinned";

export type TooltipKind = "strategy" | "decision";

export type NavigationAction = "none" | "next" | "previous" | "both";

export type AnnotationId =
  | "objective"
  | "paths"
  | "focus"
  | "overview"
  | "hover"
  | "pin"
  | "navigation"
  | "reasoning";

export interface Point {
  x: number;
  y: number;
}

export interface FriendlyUnit {
  id: UnitId;
  label: string;
  type: string;
  role: string;
  size: number;
}

export interface EnemyUnit {
  id: string;
  label: string;
  position: Point;
  type: string;
  role: string;
  size: number;
}

export interface MapNode {
  id: string;
  label: string;
  position: Point;
  variant: "neutral" | "enemy" | "critical";
}

export interface StrategyPath {
  id: StrategyId;
  label: string;
  color: string;
  dash: string;
  unitPaths: Record<UnitId, Point[]>;
  tooltipTitle: string;
  tooltipBody: string;
  tooltipAnchor: Point;
  tooltipOffset: Point;
}

export interface MoveAction {
  unitId: UnitId;
  action: string;
  from: string;
  to: string;
}

export interface MoveReasoning {
  headline: string;
  chosenMove: string;
  explanation: string;
  factors: string[];
  confidence: number;
}

export interface MoveStep {
  index: number;
  label: string;
  stepLabel: string;
  tacticalState: string;
  startPositions: Record<UnitId, Point>;
  endPositions: Record<UnitId, Point>;
  bestStrategyId: StrategyId;
  paths: StrategyPath[];
  actions: MoveAction[];
  reasoning: MoveReasoning;
}
