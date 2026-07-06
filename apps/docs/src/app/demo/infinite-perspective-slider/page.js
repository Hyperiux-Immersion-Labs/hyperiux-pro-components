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
      <ScrollBottom className="bottom-[5%] gap-[1vw] max-md:hidden" />

    </>
  );
}

export async function generateMetadata() {
  return getDemoPageMetadata("infinite-perspective-slider");
}
