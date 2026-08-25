"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

import highlightImage1 from "./assets/highlights/image1.png";
import highlightImage2 from "./assets/highlights/image2.png";

const highlightImages = [highlightImage1, highlightImage2];

const highlightPlaces = [
  { distance: "5km", location: "Palm Jumeirah" },
  { distance: "10km", location: "Dubai Marina" },
  { distance: "2km", location: "Business Bay" },
  { distance: "6km", location: "Downtown Dubai" },
  { distance: "8km", location: "Burj Al Arab" },
  { distance: "12km", location: "Jumeirah Beach Residence" },
  { distance: "7km", location: "DIFC" },
  { distance: "14km", location: "Dubai Creek Harbour" },
].map((place, index) => ({
  ...place,
  img: highlightImages[index % highlightImages.length],
}));

const Highlights = () => {
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

  return (
    <>
      <section className="pb-[7%] pt-[5%] space-y-[6vw]! max-[1025px]:space-y-[12vw]! overflow-hidden max-md:py-[15%]" id="highlights">
        <div className={`px-[5%] max-md:px-[6%] flex flex-col gap-[1.5vw]`}>
          <h2
            data-para-anim
            className="font-heading font-medium text-[3.5vw] leading-[1.2] max-[1025px]:text-[6.8vw] max-md:text-[8.8vw]"
          >
            Nearby Highlights
          </h2>
        </div>

        <div className="">
          <div
            ref={scrollRef}
            className={`fadeup no-scrollbar w-full touch-pan-x overflow-x-scroll overflow-y-hidden overscroll-x-contain pr-[5%] select-none ${
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
            <div className="flex w-max pl-[5%] gap-[1.2vw] pb-[1vw] max-md:gap-[3vw]">
              {highlightPlaces.map((place, index) => (
                <div
                  key={index}
                  className="relative h-[27vw] w-[40vw] shrink-0 overflow-hidden rounded-lg max-[1025px]:h-[50vw] max-[1025px]:w-[78vw] max-md:h-[62vw] max-md:w-[84vw]"
                >
                  <Image
                    src={place.img}
                    alt={place.location}
                    fill
                    draggable={false}
                    sizes="(max-width: 768px) 84vw, (max-width: 1024px) 72vw, 40vw"
                    className="object-cover transition-transform duration-500 ease-in-out hover:scale-110"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="absolute bottom-4 left-0 p-[2vw] max-md:p-[5vw]">
                    <p className="text-[1.3vw] text-white/80 max-md:text-[3.2vw]">
                      <span className="font-medium text-white">{place.distance}</span> away from
                    </p>
                    <p className="font-heading font-medium uppercase text-white text-[2vw] leading-[1.1] max-md:text-[6vw]">
                      {place.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-[3.6vw] mx-[5%] h-[0.4vw] max-[1025px]:h-[1.5vw] w-[90%] overflow-hidden rounded-full bg-[#e5e5e5] max-md:mt-[7vw] max-md:w-[90vw]">
            <div
              className="absolute inset-y-0 rounded-l-full bg-black"
              style={{ width: `${thumb.widthPct}%`, left: `${thumb.leftPct}%` }}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default Highlights;
