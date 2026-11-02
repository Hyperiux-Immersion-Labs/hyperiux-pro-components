"use client";

import GrassyBackground from "@/components/grassy-background";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: any) {
  return (
    <RegistryRemixerDemo registry={registry} component={GrassyBackground}>
      {({ effect }) => (
        <main className="relative h-screen w-screen overflow-hidden bg-black">
          <DemoHeader />
          <div className="absolute inset-0">{effect}</div>
          <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[50%] items-center justify-center px-[5vw]">
            <h1 className="w-[60%] text-center text-[4.8vw] font-bold uppercase leading-[1.1] tracking-widest text-white max-[1025px]:w-[80%] max-[1025px]:text-[6vw] max-md:w-full max-md:text-[9vw]">
              Hyperiux Immersion Labs
            </h1>
          </div>
        </main>
      )}
    </RegistryRemixerDemo>
  );
}
