"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { useLenis } from "lenis/react";
import { X } from "lucide-react";
import PrimaryButton from "./PrimaryButton";
import BlackButton from "./BlackButton";
import AnimatedForm from "./VaultComp/animated-form";
import heroBackground from "./assets/lumera-hero.png";
import { fadeIn } from "./gsapAnimations";
import MaskTextReveal from "./VaultComp/mask-text-reveal";

gsap.registerPlugin(ScrollTrigger);

const Hero: React.FC = () => {
  const heroImageWrapperRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryMounted, setEnquiryMounted] = useState(false);

  fadeIn();

  const openEnquiryModal = () => {
    setEnquiryMounted(true);
    window.requestAnimationFrame(() => setEnquiryOpen(true));
  };

  const closeEnquiryModal = () => {
    setEnquiryOpen(false);
    window.setTimeout(() => setEnquiryMounted(false), 300);
  };

  useEffect(() => {
    if (!enquiryMounted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeEnquiryModal();
      }
    };

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    lenis?.stop?.();
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      lenis?.start?.();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enquiryMounted, lenis]);

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
              <MaskTextReveal>
                <h1 className="font-heading font-medium! flex flex-col gap-[1vw] text-[9.9vw] leading-[0.94]   uppercase text-white/95 max-[1025px]:gap-[4vw] max-md:text-[12vw] max-[1025px]:text-[14vw]">
                  <span>Exceptional</span>
                  <div className="flex items-end gap-[1.8vw] max-[1025px]:flex-col max-[1025px]:items-start max-[1025px]:gap-[4vw]">
                    <span>Living In Dubai</span>
                    <a
                      aria-label="Scroll to about section"
                      href="#about"
                      onClick={(event) => handleNavScroll(event, "#about")}
                      data-fade-in
                      className="flex h-[6.5vw] w-[6.5vw] items-center justify-center self-center rounded-full border-4 border-white text-white transition-colors hover:bg-white/10 max-[1025px]:h-[18vw] max-[1025px]:w-[18vw] max-[1025px]:self-start"
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
              </MaskTextReveal>
            </div>
          </div>

          <div className="relative z-10 flex min-h-screen pb-20 flex-col justify-between gap-[8vw] max-[1025px]:min-h-[110vw] max-[1025px]:gap-[10vw]">
            <div className="flex flex-col gap-[4vw] max-[1025px]:gap-[8vw]">
              <div className="w-[38vw] text-white max-[1025px]:w-full">
                <MaskTextReveal>
                  <p className="text-[1.45vw] max-md:leading-[1.4] max-md:text-[5vw]  leading-[1.65] text-white/92 ">
                    A curated collection of remarkable residences across Dubai&apos;s most sought-after addresses, selected for their design, location and way of life.
                  </p>
                </MaskTextReveal>
              </div>

              <div className="flex items-center gap-[1vw] max-md:flex-col max-md:items-start max-md:gap-[4vw] max-md:w-[80%] max-[1025px]:flex-wrap max-[1025px]:gap-[3vw]">
                <PrimaryButton
                  data-fade-in
                  link="#"
                  btnText="Explore Our Collection"
                  className="max-md:w-[70vw] font-normal!"
                />
                <BlackButton
                  data-fade-in
                  link="#"
                  btnText="Speak With an Advisor"
                  onClick={(event) => {
                    event.preventDefault();
                    openEnquiryModal();
                  }}
                  className="border border-white shadow-2xl drop-shadow-2xl"
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
                  data-fade-in
                  className="rounded-[1.2vw] bg-black/10 px-[1.5vw] py-[2vw] max-md:py-[5vw] text-center backdrop-blur-[0.5vw] max-[1025px]:rounded-[4vw] flex flex-col justify-between max-md:min-h-[12vh] min-h-[18vh] border border-[#F9F9F91A]"
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
      {enquiryMounted && (
        <div
          className={`fixed inset-0 z-100 flex items-center justify-center bg-black/70 px-[5%] py-[5vw] backdrop-blur-[8px] transition-opacity duration-300 max-[1025px]:items-start max-[1025px]:overflow-y-auto max-[1025px]:py-[10vw] ${
            enquiryOpen ? "opacity-100" : "opacity-0"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Lumera enquiry form"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEnquiryModal();
            }
          }}
        >
          <div
            className={`relative w-full max-w-[42vw] rounded-[1.4vw] bg-[white] p-[2vw] shadow-2xl transition-all duration-300 max-[1025px]:max-w-[86vw] max-[1025px]:rounded-[4vw] max-[1025px]:p-[5vw] max-md:max-w-[92vw] max-md:p-[6vw] ${
              enquiryOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-[2vw] scale-[0.98] opacity-0"
            }`}
          >
            <button
              type="button"
              aria-label="Close enquiry form"
              onClick={closeEnquiryModal}
              className="absolute right-[1.2vw] top-[1.2vw] z-10 flex h-[2.8vw] w-[2.8vw] items-center justify-center rounded-full bg-[#1c1b1a] text-white transition-transform hover:scale-95 max-[1025px]:right-[4vw] max-[1025px]:top-[4vw] max-[1025px]:h-[9vw] max-[1025px]:w-[9vw]"
            >
              <X className="h-[1.2vw] w-[1.2vw] max-[1025px]:h-[4vw] max-[1025px]:w-[4vw]" strokeWidth={1.8} />
            </button>
            <AnimatedForm />
          </div>
        </div>
      )}
    </>
  );
};

export default Hero;
