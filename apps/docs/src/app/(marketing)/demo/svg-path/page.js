import HeadAnim from "@/components/Animations/HeadAnim";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import SVGPath from "@/components/svg-path";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import React from "react";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
    <LenisSmoothScroll />
      <DemoHeader logoColor='#FFFFFF' textColor="#ffffff" />

      <div className="pointer-events-none fixed  inset-0 z-1 flex h-full w-full flex-col items-center gap-[1vw] max-[1025px]:gap-[4vw] px-[5vw] pt-[6%] max-[1025px]:pt-[15%] max-md:pt-[30%]">
        <HeadAnim>
          <h1 className="text-[3vw] max-[1025px]:text-[7vw] max-md:text-[9vw]">
            SVG Path
          </h1>
        </HeadAnim>

        <p className="fixed bottom-[15%] max-[1025px]:text-base w-[40%] text-center max-[1025px]:bottom-[20%] max-[1025px]:w-[70%]"
        >
          Scroll to see the effect or navigate through tabs to switch up the
          paths.
        </p>
      </div>

      <SVGPath />
    </>
  );
};

export default page;
export async function generateMetadata() {
  return getDemoPageMetadata("svg-path");
}
