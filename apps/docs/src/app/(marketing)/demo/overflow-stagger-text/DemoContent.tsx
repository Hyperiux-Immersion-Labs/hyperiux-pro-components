"use client";

import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import { ReactLenis } from "lenis/react";
import OverflowStaggerWrapper from "./OverflowStaggerWrapper";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      render={(values: any) => <OverflowStaggerWrapper effectProps={values} />}
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
