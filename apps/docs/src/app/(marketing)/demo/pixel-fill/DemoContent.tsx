"use client";

import PixelFill from "@/components/pixel-fill";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      render={(values: any) => <PixelFill {...values} />}
      copyCodeOptions={{ propsVariableName: "pixelFillProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader logoColor="#FFFFFF" textColor="#ffffff" />
          <section className=" bg-[#101113]" aria-hidden="true" />
          {effect}
          <ScrollBottom as="h2" textColor="text-white" />
        </>
      )}
    </RegistryRemixerDemo>
  );
}
