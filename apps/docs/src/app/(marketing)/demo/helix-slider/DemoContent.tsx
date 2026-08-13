"use client";

import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import HelixSlider from "@/components/helix-slider";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={HelixSlider}
      copyCodeOptions={{ propsVariableName: "helixSliderProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader logoColor="#ffffff" textColor="#ffffff" />
          {effect}
        </>
      )}
    </RegistryRemixerDemo>
  );
}
