"use client";

import { cloneElement, isValidElement } from "react";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import type { RegistryLike } from "@/components/remixer-panel/types";
import DisplacementNavbar from "@/components/displacement-navbar";
import Button from "@/components/WebsiteComps/Button";

const DEMO_CHILDREN = (
  <div className="flex flex-col items-center justify-center min-h-[90vh] gap-10 px-[1.7vw] max-[1025px]:px-[5vw] min-[769px]:max-[1025px]:px-[2.6vw]">
    <h1 className="m-0 text-[4vw] max-[1025px]:text-[9vw] min-[769px]:max-[1025px]:text-[4.5vw] font-light leading-[1.05] tracking-[-0.03em] text-center">
      Displacement Navbar
    </h1>
    <p className="text-center text-[clamp(12px,1.1vw,15px)] tracking-[0.02em] text-black/70">
      [Click the menu to see the effect]
    </p>
    <div className="flex items-center gap-4 mt-16 max-md:flex-col">
      <Button
        text="Read Article"
        href="/effects/navigation/displacement-navbar"
        variant="black"
        className="max-md:w-[60vw]"
      />
      <Button text="Explore All Effects" href="/effects" variant="black" className="max-md:w-[60vw]" />
    </div>
  </div>
);

export default function DemoContent({ registry }: { registry: RegistryLike }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={DisplacementNavbar}
      copyCodeOptions={{ propsVariableName: "displacementNavbarProps" }}
    >
      {({ effect }) =>
       
        isValidElement(effect) ? cloneElement(effect as React.ReactElement<{ children?: React.ReactNode }>, { children: DEMO_CHILDREN }) : effect
      }
    </RegistryRemixerDemo>
  );
}
