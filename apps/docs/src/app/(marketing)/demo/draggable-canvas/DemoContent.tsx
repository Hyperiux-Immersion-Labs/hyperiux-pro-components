"use client";

import DraggableCanvas from "@/components/draggable-canvas";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={DraggableCanvas}
      copyCodeOptions={{ propsVariableName: "draggableCanvasProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader logoColor="#ffffff" textColor="#ffffff" />
          {effect}
          <ReducedMotionNotice>
            <div
               aria-live="polite"
               className="pointer-events-none fixed bottom-4 left-4 z-40 w-fit max-w-75 rounded-md border border-white/15 bg-black/80 p-3 text-center max-[1025px]:hidden"
             >
               <h2 className="text-sm leading-none text-white">
                 Reduced motion is on.
               </h2>
               <p className="mt-2 text-xs leading-5 text-white/65">
                 The canvases still follow your drag, but stop as soon as you
                 let go - no inertia glide and no scale-up on press.
               </p>
             </div>
          </ReducedMotionNotice>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
