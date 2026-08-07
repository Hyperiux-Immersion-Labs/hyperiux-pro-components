"use client";

import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import { ReactLenis } from "lenis/react";
import OverflowStaggerWrapper from "./OverflowStaggerWrapper";

export default function DemoContent({ registry }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      render={(values) => <OverflowStaggerWrapper effectProps={values} />}
      copyCodeOptions={{ propsVariableName: "overflowStaggerTextProps" }}
    >
      {({ effect }) => (
        <ReactLenis root>
          <DemoHeader />
          {effect}
        </ReactLenis>
      )}
    </RegistryRemixerDemo>
  );
}
