import React from "react";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import HoverSlider from "@/components/hover-slider";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";

const page = () => {
  return (
    <>
    <DemoHeader />
      <LenisSmoothScroll />
      <HoverSlider/>
    </>
  );
};

export default page;



