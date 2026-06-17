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
      <CurvedPlane />
      <ScrollBottom textColor='text-black' className="hidden max-md:flex bottom-[5%]" />
    </>
  );
}
