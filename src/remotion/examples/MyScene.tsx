import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import Header from "../../components/Header";

export const MyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = Math.min(1, frame / (fps * 0.5));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#081018",
        color: "#fff",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ position: "absolute", left: 40, top: 28 }}>
        <Header />
      </div>
      <div style={{ fontSize: 80, fontFamily: "Inter, sans-serif", opacity }}>
        MyScene demo
      </div>
    </AbsoluteFill>
  );
};

export default MyScene;
