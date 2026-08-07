"use client";

import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import SlideTextWrapper from "./SlideTextWrapper";

export default function DemoContent({ registry }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      render={(values) => <SlideTextWrapper effectProps={values} />}
      copyCodeOptions={{ propsVariableName: "slideTextRevealProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader />
          {effect}
        </>
      )}
    </RegistryRemixerDemo>
  );
}
