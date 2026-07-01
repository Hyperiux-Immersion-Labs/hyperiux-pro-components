import { HorizontalFeatureReveal } from "@/components/horizontal-feature-reveal";
import React from "react";
import { ReactLenis } from "lenis/react";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import { getDemoPageMetadata } from "@/lib/demo-metadata";



const Page = () => {
  return (
    <ReactLenis root>

      <DemoHeader logoColor="#ff5f00" />
      <div className="relative">

      <HorizontalFeatureReveal />
      <ScrollBottom textColor="text-[#111111]" className="bottom-[3%] gap-[1vw]" />
      </div>
    </ReactLenis>
  );
};

export default Page;

export async function generateMetadata() {
  return getDemoPageMetadata("horizontal-feature-reveal");
}
