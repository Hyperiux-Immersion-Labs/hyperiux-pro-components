// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import Image from "next/image";
import Link from "next/link";
import { FooterParallax } from "./ParallaxFooter";
import CharStaggerButton from "../char-stagger-button";
import { GooglePlay } from "../../Buttons/icons";
import { FadeUp } from "../../Animations/gsapAnim";
import kyntraLogo from "../../../assets/kyntra-logo.png";
import footerImg from "../../../assets/footer.png";

const KYNTRA_PRIMARY = "#134BD6";

// The footer itself is `position: fixed`, so it is always "in view" and cannot
// cue its own reveal. Its outer wrapper scrolls normally - watch that instead.
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
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <FooterParallax
      footerClassName="text-white"
      footerStyle={{ backgroundColor: footerBgColor }}
    >
      <div className="relative flex h-[80vh] w-full flex-col justify-between px-[5%] pt-[6vw] pb-[2vw] max-md:h-auto max-md:pt-[16vw] max-md:pb-[8vw]">
       
        <div className="pointer-events-none absolute bottom-0 left-1/2 w-[22vw] -translate-x-1/2 max-[1025px]:static max-[1025px]:left-auto max-[1025px]:my-[10vw] max-[1025px]:w-[45vw] max-[1025px]:translate-x-0 max-[1025px]:self-center max-md:w-[62vw]">
          <FadeUp watch={FOOTER_TRIGGER} delay={FOOTER_DELAY + 0.15}>
            <Image
              src={footerImg}
              height={900}
              width={900}
              alt="Kyntra app"
              className="h-auto w-full object-contain"
            />
          </FadeUp>
        </div>

        {/* Top: brand + link columns */}
        <div className="relative flex justify-between gap-[4vw] max-[1025px]:flex-col max-[1025px]:gap-[10vw]">
          {/* Brand column */}
          <div className="flex w-[28vw] flex-col max-[1025px]:w-full">
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
              className="mt-[2.5vw] flex gap-[1.2vw] max-[1025px]:mt-[6vw] max-[1025px]:gap-[3vw]"
            >
              <StoreButton
                href="#"
                topLine="Download on the"
                mainLine="App Store"
                icon={
                  <AppleGlyph className="h-[2vw] w-[2vw] max-[1025px]:h-[5vw] max-[1025px]:w-[5vw] max-md:h-[7vw] max-md:w-[7vw]" />
                }
              />
              <StoreButton
                href="#"
                topLine="Get it on"
                mainLine="Google Play"
                icon={
                  <GooglePlay className="h-[2vw] w-[2vw] max-[1025px]:h-[5vw] max-[1025px]:w-[5vw] max-md:h-[7vw] max-md:w-[7vw]" />
                }
              />
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

const StoreButton = ({
  href,
  topLine,
  mainLine,
  icon,
}: {
  href: string;
  topLine: string;
  mainLine: string;
  icon: React.ReactNode;
}) => (
  <Link
    href={href}
    className="group flex items-center gap-[0.9vw] rounded-full bg-white px-[1.6vw] py-[0.9vw] text-black transition-transform duration-300 hover:scale-[0.97] max-[1025px]:gap-[2.5vw] max-[1025px]:px-[4vw] max-[1025px]:py-[2.5vw] max-md:gap-[3vw] max-md:px-[6vw] max-md:py-[3.5vw]"
  >
    {icon}
    <span className="flex flex-col text-left leading-none">
      <span className="text-[0.8vw] max-[1025px]:text-[1.8vw] max-md:text-[2.6vw]">
        {topLine}
      </span>
      <span className="mt-[0.3vw] text-28 font-light max-[1025px]:text-[3vw] max-md:text-[4.4vw]">
        {mainLine}
      </span>
    </span>
  </Link>
);

function AppleGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 41"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M10.8273 40.982C6.85125 40.4749 2.91537 33.233 1.6989 29.8163C-0.754111 22.9267 -0.555913 13.6941 7.14735 10.3648C11.267 8.58502 12.9465 10.2123 16.6713 11.0838C19.7189 11.7971 20.8415 10.6288 23.54 9.94513C27.7969 8.86587 31.4038 10.4659 34.124 13.7245C27.4165 17.3627 28.2454 27.3184 35.253 30.0659C35.3132 30.3499 33.8849 33.034 33.6297 33.481C32.2014 35.9862 29.1225 40.6121 26.0404 40.982H24.7597C23.3443 40.7245 22.1214 39.8603 20.7404 39.5176C19.3594 39.175 17.7722 39.2039 16.4474 39.5152C15.0031 39.8546 13.7336 40.6908 12.27 40.982C11.8134 40.9411 11.2726 41.0382 10.8289 40.982H10.8273Z" />
      <path d="M25.4777 -0.00415039C25.9263 3.14937 24.2235 6.59257 21.6598 8.38679C20.3984 9.26945 18.7983 9.97157 17.2264 9.80788C16.9022 8.21667 17.3572 6.48986 18.0986 5.06636C19.5165 2.34213 22.3932 0.293549 25.4777 -0.00415039Z" />
    </svg>
  );
}

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
