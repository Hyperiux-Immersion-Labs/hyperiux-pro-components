import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import CurvedPlane from "@/components/curved-plane";
import React from "react";

export default function v1() {
  return (
    <>
      <LenisSmoothScroll />
      <DemoHeader logoColor="#1a1a1a" textColor="#1a1a1a" />
       <div className=" absolute inset-0 z-1 w-[50%] mx-auto pt-20 max-md:mt-10 text-black  max-md:w-[80%] max-sm:w-[90%] pointer-events-none">
          <h1 className="text-[5vw] max-sm:text-[9vw] max-md:text-[7vw]  text-center">
            Curved Plane
          </h1>
          <p className="mx-auto w-fit text-center max-sm:w-[90%]">
            Scroll or drag to see the immersive curved effect on the slides.
          </p>
        </div>
      <CurvedPlane />
      <ScrollBottom textColor='text-black' className="hidden max-md:flex bottom-[5%]" />
    </>
  );
}
