"use client";

import AnimatedModal from "@/components/animated-modal";
import HeadAnim from "@/components/Animations/HeadAnim";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={AnimatedModal}
      copyCodeOptions={{ propsVariableName: "animatedModalProps" }}
    >
      {({ effect }) => (
        <>
          <LenisSmoothScroll />
          <DemoHeader />

          <section
            className="
              relative flex h-screen w-screen bg-white pt-20 py-[2%]
              max-md:py-[12%]
              max-sm:pt-[18%] overflow-hidden max-sm:pb-[16%]
            "
          >
            <div
              className="
                flex w-full flex-col items-center justify-center gap-6
                max-md:gap-[6vw]
                max-sm:gap-[10vw]
              "
            >
              <div
                className="
                  flex flex-col items-center gap-[2vw]
                  max-sm:gap-[4vw]
                "
              >
                <HeadAnim>

                <h1
                  className="
                  text-center font-medium leading-none text-[#111111]
                  text-[4.5vw]
                  max-md:text-[7vw]
                  max-sm:text-[11vw]
                  "
                  >
                  Animated Modal
                </h1>
                  </HeadAnim>


              <SplitLine>

                <p
                  className="
                  max-w-[34vw] text-center text-[#555555]
                  text-[1.3vw] leading-[1.2]
                  max-md:max-w-[70vw] max-md:text-[2.5vw]
                  max-sm:max-w-[84vw] max-sm:text-[4vw]
                  "
                  >
                  Click the button below to open the modal and view the content.
                </p>
                  </SplitLine>
              </div>

              {effect}
              <ReducedMotionNotice>
                <div
                  aria-live="polite"
                  className="pointer-events-none fixed bottom-4 right-4 z-40 w-fit max-w-65 rounded-md border border-black/10 bg-[#F8F8F3] p-3 text-center"
                >
                  <h2 className="text-sm leading-none text-[#111111]">
                    The modal fades, not slides.
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-black/65">
                    Animated Modal already keeps its open and close transition to a
                    simple opacity fade, so it stays comfortable with reduced motion
                    enabled.
                  </p>
                </div>
              </ReducedMotionNotice>
            </div>
          </section>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
