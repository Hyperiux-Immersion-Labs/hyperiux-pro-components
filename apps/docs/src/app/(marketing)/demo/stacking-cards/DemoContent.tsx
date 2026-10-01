"use client";

import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import StackingCards from "@/components/stacking-cards";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={StackingCards}
      copyCodeOptions={{ propsVariableName: "stackingCardsProps" }}
    >
      {({ effect }) => (
        <>
          <LenisSmoothScroll />
          <DemoHeader logoColor="#111111" />
          {effect}
        <ScrollBottom className="bottom-[1%] text-black"/>
        </>
      )}

    </RegistryRemixerDemo>
  );
}
