"use client";

import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import DimensionalSwitchSlider from "@/components/dimensional-switch-slider";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={DimensionalSwitchSlider}
      copyCodeOptions={{ propsVariableName: "dimensionalSwitchSliderProps" }}
    >
      {({ effect }) => (
        <div className="w-screen h-screen overflow-hidden flex justify-center items-center bg-[#091413] text-foreground">
          <DemoHeader logoColor="#ffffff" />
          {effect}
        </div>
      )}
    </RegistryRemixerDemo>
  );
}


