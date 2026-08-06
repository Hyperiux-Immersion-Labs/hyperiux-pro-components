import React from "react";
import Image from "next/image";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import ArrowFillButton from "@/components/arrow-fill-button";
import SplitLine from "@/components/WebsiteComps/SplitLine";

export default function page() {
  return (
    <>
    <section className="relative flex h-screen items-center justify-center max-sm:px-[7vw] text-center">
      <Image
             src="/assets/abs/abs3.png"
             alt="Abstract background"
             fill
             priority
             className="object-cover "
             />

      <div className="relative z-10 max-w-5xl mx-auto text-center text-white">
        {/* Heading */}
        <SplitLine>
          <h1 className="text-[7vw] max-sm:text-[9vw]">
            Ascend Transition
          </h1>
        </SplitLine>

        {/* Subtext */}
        <SplitLine>
          <p className="text-balance text-[1.4vw] w-[80%]  mx-auto leading-[1.3] max-[1025px]:w-full max-[1025px]:mx-auto max-md:text-[4.5vw] max-[1025px]:text-[3vw]">
            Click on the button to see the transition
          </p>
        </SplitLine>

        {/* Buttons */}
        <div className="mt-12">
          <ArrowFillButton
            className="cursor-pointer border border-[#ff5f00] text-[#ffffff]"
            btnText={"Click here"}
            href={"/demo/ascend-transition/page2"}
            />
        </div>
      </div>
    </section>
            </>
  );
}

export async function generateMetadata() {
  return getDemoPageMetadata("ascend-transition");
}
