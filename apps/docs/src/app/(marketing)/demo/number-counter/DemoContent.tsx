"use client";

import NumberCounter from "@/components/number-counter";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={NumberCounter}
      copyCodeOptions={{ propsVariableName: "numberCounterProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader logoColor="#111111" textColor="#111111" />
          {effect}
        </>
      )}
    </RegistryRemixerDemo>
  );
}
