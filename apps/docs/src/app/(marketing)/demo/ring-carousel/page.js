import HeadAnim from "@/components/Animations/HeadAnim";
import RingCarousel from "@/components/ring-carousel";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import React from "react";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
      <DemoHeader logoColor='#FFFFFF' textColor="#ffffff" />
      <div className="flex h-screen w-full flex-col items-center justify-start overflow-hidden bg-black px-4 max-[1025px]:px-0 pt-20 pb-2 max-[1025px]:pt-10 max-[1025px]:pb-8 max-md:px-0 max-md:pt-6 max-md:pb-4">
        <div className="relative z-30 mb-6 flex flex-col w-full items-center justify-center max-[1025px]:mb-4 max-md:mb-2 max-[1025px]:gap-5 gap-2">
          <HeadAnim>
            <h1 className="m-0 text-center text-[clamp(2.5rem,4.5vw,6rem)] leading-[0.95] max-[1025px]:text-[7vw] max-[1025px]:pt-14 max-md:pt-14 font-medium tracking-[-0.04em] text-white max-md:text-[clamp(2rem,11vw,3rem)]">
              Ring Carousel
            </h1>
          </HeadAnim>
          <SplitLine>
          <p className="mx-auto w-fit max-md:w-[85vw] max-md:text-center">
            Click on Navigation buttons to change the slide or you can drag the slider itself

          </p>
          </SplitLine>
        </div>

        <RingCarousel />
      </div>
    </>
  );
};

export default page;

export async function generateMetadata() {
  return getDemoPageMetadata("ring-carousel");
}
