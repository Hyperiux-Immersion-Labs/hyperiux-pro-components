"use client";
import  { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import OverflowTextReveal from "./effects/overflow-text-reveal";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    title: "Brand Identity",
    items: [
      "Visual Systems",
      "User Experience",
      "Motion Design",
      "Design Strategy",
    ],
    href: "#",
  },
  {
    title: "Web Development",
    items: ["React", "Webflow Sites", "Shopify", "Custom Builds"],
    href: "#",
  },
  {
    title: "UI/UX Design",
    items: ["Wireframing", "Prototyping", "User Research", "Design Systems"],
    href: "#",
  },
  {
    title: "Motion & Animation",
    items: [
      "GSAP Animations",
      "Micro-interactions",
      "Scroll Effects",
      "Video Editing",
    ],
    href: "#",
  },
  {
    title: "Brand Strategy",
    items: ["Market Research", "Positioning", "Naming", "Brand Guidelines"],
    href: "#",
  },
];

const Services = () => {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const gradientRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const prefersReducedMotionRef = useRef(false);
  // The first card reads as "active" (gradient filled) from the start.
  // Hovering another card hands the active state to it; leaving the
  // cards doesn't clear it - whichever was hovered last just stays lit.
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotionRef.current = mq.matches;
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
      setPrefersReducedMotion(e.matches);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
   if (prefersReducedMotionRef.current) return;
   if(globalThis.innerWidth>1025){
       gsap.fromTo(
         rowRef.current,
         { xPercent: 70 },
         {
           xPercent: -33,
           ease: "none",
           scrollTrigger: {
             trigger: "#services",
             start: "top 20%",
             end: "bottom bottom",
             scrub: true,
             // markers: true,
           },
         },
       );
   }
   else if(globalThis.innerWidth<1025 && globalThis.innerWidth>541){
    gsap.fromTo(
         rowRef.current,
         { xPercent: 50 },
         {
           xPercent: -65,
           ease: "none",
           scrollTrigger: {
             trigger: "#services",
             start: "top 20%",
             end: "bottom bottom",
             scrub: true,
             // markers: true,
           },
         },
       );
   }
   else{
       gsap.fromTo(
         rowRef.current,
         { xPercent: 50 },
         {
           xPercent: -77,
           ease: "none",
           scrollTrigger: {
             trigger: "#services",
             start: "top 20%",
             end: "bottom bottom",
             scrub: true,
             // markers: true,
           },
         },
       );
   }
  }, []);

  const handleActivate = (index: number) => {
    if (index === activeIndex) return;
    gsap.to(gradientRefs.current[activeIndex], {
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
    });
    gsap.to(gradientRefs.current[index], {
      opacity: 1,
      duration: 0.5,
      ease: "power2.out",
    });
    setActiveIndex(index);
  };

  return (
    <section
      className={`relative w-screen bg-[#070707] text-white ${prefersReducedMotion ? "" : "h-[200vh]"}`}
      id="services"
    >
      <div className="relative pt-[6vw] px-[4vw] w-[60%] max-[1025px]:w-[85%] max-md:w-full  max-[1025px]:px-[5vw] max-[1025px]:pt-[15vw]">
        <OverflowTextReveal stagger={0.015}>
          <h2 className="text-[5.5vw] leading-[1.2] max-[1025px]:text-[7vw] max-md:text-[9vw]">
            Design That Speaks
            <br />
            to Your Audience
          </h2>
        </OverflowTextReveal>
        <div className="w-[75%] max-[1025px]:w-full mt-[1.5vw] max-[1025px]:mt-[5vw]">
          <OverflowTextReveal splitBy="lines">
            <p className="text-[1.25vw] max-[1025px]:text-[2.5vw] max-md:text-[4.5vw] ">
              My practice is focused on solving real-world digital challenges
              with thoughtful design thinking. Whether you need to refine brand
              identity, streamline user experience, or create memorable
              interactive moments, my approach provides creativity, clarity, and
              consistency for clients across industries.
            </p>
          </OverflowTextReveal>
        </div>
      </div>
      <div
        className={
          prefersReducedMotion
            ? "w-screen pb-[6vw]"
            : "w-screen h-screen sticky top-0 overflow-hidden flex flex-col max-md:mt-[-30vw]"
        }
      >
        <div className={prefersReducedMotion ? "" : "relative flex-1 flex items-center"}>
          <div
            ref={rowRef}
            className={
              prefersReducedMotion
                ? "grid grid-cols-3 gap-[1.6vw] px-[4vw] pt-[5vw] max-[1025px]:grid-cols-2 max-md:grid-cols-1"
                : "flex gap-[1.6vw] px-[4vw] will-change-transform"
            }
          >
            {SERVICES.map((service, index) => (
              <Link
                href={service.href}
                key={service.title}
                onMouseEnter={() => handleActivate(index)}
                className={
                  prefersReducedMotion
                    ? "relative rounded-lg p-[1.6vw] flex flex-col justify-between bg-[#161616] overflow-hidden min-h-[22vw] max-[1025px]:min-h-[32vw] max-[1025px]:p-[3vw] max-md:min-h-0 max-md:p-[5vw]"
                    : "relative w-[27vw] h-[30vw] shrink-0 rounded-lg p-[1.6vw] flex flex-col justify-between bg-[#161616] overflow-hidden max-[1025px]:w-[55vw] max-[1025px]:h-[65vw] max-[1025px]:p-[3vw] max-md:w-[75vw] max-md:h-[85vw] max-md:p-[5vw]"
                }
              >
                <div
                  ref={(el) => {
                    gradientRefs.current[index] = el;
                  }}
                  className={`absolute inset-0 bg-linear-to-r from-[#F16B0D] to-[#E61416] ${activeIndex === index ? "opacity-100" : "opacity-0"}`}
                />

                <div className="relative flex justify-end">
                  <div
                    ref={(el) => {
                      iconRefs.current[index] = el;
                    }}
                    className={`w-[3vw] h-[3vw] rounded-full flex items-center justify-center border-white/30 border max-[1025px]:w-[7vw] max-[1025px]:h-[7vw] max-md:w-[9vw] max-md:h-[9vw] ${activeIndex === index ? "bg-white text-black" : "text-white"}`}
                  >
                    <ArrowUpRight size={20} />
                  </div>
                </div>

                <div className="relative">
                  <h3 className="text-[2.5vw] font-normal mb-[1vw] max-[1025px]:text-[5vw] max-md:text-[6.5vw]">
                    {service.title}
                  </h3>
                  <ul className="space-y-[0.4vw] list-disc pl-[0.5vw] max-[1025px]:space-y-[1vw] max-md:space-y-[1.8vw]">
                    {service.items.map((item, i) => (
                      <li
                        key={item}
                        className="flex items-center gap-[0.7vw] text-[1.25vw] text-white max-[1025px]:text-[3vw] max-md:text-[4vw]"
                      >
                        <span className="size-1.5 bg-white rounded-full"></span>{" "}
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
