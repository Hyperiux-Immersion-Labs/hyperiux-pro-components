"use client";

import HeroBannerAnimated from "@/components/hero-banner-animated";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={HeroBannerAnimated}
      copyCodeOptions={{ propsVariableName: "heroBannerAnimatedProps" }}
    >
      {({ effect }) => (
        <>
      
          {effect}
          <ReducedMotionNotice>
            <div
              aria-live="polite"
              className="pointer-events-none fixed top-16 right-4 z-40 w-fit max-w-65 rounded-md border border-white/15 bg-white/5 p-3 text-center backdrop-blur-sm max-[1025px]:hidden"
            >
              <h2 className="text-sm leading-none text-white">
                The light keeps tracking.
              </h2>
              <p className="mt-2 text-xs leading-5 text-white/65">
                Hero Banner Animated moves light with your cursor in
                real time and zooms the scene on click. Since that tracking
                motion is continuous, reduced motion can&apos;t be applied
                here.
              </p>
            </div>
          </ReducedMotionNotice>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
