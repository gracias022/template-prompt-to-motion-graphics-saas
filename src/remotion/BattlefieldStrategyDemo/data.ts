import type {
  EnemyUnit,
  FriendlyUnit,
  MoveStep,
  Point,
  StrategyPath,
  UnitId,
} from "./types";

export const BATTLEFIELD_WIDTH = 1920;
export const BATTLEFIELD_HEIGHT = 1080;
export const BATTLEFIELD_FPS = 30;
export const MOVE_DURATION_IN_FRAMES = 100;
export const TOTAL_MOVES = 5;
export const BATTLEFIELD_DURATION_IN_FRAMES =
  MOVE_DURATION_IN_FRAMES * TOTAL_MOVES;

export const MAP_WIDTH = 1180;
export const MAP_HEIGHT = 760;

export const OBJECTIVE_TEXT =
  "Secure Hill 482 and keep the western supply road open";

export const OBJECTIVE_POSITION: Point = { x: 982, y: 176 };

export const FRIENDLY_UNITS: FriendlyUnit[] = [
  { id: "alpha", label: "A1", callSign: "Alpha", role: "Infantry" },
  { id: "bravo", label: "B2", callSign: "Bravo", role: "Armor" },
  { id: "charlie", label: "C3", callSign: "Charlie", role: "Recon" },
];

export const ENEMY_UNITS: EnemyUnit[] = [
  {
    id: "red-one",
    label: "R1",
    position: { x: 752, y: 304 },
    strength: "AT team",
    range: 116,
  },
  {
    id: "red-two",
    label: "R2",
    position: { x: 854, y: 548 },
    strength: "Mechanized",
    range: 138,
  },
  {
    id: "red-three",
    label: "R3",
    position: { x: 1012, y: 394 },
    strength: "Reserve",
    range: 104,
  },
];

const position = (x: number, y: number): Point => ({ x, y });

const path = (...points: Point[]): Point[] => points;

const positionsByMove: Record<number, Record<UnitId, Point>> = {
  0: {
    alpha: position(188, 590),
    bravo: position(214, 392),
    charlie: position(360, 690),
  },
  1: {
    alpha: position(326, 548),
    bravo: position(352, 346),
    charlie: position(504, 640),
  },
  2: {
    alpha: position(456, 500),
    bravo: position(486, 310),
    charlie: position(628, 584),
  },
  3: {
    alpha: position(608, 454),
    bravo: position(612, 282),
    charlie: position(746, 520),
  },
  4: {
    alpha: position(738, 390),
    bravo: position(738, 246),
    charlie: position(856, 456),
  },
};

const strategy = (
  id: StrategyPath["id"],
  label: string,
  color: string,
  unitPaths: Record<UnitId, Point[]>,
  tooltipTitle: string,
  tooltipBody: string,
): StrategyPath => ({
  id,
  label,
  color,
  unitPaths,
  tooltipTitle,
  tooltipBody,
});

export const MOVES: MoveStep[] = [
  {
    index: 0,
    label: "Move 1",
    tacticalState: "Objective accepted",
    previousPositions: positionsByMove[0],
    unitPositions: positionsByMove[0],
    bestStrategyId: null,
    tooltipStrategyId: null,
    tooltipAnchor: position(470, 242),
    paths: [],
    reasoning: {
      headline: "Mission objective parsed",
      bestMove: "Hold current formation while the simulator scores options.",
      explanation:
        "The agent identifies Hill 482 as the decisive terrain and preserves a three-unit formation before committing movement. Enemy anti-armor coverage is tagged as the dominant risk.",
      factors: [
        "Objective distance and road access established",
        "Friendly formation spacing remains mutually supporting",
        "Red threat rings are loaded before path scoring",
      ],
    },
  },
  {
    index: 1,
    label: "Move 2",
    tacticalState: "Candidate paths revealed",
    previousPositions: positionsByMove[0],
    unitPositions: positionsByMove[1],
    bestStrategyId: "flank",
    tooltipStrategyId: "screen",
    tooltipAnchor: position(474, 412),
    paths: [
      strategy(
        "flank",
        "Northern flank",
        "#2dd4bf",
        {
          alpha: path(
            position(188, 590),
            position(254, 536),
            position(326, 548),
          ),
          bravo: path(
            position(214, 392),
            position(282, 336),
            position(352, 346),
          ),
          charlie: path(
            position(360, 690),
            position(430, 636),
            position(504, 640),
          ),
        },
        "Northern flank",
        "Uniform rule: every friendly unit shifts along the western ridge first, keeping blue units outside the strongest red coverage while reducing distance to Hill 482.",
      ),
      strategy(
        "screen",
        "Center screen",
        "#f5b942",
        {
          alpha: path(
            position(188, 590),
            position(302, 574),
            position(426, 556),
          ),
          bravo: path(
            position(214, 392),
            position(326, 390),
            position(446, 372),
          ),
          charlie: path(
            position(360, 690),
            position(474, 680),
            position(596, 664),
          ),
        },
        "Center screen",
        "Uniform rule: all units advance on a shallow center line, maximizing speed but briefly exposing the formation to overlapping enemy observation arcs.",
      ),
      strategy(
        "breach",
        "Direct breach",
        "#7bd85b",
        {
          alpha: path(position(188, 590), position(340, 516)),
          bravo: path(position(214, 392), position(372, 318)),
          charlie: path(position(360, 690), position(526, 596)),
        },
        "Direct breach",
        "Uniform rule: each unit takes the shortest available lane toward the objective. The score improves tempo but accepts higher exposure from red mechanized coverage.",
      ),
    ],
    reasoning: {
      headline: "Best next step: Northern flank",
      bestMove:
        "Shift Alpha, Bravo, and Charlie northeast along the western ridge.",
      explanation:
        "The flank path gives up a small amount of speed to keep every friendly unit outside the anti-armor team's highest-risk arc while preserving line-of-sight between the units.",
      factors: [
        "Lowest projected casualties across the next two timesteps",
        "Maintains a support triangle between friendly units",
        "Keeps the supply road screened by Charlie",
      ],
    },
  },
  {
    index: 2,
    label: "Move 3",
    tacticalState: "Risk model updated",
    previousPositions: positionsByMove[1],
    unitPositions: positionsByMove[2],
    bestStrategyId: "screen",
    tooltipStrategyId: "flank",
    tooltipAnchor: position(562, 322),
    paths: [
      strategy(
        "flank",
        "Northern flank",
        "#2dd4bf",
        {
          alpha: path(
            position(326, 548),
            position(394, 488),
            position(474, 466),
          ),
          bravo: path(
            position(352, 346),
            position(420, 284),
            position(512, 270),
          ),
          charlie: path(
            position(504, 640),
            position(570, 588),
            position(654, 562),
          ),
        },
        "Northern flank",
        "Uniform rule: the formation stays ridge-side and compresses north. This avoids the mechanized unit but delays Charlie's road coverage.",
      ),
      strategy(
        "screen",
        "Center screen",
        "#f5b942",
        {
          alpha: path(
            position(326, 548),
            position(392, 520),
            position(456, 500),
          ),
          bravo: path(
            position(352, 346),
            position(422, 326),
            position(486, 310),
          ),
          charlie: path(
            position(504, 640),
            position(566, 610),
            position(628, 584),
          ),
        },
        "Center screen",
        "Uniform rule: all units advance on staggered center lanes, which lets Bravo screen the threat while Alpha and Charlie keep objective pressure.",
      ),
      strategy(
        "breach",
        "Direct breach",
        "#7bd85b",
        {
          alpha: path(position(326, 548), position(522, 476)),
          bravo: path(position(352, 346), position(550, 288)),
          charlie: path(position(504, 640), position(704, 560)),
        },
        "Direct breach",
        "Uniform rule: the formation accelerates in parallel. The model marks this as fast but brittle because units would cross red-two's range at the same time.",
      ),
    ],
    reasoning: {
      headline: "Best next step: Center screen",
      bestMove:
        "Advance on staggered lanes so Bravo absorbs risk while Alpha and Charlie keep pressure.",
      explanation:
        "The updated score shows the northern flank becoming too slow. A center screen keeps the formation balanced and uses Bravo's armor to reduce exposure for the softer units.",
      factors: [
        "Improves arrival time by one timestep",
        "Avoids simultaneous exposure to red-one and red-two",
        "Keeps Charlie close enough to monitor the road",
      ],
    },
  },
  {
    index: 3,
    label: "Move 4",
    tacticalState: "Objective approach opened",
    previousPositions: positionsByMove[2],
    unitPositions: positionsByMove[3],
    bestStrategyId: "breach",
    tooltipStrategyId: "breach",
    tooltipAnchor: position(732, 424),
    paths: [
      strategy(
        "flank",
        "Northern flank",
        "#2dd4bf",
        {
          alpha: path(
            position(456, 500),
            position(524, 436),
            position(604, 416),
          ),
          bravo: path(
            position(486, 310),
            position(554, 250),
            position(640, 236),
          ),
          charlie: path(
            position(628, 584),
            position(690, 528),
            position(768, 498),
          ),
        },
        "Northern flank",
        "Uniform rule: blue units keep outside the center threat rings, but this route leaves the objective flag uncontested for another timestep.",
      ),
      strategy(
        "screen",
        "Center screen",
        "#f5b942",
        {
          alpha: path(
            position(456, 500),
            position(548, 474),
            position(650, 444),
          ),
          bravo: path(
            position(486, 310),
            position(580, 308),
            position(672, 292),
          ),
          charlie: path(
            position(628, 584),
            position(710, 558),
            position(792, 534),
          ),
        },
        "Center screen",
        "Uniform rule: all units keep a measured line and trade tempo for stability. The model rates it safe but no longer decisive.",
      ),
      strategy(
        "breach",
        "Direct breach",
        "#7bd85b",
        {
          alpha: path(
            position(456, 500),
            position(536, 474),
            position(608, 454),
          ),
          bravo: path(
            position(486, 310),
            position(552, 294),
            position(612, 282),
          ),
          charlie: path(
            position(628, 584),
            position(688, 548),
            position(746, 520),
          ),
        },
        "Direct breach",
        "Uniform rule: every unit commits through the gap opened by Bravo's screen, converting the prior risk reduction into objective tempo.",
      ),
    ],
    reasoning: {
      headline: "Best next step: Direct breach",
      bestMove:
        "Commit through the center gap while red coverage is split across two axes.",
      explanation:
        "The breach is now the best move because prior positioning reduced overlapping fire. The simulator chooses tempo while enemy response time is lowest.",
      factors: [
        "Enemy arcs no longer overlap the full formation",
        "Objective distance drops sharply for all units",
        "Bravo remains between red-one and the softer units",
      ],
    },
  },
  {
    index: 4,
    label: "Move 5",
    tacticalState: "Final next action selected",
    previousPositions: positionsByMove[3],
    unitPositions: positionsByMove[4],
    bestStrategyId: "flank",
    tooltipStrategyId: "flank",
    tooltipAnchor: position(822, 294),
    paths: [
      strategy(
        "flank",
        "Northern flank",
        "#2dd4bf",
        {
          alpha: path(
            position(608, 454),
            position(674, 406),
            position(738, 390),
          ),
          bravo: path(
            position(612, 282),
            position(674, 248),
            position(738, 246),
          ),
          charlie: path(
            position(746, 520),
            position(806, 476),
            position(856, 456),
          ),
        },
        "Northern flank",
        "Uniform rule: the final step bends all units toward the flag while preserving spacing, giving Alpha the approach lane and Charlie the road-security lane.",
      ),
      strategy(
        "screen",
        "Center screen",
        "#f5b942",
        {
          alpha: path(
            position(608, 454),
            position(720, 426),
            position(820, 404),
          ),
          bravo: path(
            position(612, 282),
            position(718, 292),
            position(810, 296),
          ),
          charlie: path(
            position(746, 520),
            position(832, 510),
            position(928, 500),
          ),
        },
        "Center screen",
        "Uniform rule: all units hold a broad screen before the final objective step. It protects the road but misses the current opportunity window.",
      ),
      strategy(
        "breach",
        "Direct breach",
        "#7bd85b",
        {
          alpha: path(position(608, 454), position(794, 360)),
          bravo: path(position(612, 282), position(804, 218)),
          charlie: path(position(746, 520), position(926, 420)),
        },
        "Direct breach",
        "Uniform rule: every unit drives directly at the flag. The model rejects this because red-three can counterattack into an overextended Charlie.",
      ),
    ],
    reasoning: {
      headline: "Best next step: Northern flank",
      bestMove:
        "Bend the formation toward Hill 482 and keep Charlie between red-two and the road.",
      explanation:
        "The final recommendation balances capture probability with road security. A direct push reaches the flag slightly faster, but the flank keeps the route open and avoids overextending Charlie.",
      factors: [
        "Highest combined objective and supply-route score",
        "Keeps all friendly units in mutual support range",
        "Preserves a follow-up lane around red-three",
      ],
    },
  },
];
