import RotationSlider from "@/components/rotation-slider";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";

export default function Page() {
  return (
    <>
      <LenisSmoothScroll />
      <div className="w-full px-[7vw] flex flex-col gap-[1vw] text-[#111111] items-center text-center absolute inset-0 z-20 pt-[4vw]">
        <h1 className="text-[5vw] max-sm:lg:text-[7vw] max-sm:text-[11vw]">
          Rotation Slider
        </h1>
      </div>
      <RotationSlider />
      <ScrollBottom textColor={"text-black"} />
    </>
  );
}
