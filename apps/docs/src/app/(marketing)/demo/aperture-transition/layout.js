import ApertureTransition from "@/components/aperture-transition";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import React from "react";

export default function layout({ children }) {
  return (
    <ApertureTransition>
      <DemoHeader logoColor='#FFFFFF' textColor="#ffffff" />
      {children}
    </ApertureTransition>
  );
}
