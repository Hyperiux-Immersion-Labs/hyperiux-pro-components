"use client";

import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import OverflowTextRevealWrapper from "./OverflowTextRevealWrapper";

export default function DemoContent({ registry }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      render={(values) => <OverflowTextRevealWrapper effectProps={values} />}
      copyCodeOptions={{ propsVariableName: "overflowTextRevealProps" }}
    />
  );
}
