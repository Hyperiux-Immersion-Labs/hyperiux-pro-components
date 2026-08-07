"use client";

import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import StickyContentWrapper from "@/components/sticky-content-wrapper";

export default function DemoContent({ registry }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      render={(values) => <StickyContentWrapper {...values} />}
      copyCodeOptions={{ propsVariableName: "stickyContentWrapperProps" }}
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
