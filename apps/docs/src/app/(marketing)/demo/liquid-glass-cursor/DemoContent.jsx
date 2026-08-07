"use client";

import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import LiquidGlassWrapper from "./LiquidGlassWrapper";

export default function DemoContent({ registry }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      render={(values) => <LiquidGlassWrapper cursorProps={values} />}
      copyCodeOptions={{ propsVariableName: "liquidGlassCursorProps" }}
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
