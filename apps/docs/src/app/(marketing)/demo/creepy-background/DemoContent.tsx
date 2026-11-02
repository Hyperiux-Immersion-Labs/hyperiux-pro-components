"use client";

import CreepyBackground from "@/components/creepy-background";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: any) {
  return (
    <RegistryRemixerDemo registry={registry} component={CreepyBackground}>
      {({ effect }) => (
        <main className="relative h-screen w-screen overflow-hidden bg-black">
          <DemoHeader />
          <div className="absolute inset-0">{effect}</div>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-[5vw]">
            <h1 className="text-center w-[60%] mx-auto text-[4.8vw] leading-[1.1]  tracking-widest font-bold text-white uppercase text-shadow-[0_0.2vw_1.5vw_rgba(0,0,0,0.6)] max-[1025px]:text-[6vw] max-md:text-[9vw]">
              Hyperiux Immersion Labs
            </h1>
          </div>
        </main>
      )}
    </RegistryRemixerDemo>
  );
}
