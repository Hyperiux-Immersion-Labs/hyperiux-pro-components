import InfiniteGridGallery from "@/components/infinite-grid-gallery";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import React from "react";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
    <DemoHeader  />
    <div className="relative ">

      <InfiniteGridGallery />

      <div className="absolute bottom-5 right-5 py-2 px-4 w-[15vw] max-md:w-[30vw] max-sm:w-[50vw] text-center bg-white/10 backdrop-blur-lg rounded-lg max-sm:bottom-20">
      <SplitLine start="top bottom">

        <p className="text-black leading-[1.2] max-md:text-lg" >
          Scroll freely, then click any image to zoom in.
        </p>
      </SplitLine>
      </div>
    </div>
    </>
  );
};

export default page;

export async function generateMetadata() {
  return getDemoPageMetadata("infinite-grid-gallery");
}
