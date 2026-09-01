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
      const gridItems = Array.from(grid.querySelectorAll<HTMLElement>(".grid__item"));
      const total = gridItems.length;
      if (total === 0) return;

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

      const isDesktop = globalThis.innerWidth > 1024;
      const enterDuration = isDesktop ? 3.5 : 4;
      const exitDuration = isDesktop ? 2.5 : 3.5;
      // Gap (in timeline seconds) between one cluster's start and the next -
      // kept close to enterDuration so a new wave doesn't start arriving
      // until the current one has essentially finished appearing. Waves
      // read as distinct "two-three, two-three" beats instead of several
      // clusters' entrances piling on top of each other.
      const groupStep = enterDuration + 0.4;
      // Short, deliberate stagger between one item's start and the next
      // item's start within the same cluster - small enough that the 2-3
      // items still read as one wave "arriving together", but with a
      // visible beat between each rather than popping in simultaneously.
      const withinGroupStagger = isDesktop ? 0.4 : 0.5;

      // Split items into small clusters of 2-3, applied uniformly all the
      // way through (including whatever's left in the last cluster) so the
      // rhythm stays consistent start to finish - no special-cased finale
      // that dumps every remaining logo in at once.
      const groups: number[][] = [];
      for (let i = 0; i < total; ) {
        const remaining = total - i;
        const size = Math.min(remaining, gsap.utils.random(2, 3, 1));
        groups.push(Array.from({ length: size }, (_, k) => i + k));
        i += size;
      }

      // Items within the same cluster are visible on screen at the same
      // time, so their random start offsets need to be kept apart -
      // otherwise two logos can fly in from overlapping positions. Offsets
      // are picked with rejection sampling until they clear a minimum
      // distance from the others already chosen for that cluster.
      const offsetRange = 180;
      const minOffsetDistance = isDesktop ? 150 : 110;
      const pickGroupOffsets = (count: number) => {
        const points: { x: number; y: number }[] = [];
        for (let i = 0; i < count; i++) {
          let point = { x: 0, y: 0 };
          let attempts = 0;
          do {
            point = {
              x: isDesktop ? gsap.utils.random(-offsetRange, offsetRange, 1) : 0,
              y: gsap.utils.random(-offsetRange, offsetRange, 1),
            };
            attempts += 1;
          } while (
            attempts < 30 &&
            points.some((p) => Math.hypot(p.x - point.x, p.y - point.y) < minOffsetDistance)
          );
          points.push(point);
        }
        return points;
      };

      groups.forEach((group, groupIndex) => {
        const groupStart = groupIndex * groupStep;
        const offsets = pickGroupOffsets(group.length);

        group.forEach((itemIndex, indexInGroup) => {
          const item = gridItems[itemIndex];
          const startTime = groupStart + indexInGroup * withinGroupStagger;
          const offset = offsets[indexInGroup];

          gsap.set(item, {
            transformOrigin: "0% 0%",
            opacity: 0,
            x: offset.x,
            y: offset.y,
            filter: "blur(10px)",
            z: isDesktop ? gsap.utils.random(-2200, -1600) : gsap.utils.random(-550, -400),
          });

          timeline
            .to(
              item,
              {
                z: 0,
                opacity: 1,
                filter: "blur(0px) invert(0)",
                duration: enterDuration,
              },
              startTime,
            )
            .to(
              item,
              {
                filter: "blur(10px)",
                opacity: 0,
                z: isDesktop ? gsap.utils.random(1400, 1800) : gsap.utils.random(500, 700),
                duration: exitDuration,
              },
              startTime + enterDuration,
            );
        });
      });
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
