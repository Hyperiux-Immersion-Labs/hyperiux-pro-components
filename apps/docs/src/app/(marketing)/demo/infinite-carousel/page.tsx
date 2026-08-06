import InfiniteCarousel from "@/components/InfiniteCarousel";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import React from "react";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <div className="min-h-screen bg-[#f4f0ea]">
      <DemoHeader />
      <div className=" flex items-center pt-24 max-[1025px]:pt-20 max-md:pt-15 justify-center px-4 bg-[#f4f0ea]">
        <div className="text-center">
          <h1 className="m-0 text-center text-7xl leading-[0.9] tracking-tighter text-[#111] max-[1025px]:text-6xl max-md:text-5xl">
            Cards Carousel
          </h1>
          <p className="mt-3 max-[1025px]:pt-6 max-[1025px]:pb-8 max-md:pb-1 max-md:pt-5 text-[1rem] w-[80%] max-md:w-[90%] mx-auto max-[1025px]:text-[2.5vw] max-md:text-[3.5vw] text-[#111]/70">
            Give it a nudge - drag a card or tap the arrows to set the lineup in
            motion, watch it glide, loop, and reveal.
          </p>
        </div>
      </div>
      <InfiniteCarousel />
    </div>
  );
};

export default page;

export async function generateMetadata() {
  return getDemoPageMetadata("infinite-carousel");
}
