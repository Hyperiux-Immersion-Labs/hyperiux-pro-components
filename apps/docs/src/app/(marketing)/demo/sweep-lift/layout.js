import SweepLift from "@/components/sweep-lift";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import React from "react";

export default function layout({ children }) {
  return (
    <SweepLift>
      <DemoHeader logoColor='#FFFFFF' textColor="#ffffff" />
      {children}
    </SweepLift>
  );
}
