import type {
  EnemyUnit,
  FriendlyUnit,
  MapNode,
  MoveStep,
  Point,
  StrategyId,
  StrategyPath,
  UnitId,
} from "./types";

export const BATTLEFIELD_WIDTH = 1920;
export const BATTLEFIELD_HEIGHT = 1080;
export const BATTLEFIELD_FPS = 30;

const WORKFLOW_PAUSE_FRAMES = BATTLEFIELD_FPS * 5;

export const OBJECTIVE_TYPING_FRAMES = 88 + WORKFLOW_PAUSE_FRAMES;
export const PATH_GENERATION_FRAMES = 72 + WORKFLOW_PAUSE_FRAMES;
export const UNIT_FOCUS_FRAMES = 60 + WORKFLOW_PAUSE_FRAMES;
export const OVERVIEW_RETURN_FRAMES = 50 + WORKFLOW_PAUSE_FRAMES;
export const HOVER_TOOLTIP_FRAMES = 62 + WORKFLOW_PAUSE_FRAMES;
export const PINNED_TOOLTIP_FRAMES = 70 + WORKFLOW_PAUSE_FRAMES;
export const MOVE_STEP_FRAMES = 72 + WORKFLOW_PAUSE_FRAMES;

export const BATTLEFIELD_DURATION_IN_FRAMES =
  OBJECTIVE_TYPING_FRAMES +
  PATH_GENERATION_FRAMES +
  HOVER_TOOLTIP_FRAMES +
  PINNED_TOOLTIP_FRAMES +
  MOVE_STEP_FRAMES * 4;

export const MAP_WIDTH = 1160;
export const MAP_HEIGHT = 650;

export const OBJECTIVE_TEXT =
  "Split units across all possible paths, approach safely, coordinate attacks against enemy-held points, and wait for all friendly units before entering the critical point.";

export const END_TARGET: Point = { x: 950, y: 348 };

export const UNIT_ORDER: UnitId[] = ["331", "332", "333"];

const p = (x: number, y: number): Point => ({ x, y });

const route = (...points: Point[]): Point[] => points;

export const FRIENDLY_UNITS: FriendlyUnit[] = [
  {
    id: "331",
    label: "331",
    type: "Infantry Section",
    role: "Assault / main push",
    size: 10,
  },
  {
    id: "332",
    label: "332",
    type: "Recon Element",
    role: "Alternate path coverage",
    size: 8,
  },
  {
    id: "333",
    label: "333",
    type: "Infantry Section",
    role: "Assault support",
    size: 10,
  },
];

export const ENEMY_UNITS: EnemyUnit[] = [
  {
    id: "red-b1",
    label: "E1",
    position: p(385, 178),
    type: "Infantry Element",
    role: "Blocks northern approach",
    size: 6,
    state: "Hostile near 1-B",
  },
  {
    id: "red-b2",
    label: "E2",
    position: p(434, 206),
    type: "Support Element",
    role: "Reinforces contested point",
    size: 4,
    state: "Hostile near 1-B",
  },
  {
    id: "red-i1",
    label: "E3",
    position: p(682, 510),
    type: "Infantry Element",
    role: "Covers alternate route",
    size: 5,
    state: "Hostile near 1-I",
  },
  {
    id: "red-i2",
    label: "E4",
    position: p(730, 536),
    type: "Recon Screen",
    role: "Early contact risk",
    size: 3,
    state: "Hostile near 1-I",
  },
];

export const MAP_NODES: MapNode[] = [
  { id: "a", label: "1-A", position: p(160, 390), variant: "neutral" },
  { id: "b", label: "1-B", position: p(390, 204), variant: "enemy" },
  { id: "c", label: "1-C", position: p(374, 526), variant: "neutral" },
  { id: "d", label: "1-D", position: p(650, 190), variant: "neutral" },
  { id: "i", label: "1-I", position: p(670, 540), variant: "enemy" },
  { id: "e", label: "1-E", position: END_TARGET, variant: "critical" },
];

const initialPositions: Record<UnitId, Point> = {
  "331": p(172, 410),
  "332": p(660, 575),
  "333": p(146, 456),
};

const afterFirstPush: Record<UnitId, Point> = {
  "331": p(356, 218),
  "332": initialPositions["332"],
  "333": p(384, 250),
};

const afterSecondPush: Record<UnitId, Point> = {
  "331": p(640, 192),
  "332": initialPositions["332"],
  "333": p(660, 232),
};

const afterSynchronizedEntry: Record<UnitId, Point> = {
  "331": p(920, 326),
  "332": p(912, 390),
  "333": p(968, 354),
};

const finalSecurePositions: Record<UnitId, Point> = {
  "331": p(920, 326),
  "332": p(912, 390),
  "333": p(968, 354),
};

const strategyCopy = (
  id: StrategyId,
  unitPaths: Record<UnitId, Point[]>,
  tooltipAnchor: Point,
  tooltipOffset: Point,
): StrategyPath => {
  const strategyDetails: Record<
    StrategyId,
    Pick<
      StrategyPath,
      "label" | "color" | "dash" | "tooltipTitle" | "tooltipBody"
    >
  > = {
    maneuver: {
      label: "Maneuver",
      color: "#d985ff",
      dash: undefined,
      tooltipTitle: "Maneuver Planner Reasoning",
      tooltipBody:
        "Uniform rule for every friendly unit: take the fastest legal progress toward 1-E. The model accepts more exposure near enemy-held points because tempo and route coverage are prioritized.",
    },
    force: {
      label: "Force",
      color: "#c8e889",
      dash: "1 7",
      tooltipTitle: "Force Planner Reasoning",
      tooltipBody:
        "Uniform rule for every friendly unit: keep the assault group mutually supporting while pushing enemy-held terrain. No unit enters the end target unsupported.",
    },
    coordination: {
      label: "Coordination",
      color: "#91c7dc",
      dash: "9 7",
      tooltipTitle: "Coordination Planner Reasoning",
      tooltipBody:
        "Uniform rule for every friendly unit: preserve split-path coverage and synchronize the critical entry. The final move waits until all blue elements can converge on 1-E together.",
    },
  };

  return {
    id,
    ...strategyDetails[id],
    unitPaths,
    tooltipAnchor,
    tooltipOffset,
  };
};

const initialRoutes: StrategyPath[] = [
  strategyCopy(
    "maneuver",
    {
      "331": route(initialPositions["331"], p(320, 316), p(646, 190), END_TARGET),
      "332": route(initialPositions["332"], p(742, 480), p(846, 406), END_TARGET),
      "333": route(initialPositions["333"], p(346, 318), p(660, 232), END_TARGET),
    },
    p(474, 240),
    p(112, -132),
  ),
  strategyCopy(
    "force",
    {
      "331": route(initialPositions["331"], p(356, 218), p(650, 190), END_TARGET),
      "332": route(initialPositions["332"], p(724, 505), p(820, 430), END_TARGET),
      "333": route(initialPositions["333"], p(384, 250), p(662, 230), END_TARGET),
    },
    p(390, 262),
    p(118, -112),
  ),
  strategyCopy(
    "coordination",
    {
      "331": route(initialPositions["331"], p(318, 488), p(668, 540), END_TARGET),
      "332": route(initialPositions["332"], p(720, 534), p(838, 472), END_TARGET),
      "333": route(initialPositions["333"], p(344, 540), p(684, 536), END_TARGET),
    },
    p(530, 536),
    p(102, -176),
  ),
];

const secondRoutes: StrategyPath[] = [
  strategyCopy(
    "maneuver",
    {
      "331": route(afterFirstPush["331"], p(510, 168), p(708, 198), END_TARGET),
      "332": route(afterFirstPush["332"], p(808, 440), p(882, 392), END_TARGET),
      "333": route(afterFirstPush["333"], p(530, 220), p(730, 260), END_TARGET),
    },
    p(584, 182),
    p(106, -118),
  ),
  strategyCopy(
    "force",
    {
      "331": route(afterFirstPush["331"], p(526, 242), p(748, 282), END_TARGET),
      "332": route(afterFirstPush["332"], p(806, 490), p(894, 426), END_TARGET),
      "333": route(afterFirstPush["333"], p(546, 276), p(760, 306), END_TARGET),
    },
    p(644, 278),
    p(112, -126),
  ),
  strategyCopy(
    "coordination",
    {
      "331": route(afterFirstPush["331"], p(640, 192), p(790, 252), END_TARGET),
      "332": route(afterFirstPush["332"], p(792, 455), p(870, 420), END_TARGET),
      "333": route(afterFirstPush["333"], p(660, 232), p(802, 278), END_TARGET),
    },
    p(732, 404),
    p(-440, -164),
  ),
];

const thirdRoutes: StrategyPath[] = [
  strategyCopy(
    "maneuver",
    {
      "331": route(afterSecondPush["331"], p(760, 242), p(878, 304), END_TARGET),
      "332": route(afterSecondPush["332"], p(846, 436), p(910, 382), END_TARGET),
      "333": route(afterSecondPush["333"], p(790, 282), p(900, 324), END_TARGET),
    },
    p(802, 284),
    p(-422, -112),
  ),
  strategyCopy(
    "force",
    {
      "331": route(afterSecondPush["331"], p(780, 312), p(892, 336), END_TARGET),
      "332": route(afterSecondPush["332"], p(846, 462), p(920, 392), END_TARGET),
      "333": route(afterSecondPush["333"], p(802, 332), p(916, 352), END_TARGET),
    },
    p(854, 350),
    p(-438, -132),
  ),
  strategyCopy(
    "coordination",
    {
      "331": route(afterSecondPush["331"], p(820, 274), p(920, 326), END_TARGET),
      "332": route(afterSecondPush["332"], p(866, 430), p(912, 390), END_TARGET),
      "333": route(afterSecondPush["333"], p(838, 300), p(968, 354), END_TARGET),
    },
    p(882, 364),
    p(-462, -158),
  ),
];

const finalRoutes: StrategyPath[] = [
  strategyCopy(
    "maneuver",
    {
      "331": route(afterSynchronizedEntry["331"], finalSecurePositions["331"], END_TARGET),
      "332": route(afterSynchronizedEntry["332"], finalSecurePositions["332"], END_TARGET),
      "333": route(afterSynchronizedEntry["333"], finalSecurePositions["333"], END_TARGET),
    },
    p(930, 326),
    p(-452, -156),
  ),
  strategyCopy(
    "force",
    {
      "331": route(afterSynchronizedEntry["331"], p(938, 342), END_TARGET),
      "332": route(afterSynchronizedEntry["332"], p(936, 372), END_TARGET),
      "333": route(afterSynchronizedEntry["333"], p(958, 346), END_TARGET),
    },
    p(940, 352),
    p(-452, -120),
  ),
  strategyCopy(
    "coordination",
    {
      "331": route(afterSynchronizedEntry["331"], p(910, 344), END_TARGET),
      "332": route(afterSynchronizedEntry["332"], p(922, 374), END_TARGET),
      "333": route(afterSynchronizedEntry["333"], p(970, 366), END_TARGET),
    },
    p(936, 382),
    p(-452, -108),
  ),
];

export const MOVES: MoveStep[] = [
  {
    index: 0,
    label: "Move 1",
    stepLabel: "Initial State",
    tacticalState: "Objective entry",
    startPositions: initialPositions,
    endPositions: initialPositions,
    bestStrategyId: "force",
    paths: initialRoutes,
    actions: [
      { unitId: "331", action: "READY", from: "1-A", to: "1-A" },
      { unitId: "332", action: "READY", from: "1-I", to: "1-I" },
      { unitId: "333", action: "READY", from: "1-A", to: "1-A" },
    ],
    reasoning: {
      headline: "Mission objective parsed",
      chosenMove:
        "Extract coordinated critical-entry strategy before committing movement.",
      explanation:
        "The operator intent is converted into a strategy profile that favors split-path coverage, safe approach, and synchronized entry into the critical point.",
      factors: [
        "End target fixed at critical point 1-E",
        "Enemy-held 1-B and 1-I loaded as contact risks",
        "Friendly units preserved in a coordinated entry posture",
      ],
      confidence: 68,
    },
  },
  {
    index: 1,
    label: "Move 2",
    stepLabel: "Generate Routes",
    tacticalState: "Planner routes generated",
    startPositions: initialPositions,
    endPositions: afterFirstPush,
    bestStrategyId: "force",
    paths: initialRoutes,
    actions: [
      { unitId: "331", action: "MOVE", from: "1-A", to: "1-B" },
      { unitId: "332", action: "WAIT", from: "1-I", to: "1-I" },
      { unitId: "333", action: "MOVE", from: "1-A", to: "1-B" },
    ],
    reasoning: {
      headline: "Best next step: Coordinated force entry",
      chosenMove:
        "Move 331 and 333 into the northern contact lane while 332 holds the alternate approach.",
      explanation:
        "The force route best matches the extracted profile because it keeps the main assault paired and prevents 332 from entering 1-E alone. The route still preserves split-path coverage for the final convergence.",
      factors: [
        "Best alignment with full-force entry",
        "Keeps assault elements mutually supporting at 1-B",
        "Preserves 332 as the second entry vector",
      ],
      confidence: 84,
    },
  },
  {
    index: 2,
    label: "Move 3",
    stepLabel: "Replan After Contact",
    tacticalState: "Paths updated after first move",
    startPositions: afterFirstPush,
    endPositions: afterSecondPush,
    bestStrategyId: "coordination",
    paths: secondRoutes,
    actions: [
      { unitId: "331", action: "MOVE", from: "1-B", to: "1-D" },
      { unitId: "332", action: "WAIT", from: "1-I", to: "1-I" },
      { unitId: "333", action: "MOVE", from: "1-B", to: "1-D" },
    ],
    reasoning: {
      headline: "Best next step: Coordinate lanes",
      chosenMove:
        "Advance the main pair toward 1-D while 332 continues to hold at 1-I.",
      explanation:
        "Once contact is absorbed near 1-B, the simulator shifts from raw force to coordination. The selected move reduces the chance that the northern pair reaches 1-E before 332 can support the entry.",
      factors: [
        "Shortens final convergence time for all units",
        "Keeps 332 out of the critical point until support is ready",
        "Maintains pressure without splitting the assault pair",
      ],
      confidence: 88,
    },
  },
  {
    index: 3,
    label: "Move 4",
    stepLabel: "Synchronized Entry",
    tacticalState: "Final entry window opens",
    startPositions: afterSecondPush,
    endPositions: afterSynchronizedEntry,
    bestStrategyId: "coordination",
    paths: thirdRoutes,
    actions: [
      { unitId: "331", action: "MOVE", from: "1-D", to: "1-E" },
      { unitId: "332", action: "MOVE", from: "1-I", to: "1-E" },
      { unitId: "333", action: "MOVE", from: "1-D", to: "1-E" },
    ],
    reasoning: {
      headline: "Best next step: Enter together",
      chosenMove:
        "Commit all friendly units into 1-E during the same timestep.",
      explanation:
        "The coordinated route is now optimal because the arrival times match. The model rejects a staggered entry and chooses a synchronized force push to secure the endpoint.",
      factors: [
        "All friendly units can reach 1-E together",
        "Avoids unsupported entry into the critical point",
        "Maximizes capture score while limiting exposure",
      ],
      confidence: 92,
    },
  },
  {
    index: 4,
    label: "Move 5",
    stepLabel: "Secure Hill 482",
    tacticalState: "Endpoint secured",
    startPositions: afterSynchronizedEntry,
    endPositions: finalSecurePositions,
    bestStrategyId: "maneuver",
    paths: finalRoutes,
    actions: [
      { unitId: "331", action: "HOLD", from: "1-E", to: "1-E" },
      { unitId: "332", action: "HOLD", from: "1-E", to: "1-E" },
      { unitId: "333", action: "HOLD", from: "1-E", to: "1-E" },
    ],
    reasoning: {
      headline: "Terminal state: Endpoint secured",
      chosenMove:
        "No additional movement is required; all friendly units hold at 1-E.",
      explanation:
        "After synchronized entry, the simulator terminates movement planning because the endpoint is secured by all friendly units at the critical point.",
      factors: [
        "Critical point remains controlled by all friendly units",
        "No follow-on move is needed after reaching 1-E",
        "The next-step table remains anchored to valid map nodes",
      ],
      confidence: 90,
    },
  },
];
