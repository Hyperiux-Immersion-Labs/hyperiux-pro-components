import { HorizontalFeatureReveal } from "@/components/horizontal-feature-reveal";
import React from "react";
import { ReactLenis } from "lenis/react";


const Page = () => {
  return (
    <ReactLenis root>
      <HorizontalFeatureReveal />
    </ReactLenis>
  );
};

export default Page;
