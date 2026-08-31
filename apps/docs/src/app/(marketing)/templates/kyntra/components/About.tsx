// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import aboutPhone1 from "../assets/about01.png";
import aboutPhone2 from "../assets/about02.png";
import aboutPhone3 from "../assets/about03.png";

import FocusTextWrap from "./effects/focus-text/wrap";
import { ParaAnim } from "./Animations/gsapAnim";
import { prefersReducedMotion } from "./Animations/reducedMotion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const About = () => {
  const clusterRef = useRef<HTMLDivElement>(null);
  // Ordered centre -> right -> left, which is the order they animate in. The
  // DOM order is left, centre, right, so the refs are assigned by hand rather
  // than by index.
  const midRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const cluster = clusterRef.current;
    const phones = [midRef.current, rightRef.current, leftRef.current];
    if (!cluster || phones.some((el) => !el)) return;

    
    if (prefersReducedMotion()) {
      gsap.set(phones, { opacity: 1 });
      return;
    }

    gsap.set(phones, { opacity: 1 });

    gsap.from(phones, {
      scrollTrigger: {
        trigger: cluster,
        // Fires once the section is about half way up the viewport.
        start: "top 50%",
        // markers:true,
        once: true,
      },
      yPercent: 60,
      opacity: 0,
      duration: 1,
      ease: "power2.out",
      // Array order (centre, right, left) drives the sequence, not DOM order.
      stagger: 0.6,
    });
  }, []);

  return (
    <section className="kyntra-container relative w-full h-full overflow-hidden bg-white text-black">
      <div className="mx-auto flex max-w-400 items-start justify-between gap-[6vw] max-[1025px]:flex-col max-[1025px]:gap-[4vw]">
        <FocusTextWrap>
          <h2 className="font-helvetica-neue w-[35vw] leading-[1.15] font-normal tracking-[-0.02em] max-[1025px]:text-[6vw] max-md:text-[8vw]">
            Everything You Need For a Better Home &amp; Lifestyle
          </h2>
        </FocusTextWrap>

        <ParaAnim
          as="p"
          className="text-24 w-[34vw] leading-[1.6] text-black/80 max-[1025px]:text-[2.6vw] max-[1025px]:text-left max-md:text-[4vw] lg:text-right"
        >
          Kyntra Gives Every Home A Memory Keeping Repairs, Warranties,
          Maintenance And Service History Connected, So Each Future Decision
          Starts With Context Instead Of From Scratch.
        </ParaAnim>
      </div>

      {/* Phone mockup cluster - all three the same size; the outer two are
          shifted down so the centre one leads. */}
      <div
        ref={clusterRef}
        className="relative mx-auto mt-[6vw] flex max-w-400 items-start justify-center gap-[3vw] max-md:mt-[12vw]"
      >
        <div
          ref={leftRef}
          className="w-[22vw] opacity-0 max-[1025px]:w-[28vw] max-md:w-[31vw]"
        >
          <Image
            src={aboutPhone1}
            alt="Kyntra room control screen"
            className="h-auto w-full object-contain"
          />
        </div>

        <div
          ref={midRef}
          className="z-10 w-[22vw] opacity-0 max-[1025px]:w-[28vw] max-md:w-[31vw]"
        >
          <Image
            src={aboutPhone2}
            alt="Kyntra app - everything your home needs, one app"
            className="h-auto w-full object-contain"
            priority
          />
        </div>

        <div
          ref={rightRef}
          className="w-[22vw] opacity-0 max-[1025px]:w-[28vw] max-md:w-[31vw]"
        >
          <Image
            src={aboutPhone3}
            alt="Kyntra device search screen"
            className="h-auto w-full object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default About;
