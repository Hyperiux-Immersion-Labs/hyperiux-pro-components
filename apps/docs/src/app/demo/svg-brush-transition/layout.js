import React from "react";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import BrushStrokesTransition from "@/components/showcase/transitions/BrushStroke/BrushStrokesTransition";

export default function layout({ children }) {
  return (
    <BrushStrokesTransition
      config={{
        enableBlur: false,
        strokeColor: "#82A0FF",
        strokeWidth: 2,
        duration: 1.5,
      }}
    >
      <DemoHeader />
      {children}
    </BrushStrokesTransition>
  );
}
