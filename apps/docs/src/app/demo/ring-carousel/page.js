import HeadAnim from "@/components/Animations/HeadAnim";
import RingCarousel from "@/components/ring-carousel";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import React from "react";

const page = () => {
  return (
    <>
      <DemoHeader logoColor="#ffffff" textColor="#ffffff" />
      <div className="flex min-h-screen w-full flex-col items-center justify-start overflow-hidden bg-black px-4 max-md:px-0 pt-20 pb-2 max-md:pt-10 max-md:pb-8 max-sm:px-0 max-sm:pt-6 max-sm:pb-4">
        <div className="relative z-30 mb-6 flex w-full items-center justify-center max-md:mb-4 max-sm:mb-2">
          <HeadAnim>
            <h1 className="m-0 text-center text-[clamp(2.5rem,4.5vw,6rem)] leading-[0.95] max-md:text-[7vw] max-md:pt-14 max-sm:pt-14 font-medium tracking-[-0.04em] text-white max-sm:text-[clamp(2rem,11vw,3rem)]">
              Ring Carousel
            </h1>
          </HeadAnim>
        </div>

        <RingCarousel />
      </div>
    </>
  );
};

export default page;
