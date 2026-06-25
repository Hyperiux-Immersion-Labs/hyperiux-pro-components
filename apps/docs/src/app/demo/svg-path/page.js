import HeadAnim from "@/components/Animations/HeadAnim";
import SVGPath from "@/components/svg-path";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import React from "react";

const page = () => {
  return (
    <>
      <DemoHeader logoColor="#ffffff" textColor="#ffffff" />

      <div className="pointer-events-none absolute inset-0 z-1 flex h-full w-full flex-col items-center gap-[1vw] px-[5vw] pt-[7%] max-md:pt-[15%] max-sm:pt-[30%]">
        <HeadAnim>
          <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">
            SVG Path
          </h1>
        </HeadAnim>

        <SplitLine
          as="p"
          start="top 95%"
          className="absolute bottom-[15%] w-[40%] text-center max-md:bottom-[20%] max-md:w-[70%]"
        >
          Scroll to see the effect or navigate through tabs to switch up the
          paths.
        </SplitLine>
      </div>

      <SVGPath />
    </>
  );
};

export default page;