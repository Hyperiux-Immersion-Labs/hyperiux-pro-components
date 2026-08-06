import AscendTransition from "@/components/ascend-transition";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import React from "react";

export default function layout({ children }) {
  return (
    <AscendTransition>
      <DemoHeader logoColor='#FFFFFF' textColor="#ffffff" />
      {children}
    </AscendTransition>
  );
}
