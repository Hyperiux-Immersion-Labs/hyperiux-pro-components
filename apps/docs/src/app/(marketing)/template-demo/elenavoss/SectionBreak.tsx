"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useRef } from "react";
import Awards1 from "./assets/awards-1.png";
import Awards2 from "./assets/awards-2.png";
import Awards3 from "./assets/awards-3.png";
import Awards4 from "./assets/awards-4.png";
import Awards5 from "./assets/awards-5.png";
import Awards6 from "./assets/awards-6.png";
import OverflowTextReveal from "./effects/overflow-text-reveal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SectionBreak() {
  const container = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const grid = gridRef.current;
      if (!grid) return;
      const gridItems = grid.querySelectorAll(".grid__item");

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: container.current,
          start: "top 20%",
          end: "bottom center",
          scrub: true,
          // markers:true,
        },
      });

      if (globalThis.innerWidth > 1024) {
        gsap.set(gridItems, {
          transformOrigin: "0% 0%",
          opacity: 0,
          x: () => gsap.utils.random(-150, 150),
          y: () => gsap.utils.random(-150, 150),
          filter: "blur(2px)",
          z: () => gsap.utils.random(-2000, -2000),
        });
        gridItems.forEach((item, index) =>
          timeline
            .to(item, {
              z: 0,
              opacity: 1,
              filter: "blur(0px) invert(0)",
              duration: 3,
              delay: index * -0.4,
            })
            .to(
              item,
              {
                filter: "blur(5px)",
                opacity: 0,
                z: 2000,
                duration: 2.5,
              },
              ">",
            ),
        );
      } else {
        gsap.set(gridItems, {
          transformOrigin: "0% 0%",
          opacity: 0,
          x: () => gsap.utils.random(0, 0),
          y: () => gsap.utils.random(-250, 250),
          filter: "blur(2px)",
          z: () => gsap.utils.random(-500, -500),
        });
        gridItems.forEach((item, index) =>
          timeline
            .to(item, {
              z: 0,
              opacity: 1,
              filter: "blur(0px) invert(0)",
              duration: 4,
              delay: -2,
            })
            .to(
              item,
              {
                filter: "blur(5px)",
                opacity: 0,
                z: 800,
                duration: 3.5,
              },
              ">",
            ),
        );
      }
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      id="clientblur"
      className="relative w-screen h-[240vh] text-center z-2  bg-[#070707]"
    >
      <div className="sticky w-full top-0 h-screen flex items-center justify-center">
        <div className="w-[60%] max-[1025px]:w-[80%]">
          <OverflowTextReveal stagger={0.015}>
            <h3 className="text-[5.5vw]  text-white leading-[1.2] max-[1025px]:text-[7vw] max-md:text-[8vw]">
              Trusted by Founders and Creatives, Built for Ambitious Brands.
            </h3>
          </OverflowTextReveal>
        </div>
      </div>
      <div className="left-0 sticky mt-[-100vh] top-0 z-20 h-screen w-screen overflow-hidden flex items-center justify-center">
        <div
          ref={gridRef}
          className="grid grid-cols-5 gap-[1vw] perspective-[5000px] max-md:px-[20vw]"
        >
          {logos.map((item, index) => (
            <div key={index} className="grid__item">
              <Image
                className="w-[14vw] h-auto max-md:w-[100vw] max-[1025px]:w-[60vw] max-[1025px]:scale-[1.8] max-md:scale-[4] "
                src={item}
                alt={"awards-images"}
                width={200}
                height={100}
                quality={100}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const logos = [Awards1, Awards2, Awards3, Awards4, Awards5, Awards6,Awards1, Awards2, Awards3, Awards4, Awards5, Awards6];
