import DepthShiftTransition from "@/components/depth-shift-transition";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import React from "react";

export default function layout({ children }) {
  return (
    <DepthShiftTransition>
      <DemoHeader logoColor='#FFFFFF' textColor="#ffffff" />
      {children}
    </DepthShiftTransition>
  );
}
