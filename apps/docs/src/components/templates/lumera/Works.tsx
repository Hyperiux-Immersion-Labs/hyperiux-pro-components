"use client";

/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import architecture1 from "./assets/architecture-1.png";
import architecture2 from "./assets/architecture-2.png";
import architecture3 from "./assets/architecture-3.png";
import architecture4 from "./assets/architecture-4.png";
import architecture5 from "./assets/architecture-5.png";
import squareIcon from "./assets/icons/square.svg";
import ParallaxImageAnimation from "./VaultComp/ParallaxImageAnimation";
import Image from "next/image";
gsap.registerPlugin(ScrollTrigger);

const WORK_BUTTON_CLASS =
  "fadeUp inline-flex w-fit items-center gap-[0.8vw] rounded-[1000px] bg-white py-[0.3vw] pl-[1vw] pr-[0.3vw] text-[0.85vw] font-medium normal-case text-[#1c1b1a] [text-rendering:geometricPrecision] max-[1025px]:gap-[1.2vw] max-[1025px]:py-[0.5vw] max-[1025px]:pl-[1.6vw] max-[1025px]:pr-[0.5vw] max-[1025px]:text-[1.5vw] max-md:gap-[2vw] max-md:py-[1vw] max-md:pl-[3vw] max-md:pr-[1vw] max-md:text-[3vw]";

const WORK_BUTTON_CIRCLE_CLASS =
  "relative flex h-[1.8vw] w-[1.8vw] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1c1b1a] max-[1025px]:h-[3vw] max-[1025px]:w-[3vw] max-md:h-[6vw] max-md:w-[6vw]";

const WORK_BUTTON_ICON_CLASS =
  "h-[0.65vw] w-[0.65vw] overflow-hidden text-white max-[1025px]:h-[1.1vw] max-[1025px]:w-[1.1vw] max-md:h-[2.2vw] max-md:w-[2.2vw]";

const WORK_BUTTON_PATH_ENTER_CLASS =
  "origin-center -translate-x-[120%] scale-0 fill-current transition-transform duration-[450ms] ease-[cubic-bezier(0.785,0.135,0.15,0.86)] group-hover:translate-x-0 group-hover:scale-100";

const WORK_BUTTON_PATH_LEAVE_CLASS =
  "origin-center fill-current transition-transform duration-[450ms] ease-[cubic-bezier(0.785,0.135,0.15,0.86)] group-hover:translate-x-[120%] group-hover:scale-0";

const GLASS_PANEL_CLASS =
  "backdrop-blur-[14px] [backdrop-filter:blur(14px)]";

const WorkCardMeta = () => (
  <div className="flex items-center gap-[0.6vw] max-[1025px]:gap-[1vw] max-md:gap-[2vw]">
    <Image
      src={squareIcon}
      className="h-[1.2vw] w-[1.2vw] object-contain max-[1025px]:h-[2.2vw] max-[1025px]:w-[2.2vw] max-md:h-[4.5vw] max-md:w-[4.5vw]"
      alt=""
      aria-hidden="true"
    />
    <p className="tracking-tight">300 x 400</p>
  </div>
);

const WorkCardButton = ({ text }: { text: string }) => (
  <div>
    <Link href={"#"} className={WORK_BUTTON_CLASS}>
      <span data-primary className="btn-text normal-case ">
        {text}
      </span>
      <div aria-hidden="true" className={WORK_BUTTON_CIRCLE_CLASS}>
        <svg
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={WORK_BUTTON_ICON_CLASS}
        >
          <path
            data-v-f4363f2a
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3.82475e-07 5.625L7.625 5.625L4.125 9.125L5 10L10 5L5 -4.37114e-07L4.125 0.874999L7.625 4.375L4.91753e-07 4.375L3.82475e-07 5.625Z"
            className={WORK_BUTTON_PATH_ENTER_CLASS}
          />
          <path
            data-v-f4363f2a
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3.82475e-07 5.625L7.625 5.625L4.125 9.125L5 10L10 5L5 -4.37114e-07L4.125 0.874999L7.625 4.375L4.91753e-07 4.375L3.82475e-07 5.625Z"
            className={WORK_BUTTON_PATH_LEAVE_CLASS}
          />
        </svg>
      </div>
    </Link>
  </div>
);

const workImages = {
  work5: architecture1,
  work1: architecture2,
  work2: architecture3,
  work4: architecture4,
  work3: architecture5,
};

const Works = () => {
  const [isMobile, setIsMobile] = useState(false);
  const checkIsMobile = () => {
    setIsMobile(window.innerWidth < 1024);
  };

  useEffect(() => {
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

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
          trigger: "#works",
          start: "top 60%",
          end: "bottom 20%",
          onEnter: () => changeBodyColor("#161616"),
          onLeaveBack: () => changeBodyColor("#ffffff"),
        });
      });
      return () => ctx.revert();
    }
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      const imagePin = document.getElementById("work-bg-icon");
      const triggerSection = document.getElementById("works");
      ScrollTrigger.create({
        trigger: imagePin,
        start: "top 10%",
        endTrigger: triggerSection,
        end: "bottom 80%",
        invalidateOnRefresh: true,
        pin: imagePin,
        markers: false,
      });
    });
    return () => ctx.revert();
  });

  return (
    <>
      <section id="works" className="w-full h-full overflow-hidden max-md:bg-[#1C1B1A] max-[1025px]:bg-[#1C1B1A] max-[1025px]:py-[10%]">
        <div className="relative mx-auto h-full w-full max-md:w-[85%] max-w-[90%] py-[5%]">
          <div className="w-full flex justify-center relative z-2">
            <h2
              data-para-anim
              className="w-[80%] text-center font-heading text-[3.9vw] capitalize leading-tight text-white max-md:w-full max-md:text-[7vw] max-[1025px]:w-[80%] max-[1025px]:text-[5.5vw]"
            >
              Lumera Heights is defined by bold architectural expression , where structure, form, and light come together to create a timeless vertical icon.
            </h2>
          </div>
          <div className="w-full h-full flex-col mt-[10vw] relative z-2 max-md:mt-[20vw]">
            <div className="flex w-full h-full justify-between max-md:flex-col max-md:gap-[10vw]">
              <div
                className="w-[37vw] h-full flex flex-col gap-[2vw] max-md:w-full max-md:gap-[7vw] max-[1025px]:w-[70vw]"
                data-scroll
                data-scroll-speed={isMobile ? undefined : "0.1"}
              >
                <div className="w-[40vw] h-[27vw] relative rounded-[2vw] overflow-hidden p-[2vw] group max-md:w-[85vw] max-md:h-[70vw] max-md:p-[4vw] fadeup max-[1025px]:w-[65vw] max-[1025px]:h-[40vw]">
                  <ParallaxImageAnimation
                    src={workImages.work5}
                    alt="work-img-5"
                    translateY="15%"
                    wrapperClassName="absolute inset-0 h-full w-full group-hover:scale-[1.1] transition-all ease-in-out duration-500"
                    imageClassName="scale-[1.5] -translate-y-[15%]"
                  />
                  <div className={`w-fit h-[3.5vw] p-[1vw] px-[1vw] rounded-[0.8vw] bg-white/40 relative z-3 text-[1.2vw]  ${GLASS_PANEL_CLASS} overflow-hidden group-hover:h-[12vw] transition-all ease-in-out duration-300 max-md:text-[3.5vw] max-md:h-[10vw] max-md:px-[3vw] max-md:py-[3vw] max-md:group-hover:h-[30vw] max-[1025px]:text-[2.5vw] max-[1025px]:h-[7vw] max-[1025px]:px-[2vw] max-[1025px]:py-[2vw] max-[1025px]:group-hover:h-[20vw] max-md:w-[30vw]`}>
                    Living Room
                    <div className="w-full h-full flex flex-col gap-[1vw] mt-[1.5vw]">
                      <WorkCardMeta />
                      <WorkCardButton text="View Gallery" />
                    </div>
                  </div>
                </div>
                <p data-para-anim className=" text-white max-md:text-[3.5vw] text-[1.25vw] tracking-wide">
                  Every residence is thoughtfully crafted around light, proportion, and timeless materials. From expansive living spaces to serene private retreats, each detail creates an atmosphere of effortless sophistication above it.
                </p>
              </div>

              <div
                className="w-[25vw] h-fit relative mr-[8%] mt-[30%] z-[4] max-md:mt-auto max-md:mr-auto max-[1025px]:mt-[80%] max-[1025px]:w-[35vw] "
                data-scroll
                data-scroll-speed={isMobile ? undefined : "-0.1"}
              >
                <div className="w-[27vw] h-[35vw] rounded-[1.5vw] overflow-hidden absolute p-[1.5vw] top-0 left-0 group max-md:w-[90vw] max-md:h-[80vw] max-md:p-[4vw] fadeup max-[1025px]:w-[40vw] max-[1025px]:h-[50vw] max-[1025px]:ml-[-140%] max-md:ml-0">
                  <ParallaxImageAnimation
                    src={workImages.work1}
                    alt="work-img-1"
                    translateY="15%"
                    wrapperClassName="absolute inset-0 h-full w-full group-hover:scale-[1.1] transition-all ease-in-out duration-500"
                    imageClassName="scale-[1.5] -translate-y-[15%]"
                  />
                  <div className={`w-fit h-[3.5vw] p-[1vw] px-[1vw] rounded-[0.8vw] bg-white/40 relative z-[3] text-[1.2vw]  ${GLASS_PANEL_CLASS} overflow-hidden group-hover:h-[12vw] transition-all ease-in-out duration-300 max-md:text-[3.5vw] max-md:h-[10vw] max-md:px-[3vw] max-md:py-[3vw] max-md:group-hover:h-[30vw] max-[1025px]:text-[2.5vw] max-[1025px]:h-[7vw] max-[1025px]:px-[2vw] max-[1025px]:py-[2vw] max-[1025px]:group-hover:h-[20vw]`}>
                    Kitchen
                    <div className="w-full h-full flex flex-col gap-[1vw] mt-[1.5vw]">
                      <WorkCardMeta />
                      <WorkCardButton text="View Gallery" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="w-fit h-full  mt-[15vw] relative max-md:mt-[90vw] max-[1025px]:mt-[70%]"
              data-scroll
              data-scroll-speed={isMobile ? undefined : "-0.1"}
            >
              <div className="w-[47vw] h-[35vw] relative rounded-[2vw] overflow-hidden ml-[3%] p-[2vw] group max-md:w-[90vw] max-md:h-[80vw] max-md:ml-0 max-md:p-[4vw] fadeup max-[1025px]:w-[65vw] max-[1025px]:h-[45vw]">
                <ParallaxImageAnimation
                  src={workImages.work2}
                  alt="work-img-2"
                  translateY="15%"
                  wrapperClassName="absolute inset-0 h-full w-full group-hover:scale-[1.1] transition-all ease-in-out duration-500"
                  imageClassName="scale-[1.5] -translate-y-[15%]"
                />
                <div className={`w-fit h-[3.5vw] p-[1vw] px-[1vw] rounded-[0.8vw] bg-white/40 relative z-[3] text-[1.2vw]  ${GLASS_PANEL_CLASS} overflow-hidden group-hover:h-[12vw] transition-all ease-in-out duration-500 max-md:text-[3.5vw] max-md:h-[10vw] max-md:px-[3vw] max-md:py-[3vw] max-md:group-hover:h-[30vw] max-[1025px]:text-[2.5vw] max-[1025px]:h-[7vw] max-[1025px]:px-[2vw] max-[1025px]:py-[2vw] max-[1025px]:group-hover:h-[20vw]`}>
                  Bedroom
                  <div className="w-full h-full flex flex-col gap-[1vw] mt-[1.5vw]">
                    <WorkCardMeta />
                    <WorkCardButton text="View Gallery" />
                  </div>
                </div>
              </div>
              <div className="w-[47vw] h-full flex ml-[3%] mt-[5vw] max-[1025px]:w-[80vw] max-md:w-full max-md:ml-0">
                <p data-para-anim className="w-[75%] text-white text-left text-[1.25vw] max-md:w-full tracking-wide max-md:text-[3.5vw]">
                 From bespoke finishes to panoramic city views, every space is designed to elevate the everyday. Warm materials, considered proportions, and refined craftsmanship come together to create residences that feel as exceptional as the city beyond them.
                </p>
              </div>
            </div>
            <div
              className="w-full h-full flex justify-between mt-[7vw] max-md:mt-auto max-md:flex-col max-[1025px]:mt-[10vw]"
              data-scroll
              data-scroll-speed={isMobile ? undefined : "0.1"}
            >
              <div className="w-[40vw] h-[27vw] relative rounded-[2vw] overflow-hidden mt-[10vw] p-[2vw] group max-[1025px]:w-[47vw] max-[1025px]:h-[35vw] max-[1025px]:mt-[25vw] max-md:w-[90vw] max-md:h-[70vw] max-md:mt-[10vw] max-md:p-[4vw] fadeup ">
                <ParallaxImageAnimation
                  src={workImages.work4}
                  alt="work-img-4"
                  translateY="15%"
                  wrapperClassName="absolute inset-0 h-full w-full group-hover:scale-[1.1] transition-all ease-in-out duration-500"
                  imageClassName="scale-[1.5] -translate-y-[15%]"
                />
                <div className={`w-fit h-[3.5vw] p-[1vw] px-[1vw] rounded-[0.8vw] bg-white/40 relative z-[3] text-[1.2vw]  ${GLASS_PANEL_CLASS} overflow-hidden group-hover:h-[12vw] transition-all ease-in-out duration-500 max-md:text-[3.5vw] max-md:h-[10vw] max-md:px-[3vw] max-md:py-[3vw] max-md:group-hover:h-[30vw] max-[1025px]:text-[2.5vw] max-[1025px]:h-[7vw] max-[1025px]:px-[2vw] max-[1025px]:py-[2vw] max-[1025px]:group-hover:h-[20vw]`}>
                Bedroom
                  <div className="w-full h-full flex flex-col gap-[1vw] mt-[1.5vw]">
                    <WorkCardMeta />
                    <WorkCardButton text="View Gallery" />
                  </div>
                </div>
              </div>
              <div
                className="w-[30vw] h-full flex flex-col gap-[5vw] max-md:mt-[10vw] max-md:w-full max-[1025px]:w-[40vw]"
                data-scroll
                data-scroll-speed={isMobile ? undefined : "-0.1"}
              >
                <div className="w-[25vw] h-[35vw] overflow-hidden rounded-[2vw] relative p-[2vw] group max-md:w-[90vw] max-md:h-[70vw] max-md:p-[4vw] fadeup max-[1025px]:w-[40vw] max-[1025px]:h-[45vw]">
                  <ParallaxImageAnimation
                    src={workImages.work3}
                    alt="work-img-3"
                    translateY="15%"
                    wrapperClassName="absolute inset-0 h-full w-full group-hover:scale-[1.1] transition-all ease-in-out duration-500"
                    imageClassName="scale-[1.5] -translate-y-[15%]"
                  />
                  <div className={`w-fit h-[3.5vw] p-[1vw] px-[1vw] rounded-[0.8vw] bg-white/40 relative z-3 text-[1.2vw]  ${GLASS_PANEL_CLASS} overflow-hidden group-hover:h-[12vw] transition-all ease-in-out duration-500 max-md:text-[3.5vw] max-md:h-[10vw] max-md:px-[3vw] max-md:py-[3vw] max-md:group-hover:h-[30vw] max-[1025px]:text-[2.5vw] max-[1025px]:h-[7vw] max-[1025px]:px-[2vw] max-[1025px]:py-[2vw] max-[1025px]:group-hover:h-[20vw]`}>
                    Bathroom
                    <div className="w-full h-full flex flex-col gap-[1vw] mt-[1.5vw]">
                      <WorkCardMeta />
                      <WorkCardButton text="View Gallery" />
                    </div>
                  </div>
                </div>
                <p data-para-anim className="text-white text-[1.25vw] tracking-wide max-md:text-[3.5vw]">
                 Thoughtful interiors, refined materials, and breathtaking views come together in spaces designed for modern living at its highest level.
                </p>
              </div>
            </div>
          </div>
          <div
            className="w-full h-full absolute top-[10%] left-0 right-0 work-bg-icon"
            id="work-bg-icon"
          >
            <div className="w-full h-[50vw] relative flex items-center justify-center max-md:h-[90vw]">
              <h2 className="w-[60vw] text-center text-[#2A2A2A] text-[10vw] leading-[1.2] max-md:w-[90vw]">
                LUMERA HEIGHTS
              </h2>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Works;
