"use client";

import PixelReveal from "@/components/pixel-reveal";
import DemoHeader from "@/components/preview-chrome/DemoHeader";

export default function DemoContent() {
  return (
    <>
      <DemoHeader />
      <div className="flex min-h-[300vh] flex-col items-center gap-[60vh] bg-white px-[5vw] py-[50vh] text-black">
        <p className="text-center text-[2vw] max-md:text-[5vw]">Scroll down</p>
        <PixelReveal
          imageSrc="/assets/img/image01.webp"
          alt="Pixel reveal preview"
          gridSize={24}
          edgeHeight={0.3}
          direction="down"
          className="h-[40vw] w-[60vw] rounded-[2vw] max-md:h-[90vw] max-md:w-[90vw]"
        />
        <p className="text-center text-[2vw] max-md:text-[5vw]">Scroll back up</p>
      </div>
    </>
  );
}
