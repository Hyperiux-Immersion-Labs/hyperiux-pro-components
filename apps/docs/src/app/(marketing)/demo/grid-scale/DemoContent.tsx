"use client";

import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import GridScale from "@/components/grid-scale";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={GridScale}
      copyCodeOptions={{ propsVariableName: "gridScaleProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader textColor="#ffffff" />
          {effect}
          <ScrollBottom className="bottom-[3%]"/>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
