import InfinitePerspectiveSlider from "@/components/infinite-perspective-slider";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import { getDemoPageMetadata } from "@/lib/demo-metadata";

export default function Page() {
  return (
    <>
    <DemoHeader />
      <LenisSmoothScroll />
      <InfinitePerspectiveSlider />
      <ScrollBottom />

    </>
  );
}

export async function generateMetadata() {
  return getDemoPageMetadata("infinite-perspective-slider");
}
