"use client";

import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";

import LinesLoadingDemo from "@/components/lines-loader";
import React, { useState } from "react";

export default function Page() {
  const [isCompleted, setIsCompleted] = useState(false);

  return (
    <>
      <LenisSmoothScroll />
     
      <LinesLoadingDemo 
        onComplete={() => setIsCompleted(true)} 
        onVariantChange={() => setIsCompleted(false)}
      />
     
    </>
  );
}
