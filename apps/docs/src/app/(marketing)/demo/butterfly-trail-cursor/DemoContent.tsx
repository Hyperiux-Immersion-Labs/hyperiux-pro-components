"use client";

import ButterflyTrailCursor from "@/components/butterfly-trail-cursor";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={ButterflyTrailCursor}
      copyCodeOptions={{ propsVariableName: "butterflyTrailCursorProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader logoColor="#1a1a1a" textColor="#1a1a1a" />
          {effect}
          <ReducedMotionNotice>
            <div
            	aria-live="polite"
            	className="pointer-events-none fixed bottom-4 right-4 z-40 w-fit max-w-65 rounded-md border border-black/10 bg-white/10 backdrop-blur-sm p-3 text-center max-md:hidden"
            >
            	<h2 className="text-sm leading-none text-[#111111]">
            		The butterflies keep drifting.
            	</h2>
            	<p className="mt-2 text-xs leading-5 text-black/65">
            		These butterflies are animated purely by cursor movement. Pausing
            		that motion would remove the effect, so reduced motion isn&apos;t
            		supported here.
            	</p>
            </div>
          </ReducedMotionNotice>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
