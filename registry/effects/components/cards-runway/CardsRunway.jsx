'use client'
import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

export default function CardsRunway({
  data = [],
  accentColor = "#ff5f00",
  cardColor = "#161616",
  cardWidth = "28vw",
  start = "10% 90%",
}) {
  const root = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      if (globalThis.innerWidth > 1024) {
        gsap.set(".cards-runway-card", {
          y: prefersReducedMotion() ? "0vw" : "37vw",
          opacity: 1,
        });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start,
            end: "102% bottom",
            scrub: true,
          },
        });
        tl.to(".cards-runway-card", {
          y: "0vw",
          stagger: 0.2,
          duration: 0.4,
          ease: "power1.out",
        }).to(".cards-runway-container", {
          translateX: "-38%",
          duration: 1.2,
          delay: -0.8,
          ease: "power1.inOut",
        });
      } else {
        gsap.set(".cards-runway-card", { autoAlpha: 0, y: 50 });
        gsap.to(".cards-runway-card", {
          scrollTrigger: {
            trigger: ".cards-runway-container",
            start: "top 90%",
            once: true,
          },
          autoAlpha: 1,
          y: 0,
          stagger: 0.15,
          duration: 1,
          ease: "power3.out",
        });
      }
    }, root);

    return () => ctx.revert();
  }, [start]);

  return (
    <section
      ref={root}
      className="w-full h-[350vh] text-white bg-black max-xl:overflow-hidden max-xl:h-screen max-md:py-[25%] max-xl:py-[12%] relative z-20"
    >
      {/* Cards Runway */}
      <div className="w-screen h-screen sticky top-0 overflow-hidden px-[3vw] max-xl:h-fit max-xl:static pb-5  max-xl:mt-[40vw] max-xl:pb-[4vw] max-xl:overflow-x-scroll mobile-scrollbar max-xl:pr-[7vw] z-15">
        <div className="w-fit h-full flex gap-[3vw] max-md:gap-[6vw] items-end cards-runway-container">
          {data.map((card) => (
            <div
              key={card.id}
              style={{ width: cardWidth }}
              className="h-fit flex flex-col relative cards-runway-card justify-between max-md:w-[70vw]! max-xl:w-[45vw]! opacity-0"
            >
              {/* Always visible top accent bar */}
              <div
                style={{ backgroundColor: accentColor }}
                className="w-full h-[0.5vw] max-xl:h-[1vw] max-md:h-[1.5vw] shrink-0"
              />

              {/* Card content */}
              <div
                style={{ backgroundColor: cardColor }}
                className="w-full h-[37vw] cards-runway-content overflow-hidden max-md:h-[40vh] max-xl:h-[55vw]"
              >
                <div className="p-[2vw] flex flex-col justify-between h-full max-xl:p-[5vw]">
                  <h3 className="text-[2.8vw] leading-[1.2] max-md:text-[6vw] max-xl:text-[4vw] max-md:w-[80%]">{card.title}</h3>
                  <p className="text-[1.25vw] max-xl:text-[2.6vw] max-md:text-[4.4vw] max-md:leading-[1.2]">{card.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
