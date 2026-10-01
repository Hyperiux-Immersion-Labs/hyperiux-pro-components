"use client";

import CircularSlider from "@/components/circular-slider";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

const defaultItems = [
  {
    title: "Arrow Fill Button",
    description: "Primary button with an expanding fill and animated arrow",
    bgColor: "#655A7C",
    textColor: "#2A2433",
  },
  {
    title: "Custom Cursor",
    description: "Interactive cursor that transforms every hover",
    bgColor: "#AB92BF",
    textColor: "#3D2E50",
  },
  {
    title: "Text Scramble",
    description: "Dynamic text reveal with glitch-style transitions",
    bgColor: "#AFC1D6",
    textColor: "#2C3E52",
  },
  {
    title: "Hover Reveal Card",
    description: "Cards that come alive on hover interaction",
    bgColor: "#CEF9F2",
    textColor: "#1A5C53",
  },
  {
    title: "Scroll Animations",
    description: "Smooth GSAP-powered scroll-based animations",
    bgColor: "#D6CA98",
    textColor: "#4A3F1A",
  },
  {
    title: "Circular Slider",
    description: "Rotating card slider with immersive motion",
    bgColor: "#655A7C",
    textColor: "#2A2433",
  },
];

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      render={(values: any) => (
        <CircularSlider
          {...values}
          items={values.items?.length ? values.items : defaultItems}
        />
      )}
      copyCodeOptions={{ propsVariableName: "circularSliderProps" }}
    >
      {({ effect }) => (
        <main className="min-h-screen text-white">
          <LenisSmoothScroll />
          <DemoHeader logoColor="#ffffff" textColor="#ffffff" />
          {effect}
          <ReducedMotionNotice>
            <div
            aria-live="polite"
            className="pointer-events-none fixed bottom-6 right-6 z-60 w-fit max-w-[min(90vw,26rem)] rounded-md border border-black/10 bg-white p-6 text-center shadow-sm"
            >
            <h2 className="text-[1.15vw] max-[1025px]:text-[2vw] max-md:text-[3.5vw] leading-none text-black">
            This effect can&apos;t be reduced.
            </h2>
            <p className="mx-auto mt-4 text-sm leading-6 text-black">
            Reduced motion is enabled, but this effect relies on continuous
            scroll-driven rotation around the wheel, and can&apos;t be
            simplified to a fade without losing the effect entirely.
            </p>
            </div>
          </ReducedMotionNotice>
          <ScrollBottom className="bottom-[3%]"/>
        </main>
      )}
    </RegistryRemixerDemo>
  );
}
