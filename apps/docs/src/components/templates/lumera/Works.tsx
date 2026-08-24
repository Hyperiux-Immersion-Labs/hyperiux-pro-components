"use client";

/* eslint-disable react-hooks/rules-of-hooks */
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import styles from "./styles.module.css";
gsap.registerPlugin(ScrollTrigger);

const WorkCardButton = ({ text }: { text: string }) => (
  <div className={styles["work-btn"]}>
    <Link href={"#"} className={`  ${styles.btn} fadeUp`}>
      <span data-primary className="btn-text normal-case ">
        {text}
      </span>
      <div aria-hidden="true" className={styles["btn-circle"]}>
        <div className={`${styles["btn-circle-text"]} normal-case`}>
          {text}
          <svg
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles["btn-icon"]}
          >
            <path
              data-v-f4363f2a
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.82475e-07 5.625L7.625 5.625L4.125 9.125L5 10L10 5L5 -4.37114e-07L4.125 0.874999L7.625 4.375L4.91753e-07 4.375L3.82475e-07 5.625Z"
              className={`${styles["btn-path"]} fill-current`}
            />
            <path
              data-v-f4363f2a
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.82475e-07 5.625L7.625 5.625L4.125 9.125L5 10L10 5L5 -4.37114e-07L4.125 0.874999L7.625 4.375L4.91753e-07 4.375L3.82475e-07 5.625Z"
              className={`${styles["btn-path"]} fill-current`}
            />
          </svg>
        </div>
      </div>
    </Link>
  </div>
);

const workImages = {
  work5: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop",
  work1: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&auto=format&fit=crop",
  work2: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1600&auto=format&fit=crop",
  work4: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600&auto=format&fit=crop",
  work3: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1600&auto=format&fit=crop",
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
      <section id="works" className="w-full h-full overflow-hidden mobile:bg-[#1C1B1A] tablet:bg-[#1C1B1A] tablet:py-[10%]">
        <div className={`${styles["container-lg"]} h-full  py-[5%] relative `}>
          <div className="w-full flex justify-center relative z-[2]">
            <h2
              data-para-anim
              className={`${styles["title-2"]} text-white w-[60%] text-center mobile:w-full tablet:w-[80%]`}
            >
              Selected Works
            </h2>
          </div>
          <div className="w-full h-full flex-col mt-[10vw] relative z-[2] mobile:mt-[20vw]">
            <div className="flex w-full h-full justify-between mobile:flex-col mobile:gap-[10vw]">
              <div
                className="w-[37vw] h-full flex flex-col gap-[2vw] mobile:w-full mobile:gap-[7vw] tablet:w-[70vw]"
                data-scroll
                data-scroll-speed={isMobile ? undefined : "0.1"}
              >
                <div className="w-[40vw] h-[27vw] relative rounded-[2vw] overflow-hidden p-[2vw] group mobile:w-[90vw] mobile:h-[70vw] mobile:p-[4vw] fadeup tablet:w-[65vw] tablet:h-[40vw]">
                  <Image
                    src={workImages.work5}
                    alt="work-img-5"
                    fill
                    className="object-cover group-hover:scale-[1.1] transition-all ease-in-out duration-500"
                  />
                  <div className={`w-fit h-[3.5vw] p-[1vw] px-[1vw] rounded-[0.8vw] bg-white/40 relative z-[3] text-[1.2vw] uppercase ${styles.glassmorphism} overflow-hidden group-hover:h-[12vw] transition-all ease-in-out duration-300 mobile:text-[3.5vw] mobile:h-[10vw] mobile:px-[3vw] mobile:py-[3vw] mobile:group-hover:h-[30vw] tablet:text-[2.5vw] tablet:h-[7vw] tablet:px-[2vw] tablet:py-[2vw] tablet:group-hover:h-[20vw]`}>
                    Riverside Loft
                    <div className="w-full h-full flex flex-col gap-[1vw] mt-[1.5vw]">
                      <div>
                        <p className="tracking-tight">300 x 400</p>
                      </div>
                      <WorkCardButton text="View Project" />
                    </div>
                  </div>
                </div>
                <p data-para-anim className=" text-white">
                  A converted warehouse loft that keeps its industrial bones while adding warmth.
                </p>
              </div>

              <div
                className="w-[25vw] h-fit relative mr-[8%] mt-[30%] z-[4] mobile:mt-auto mobile:mr-auto tablet:mt-[80%] tablet:w-[35vw] "
                data-scroll
                data-scroll-speed={isMobile ? undefined : "-0.1"}
              >
                <div className="w-[27vw] h-[35vw] rounded-[1.5vw] overflow-hidden absolute p-[1.5vw] top-0 left-0 group mobile:w-[90vw] mobile:h-[80vw] mobile:p-[4vw] fadeup tablet:w-[40vw] tablet:h-[50vw] tablet:ml-[-140%] mobile:ml-0">
                  <Image
                    src={workImages.work1}
                    alt="work-img-1"
                    fill
                    className="object-cover group-hover:scale-[1.1] transition-all ease-in-out duration-500"
                  />
                  <div className={`w-fit h-[3.5vw] p-[1vw] px-[1vw] rounded-[0.8vw] bg-white/40 relative z-[3] text-[1.2vw] uppercase ${styles.glassmorphism} overflow-hidden group-hover:h-[12vw] transition-all ease-in-out duration-300 mobile:text-[3.5vw] mobile:h-[10vw] mobile:px-[3vw] mobile:py-[3vw] mobile:group-hover:h-[30vw] tablet:text-[2.5vw] tablet:h-[7vw] tablet:px-[2vw] tablet:py-[2vw] tablet:group-hover:h-[20vw]`}>
                    Hillside Retreat
                    <div className="w-full h-full flex flex-col gap-[1vw] mt-[1.5vw]">
                      <div>
                        <p className="tracking-tight">300 x 400</p>
                      </div>
                      <WorkCardButton text="View Project" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="w-fit h-full mt-[15vw] relative mobile:mt-[90vw] tablet:mt-[70%]"
              data-scroll
              data-scroll-speed={isMobile ? undefined : "-0.1"}
            >
              <div className="w-[47vw] h-[35vw] relative rounded-[2vw] overflow-hidden ml-[3%] p-[2vw] group mobile:w-[90vw] mobile:h-[80vw] mobile:ml-0 mobile:p-[4vw] fadeup tablet:w-[65vw] tablet:h-[45vw]">
                <Image
                  src={workImages.work2}
                  alt="work-img-2"
                  className="object-cover group-hover:scale-[1.1] transition-all ease-in-out duration-500"
                  fill
                />
                <div className={`w-fit h-[3.5vw] p-[1vw] px-[1vw] rounded-[0.8vw] bg-white/40 relative z-[3] text-[1.2vw] uppercase ${styles.glassmorphism} overflow-hidden group-hover:h-[12vw] transition-all ease-in-out duration-500 mobile:text-[3.5vw] mobile:h-[10vw] mobile:px-[3vw] mobile:py-[3vw] mobile:group-hover:h-[30vw] tablet:text-[2.5vw] tablet:h-[7vw] tablet:px-[2vw] tablet:py-[2vw] tablet:group-hover:h-[20vw]`}>
                  Courtyard House
                  <div className="w-full h-full flex flex-col gap-[1vw] mt-[1.5vw]">
                    <div>
                      <p className="tracking-tight">300 x 400</p>
                    </div>
                    <WorkCardButton text="View Project" />
                  </div>
                </div>
              </div>
              <div className="w-[47vw] h-full flex ml-[3%] mt-[5vw] tablet:w-[80vw] mobile:w-full mobile:ml-0">
                <p data-para-anim className="w-[75%] text-white text-left mobile:w-full">
                  A central courtyard organizes the plan and pulls light deep into the home.
                </p>
              </div>
            </div>
            <div
              className="w-full h-full flex justify-between mt-[7vw] mobile:mt-auto mobile:flex-col tablet:mt-[10vw]"
              data-scroll
              data-scroll-speed={isMobile ? undefined : "0.1"}
            >
              <div className="w-[40vw] h-[27vw] relative rounded-[2vw] overflow-hidden mt-[10vw] p-[2vw] group tablet:w-[47vw] tablet:h-[35vw] tablet:mt-[25vw] mobile:w-[90vw] mobile:h-[70vw] mobile:mt-[10vw] mobile:p-[4vw] fadeup ">
                <Image
                  src={workImages.work4}
                  alt="work-img-4"
                  className="object-cover group-hover:scale-[1.1] transition-all ease-in-out duration-500"
                  fill
                />
                <div className={`w-fit h-[3.5vw] p-[1vw] px-[1vw] rounded-[0.8vw] bg-white/40 relative z-[3] text-[1.2vw] uppercase ${styles.glassmorphism} overflow-hidden group-hover:h-[12vw] transition-all ease-in-out duration-500 mobile:text-[3.5vw] mobile:h-[10vw] mobile:px-[3vw] mobile:py-[3vw] mobile:group-hover:h-[30vw] tablet:text-[2.5vw] tablet:h-[7vw] tablet:px-[2vw] tablet:py-[2vw] tablet:group-hover:h-[20vw]`}>
                  Studio Annex
                  <div className="w-full h-full flex flex-col gap-[1vw] mt-[1.5vw]">
                    <div>
                      <p className="tracking-tight">300 x 400</p>
                    </div>
                    <WorkCardButton text="View Project" />
                  </div>
                </div>
              </div>
              <div
                className="w-[35vw] h-full flex flex-col gap-[5vw] mobile:mt-[10vw] mobile:w-full tablet:w-[40vw]"
                data-scroll
                data-scroll-speed={isMobile ? undefined : "-0.1"}
              >
                <div className="w-[25vw] h-[35vw] overflow-hidden rounded-[2vw] relative p-[2vw] group mobile:w-[90vw] mobile:h-[70vw] mobile:p-[4vw] fadeup tablet:w-[40vw] tablet:h-[45vw]">
                  <Image
                    src={workImages.work3}
                    alt="work-img-3"
                    fill
                    className="object-cover group-hover:scale-[1.1] transition-all ease-in-out duration-500"
                  />
                  <div className={`w-fit h-[3.5vw] p-[1vw] px-[1vw] rounded-[0.8vw] bg-white/40 relative z-[3] text-[1.2vw] uppercase ${styles.glassmorphism} overflow-hidden group-hover:h-[12vw] transition-all ease-in-out duration-500 mobile:text-[3.5vw] mobile:h-[7vw] mobile:px-[3vw] mobile:group-hover:h-[30vw] tablet:text-[2.5vw] tablet:h-[7vw] tablet:px-[2vw] tablet:py-[2vw] tablet:group-hover:h-[20vw]`}>
                    Garden Studio
                    <div className="w-full h-full flex flex-col gap-[1vw] mt-[1.5vw]">
                      <div>
                        <p className="tracking-tight">300 x 400</p>
                      </div>
                      <WorkCardButton text="View Project" />
                    </div>
                  </div>
                </div>
                <p data-para-anim className="text-white">
                  A compact garden studio designed for quiet, focused work.
                </p>
              </div>
            </div>
          </div>
          <div
            className="w-fit h-full absolute top-[10%] left-[50%] translate-x-[-50%] work-bg-icon"
            id="work-bg-icon"
          >
            <div className="w-[50vw] h-[50vw] relative mobile:w-[90vw] mobile:h-[90vw]">
              <Image
                src="/assets/hogar-logo.svg"
                alt="logo image"
                fill
                className="object-contain opacity-[0.05]"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Works;
