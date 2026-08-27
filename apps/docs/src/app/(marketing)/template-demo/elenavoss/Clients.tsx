"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
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

// The three ripple rings' own native rendered sizes (their SVG width/height
// attributes below, before any scale transform) - each ring's "grow into
// the next ring" scale target is just the ratio between consecutive sizes.
const RING_SIZE_3 = 620;
const RING_SIZE_4 = 951;
const RING_SIZE_5 = 1301;
// Ring 5 has no ring 6 to grow into, so it just keeps expanding at
// roughly the same rate as the others instead of stopping dead - staying
// fully opaque throughout (an opacity fade alongside the scale read as
// glitchy on repeat).
const RING_5_EXIT_SCALE = 1.35;
const RIPPLE_DURATION = 3;

const Clients = () => {
  const sectionRef = useRef<HTMLElement | null>(null);

  const circle1 = useRef<HTMLDivElement | null>(null);
  const circle2 = useRef<HTMLDivElement | null>(null);
  const circleCenter = useRef<HTMLDivElement | null>(null);
  const circle3 = useRef<HTMLDivElement | null>(null);
  const circle4 = useRef<HTMLDivElement | null>(null);
  const circle5 = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotionRef.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

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
    ).fromTo(
      circle2.current,
      { scale: 0 },
      { scale: 1, duration: 0.8, ease: "power3.inOut" },
      "-=0.5",
    );

    return () => {
      tl.kill();
    };
  }, []);

  // Continuous ripple: all four rings (center + 3/4/5) grow together every
  // cycle, each one landing exactly on the NEXT ring's own start size at
  // the end of the duration - center's end (620) matches ring3's start
  // (620), ring3's end (951) matches ring4's start (951), ring4's end
  // (1301) matches ring5's start (1301). That's what makes the handoff
  // seamless: the ring vacating a size and the ring arriving at that same
  // size are numerically identical, so there's nothing to visibly snap.
  // Scale-only, no opacity animation on any ring - fading opacity while
  // also scaling read as glitchy. repeat:-1 with fromTo() snaps every
  // ring back to its start size the instant a cycle ends, so the reset is
  // imperceptible and the next cycle reads as a continuation, not a
  // restart.
  useEffect(() => {
    if (prefersReducedMotionRef.current) return;

    const tl = gsap.timeline({
      repeat: -1,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 50%",
        toggleActions: "play none none none",
      },
    });

    tl.fromTo(
      circleCenter.current,
      { scale: 0.3 },
      { scale: 1, duration: RIPPLE_DURATION, ease: "none", force3D: true },
      0,
    )
      .fromTo(
        circle3.current,
        { scale: 1 },
        { scale: RING_SIZE_4 / RING_SIZE_3, duration: RIPPLE_DURATION, ease: "none", force3D: true },
        0,
      )
      .fromTo(
        circle4.current,
        { scale: 1 },
        { scale: RING_SIZE_5 / RING_SIZE_4, duration: RIPPLE_DURATION, ease: "none", force3D: true },
        0,
      )
      .fromTo(
        circle5.current,
        { scale: 1 },
        { scale: RING_5_EXIT_SCALE, duration: RIPPLE_DURATION, ease: "none", force3D: true },
        0,
      );

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="h-full w-screen py-30 px-15 relative z-0 overflow-hidden bg-[#070707]"
    >
      <div className="w-full h-full flex flex-col items-center justify-center relative z-[2]">
        <div className="text-center w-[70%] space-y-5 mt-10 max-[1025px]:w-[70%] max-md:w-[92%]">
          <OverflowTextReveal stagger={0.015}>
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
        <div className="w-full flex items-center justify-center gap-20 py-40  max-[1025px]:py-20 max-[1025px]:flex-col max-[1025px]:gap-16 ">
          <div>
            <Image
              src={Client1}
              height={49}
              width={171}
              alt="google-logo"
              className="w-[12vw] max-md:w-[25vw] max-[1025px]:w-[18vw]"
            />
          </div>
          <div>
            <Image
              src={Client2}
              height={51}
              width={131}
              alt="adobe-logo"
              className="w-[6vw] max-md:w-[12vw] max-[1025px]:w-[8vw]"
            />
          </div>
          <div>
            <Image
              src={Client3}
              height={136}
              width={136}
              alt="JP-logo"
              className="w-[12vw] max-md:w-[25vw] max-[1025px]:w-[18vw]"
            />
          </div>
          <div className="relative flex items-center justify-center w-[20vw] h-[20vw] max-md:size-[60vw] max-[1025px]:size-[40vw] ">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#242424] h-[15vw] w-[15vw] z-[-1] origin-center max-md:size-[40vw]  max-[1025px]:size-[30vw] " 
              ref={circle1}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#161616] h-[20vw] w-[20vw] z-[-2] origin-center max-md:size-[60vw]  max-[1025px]:size-[40vw]" 
              ref={circle2}
            />
            <Image
              src={ElenaVoss}
              height={65}
              width={150}
              alt="elenavoss-logo"
              className="w-[10vw] max-md:w-[28vw]  max-[1025px]:w-[18vw]"
            />
          </div>

          <div>
            <Image
              src={Client4}
              height={68}
              width={183}
              alt="pinterest-logo"
              className="w-[12vw] max-md:w-[25vw] max-[1025px]:w-[20vw]"
            />
          </div>
          <div>
            <Image
              src={Client5}
              height={58}
              width={335}
              alt="IBM-logo"
              className="w-[8vw] max-md:w-[15vw] max-[1025px]:w-[12vw]"
            />
          </div>
          <div>
            <Image
              src={Client6}
              height={58}
              width={335}
              alt="intel-logo"
              className="w-[10vw] max-md:w-[20vw] max-[1025px]:w-[14vw]"
            />
          </div>
        </div>
      </div>
      <div className="w-screen h-[35vw] bg-gradient-to-t from-transparent to-[#080808] absolute top-0 z-[1]" />
      <div className="w-screen h-[10vw] bg-gradient-to-b from-transparent to-[#080808] absolute bottom-0 z-[1]" />
      <div></div>
      <div className="h-screen w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[38%] z-[-1] flex items-center justify-center max-[1025px]:scale-75 max-md:scale-50">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute scale-[0.3]" ref={circleCenter}>
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
                stroke="url(#paint0_linear_338_2389_center)"
                strokeOpacity="0.5"
                strokeWidth="0.25"
                vectorEffect="non-scaling-stroke"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_338_2389_center"
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

          <div className="absolute" ref={circle3}>
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
                vectorEffect="non-scaling-stroke"
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

          <div className="absolute" ref={circle4}>
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
                vectorEffect="non-scaling-stroke"
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

          <div className="absolute" ref={circle5}>
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
                strokeWidth="0.25"
                vectorEffect="non-scaling-stroke"
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

export default Clients;
