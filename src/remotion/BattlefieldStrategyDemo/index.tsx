import type { CSSProperties, FC } from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { MapScene } from "./components/MapScene";
import { NavigationControls } from "./components/NavigationControls";
import { ObjectiveBox } from "./components/ObjectiveBox";
import { ReasoningPanel } from "./components/ReasoningPanel";
import {
  BATTLEFIELD_DURATION_IN_FRAMES,
  BATTLEFIELD_FPS,
  BATTLEFIELD_HEIGHT,
  BATTLEFIELD_WIDTH,
  HOVER_TOOLTIP_FRAMES,
  MOVE_STEP_FRAMES,
  MOVES,
  OBJECTIVE_TYPING_FRAMES,
  OVERVIEW_RETURN_FRAMES,
  PATH_GENERATION_FRAMES,
  PINNED_TOOLTIP_FRAMES,
  UNIT_FOCUS_FRAMES,
} from "./data";
import type {
  AnnotationId,
  NavigationAction,
  ObjectiveMode,
  StrategyId,
  TooltipKind,
  TooltipMode,
  UnitId,
} from "./types";

export {
  BATTLEFIELD_DURATION_IN_FRAMES,
  BATTLEFIELD_FPS,
  BATTLEFIELD_HEIGHT,
  BATTLEFIELD_WIDTH,
};

type HighlightCard = "planner" | "decision" | "unit" | null;

interface DemoSceneConfig {
  moveIndex: number;
  objectiveMode: ObjectiveMode;
  showPaths: boolean;
  selectedUnitId: UnitId | null;
  tooltipStrategyId: StrategyId | null;
  tooltipMode: TooltipMode;
  tooltipKind: TooltipKind;
  navigationAction: NavigationAction;
  animateMove: boolean;
  isGenerating: boolean;
  hoveredEnemyId: string | null;
  annotation: AnnotationId | null;
  highlightAssess: boolean;
  highlightMap: boolean;
  highlightCard: HighlightCard;
}

interface BattlefieldDemoSceneProps {
  config: DemoSceneConfig;
  durationInFrames: number;
}

const annotationText: Record<AnnotationId, string> = {
  objective: "User selects an OCA and enters mission strategy",
  paths: "Simulator generates multiple strategy paths per unit",
  focus: "User can focus on a single unit's strategy options",
  overview: "Return to full tactical overview",
  hover: "Hover to view reasoning for this strategy",
  pin: "Click path to pin reasoning; click anywhere to close",
  navigation: "Step through moves to see evolving strategies",
  reasoning: "Agent explains why the chosen move is optimal",
};

const annotationStyle: Record<AnnotationId, CSSProperties> = {
  objective: { left: 430, top: 122, width: 620 },
  paths: { left: 620, top: 164, width: 670 },
  focus: { left: 620, top: 164, width: 640 },
  overview: { left: 650, top: 164, width: 520 },
  hover: { left: 1160, top: 164, width: 500 },
  pin: { left: 1130, top: 164, width: 480 },
  navigation: { left: 692, top: 954, width: 620 },
  reasoning: { left: 1260, top: 164, width: 520 },
};

const VideoAnnotation: FC<{
  annotation: AnnotationId | null;
  frame: number;
  durationInFrames: number;
}> = ({ annotation, frame, durationInFrames }) => {
  const { fps } = useVideoConfig();

  if (!annotation) {
    return null;
  }

  const entrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 150 },
  });
  const opacity = interpolate(
    frame,
    [0, 10, Math.max(12, durationInFrames - 14), durationInFrames - 1],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 220,
        ...annotationStyle[annotation],
        opacity,
        transform: `translateY(${interpolate(entrance, [0, 1], [-12, 0])}px)`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          color: "#eef3e7",
          background: "rgba(8, 10, 9, 0.94)",
          border: "2px solid rgba(238,243,231,0.58)",
          boxShadow: "9px 9px 0 rgba(0,0,0,0.34)",
          font: '900 22px/1.18 "Lucida Console", "Courier New", monospace',
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            flexShrink: 0,
            color: "#111612",
            background: "#d6a23a",
            padding: "5px 7px",
            fontSize: 13,
          }}
        >
          Demo
        </span>
        <span>{annotationText[annotation]}</span>
      </div>
    </div>
  );
};

const TopBar: FC = () => (
  <header
    style={{
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: 12,
      alignItems: "stretch",
      marginBottom: 10,
      border: "1px solid #687466",
      background: "#222a25",
      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.32)",
    }}
  >
    <div
      style={{
        padding: "10px 12px",
        borderLeft: "5px solid #8fb36a",
      }}
    >
      <div
        style={{
          color: "#d6a23a",
          font: '700 11px "Lucida Console", "Courier New", monospace',
          textTransform: "uppercase",
          marginBottom: 5,
          letterSpacing: 0,
        }}
      >
        Marik Tactical Decision Support / Route Reasoning
      </div>
      <h1
        style={{
          margin: 0,
          color: "#eef3e7",
          font: '900 24px "Lucida Console", "Courier New", monospace',
          textTransform: "uppercase",
          letterSpacing: 0,
        }}
      >
        Strategy Assess + Planner Route Inspection
      </h1>
    </div>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, auto)",
        borderLeft: "1px solid #465147",
      }}
    >
      {[
        ["OCA", "LILY"],
        ["Critical Pt", "1-E"],
        ["Mode", "Split-Sync"],
        ["Status", "Planning"],
      ].map(([label, value]) => (
        <div
          key={label}
          style={{
            minWidth: 112,
            padding: "9px 11px",
            borderLeft: "1px solid #465147",
            fontFamily: '"Lucida Console", "Courier New", monospace',
          }}
        >
          <span
            style={{
              display: "block",
              color: "#a7b09f",
              fontSize: 10,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            {label}
          </span>
          <strong
            style={{
              color: "#eef3e7",
              fontSize: 12,
              textTransform: "uppercase",
            }}
          >
            {value}
          </strong>
        </div>
      ))}
    </div>
  </header>
);

const WorkspaceHeader: FC = () => (
  <header
    style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10,
      padding: "8px 10px",
      background: "#111612",
      borderBottom: "1px solid #687466",
    }}
  >
    <div>
      <h2
        style={{
          margin: 0,
          color: "#eef3e7",
          font: '700 15px "Lucida Console", "Courier New", monospace',
          textTransform: "uppercase",
          letterSpacing: 0,
        }}
      >
        02 Planner + Battle Reasoning
      </h2>
      <p
        style={{
          margin: "5px 0 0",
          color: "#a7b09f",
          lineHeight: 1.35,
          fontSize: 13,
          maxWidth: 760,
        }}
      >
        Planner paths are shown on the tactical overlay. Click path segments for
        model reasoning. Hover over friendly units for type and strength.
      </p>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {["Available: 331 / 332 / 333", "Display: Reasoning Overlay"].map(
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
  </header>
);

const BattlefieldDemoScene: FC<BattlefieldDemoSceneProps> = ({
  config,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const move = MOVES[config.moveIndex];

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px), #1d241f",
        backgroundSize: "18px 18px, 18px 18px, auto",
        color: "#d8decf",
        fontFamily:
          '"Arial Narrow", "Roboto Condensed", Arial, system-ui, sans-serif',
      }}
    >
      <main
        style={{
          width: 1880,
          margin: "0 auto",
          padding: "12px 0 18px",
        }}
      >
        <TopBar />
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "350px 1fr",
            gap: 10,
            alignItems: "start",
          }}
        >
          <ObjectiveBox
            frame={frame}
            mode={config.objectiveMode}
            highlight={config.highlightAssess}
          />

          <section
            style={{
              minWidth: 0,
              background: "#2a322c",
              border: "1px solid #687466",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.32)",
            }}
          >
            <WorkspaceHeader />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 330px",
                gap: 10,
                padding: 10,
              }}
            >
              <div style={{ display: "grid", gap: 10 }}>
                <MapScene
                  move={move}
                  frame={frame}
                  showPaths={config.showPaths}
                  selectedUnitId={config.selectedUnitId}
                  tooltipStrategyId={config.tooltipStrategyId}
                  tooltipMode={config.tooltipMode}
                  tooltipKind={config.tooltipKind}
                  animateMove={config.animateMove}
                  isGenerating={config.isGenerating}
                  durationInFrames={durationInFrames}
                  hoveredEnemyId={config.hoveredEnemyId}
                  highlight={config.highlightMap}
                />
                <NavigationControls
                  frame={frame}
                  moveIndex={move.index}
                  action={config.navigationAction}
                />
              </div>
              <ReasoningPanel
                move={move}
                frame={frame}
                highlight={config.highlightCard}
              />
            </div>
          </section>
        </section>
      </main>
      <VideoAnnotation
        annotation={config.annotation}
        frame={frame}
        durationInFrames={durationInFrames}
      />
    </AbsoluteFill>
  );
};

const baseScene = {
  selectedUnitId: null,
  tooltipStrategyId: null,
  tooltipMode: "hidden",
  tooltipKind: "strategy",
  navigationAction: "none",
  animateMove: false,
  isGenerating: false,
  hoveredEnemyId: null,
  annotation: null,
  highlightAssess: false,
  highlightMap: false,
  highlightCard: null,
} satisfies Omit<DemoSceneConfig, "moveIndex" | "objectiveMode" | "showPaths">;

const objectiveScene: DemoSceneConfig = {
  ...baseScene,
  moveIndex: 0,
  objectiveMode: "typing",
  showPaths: false,
  annotation: "objective",
  highlightAssess: true,
};

const pathGenerationScene: DemoSceneConfig = {
  ...baseScene,
  moveIndex: 1,
  objectiveMode: "submitted",
  showPaths: true,
  isGenerating: true,
  annotation: "paths",
  highlightMap: true,
  highlightCard: "planner",
};

const focusUnitScene: DemoSceneConfig = {
  ...baseScene,
  moveIndex: 1,
  objectiveMode: "running",
  showPaths: true,
  selectedUnitId: "331",
  annotation: "focus",
  highlightMap: true,
  highlightCard: "unit",
};

const overviewScene: DemoSceneConfig = {
  ...baseScene,
  moveIndex: 1,
  objectiveMode: "running",
  showPaths: true,
  annotation: "overview",
  highlightMap: true,
  hoveredEnemyId: "cycle",
  highlightCard: "unit",
};

const hoverTooltipScene: DemoSceneConfig = {
  ...baseScene,
  moveIndex: 1,
  objectiveMode: "running",
  showPaths: true,
  tooltipStrategyId: "coordination",
  tooltipMode: "hover",
  tooltipKind: "strategy",
  highlightCard: "planner",
};

const pinnedDecisionTooltipScene: DemoSceneConfig = {
  ...baseScene,
  moveIndex: 1,
  objectiveMode: "running",
  showPaths: true,
  tooltipStrategyId: null,
  tooltipMode: "pinned",
  tooltipKind: "decision",
  highlightCard: "decision",
};

const navigationFirstScene: DemoSceneConfig = {
  ...baseScene,
  moveIndex: 1,
  objectiveMode: "running",
  showPaths: true,
  navigationAction: "both",
  animateMove: true,
  highlightMap: true,
  highlightCard: "decision",
};

const navigationSecondScene: DemoSceneConfig = {
  ...baseScene,
  moveIndex: 2,
  objectiveMode: "running",
  showPaths: true,
  navigationAction: "next",
  animateMove: true,
  highlightCard: "decision",
};

const navigationThirdScene: DemoSceneConfig = {
  ...baseScene,
  moveIndex: 3,
  objectiveMode: "running",
  showPaths: true,
  navigationAction: "next",
  animateMove: true,
  highlightCard: "decision",
};

const navigationFourthScene: DemoSceneConfig = {
  ...baseScene,
  moveIndex: 4,
  objectiveMode: "running",
  showPaths: true,
  navigationAction: "next",
  animateMove: true,
  highlightCard: "decision",
};

const PATH_GENERATION_START = OBJECTIVE_TYPING_FRAMES;
const UNIT_FOCUS_START = PATH_GENERATION_START + PATH_GENERATION_FRAMES;
const OVERVIEW_RETURN_START = UNIT_FOCUS_START + UNIT_FOCUS_FRAMES;
const HOVER_TOOLTIP_START = OVERVIEW_RETURN_START + OVERVIEW_RETURN_FRAMES;
const PINNED_TOOLTIP_START = HOVER_TOOLTIP_START + HOVER_TOOLTIP_FRAMES;
const NAVIGATION_FIRST_START = PINNED_TOOLTIP_START + PINNED_TOOLTIP_FRAMES;
const NAVIGATION_SECOND_START = NAVIGATION_FIRST_START + MOVE_STEP_FRAMES;
const NAVIGATION_THIRD_START = NAVIGATION_SECOND_START + MOVE_STEP_FRAMES;
const NAVIGATION_FOURTH_START = NAVIGATION_THIRD_START + MOVE_STEP_FRAMES;

export const BattlefieldStrategyDemo: FC = () => {
  return (
    <>
      {/* Frames 0-87: User selects OCA LILY and enters the Mission Strategy text. */}
      <Sequence durationInFrames={OBJECTIVE_TYPING_FRAMES}>
        <BattlefieldDemoScene
          config={objectiveScene}
          durationInFrames={OBJECTIVE_TYPING_FRAMES}
        />
      </Sequence>

      {/* Frames 88-159: Planner paths are generated and rendered on the map. */}
      <Sequence
        from={PATH_GENERATION_START}
        durationInFrames={PATH_GENERATION_FRAMES}
      >
        <BattlefieldDemoScene
          config={pathGenerationScene}
          durationInFrames={PATH_GENERATION_FRAMES}
        />
      </Sequence>

      {/* Frames 160-219: Unit 331 is selected to isolate its strategy paths. */}
      <Sequence from={UNIT_FOCUS_START} durationInFrames={UNIT_FOCUS_FRAMES}>
        <BattlefieldDemoScene
          config={focusUnitScene}
          durationInFrames={UNIT_FOCUS_FRAMES}
        />
      </Sequence>

      {/* Frames 220-269: Unit 331 is deselected and all unit paths return. */}
      <Sequence
        from={OVERVIEW_RETURN_START}
        durationInFrames={OVERVIEW_RETURN_FRAMES}
      >
        <BattlefieldDemoScene
          config={overviewScene}
          durationInFrames={OVERVIEW_RETURN_FRAMES}
        />
      </Sequence>

      {/* Frames 270-331: Hovering a planner route shows model reasoning in a tooltip. */}
      <Sequence
        from={HOVER_TOOLTIP_START}
        durationInFrames={HOVER_TOOLTIP_FRAMES}
      >
        <BattlefieldDemoScene
          config={hoverTooltipScene}
          durationInFrames={HOVER_TOOLTIP_FRAMES}
        />
      </Sequence>

      {/* Frames 332-401: Clicking the amber tactical decision arrow pins next-step reasoning, then closes it with x. */}
      <Sequence
        from={PINNED_TOOLTIP_START}
        durationInFrames={PINNED_TOOLTIP_FRAMES}
      >
        <BattlefieldDemoScene
          config={pinnedDecisionTooltipScene}
          durationInFrames={PINNED_TOOLTIP_FRAMES}
        />
      </Sequence>

      {/* Frames 402-473: Navigation controls step backward and forward while Move 2 executes. */}
      <Sequence
        from={NAVIGATION_FIRST_START}
        durationInFrames={MOVE_STEP_FRAMES}
      >
        <BattlefieldDemoScene
          config={navigationFirstScene}
          durationInFrames={MOVE_STEP_FRAMES}
        />
      </Sequence>

      {/* Frames 474-545: Move 3 replans from the new positions and updates Next Step reasoning. */}
      <Sequence
        from={NAVIGATION_SECOND_START}
        durationInFrames={MOVE_STEP_FRAMES}
      >
        <BattlefieldDemoScene
          config={navigationSecondScene}
          durationInFrames={MOVE_STEP_FRAMES}
        />
      </Sequence>

      {/* Frames 546-617: Move 4 synchronizes entry into the critical point. */}
      <Sequence
        from={NAVIGATION_THIRD_START}
        durationInFrames={MOVE_STEP_FRAMES}
      >
        <BattlefieldDemoScene
          config={navigationThirdScene}
          durationInFrames={MOVE_STEP_FRAMES}
        />
      </Sequence>

      {/* Frames 618-689: Move 5 secures the endpoint and keeps the reasoning panel updated. */}
      <Sequence
        from={NAVIGATION_FOURTH_START}
        durationInFrames={MOVE_STEP_FRAMES}
      >
        <BattlefieldDemoScene
          config={navigationFourthScene}
          durationInFrames={MOVE_STEP_FRAMES}
        />
      </Sequence>
    </>
  );
};
