// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { FooterParallax } from "./ParallaxFooter";
import CharStaggerButton from "../char-stagger-button";
import { AppleStoreButton, PlayStoreButton } from "../../Buttons";
import { FadeUp } from "../../Animations/gsapAnim";
import kyntraLogo from "../../../assets/kyntra-logo.png";
import footerImg from "../../../assets/footer.png";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const KYNTRA_PRIMARY = "#134BD6";


const FOOTER_BUTTON_TEXT = "#1A1A1A";


const FOOTER_TRIGGER = "#footer";


const FOOTER_DELAY = 0.5;

const serviceLinks = [
  "Plumbing",
  "Electrical",
  "Cleaning",
  "AC Repair",
  "Painting",
];

const connectLinks = [
  "Linkedin",
  "Twitter",
  "Instagram",
  "Facebook",
  "Youtube",
];

const ParallaxFooter = ({ footerBgColor = KYNTRA_PRIMARY }) => {
  const footerImgRef = useRef<HTMLImageElement | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const el = footerImgRef.current;
    if (!el) return;

    const trigger = document.querySelector(FOOTER_TRIGGER);
    if (!trigger) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: 100 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger,
            start: "top 80%",
            end: "bottom top",
            scrub: 0.2,
            // markers: true,
          },
        },
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <FooterParallax
      footerClassName="text-white"
      footerStyle={{ backgroundColor: footerBgColor }}
    >
      <div className="relative flex h-[80vh] w-full flex-col justify-between px-[5%] pt-[6vw] pb-[2vw] max-md:h-auto max-md:pt-[16vw] max-md:pb-[8vw]">
       
        <div className="pointer-events-none absolute bottom-0 left-1/2 w-[22vw] -translate-x-1/2 max-[1025px]:static max-[1025px]:left-auto max-[1025px]:my-[10vw] max-[1025px]:w-[45vw] max-[1025px]:translate-x-0 max-[1025px]:self-center max-md:w-[62vw]">
          <Image
            ref={footerImgRef}
            src={footerImg}
            height={900}
            width={900}
            alt="Kyntra app"
            className="h-auto w-full object-contain"
          />
        </div>

        {/* Top: brand + link columns */}
        <div className="relative flex justify-between gap-[4vw] max-[1025px]:flex-col max-[1025px]:gap-[10vw]">
          {/* Brand column */}
          <div className="flex w-[34vw] flex-col max-[1025px]:w-full">
            <FadeUp
              watch={FOOTER_TRIGGER}
              delay={FOOTER_DELAY}
              className="w-[20vw] max-[1025px]:w-[42vw] max-md:w-[50vw]"
            >
              <Image
                src={kyntraLogo}
                width={900}
                height={900}
                alt="Kyntra"
                className="h-auto w-full object-contain brightness-0 invert"
              />
            </FadeUp>

            <FadeUp
              as="p"
              watch={FOOTER_TRIGGER}
              delay={FOOTER_DELAY + 0.08}
              className="text-24 mt-[2vw] w-[24vw] leading-normal text-white/90 max-[1025px]:mt-[4vw] max-[1025px]:w-[60vw] max-[1025px]:text-[2.8vw] max-md:w-full max-md:text-[4vw]"
            >
              Home intelligence, maintenance and trusted services managed from
              one app.
            </FadeUp>

            <FadeUp
              watch={FOOTER_TRIGGER}
              delay={FOOTER_DELAY + 0.16}
              className="mt-[2.5vw] flex gap-[1.2vw] max-[1025px]:mt-[6vw] max-[1025px]:flex-col max-[1025px]:items-start max-[1025px]:gap-[3vw] max-md:gap-[4vw]"
            >
              {/* Same components as the hero, so size, padding and type scale
                  match by construction. Only the palette differs: on the blue
                  footer both pills are white. */}
              <AppleStoreButton
                href="#"
                style={{
                  backgroundColor: "#ffffff",
                  borderColor: "#ffffff",
                  color: FOOTER_BUTTON_TEXT,
                }}
              />
              <PlayStoreButton href="#" />
            </FadeUp>
          </div>

          {/* Link columns */}
          <div className="flex gap-[4vw] max-[1025px]:gap-[12vw]">
            <FooterLinkColumn title="Services" links={serviceLinks} />
            <FooterLinkColumn title="Connect" links={connectLinks} />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative flex items-end justify-between">
          <FadeUp
            as="p"
            watch={FOOTER_TRIGGER}
            delay={FOOTER_DELAY + 0.3}
            className="text-22 text-white/90 max-[1025px]:text-[2.4vw] max-md:text-[3.4vw]"
          >
            &copy; 2026 KYNTRA. All Rights Reserved.
          </FadeUp>

          <FadeUp watch={FOOTER_TRIGGER} delay={FOOTER_DELAY + 0.36}>
            <CharStaggerButton
              text="Back To Top"
              href="#"
              showLine
              lineSpansArrow
              showArrow
              icon={ArrowUp}
              iconVariant="single"
              hoverColor="white"
              onClick={(event) => {
                event.preventDefault();
                scrollToTop();
              }}
              className="text-white"
              textClassName="font-aeonik-pro text-22 tracking-tight max-[1025px]:text-[2.6vw] max-md:text-[3.6vw]"
              iconClassName="text-white"
            />
          </FadeUp>
        </div>
      </div>
    </FooterParallax>
  );
};

const FooterLinkColumn = ({
  title,
  links,
}: {
  title: string;
  links: string[];
}) => (
  <div className="flex flex-col">
    <FadeUp
      as="span"
      watch={FOOTER_TRIGGER}
      delay={FOOTER_DELAY}
      className="text-22 tracking-wide text-white max-[1025px]:text-[2.8vw] max-md:text-[4vw]"
    >
      {title.toUpperCase()}
    </FadeUp>

    <div className="mt-[1.4vw] flex flex-col gap-[0.9vw] max-[1025px]:mt-[4vw] max-[1025px]:gap-[2.5vw]">
      {links.map((label, index) => (
        <FadeUp
          key={label}
          watch={FOOTER_TRIGGER}
          delay={FOOTER_DELAY + 0.08 + index * 0.06}
        >
          <CharStaggerButton
            text={label}
            href="#"
            hoverColor="white"
            className="text-white"
            textClassName="font-aeonik-pro text-22 tracking-tight max-[1025px]:text-[2.8vw] max-md:text-[4vw]"
          />
        </FadeUp>
      ))}
    </div>
  </div>
);

function ArrowUp({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

export default ParallaxFooter;
