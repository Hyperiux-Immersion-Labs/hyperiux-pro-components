"use client";

import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import CardDrift from "@/components/card-drift";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={CardDrift}
      copyCodeOptions={{ propsVariableName: "cardDriftProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader logoColor='#FFFFFF' textColor='white'/>
          {effect}
          <ReducedMotionNotice>
            <div
            aria-live="polite"
            className="pointer-events-none fixed bottom-6 right-6 z-60 w-fit max-w-[min(90vw,26rem)] rounded-md border border-black/10 bg-white p-6 text-center shadow-sm"
            >
            <h2 className="text-[1.15vw] max-[1025px]:text-[2vw] max-md:text-[3.5vw] leading-none text-black">
            This effect can&apos;t be reduced.
            </h2>
            <p className="mx-auto mt-4 text-sm leading-6 text-black">
            The scattered cards only move when you drag them - dragging
            stays fully interactive since it&apos;s a direct, user-initiated
            action, not automatic motion.
            </p>
            </div>
          </ReducedMotionNotice>
          <div className='absolute bottom-2 translate-x-[-50%] left-1/2  rounded-xl   text-white bg-white/10 px-4 py-2 max-md:bottom-5 text-center backdrop-blur-md'>
            Grab any card and move it around
          </div>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
