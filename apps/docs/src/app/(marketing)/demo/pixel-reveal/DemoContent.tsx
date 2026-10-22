"use client";

import PixelReveal from "@/components/pixel-reveal";
import { LocalRemixerDemo } from "@/components/local-remixer";
import DemoHeader from "@/components/preview-chrome/DemoHeader";

const PROPS = [
  {
    name: "gridSize",
    type: "number",
    default: 24,
    description: "Approximate size of each pixel cell, in pixels.",
    remixer: { control: "range", group: "pixels", groupTitle: "Pixels", min: 4, max: 80, step: 1 },
  },
  {
    name: "edgeHeight",
    type: "number",
    default: 0.3,
    description: "Thickness of the noisy leading edge, as a fraction of the sweep axis.",
    remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0.05, max: 0.6, step: 0.05 },
  },
  {
    name: "direction",
    type: "string",
    default: "up",
    description: "Direction the sweep travels.",
    remixer: {
      control: "select",
      group: "motion",
      groupTitle: "Motion",
      options: [
        { label: "Up", value: "up" },
        { label: "Down", value: "down" },
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
    },
  },
  {
    name: "scrub",
    type: "boolean",
    default: false,
    description: "Ties the reveal to scroll position. When off, it plays once on entering the viewport.",
    remixer: { control: "toggle", group: "motion", groupTitle: "Motion" },
  },
];

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="pixel-reveal"
      category="scroll"
      props={PROPS}
      render={(values) => (
        <PixelReveal
          {...values}
          imageSrc="/assets/img/image01.webp"
          alt="Pixel reveal preview"
          className="h-[40vw] w-[60vw] rounded-[2vw] max-md:h-[90vw] max-md:w-[90vw]"
        />
      )}
    >
      {({ effect }) => (
        <>
          <DemoHeader />
          <div className="flex min-h-[300vh] flex-col items-center gap-[60vh] bg-white px-[5vw] py-[50vh] text-black">
            <p className="text-center text-[2vw] max-md:text-[5vw]">Scroll down</p>
            {effect}
            <p className="text-center text-[2vw] max-md:text-[5vw]">Scroll back up</p>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
