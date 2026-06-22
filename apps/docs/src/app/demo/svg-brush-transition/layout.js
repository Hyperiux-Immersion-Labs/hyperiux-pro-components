import React from "react";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import SVGBrushTransition from "@/components/svg-brush-transition";

export default function layout({ children }) {
  return (
    <SVGBrushTransition
      config={{
        enableBlur: false,
        strokeColor: "#82A0FF",
        strokeWidth: 2,
        duration: 1.5,
      }}
    >
      <DemoHeader />
      {children}
    </SVGBrushTransition>
  );
}
