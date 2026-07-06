'use client'
import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

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
        gsap.set(".cards-runway-card", { y: "37vw", opacity: 1 });
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
      className="w-full h-[350vh] text-white max-md:overflow-hidden max-md:h-fit max-sm:py-[25%] max-md:py-[12%] relative z-20"
    >
      {/* Cards Runway */}
      <div className="w-screen h-screen sticky top-0 overflow-hidden px-[3vw] max-md:h-fit max-md:static pb-5  max-md:mt-[40vw] max-md:pb-[4vw] max-md:overflow-x-scroll mobile-scrollbar max-md:pr-[7vw] z-15">
        <div className="w-fit h-full flex gap-[3vw] max-sm:gap-[6vw] items-end cards-runway-container">
          {data.map((card) => (
            <div
              key={card.id}
              style={{ width: cardWidth }}
              className="h-fit flex flex-col relative cards-runway-card justify-between max-sm:w-[70vw]! max-md:w-[45vw]! opacity-0"
            >
              {/* Always visible top accent bar */}
              <div
                style={{ backgroundColor: accentColor }}
                className="w-full h-[0.5vw] max-md:h-[1vw] max-sm:h-[1.5vw] shrink-0"
              />

              {/* Card content */}
              <div
                style={{ backgroundColor: cardColor }}
                className="w-full h-[37vw] cards-runway-content overflow-hidden max-sm:h-[40vh] max-md:h-[55vw]"
              >
                <div className="p-[2vw] flex flex-col justify-between h-full max-md:p-[5vw]">
                  <h3 className="text-[2.8vw] leading-[1.2] max-sm:text-[6vw] max-md:text-[4vw] max-sm:w-[80%]">{card.title}</h3>
                  <p className="text-[1.25vw] max-md:text-[2.6vw] max-sm:text-[4.4vw] max-sm:leading-[1.2]">{card.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
