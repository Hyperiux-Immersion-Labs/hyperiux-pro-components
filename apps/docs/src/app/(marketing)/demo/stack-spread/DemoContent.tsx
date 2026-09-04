"use client";

import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import { LocalRemixerDemo } from "@/components/local-remixer";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import StackSpread from "@/components/stack-spread";
import type {
  RegistryProp,
  RegistryRemixerConfig,
} from "@/components/remixer-panel/types";

export default function DemoContent({
  registry,
}: {
  registry: {
    name: string;
    category?: string;
    props?: RegistryProp[];
    remixer?: RegistryRemixerConfig;
  };
}) {
  return (
    <LocalRemixerDemo
      name={registry.name}
      category={registry.category}
      props={registry.props ?? []}
      remixer={registry.remixer}
      render={(values) => <StackSpread {...values} />}
    >
      {({ effect }) => (
        <>
          <DemoHeader logoColor="#141414" textColor="#141414" />
          <LenisSmoothScroll />
          {effect}
        </>
      )}
    </LocalRemixerDemo>
  );
}
