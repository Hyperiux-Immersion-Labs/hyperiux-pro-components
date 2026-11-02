"use client";

import AnimatedFaq from "@/components/animated-faq";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={AnimatedFaq}
      copyCodeOptions={{ propsVariableName: "animatedFaqProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader />
          <section className="bg-black min-h-screen px-8 py-20 text-white">
            <div className="max-w-5xl mx-auto text-center text-white mb-12">
              <h1 className="text-[5.5vw] max-sm:text-[11vw] max-md:text-[8vw]">
                Animated Faq
              </h1>

              <p className="mt-8 text-[1.2vw] max-sm:text-[4.5vw] max-md:mt-4 max-md:text-[3vw]">
                Click on the FAQ triggers
              </p>
            </div>

            {effect}
          </section>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
