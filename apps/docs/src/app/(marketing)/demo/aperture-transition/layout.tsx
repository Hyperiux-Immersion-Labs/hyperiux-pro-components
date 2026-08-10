import ApertureTransition from "@/components/aperture-transition";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <ApertureTransition>
      <DemoHeader logoColor='#FFFFFF' textColor="#ffffff" />
      {children}
    </ApertureTransition>
  );
}
