"use client";

import DemoHeader from "@/components/preview-chrome/DemoHeader";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import PixelBloomWrapper from "./PixelBloomWrapper";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      render={(values: any) => <PixelBloomWrapper pixelBloomProps={values} />}
      copyCodeOptions={{ propsVariableName: "pixelBloomProps" }}
    >
      {({ effect }) => (
        <>
          <LenisSmoothScroll />
          <DemoHeader
            reducedMotionNote={{
              title: "The bloom keeps rippling.",
              body: "Pixel Bloom reveals pixelation as your cursor moves across the media. Since the transition is driven by motion, reduced motion can't be applied here.",
            }}
          />
          {effect}
          <ScrollBottom textColor="text-[#111111]" />
        </>
      )}
    </RegistryRemixerDemo>
  );
}
