'use client'
import React, { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger)
}

const UI_CARDS = [
  {
    id: 1,
    title: "Motion identity, not decoration",
    text: "Every effect should reinforce attention, hierarchy, brand feel, or interaction feedback. If motion does not earn its place, it does not belong.",
  },
  {
    id: 2,
    title: "Performance first, always",
    text: "Animations should run at 60fps across devices. We prioritize hardware-accelerated properties and avoid layout thrashing to ensure a buttery smooth experience.",
  },
  {
    id: 3,
    title: "Meaningful micro-interactions",
    text: "Small details make a massive difference. Hover states, click feedback, and transitions are meticulously crafted to provide intuitive cues.",
  },
  {
    id: 4,
    title: "Scalable component architecture",
    text: "Built with reusability in mind. Each component is modular, allowing you to compose complex interfaces without fighting the framework.",
  },
  {
    id: 5,
    title: "Accessible by default",
    text: "Motion is beautiful, but accessibility is mandatory. We respect prefers-reduced-motion and ensure contrast ratios meet WCAG standards.",
  },
  {
    id: 6,
    title: "Seamless integration",
    text: "Drop these components into your Next.js or React codebase with zero friction. Fully typed with TypeScript and styled with Tailwind CSS.",
  },
];

export default function UIKit() {
  useEffect(() => {
    let ctx = gsap.context(() => {
      if (globalThis.innerWidth > 1024) {
        gsap.set(".use-case", { y: "37vw" });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "#uikit-section",
            start: "20% 90%",
            end: "102% bottom",
            scrub: true,
          },
        });
        tl.to(".use-case", {
          y: "0vw",
          stagger: 0.2,
          duration: 0.4,
          ease: "power1.out",
        }).to(".use-case-container", {
          translateX: "-50%",
          duration: 1.2,
          delay: -1.2,
          ease: "power1.inOut",
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="uikit-section" className="w-full h-[400vh] text-white max-md:overflow-hidden max-md:h-fit max-sm:py-[25%] max-md:py-[12%] relative z-[20]">
        <div>
            <h2 className='text-[5.5vw] pt-[10vw] w-full text-center'>
               Not <span className='text-[#ff5f00]'>Another</span> UI Kit. Not a Side Project.
            </h2>
        </div>

      {/* Use Case Cards */}
      <div className="w-screen h-screen sticky -mt-[10vw] top-0  overflow-hidden px-[3vw] max-md:h-fit max-md:static max-md:mt-[10vw] max-md:pb-[4vw] max-md:overflow-x-scroll mobile-scrollbar max-md:pr-[7vw] z-[15] ">
        <div className="w-fit h-full flex gap-[3vw] items-end use-case-container ">
          {UI_CARDS.map((card) => (
            <div
              key={card.id}
              className="w-[28vw] h-fit flex flex-col relative use-case justify-between max-sm:w-[80vw] max-md:w-[55vw]"
            >
              {/* Always visible top orange bar */}
              <div className="w-full h-[0.5vw] bg-[#ff5f00] max-md:h-[1vw] shrink-0" />

              {/* Expanding card content */}
              <div className="w-full h-[37vw] bg-[#161616] content-container overflow-hidden max-sm:h-[100vw] max-md:h-[65vw]">
                <div className="p-[2.5vw] flex flex-col justify-between h-full max-md:p-[5vw]">
                  <h3 className="text64">
                    {card.title}
                  </h3>

                  <p className="text24">
                    {card.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
