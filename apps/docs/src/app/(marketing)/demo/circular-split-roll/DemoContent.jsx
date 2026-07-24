"use client";

import CircularSplitRoll from "@/components/circular-split-roll";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import React from "react";

export default function Page() {
  return (
    <>
    <DemoHeader textColor="#ffffff" logoColor='#FFFFFF' />
    <div className="max-md:block flex flex-col justify-center items-center gap-[2vw] text-center max-sm:pt-[18vw] pt-[10vw] sr-only">
      <h1 className="text-[7vw] max-sm:text-[11vw]">
        Circular Split Roll
      </h1>
      <p>
        Open in desktop for the better experience
      </p>

    </div>
      <CircularSplitRoll />
      <ScrollBottom/>
    </>
  );
}
