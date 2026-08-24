"use client";

/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

import BlackButton from "./BlackButton";
import refinement1 from "./assets/refinement-1.png";
import refinement2 from "./assets/refinement-2.png";

gsap.registerPlugin(ScrollTrigger);

const interiorImages = [
  refinement1,
  refinement2,
  refinement1,
  refinement2,
  refinement1,
  refinement2,
];

export default function Project() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ pointerId: number; startX: number; startScrollLeft: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [thumb, setThumb] = useState({ widthPct: 100, leftPct: 0 });

  const updateThumb = () => {
    const el = scrollRef.current;
    if (!el) return;
    const widthPct = Math.min(100, (el.clientWidth / el.scrollWidth) * 100);
    const maxScroll = el.scrollWidth - el.clientWidth;
    const scrollRatio = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
    setThumb({ widthPct, leftPct: scrollRatio * (100 - widthPct) });
  };

  useEffect(() => {
    updateThumb();
    window.addEventListener("resize", updateThumb);
    return () => window.removeEventListener("resize", updateThumb);
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: el.scrollLeft,
    };
    setIsDragging(true);
    el.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    const drag = dragState.current;
    if (!el || !drag || drag.pointerId !== event.pointerId) return;
    el.scrollLeft = drag.startScrollLeft - (event.clientX - drag.startX);
    updateThumb();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    const drag = dragState.current;
    if (!el || !drag || drag.pointerId !== event.pointerId) return;
    el.releasePointerCapture(event.pointerId);
    dragState.current = null;
    setIsDragging(false);
  };

  useEffect(() => {
    if (globalThis.innerWidth > 1024) {
      const ctx = gsap.context(() => {
        const body = document.body;
        const changeBodyColor = (color: string) => {
          gsap.to(body, {
            backgroundColor: color,
            duration: 1,
            ease: "power2.out",
          });
        };

        ScrollTrigger.create({
          trigger: "#project",
          start: "top 60%",
          end: "bottom 20%",
          onEnter: () => changeBodyColor("#ffffff"),
          onLeaveBack: () => changeBodyColor("#1C1B1A"),
        });
      });
      return () => ctx.revert();
    }
  }, []);

  return (
    <section
      id="project"
      className="w-screen overflow-hidden  pt-[8%] pb-[12%] text-[#1c1b1a] mobile:pt-[20%] mobile:pb-[16%] tablet:py-[10%]"
    >
      <div className="px-[5%]">
        <h2
          data-para-anim
          className="font-medium font-heading text-[3.9vw] leading-[1.06] tracking-[-0.04em] max-[1025px]:text-[6.8vw] max-md:text-[10vw]"
        >
          A World of Refinement
        </h2>
        <div className="my-[3.5vw] h-[1px] w-full bg-black/15 lineDraw mobile:my-[8vw] tablet:my-[5vw]" />

        <div className="mb-[4.5vw] grid grid-cols-[minmax(0,1fr)_minmax(18rem,34vw)] items-start gap-[4vw] pl-[23%] pr-[2%] tablet:grid-cols-1 tablet:gap-[7vw] tablet:px-0 mobile:mb-[10vw]">
          <div className="fadeup tablet:order-1">
            <BlackButton btnText="Enquire Now" link="#" className="bg-[#1c1b1a]" borderColor="#1c1b1a" />
          </div>
          <p
            data-para-anim
            className="max-w-[38vw] text-[1.25vw] leading-[1.75] tracking-[-0.02em] text-black/85 tablet:max-w-full tablet:text-[2.5vw] mobile:text-[4.6vw]"
          >
            Immerse yourself in the stylish allure of Lumera Heights, where every
            corner exudes sophistication. This is not just a residence, it&apos;s a
            mark of distinction that embodies the luxurious lifestyle you&apos;ve
            always craved.
          </p>
        </div>
      </div>

      <div className="">
        <div
          ref={scrollRef}
          className={`fadeup no-scrollbar w-full pl-[25.5%] tablet:pl-[5%]  touch-pan-x overflow-x-scroll overflow-y-hidden overscroll-x-contain pr-[5%] select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          onScroll={updateThumb}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
          onDragStart={(event) => event.preventDefault()}
        >
          <div className="flex w-max gap-[1.2vw] pb-[1vw] mobile:gap-[3vw]">
            {interiorImages.map((src, index) => (
              <div
                key={index}
                className="relative h-[29vw] w-[43vw] shrink-0 overflow-hidden rounded-[1.8vw] tablet:h-[50vw] tablet:w-[72vw] mobile:h-[62vw] mobile:w-[84vw]"
              >
                <Image
                  src={src}
                  alt={`interior-img-${index + 1}`}
                  fill
                  draggable={false}
                  sizes="(max-width: 768px) 84vw, (max-width: 1024px) 72vw, 43vw"
                  className="object-cover transition-transform duration-500 ease-in-out hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-[3.6vw] h-[0.4vw] ml-[25.5%] tablet:pl-[5%] w-[74vw] overflow-hidden rounded-full bg-[#e5e5e5] mobile:mt-[7vw] mobile:w-[90vw]">
          <div
            className="absolute inset-y-0 rounded-l-full bg-black"
            style={{ width: `${thumb.widthPct}%`, left: `${thumb.leftPct}%` }}
          />
        </div>
      </div>
    </section>
  );
}
