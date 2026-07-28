"use client";

import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import ScrambleTextWrapper from "./ScrambleTextWrapper";

export default function DemoContent({ registry }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      render={(values) => <ScrambleTextWrapper effectProps={values} />}
      copyCodeOptions={{ propsVariableName: "scrambleTextProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader />
          {effect}
          <ScrollBottom textColor="text-black" />
        </>
      )}
    </RegistryRemixerDemo>
  );
}
