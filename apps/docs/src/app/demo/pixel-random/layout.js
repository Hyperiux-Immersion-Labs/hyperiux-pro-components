import React from "react";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import PixelRandomTransition from "@/components/pixel-random";

export default function layout({ children }) {
  return (
    <PixelRandomTransition>
      <DemoHeader />
      {children}
    </PixelRandomTransition>
  );
}
