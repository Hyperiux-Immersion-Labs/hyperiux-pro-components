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
      <ScrollBottom textColor='text-[#111111]' className="bottom-[5%] gap-[1vw] max-[1025px]:hidden" />

    </>
  );
}

export async function generateMetadata() {
  return getDemoPageMetadata("infinite-perspective-slider");
}
