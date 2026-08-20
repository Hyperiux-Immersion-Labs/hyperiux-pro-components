"use client";

import SmoothSlider from "@/components/smooth-slider";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={SmoothSlider}
      copyCodeOptions={{ propsVariableName: "smoothSliderProps" }}
    >
      {({ effect }) => (
        <main className="relative min-h-screen">
          <DemoHeader />
          {effect}
        </main>
      )}
    </RegistryRemixerDemo>
  );
}
