"use client";

import { useMemo, useState } from "react";
import SVGPathComp from "./SVGPathComp";

const wavePath =
  "M1 209.434C58.5872 255.935 387.926 325.938 482.583 209.434C600.905 63.8051 525.516 -43.2211 427.332 19.9613C329.149 83.1436 352.902 242.723 515.041 267.302C644.752 286.966 943.56 181.94 995 156.5";

const circlePath =
  "M498 165 m -120, 0 a 120,120 0 1,0 240,0 a 120,120 0 1,0 -240,0";

const spiralPath =
  "M0 165C120 40 240 290 360 165C480 40 600 290 720 165C840 40 960 290 1080 165";

const svgPathImages = Array.from({ length: 15 }, (_, i) =>
  `https://picsum.photos/seed/svg${i + 1}/56/100`
);

const tabs = [
  {
    id: "circle",
    label: "Circle",
    path: circlePath,
    viewBox: "0 0 996 330",
    className: "h-full w-full scale-[1.1] max-md:scale-[1.55] max-sm:scale-[1.95]",
    repeat: 1,
    baseVelocity: 8,
  },
  {
    id: "spiral",
    label: "Spiral",
    path: wavePath,
    viewBox: "0 0 996 330",
    className: "h-full w-full scale-[1.05] max-md:scale-[1.35] max-sm:scale-[1.75]",
    repeat: 1.5,
    baseVelocity: 8,
  },
  {
    id: "wave",
    label: "Wave",
    path: spiralPath,
    viewBox: "0 0 1080 330",
    className: "h-full w-full scale-[1.08] max-md:scale-[1.3] max-sm:scale-[1.65]",
    repeat: 1,
    baseVelocity: 8,
  },
];

const imgs = svgPathImages.map((src) => ({ src }));

export default function SVGPath() {
  const [activeTab, setActiveTab] = useState("circle");

  const currentTab = useMemo(() => {
    return tabs.find((tab) => tab.id === activeTab) || tabs[0];
  }, [activeTab]);

  return (
    <>

      <section className="relative flex h-[180vh] w-dvw items-center justify-center overflow-hidden bg-black">
        <div className="fixed inset-0 h-dvh w-dvw overflow-hidden bg-black">
          <div className="pointer-events-auto fixed left-1/2 bottom-[5%] max-md:bottom-[7%] z-20 flex -translate-x-1/2 items-center gap-[0.8vw] rounded-full border border-white/15 bg-white/10 p-[0.35vw] backdrop-blur-md  max-md:gap-[1.2vw] max-md:p-[0.7vw] max-sm:w-fit max-md:h-fit max-sm:justify-center max-sm:gap-[2vw] max-sm:p-[1.4vw]">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-[1.2vw] py-[0.6vw] text-[0.9vw] font-medium transition-all duration-300 ease-in-out max-md:px-[2.4vw] max-md:py-[1.1vw] max-md:text-[1.8vw] max-sm:px-[4vw] max-sm:py-[2.2vw] max-sm:text-[3.4vw] ${
                    isActive
                      ? "bg-white text-black"
                      : "bg-transparent text-white/65 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <SVGPathComp
            key={`${currentTab.id}-${currentTab.path}`}
            path={currentTab.path}
            viewBox={currentTab.viewBox}
            baseVelocity={currentTab.baseVelocity}
            slowdownOnHover
            draggable
            useScrollVelocity
            repeat={currentTab.repeat}
            dragSensitivity={0.1}
            className={currentTab.className}
            responsive
            grabCursor
          >
            {imgs.map((img, i) => (
              <div key={`${currentTab.id}-${i}`} className="h-full w-14 duration-300 ease-in-out hover:scale-150 max-md:w-16 max-sm:w-18">
                <img
                  src={img.src}
                  alt={`Marquee path image ${i + 1}`}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </div>
            ))}
          </SVGPathComp>
        </div>
      </section>
    </>
  );
}