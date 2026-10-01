"use client";

import HeadAnim from "@/components/Animations/HeadAnim";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import SVGPixelReveal from "@/components/svg-pixel-reveal";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      render={(values: any) => (
        <SVGPixelReveal
          src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-01.jpg"
          alt="Nature scene"
          priority
          className="w-full max-sm:max-w-md h-[70vh] max-w-xl"
          {...values}
        />
      )}
      copyCodeOptions={{ propsVariableName: "svgPixelRevealProps" }}
    >
      {({ effect }) => (
        <>
          <LenisSmoothScroll />
          <DemoHeader logoColor="#FFFFFF" textColor="#ffffff" />
          <main className="h-full bg-neutral-950 text-white">
            <section className="flex min-h-[40vh] max-sm:h-[30vh] items-center justify-center px-6">
              <div className="w-fit text-center space-y-[1vw]">
                <HeadAnim>
                  <h1 className="mt-4 text-[4vw] max-sm:text-[9vw] max-md:text-[7vw]">
                    Pixelated to crisp on scroll
                  </h1>
                </HeadAnim>
                <SplitLine>
                  <p>
                    Scroll down to morph the pixelated image into the crystal clear image.
                  </p>
                </SplitLine>
              </div>
            </section>

            <section className="flex min-h-[50vh] max-sm:min-h-[70vh] items-center justify-center px-6 py-20">
              {effect}
              <ReducedMotionNotice>
                <div
                    aria-live="polite"
                    className="fixed bottom-6 right-6 z-60 w-fit max-w-[min(90vw,26rem)] rounded-md border border-black/10 bg-[#F8F8F3] p-6 text-center shadow-sm"
                >
                    <h2 className="text-[1.15vw] max-md:text-[3.5vw] max-[1025px]:text-[2vw] leading-none text-[#111111]">
                        This effect can&apos;t be reduced.
                    </h2>
                    <p className="mx-auto mt-4 text-sm leading-6 text-black/65">
                        Reduced motion is enabled, but this effect relies on a
                        continuous scroll-driven transition from pixelated to
                        sharp, and can&apos;t be simplified to a fade without
                        losing the effect entirely.
                    </p>
                </div>
              </ReducedMotionNotice>
            </section>

            <section aria-hidden="true" className="h-[70vh]" />
          </main>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
