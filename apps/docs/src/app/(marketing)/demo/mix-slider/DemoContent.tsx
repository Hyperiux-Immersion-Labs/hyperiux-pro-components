"use client";

import MixSlider from "@/components/mix-slider";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={MixSlider}
      copyCodeOptions={{ propsVariableName: "mixSliderProps" }}
    >
      {({ effect }) => effect}
    </RegistryRemixerDemo>
  );
}
