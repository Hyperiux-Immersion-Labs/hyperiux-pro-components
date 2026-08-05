import RotationSlider from "@/components/rotation-slider";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


export default function Page() {
  return (
    <>
      <LenisSmoothScroll />
      <DemoHeader />
      <div className="w-full px-[7vw] flex flex-col gap-[1vw] text-[#111111] items-center text-center absolute inset-0 z-20 pt-[4vw]">
        <h1 className="text-[5vw] pt-6 max-[1025px]:pt-15 max-md:lg:text-[7vw] max-md:text-[11vw]">
          Rotation Slider
        </h1>
      </div>
      <RotationSlider />
      <ScrollBottom textColor={"text-black"} />
    </>
  );
}

export async function generateMetadata() {
  return getDemoPageMetadata("rotation-slider");
}
