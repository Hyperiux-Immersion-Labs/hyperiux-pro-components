"use client";

import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
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
          <DemoHeader textColor="#ffffff" logoColor="#FFFFFF" />
          {effect}
          <ScrollBottom />
        </>
      )}
    </RegistryRemixerDemo>
  );
}
