import React from "react";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import PixelTransition  from "@/components/pixel-transition";

export default function layout({ children }) {
  return (
    <PixelTransition>
      <DemoHeader />
      {children}
    </PixelTransition>
  );
}
