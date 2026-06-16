import CurvedPlaneHorizontal from "@/components/CurvedPlane/CurvedSwiperHorizontal";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import React from "react";

export default function v1() {
  return (
    <>
    <DemoHeader/>
        <LenisSmoothScroll />
        <CurvedPlaneHorizontal />
    </>
  );
}
