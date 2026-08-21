"use client";

import Image from "next/image";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { useLenis } from "lenis/react";
import PrimaryButton from "./PrimaryButton";
import Header from "./Header";
import styles from "./styles.module.css";
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

      // Replaces locomotive-scroll's data-scroll-speed="-0.7" parallax: the
      // image drifts opposite to scroll while its section is in view.
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

  // Replaces locomotive-scroll's data-scroll-to/data-scroll-duration anchor
  // scroll. Routed through Lenis (this page is wrapped in
  // <LenisSmoothScroll />) so the scroll stays in sync with Lenis's
  // virtualized scroll position instead of fighting it.
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
      <section id="hero" className="">
        <div className="w-screen h-full relative ">
          <div className={`${styles["container-lg"]} w-screen h-[125vw] relative isolate overflow-hidden pt-[3%] tablet:h-[240vw] tablet:pt-[7%]`}>
            <Header />
            <div ref={heroImageWrapperRef} className="absolute inset-[-10%] z-[-1]">
              <Image
                quality={90}
                src={heroBackground}
                alt="Hero Image"
                fill
                className=" w-full h-full object-top"
              />
            </div>
            <div className="relative z-10 pt-[10vw] space-y-[6vw]">
              <h1 className={`text-white text-[6vw] leading-[1] ${styles["text-head"]} font-light uppercase flex flex-col gap-[1vw] opacity-90 tablet:text-[14vw] tablet:gap-[4vw]`}>
                <span data-para-anim>EXCEPTIONAL </span>
                <div className="flex items-start gap-[1.5vw] tablet:flex-col tablet:items-start tablet:gap-[4vw]">
                  <span data-para-anim>LIVING IN DUBAI</span>
                  <a
                    aria-label="Select Title"
                    href="#about"
                    onClick={(event) => handleNavScroll(event, "#about")}
                    className="w-fit mt-[0.5vw] tablet:mt-0 h-fit p-[1.5vw] rounded-full flex justify-center items-center border-[2px] border-white cursor-pointer fadeup tablet:p-[4vw]"
                  >
                    <svg
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`${styles["btn-icon"]} rotate-90 w-[2vw] h-[2vw] tablet:w-[7vw] tablet:h-[7vw]`}
                    >
                      <path
                        data-v-f4363f2a
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.82475e-07 5.625L7.625 5.625L4.125 9.125L5 10L10 5L5 -4.37114e-07L4.125 0.874999L7.625 4.375L4.91753e-07 4.375L3.82475e-07 5.625Z"
                        className={styles["btn-path"]}
                        fill="white"
                      />
                      <path
                        data-v-f4363f2a
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.82475e-07 5.625L7.625 5.625L4.125 9.125L5 10L10 5L5 -4.37114e-07L4.125 0.874999L7.625 4.375L4.91753e-07 4.375L3.82475e-07 5.625Z"
                        className={styles["btn-path"]}
                        fill="white"
                      />
                    </svg>
                  </a>
                </div>
              </h1>
            <div className="text-white w-[35vw]">
              <p>A curated collection of remarkable residences across Dubai’s most sought-after addresses, selected for their design, location and way of life.</p>
              </div>
            </div>
            <div className="flex  mt-[3vw] mobile:gap-[10vw] mobile:mt-[20vw] tablet:gap-[5vw] tablet:mt-[10vw]">
              <div className="fadeup space-x-[5vw]">
                <PrimaryButton
                  link={"#"}
                  btnText={"Explore Our Collection"}
                  className="shadow-2xl drop-shadow-2xl "
                />
                <PrimaryButton
                  link={"#"}
                  btnText={"Speak With an Advisor"}
                  className="shadow-2xl drop-shadow-2xl "
                />
              </div>
            </div>


            <div className="relative z-10 mt-[4vw] grid grid-cols-4 gap-[1vw] mobile:grid-cols-2 mobile:gap-[3vw] tablet:mt-[8vw]">
              {[
                { value: "4.2M+", suffix: "/AED", label: "Starting Price" },
                { value: "80+", label: "Stories" },
                { value: "1,000 FT+", label: "Sky Elevation" },
                { value: "Q4 2027", label: "Handover" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`${styles.glassmorphism} fadeup rounded-2xl bg-gradient-to-r from-black/70 to-black/30 px-[1.5vw] py-[1.8vw] text-center tablet:px-[3vw] tablet:py-[4vw]`}
                >
                  <p className="text-white text-[2vw] font-medium leading-none tablet:text-[6vw]">
                    {stat.value}
                    {stat.suffix && (
                      <span className="text-[1vw] font-normal align-super tablet:text-[3vw]">
                        {stat.suffix}
                      </span>
                    )}
                  </p>
                  <p className="mt-[0.8vw] text-white/80 text-[1vw] tablet:mt-[2vw] tablet:text-[3vw]">
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
