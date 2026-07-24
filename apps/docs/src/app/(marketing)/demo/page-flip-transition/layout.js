import React from "react";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import PageFlipTransition from "@/components/page-flip-transition";

export default function layout({ children }) {
  return (
    <PageFlipTransition
      config={{ strokeColor: "#DE4013", strokeWidth: 2, duration: 0.3 }}
    >
      <DemoHeader />
      {children}
    </PageFlipTransition>
  );
}
