import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";

import {
  BATTLEFIELD_DURATION_IN_FRAMES,
  BATTLEFIELD_FPS,
  BATTLEFIELD_HEIGHT,
  BATTLEFIELD_WIDTH,
  MOVE_DURATION_IN_FRAMES,
  MOVES,
} from "./data";
import { MapScene } from "./components/MapScene";
import { NavigationControls } from "./components/NavigationControls";
import { ObjectiveBox } from "./components/ObjectiveBox";
import { ReasoningPanel } from "./components/ReasoningPanel";
import type { MoveStep } from "./types";

export {
  BATTLEFIELD_DURATION_IN_FRAMES,
  BATTLEFIELD_FPS,
  BATTLEFIELD_HEIGHT,
  BATTLEFIELD_WIDTH,
};

interface MoveSceneProps {
  move: MoveStep;
}

const MoveScene: React.FC<MoveSceneProps> = ({ move }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 18% 16%, rgba(155,220,126,0.11), transparent 28%), linear-gradient(135deg, #151814 0%, #1d211b 48%, #151814 100%)",
        color: "#f4f7ef",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: "42px 44px 38px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 34,
          width: "100%",
          height: "100%",
        }}
      >
        <main
          style={{
            width: 1180,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <ObjectiveBox frame={frame} moveIndex={move.index} />
          <MapScene move={move} frame={frame} />
          <NavigationControls frame={frame} moveIndex={move.index} />
        </main>
        <ReasoningPanel move={move} frame={frame} />
      </div>
    </AbsoluteFill>
  );
};

export const BattlefieldStrategyDemo: React.FC = () => {
  return (
    <>
      {/* Frames 0-99: Move 1, objective loaded and initial battlefield state. */}
      <Sequence durationInFrames={MOVE_DURATION_IN_FRAMES}>
        <MoveScene move={MOVES[0]} />
      </Sequence>

      {/* Frames 100-199: Move 2, reveal candidate paths and select the northern flank. */}
      <Sequence
        from={MOVE_DURATION_IN_FRAMES}
        durationInFrames={MOVE_DURATION_IN_FRAMES}
      >
        <MoveScene move={MOVES[1]} />
      </Sequence>

      {/* Frames 200-299: Move 3, update risk model and choose the center screen. */}
      <Sequence
        from={MOVE_DURATION_IN_FRAMES * 2}
        durationInFrames={MOVE_DURATION_IN_FRAMES}
      >
        <MoveScene move={MOVES[2]} />
      </Sequence>

      {/* Frames 300-399: Move 4, use prior screening to commit through the gap. */}
      <Sequence
        from={MOVE_DURATION_IN_FRAMES * 3}
        durationInFrames={MOVE_DURATION_IN_FRAMES}
      >
        <MoveScene move={MOVES[3]} />
      </Sequence>

      {/* Frames 400-499: Move 5, bend toward the objective while protecting the road. */}
      <Sequence
        from={MOVE_DURATION_IN_FRAMES * 4}
        durationInFrames={MOVE_DURATION_IN_FRAMES}
      >
        <MoveScene move={MOVES[4]} />
      </Sequence>
    </>
  );
};
