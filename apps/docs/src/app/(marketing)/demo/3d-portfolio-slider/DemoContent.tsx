"use client";

import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import PortfolioSlider3D from "@/components/3d-portfolio-slider";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={PortfolioSlider3D}
      copyCodeOptions={{ propsVariableName: "portfolioSlider3DProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader logoColor="#ffffff" textColor="#ffffff" />
          {effect}
          <ReducedMotionNotice>
            <div
              aria-live="polite"
              className="fixed bottom-6 right-6 z-60 w-fit max-w-[min(90vw,26rem)] rounded-md border border-black/10 bg-[#F8F8F3] p-6 text-center shadow-sm"
            >
              <h2 className="text-[1.15vw] max-md:text-[3.5vw] max-[1025px]:text-[2vw] leading-none text-[#111111]">
                Reduced motion is on.
              </h2>
              <p className="mx-auto mt-4 text-sm leading-6 text-black/65">
                The zoom and ring pulse are turned off. Scrolling still moves
                through the images, since the carousel is the navigation itself.
              </p>
            </div>
          </ReducedMotionNotice>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
