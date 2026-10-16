"use client";

import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import ParallaxGallery from "@/components/parallax-gallery";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={ParallaxGallery}
      copyCodeOptions={{ propsVariableName: "parallaxGalleryProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader logoColor="#ffffff" textColor="#ffffff" />
          {effect}
          <ScrollBottom className="bottom-[2%]"/>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
