// import DemoContent from "./DemoContent";
// import { getDemoPageMetadata } from "@/lib/demo-metadata";
// import smoothSliderRegistry from "../../../../../../../registry/effects/carousels/smooth-slider/registry.json";

// export default function Page() {
//   return <DemoContent registry={smoothSliderRegistry} />;
// }

// export async function generateMetadata() {
//   return getDemoPageMetadata("smooth-slider");
// }

import SmoothSlider from '@/components/smooth-slider'
import React from 'react'

const page = () => {
  return (
    <>
      <SmoothSlider />
    </>
  )
}

export default page
