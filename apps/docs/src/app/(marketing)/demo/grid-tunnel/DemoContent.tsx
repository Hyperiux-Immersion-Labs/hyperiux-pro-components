"use client";

import GridTunnel from "@/components/grid-tunnel";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={GridTunnel}
      copyCodeOptions={{ propsVariableName: "gridTunnelProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader logoColor="#1a1a1a" textColor="#1a1a1a" />
          {effect}
          <ReducedMotionNotice>
            <div
              aria-live="polite"
              className="pointer-events-none absolute bottom-6 right-6 z-40 w-fit max-w-[min(90vw,26rem)] rounded-md border border-black/10 bg-white p-6 text-center shadow-sm"
            >
              <h2 className="text-[1.15vw] max-[1025px]:text-[2vw] max-md:text-[3.5vw] leading-none text-black">
                Tunnel navigation is instant.
              </h2>
              <p className="mx-auto mt-4 text-sm leading-6 text-black">
                Reduced motion is enabled: scroll and touch move the camera
                directly with no momentum or easing, instead of coasting
                smoothly through the tunnel.
              </p>
            </div>
          </ReducedMotionNotice>
          <ScrollBottom textColor="text-black" />
        </>
      )}
    </RegistryRemixerDemo>
  );
}
