import React from "react";
import { Composition } from "remotion";
import {
  BATTLEFIELD_DURATION_IN_FRAMES,
  BATTLEFIELD_FPS,
  BATTLEFIELD_HEIGHT,
  BATTLEFIELD_WIDTH,
  BattlefieldStrategyDemo,
} from "./BattlefieldStrategyDemo";
import { DynamicComp } from "./DynamicComp";
import { MyScene } from "./examples/MyScene";

const defaultCode = `import { AbsoluteFill } from "remotion";
export const MyAnimation = () => <AbsoluteFill style={{ backgroundColor: "#000" }} />;`;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DynamicComp"
        component={DynamicComp}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ code: defaultCode }}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.durationInFrames as number,
          fps: props.fps as number,
        })}
      />
      <Composition
        id="BattlefieldStrategyDemo"
        component={BattlefieldStrategyDemo}
        durationInFrames={BATTLEFIELD_DURATION_IN_FRAMES}
        fps={BATTLEFIELD_FPS}
        width={BATTLEFIELD_WIDTH}
        height={BATTLEFIELD_HEIGHT}
      />
      <Composition
        id="MyScene"
        component={MyScene}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
