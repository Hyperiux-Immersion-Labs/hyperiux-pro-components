// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import CharStaggerPrimaryButton from "./effects/char-stagger-primary-button";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const KYNTRA_PRIMARY = "#0205FA";

const STEPS = [
  {
    title: "Tell us what you need",
    description: "Choose a service or describe your problem.",
  },
  {
    title: "Choose your professional",
    description: "Compare ratings, experience and pricing.",
  },
  {
    title: "Pick a time",
    description: "Schedule a visit when it's convenient.",
  },
  {
    title: "Get it done",
    description: "Track the service and payment from Kyntra.",
  },
];

const LINE_HEIGHT = 150;

export default function HowKyntraWorks() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const lineRefs = useRef<SVGLineElement[]>([]);
  const dotRefs = useRef<SVGCircleElement[]>([]);
  const stepRefs = useRef<HTMLDivElement[]>([]);

  lineRefs.current = [];
  dotRefs.current = [];

  const addLineRef = (el: SVGLineElement | null) => {
    if (el && !lineRefs.current.includes(el)) lineRefs.current.push(el);
  };

  const addDotRef = (el: SVGCircleElement | null) => {
    if (el && !dotRefs.current.includes(el)) dotRefs.current.push(el);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      // One scrubbed timeline draws each line segment and slides its dot down.
      const masterTL = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "10% 70%",
          end: "90% 70%",
          scrub: 0.4,
        },
      });

      lineRefs.current.forEach((line, index) => {
        const dot = dotRefs.current[index];

        gsap.set(line, {
          strokeDasharray: LINE_HEIGHT,
          strokeDashoffset: LINE_HEIGHT,
        });

        if (index === 0) {
          masterTL.to(dot, { fill: KYNTRA_PRIMARY, duration: 0.1 });
        }

        masterTL.to(line, { strokeDashoffset: 0, ease: "none" });

        if (dot) {
          masterTL.fromTo(
            dot,
            { attr: { cy: 0 } },
            { attr: { cy: LINE_HEIGHT }, ease: "none" },
            "<",
          );

          if (index > 0) {
            masterTL.to(dot, { fill: KYNTRA_PRIMARY, duration: 0.1 }, "<0.1");
          }
        }
      });

      // Each step fades up and its heading shifts from black to brand blue.
      stepRefs.current.forEach((step) => {
        const heading = step.querySelector<HTMLHeadingElement>(".step-title");
        const scrollTrigger = {
          trigger: step,
          start: "top 65%",
          end: "top 45%",
          scrub: 1,
        };

        gsap.fromTo(
          step,
          { opacity: 0.3 },
          { opacity: 1, ease: "power2.out", scrollTrigger },
        );

        if (heading) {
          gsap.fromTo(
            heading,
            { color: "#000000" },
            { color: KYNTRA_PRIMARY, ease: "none", scrollTrigger },
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="kyntra-container relative w-full bg-white text-black"
    >
      <div className="mx-auto max-w-400 text-center space-y-[2vw]">
        <h2 className="font-helvetica-neue leading-[1.15] font-normal tracking-[-0.02em] max-[1025px]:text-[6vw] max-md:text-[8vw]">
          How Kyntra Works
        </h2>

        <p className="text-24 mx-auto  w-[60vw] leading-[1.6] text-black max-[1025px]:max-w-full max-[1025px]:text-[2.6vw] max-md:text-[4vw]">
          Kyntra Makes It Simple To Get Any Home Service Done In Just A Few
          Steps. First, You Tell Us What You Need By Choosing A Service Or
          Describing The Issue You&apos;re Facing At Home.
        </p>
      </div>

      <div className="relative mx-auto mt-[5vw] flex w-full flex-col items-center">
        {STEPS.map((step, index) => (
          <div key={step.title} className="flex w-full flex-col items-center">
            <TimelineConnector addLineRef={addLineRef} addDotRef={addDotRef} />

            <div
              ref={(el) => {
                if (el) stepRefs.current[index] = el;
              }}
              className="mt-[2vw] mb-[1vw] space-y-[1vw] text-center"
            >
              <h3 className="step-title font-helvetica-neue text-[1.8vw] font-normal max-[1025px]:text-[3.4vw] max-md:text-[5.5vw]">
                {step.title}
              </h3>
              <p className="text-24 text-[#333333] max-[1025px]:text-[2.6vw] max-md:text-[4vw]">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-[4vw] flex justify-center">
        <CharStaggerPrimaryButton
          text="Book Your First Service"
          href="#"
          hoverColor="#ffffff"
          showArrow
          className="rounded-full px-[2.5vw] py-[1vw] text-white max-md:px-[6vw] max-md:py-[3vw]"
          textClassName="font-aeonik-pro text-[1vw] tracking-tight max-md:text-[3.5vw]"
          iconClassName="text-white"
          style={{ backgroundColor: KYNTRA_PRIMARY }}
        />
      </div>
    </section>
  );
}

function TimelineConnector({
  addLineRef,
  addDotRef,
}: {
  addLineRef: (el: SVGLineElement | null) => void;
  addDotRef: (el: SVGCircleElement | null) => void;
}) {
  return (
    <svg width="20" height={LINE_HEIGHT} className="overflow-visible">
      {/* Track */}
      <line
        x1="10"
        y1="0"
        x2="10"
        y2={LINE_HEIGHT}
        stroke="#D1D5DB"
        strokeWidth="1"
      />
      {/* Progress fill, drawn by the scroll timeline */}
      <line
        ref={addLineRef}
        x1="10"
        y1="0"
        x2="10"
        y2={LINE_HEIGHT}
        stroke={KYNTRA_PRIMARY}
        strokeWidth="1"
      />
      {/* Dot that travels down the line */}
      <circle
        ref={addDotRef}
        cx="10"
        cy="0"
        r="6"
        fill="#f8f8f8"
        stroke={KYNTRA_PRIMARY}
        strokeWidth="1"
      />
    </svg>
  );
}
