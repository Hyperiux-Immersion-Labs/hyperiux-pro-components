"use client";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
import Client1 from "./assets/clients-1.png";
import Client2 from "./assets/clients-2.png";
import Client3 from "./assets/clients-3.png";
import Client4 from "./assets/clients-4.png";
import Client5 from "./assets/clients-5.png";
import Client6 from "./assets/clients-6.png";
import ElenaVoss from "./assets/connect-center-img.png";
import OverflowTextReveal from "./effects/overflow-text-reveal";

const Connects = () => {
  const sectionRef = useRef<HTMLElement | null>(null);

  const circle1 = useRef<HTMLDivElement | null>(null);
  const circle2 = useRef<HTMLDivElement | null>(null);
  const circle3 = useRef<HTMLDivElement | null>(null);
  const circle4 = useRef<HTMLDivElement | null>(null);
  const circle5 = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 50%",
        end: "bottom 70%",
        // scrub:true,
        // markers:true,
      },
    });
    tl.fromTo(
      circle1.current,
      { scale: 0 },
      { scale: 1, duration: 0.8, ease: "power3.inOut" },
    )
      .fromTo(
        circle2.current,
        { scale: 0 },
        { scale: 1, duration: 0.8, ease: "power3.inOut" },
        "-=0.5",
      )
      .fromTo(
        circle3.current,
        { scale: 0.5, opacity: 0 },
        { scale: 1, duration: 0.8, opacity: 1, ease: "power3.inOut" },
        "-=0.5",
      )
      .fromTo(
        circle4.current,
        { scale: 0.5, opacity: 0 },
        { scale: 1, duration: 0.8, opacity: 1, ease: "power3.inOut" },
        "-=0.65",
      )
      .fromTo(
        circle5.current,
        { scale: 0.5, opacity: 0 },
        {
          scale: 1,
          duration: 0.8,
          opacity: 1,
          ease: "power3.inOut",
        },
        "-=0.7",
      );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="h-full w-screen py-30 px-15 relative z-0 overflow-hidden bg-[#080808]"
    >
      <div className="w-full h-full flex flex-col items-center justify-center relative z-[2]">
        <div className="text-center w-[40%] space-y-5 mt-10 max-[1025px]:w-[70%] max-md:w-[92%]">
          <OverflowTextReveal>
            <h3 className="text-[5.5vw] leading-[1.2] max-[1025px]:text-[7vw] max-md:text-[9vw]">
              Hear From the Clients!
            </h3>
          </OverflowTextReveal>
          <OverflowTextReveal splitBy="lines">

          <p className="text-[1.25vw] text-[#CACACA] max-[1025px]:text-[2.4vw] max-md:text-[4vw]">
            I work seamlessly with the platforms you already use.
          </p>
          </OverflowTextReveal>

        </div>
        <div className="w-full flex items-center justify-center gap-20 py-20 max-[1025px]:flex-wrap max-[1025px]:gap-10 max-[1025px]:py-14 max-md:gap-6 max-md:py-10">
          <div>
            <Image
              src={Client1}
              height={49}
              width={171}
              alt="azure-logo"
              className="w-[12vw]"
            />
          </div>
          <div>
            <Image
              src={Client2}
              height={51}
              width={131}
              alt="intel-logo"
              className="w-[6vw]"
            />
          </div>
          <div>
            <Image
              src={Client3}
              height={136}
              width={136}
              alt="IBM-logo"
              className="w-[12vw]"
            />
          </div>
          <div className="relative flex items-center justify-center w-[20vw] h-[20vw] ">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#242424] h-[15vw] w-[15vw] z-[-1] origin-center"
              ref={circle1}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#161616] h-[20vw] w-[20vw] z-[-2] origin-center"
              ref={circle2}
            />
            <Image
              src={ElenaVoss}
              height={65}
              width={150}
              alt="unify-logo"
              className="w-[10vw]"
            />
          </div>

          <div>
            <Image
              src={Client4}
              height={68}
              width={183}
              alt="amazon-logo"
              className="w-[12vw]"
            />
          </div>
          <div>
            <Image
              src={Client5}
              height={58}
              width={335}
              alt="google-logo"
              className="w-[8vw]"
            />
          </div>
          <div>
            <Image
              src={Client6}
              height={58}
              width={335}
              alt="google-logo"
              className="w-[10vw]"
            />
          </div>
        </div>
      </div>
      <div className="w-screen h-[35vw] bg-gradient-to-t from-transparent to-[#080808] absolute top-0 z-[1]" />
      <div className="w-screen h-[10vw] bg-gradient-to-b from-transparent to-[#080808] absolute bottom-0 z-[1]" />
      <div></div>
      <div className="h-screen w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 z-[-1] flex items-center justify-center max-[1025px]:scale-75 max-md:scale-50">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute connect-circle-1" ref={circle3}>
            <svg
              width="620"
              height="620"
              viewBox="0 0 859 859"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="429.5"
                cy="429.5"
                r="428.5"
                stroke="url(#paint0_linear_338_2389)"
                strokeOpacity="0.5"
                strokeWidth="0.25"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_338_2389"
                  x1="0"
                  y1="0"
                  x2="859"
                  y2="0"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="white" />
                  <stop offset="1" stopColor="#999999" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="absolute connect-circle-2" ref={circle4}>
            <svg
              width="951"
              height="951"
              viewBox="0 0 1231 1231"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="615.5"
                cy="615.5"
                r="614.5"
                stroke="url(#paint0_linear_338_2388)"
                strokeOpacity="0.5"
                strokeWidth="0.25"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_338_2388"
                  x1="0"
                  y1="0"
                  x2="1231"
                  y2="0"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="white" />
                  <stop offset="1" stopColor="#999999" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="absolute connect-circle-3" ref={circle5}>
            <svg
              width="1301"
              height="1301"
              viewBox="0 0 1581 1581"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="790.5"
                cy="790.5"
                r="789.5"
                stroke="url(#paint0_linear_338_2387)"
                strokeOpacity="0.5"
                strokeWidth="0.55"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_338_2387"
                  x1="0"
                  y1="0"
                  x2="1581"
                  y2="0"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="white" />
                  <stop offset="1" stopColor="#999999" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Connects;
