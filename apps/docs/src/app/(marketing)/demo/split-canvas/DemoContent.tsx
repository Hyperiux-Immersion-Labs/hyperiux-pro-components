"use client";

import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import SplitCanvas from "@/components/split-canvas";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={SplitCanvas}
      copyCodeOptions={{ propsVariableName: "splitCanvasProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader />
          {effect}
          <ScrollBottom className="bottom-[3%] text-black"/>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
