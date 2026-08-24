"use client";

import Image from "next/image";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { useLenis } from "lenis/react";
import PrimaryButton from "./PrimaryButton";
import BlackButton from "./BlackButton";
import heroBackground from "./assets/lumera-hero.png";

gsap.registerPlugin(ScrollTrigger);

const Hero: React.FC = () => {
  const heroImageWrapperRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-fadeup", {
        yPercent: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.01,
        delay: 2.5,
      });
      gsap.from(".linedraw", {
        scrollTrigger: {
          trigger: ".linedraw",
          start: "top 95%",
        },
        scaleX: 0,
        transformOrigin: "left",
        duration: 1,
        yPercent: 100,
        ease: "power4.out",
        delay: 2.5,
      });

      if (heroImageWrapperRef.current) {
        gsap.fromTo(
          heroImageWrapperRef.current,
          { yPercent: -15 },
          {
            yPercent: 15,
            ease: "none",
            scrollTrigger: {
              trigger: heroImageWrapperRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);


  const handleNavScroll = (event: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    event.preventDefault();

    if (lenis) {
      lenis.scrollTo(target, { duration: 2 });
      return;
    }

    document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <section id="hero" className="relative overflow-hidden">
        <div className="relative isolate flex min-h-[200vh] w-screen flex-col gap-[5vw] px-[5%] py-[3%] max-[1025px]:min-h-[240vw] max-[1025px]:gap-[8vw] max-[1025px]:py-[7%]">
          <div ref={heroImageWrapperRef} className="absolute inset-0 z-[-1]">
            <Image
              quality={90}
              src={heroBackground}
              alt="Hero Image"
              fill
              className="h-full w-full object-cover"
            />
          </div>

          <div className="relative z-10 flex h-screen flex-col justify-end gap-[8vw] max-[1025px]:gap-[12vw]">
            <div className="flex flex-col gap-[3vw] max-[1025px]:gap-[6vw] mb-30">
              <h1 className="font-heading font-medium! flex flex-col gap-[1vw] text-[9.9vw] leading-[0.94]   uppercase text-white/95 max-[1025px]:gap-[4vw] max-md:text-[12vw] max-[1025px]:text-[14vw]">
                <span data-para-anim>Exceptional</span>
                <div className="flex items-end gap-[1.8vw] max-[1025px]:flex-col max-[1025px]:items-start max-[1025px]:gap-[4vw]">
                  <span data-para-anim>Living In Dubai</span>
                  <a
                    aria-label="Scroll to about section"
                    href="#about"
                    onClick={(event) => handleNavScroll(event, "#about")}
                    className="fadeup flex h-[6.5vw] w-[6.5vw] items-center justify-center self-center rounded-full border-4 border-white text-white transition-colors hover:bg-white/10 max-[1025px]:h-[18vw] max-[1025px]:w-[18vw] max-[1025px]:self-start"
                  >
                    <svg
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-[2.3vw] w-[2.3vw] rotate-90 max-[1025px]:h-[7vw] max-[1025px]:w-[7vw]"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.82475e-07 5.625L7.625 5.625L4.125 9.125L5 10L10 5L5 -4.37114e-07L4.125 0.874999L7.625 4.375L4.91753e-07 4.375L3.82475e-07 5.625Z"
                        fill="white"
                      />
                    </svg>
                  </a>
                </div>
              </h1>
            </div>
          </div>

          <div className="relative z-10 flex min-h-screen pb-20 flex-col justify-between gap-[8vw] max-[1025px]:min-h-[110vw] max-[1025px]:gap-[10vw]">
            <div className="flex flex-col gap-[4vw] max-[1025px]:gap-[8vw]">
              <div className="w-[38vw] text-white max-[1025px]:w-full">
                <p className="text-[1.45vw] max-md:leading-[1.4] max-md:text-[5vw]  leading-[1.65] text-white/92 ">
                  A curated collection of remarkable residences across Dubai&apos;s most sought-after addresses, selected for their design, location and way of life.
                </p>
              </div>

              <div className="flex items-center gap-[1vw] max-md:flex-col max-md:items-start max-md:gap-[4vw] max-md:w-[80%] max-[1025px]:flex-wrap max-[1025px]:gap-[3vw]">
                <PrimaryButton
                  link="#"
                  btnText="Explore Our Collection"
                  className="max-md:w-[70vw] font-normal!"
                />
                <BlackButton
                  link="#"
                  btnText="Speak With an Advisor"
                  className="border border-white max-md:w-[70vw]"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-[5vw] self-stretch max-md:grid-cols-2 max-md:gap-[3vw] max-[1025px]:gap-[3vw]">
              {[
                { value: "4.2M+", suffix: "/AED", label: "Starting Price" },
                { value: "80+", label: "Stories" },
                { value: "1,000 FT+", label: "Sky Elevation" },
                { value: "Q4 2027", label: "Handover" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="fadeup rounded-[1.2vw] bg-black/10 px-[1.5vw] py-[2vw] max-md:py-[5vw] text-center backdrop-blur-[0.5vw] max-[1025px]:rounded-[4vw] flex flex-col justify-between max-md:min-h-[12vh] min-h-[18vh] border border-[#F9F9F91A]"
                >
                  <p className="inline-flex items-end justify-center gap-[0.25vw] text-[2.9vw] font-medium leading-none text-white max-[1025px]:gap-[1vw] max-[1025px]:text-[6vw]">
                    {stat.value}
                    {stat.suffix && (
                      <span className="mb-[0.15vw] text-[0.75vw] font-normal leading-none max-[1025px]:mb-[0.4vw] max-[1025px]:text-[2.5vw]">
                        {stat.suffix}
                      </span>
                    )}
                  </p>
                  <p className="text-[1.1vw] text-white/80 max-[1025px]:text-[3vw]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
