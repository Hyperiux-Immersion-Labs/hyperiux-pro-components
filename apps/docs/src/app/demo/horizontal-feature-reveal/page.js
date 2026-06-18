import { HorizontalFeatureReveal } from "@/components/horizontal-feature-reveal";
import React from "react";
import { ReactLenis } from "lenis/react";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";


const Page = () => {
  return (
    <ReactLenis root>
      <DemoHeader logoColor="#ff5f00" />
      <HorizontalFeatureReveal />
    </ReactLenis>
  );
};

export default Page;
