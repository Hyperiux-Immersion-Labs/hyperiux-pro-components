"use client";

import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import ScrollStack from "@/components/scroll-stack";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={ScrollStack}
      copyCodeOptions={{ propsVariableName: "scrollStackProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader />
          {effect}
          <ScrollBottom textColor="#111111" className="text-black! bottom-[3vw]"/>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
