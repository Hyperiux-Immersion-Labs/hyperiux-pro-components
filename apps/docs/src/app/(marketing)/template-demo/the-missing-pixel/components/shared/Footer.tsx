// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { FadeUp } from "../Animations/gsapAnim";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import PixelButton from "../Buttons/PixelButton";
import UnderlineLink from "../Buttons/UnderlineLink";
import { ArrowRight, LogoMark } from "../Buttons/icons";
import FooterParallax from "../effects/parallax-footer";
import WordmarkPixels from "./WordmarkPixels";
import { ROUTES } from "../../routes";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const COLUMNS = [
  {
    title: "Studio",
    links: [
      { label: "Work", href: ROUTES.work },
      { label: "Services", href: ROUTES.services },
      { label: "About", href: ROUTES.about },
      { label: "Journal", href: ROUTES.blog },
      { label: "Contact", href: ROUTES.contact },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Brand strategy", href: ROUTES.service },
      { label: "Brand identity", href: ROUTES.service },
      { label: "Websites and products", href: ROUTES.service },
      { label: "Motion and 3D", href: ROUTES.service },
      { label: "Packaging", href: ROUTES.service },
    ],
  },
  {
    title: "Elsewhere",
    links: [
      { label: "Instagram", href: "https://www.instagram.com/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/" },
      { label: "Behance", href: "https://www.behance.net/" },
      { label: "Dribbble", href: "https://dribbble.com/" },
    ],
  },
];

const LEGAL = ["Privacy", "Cookies", "Imprint"];

const MARK = [..."missing pixel"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const Footer = () => {
  const lenis = useLenis();
  const markRef = useRef<HTMLDivElement | null>(null);
  const markInnerRef = useRef<HTMLDivElement | null>(null);
  const markProgressRef = useRef(prefersReducedMotion() ? 1 : 0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const inner = markInnerRef.current;
    if (!inner) return;

    const fit = () => {
      inner.style.fontSize = "100px";
      const letters = Array.from(inner.children) as HTMLElement[];
      const textWidth = letters.reduce((total, letter) => total + letter.offsetWidth, 0);
      if (textWidth) {
        const byWidth = Math.floor((inner.clientWidth / textWidth) * 85);
        const byHeight = window.matchMedia("(min-width: 1026px)").matches ? Math.floor(window.innerHeight * 0.27) : byWidth;
        inner.style.fontSize = `${Math.min(byWidth, byHeight)}px`;
      }
      ScrollTrigger.refresh();
    };

    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useGSAP(
    () => {
      const mark = markRef.current;
      const wrapper = document.getElementById("footer");
      if (!mark || !wrapper || prefersReducedMotion()) return;

      gsap.fromTo(
        mark.querySelectorAll("[data-mark-letter]"),
        { yPercent: 100 },
        {
          yPercent: 0,
          ease: "power3.out",
          stagger: 0.03,
          scrollTrigger: {
            trigger: wrapper,
            start: "40% bottom",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
              markProgressRef.current = self.progress;
            },
          },
        },
      );
    },
    { scope: markRef },
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("email") as HTMLInputElement | null;
    if (!input || !EMAIL_PATTERN.test(input.value.trim())) {
      setMessage("Enter a valid email address, like name@studio.com.");
      input?.focus();
      return;
    }
    setMessage("Subscribed. The next issue lands on the first Thursday of the month.");
    event.currentTarget.reset();
  };

  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <FooterParallax data-mpx-inert footerClassName="bg-(--mpx-ink) text-(color:--mpx-paper)">
      <div className="flex h-screen flex-col justify-between gap-[4vh] overflow-hidden max-lg:h-auto max-lg:min-h-screen max-lg:gap-[6vh] max-md:gap-[3vh] px-[5vw] max-lg:px-[6vw] max-md:px-[7vw]">
        <div className="grid grid-cols-12 gap-x-9 gap-y-12 py-[8vh] max-lg:grid-cols-6 max-lg:gap-x-8 max-lg:py-[6vh] max-md:grid-cols-2 max-md:gap-y-5 max-md:py-[3vh]">
          <div className="col-span-5 flex flex-col gap-5 max-lg:col-span-6 max-md:col-span-2 max-md:gap-3">
            <span className="flex items-center gap-2 text-22 font-medium leading-none tracking-tight">
              <LogoMark className="size-[1.4vw] max-lg:size-[4vw] max-md:size-[6.5vw]" />
              <span className="font-mpx-head">
                the missing <b className="font-bold">pixel</b>
              </span>
            </span>
            <p className="w-[70%] text-24 leading-[1.3] text-(color:--mpx-white)/60 max-lg:w-[60%] max-md:w-full">
              A brand and digital studio in Delhi, London, Dubai and New York. One newsletter a month. Zero filler.
            </p>
            <form onSubmit={handleSubmit} noValidate className="flex w-[70%] gap-1 max-lg:w-[60%] max-lg:gap-2 max-md:w-full max-md:flex-col max-md:gap-3">
              <label htmlFor="mpx-newsletter" className="sr-only">
                Email address
              </label>
              <input
                id="mpx-newsletter"
                type="email"
                name="email"
                placeholder="Your email"
                autoComplete="email"
                required
                className="h-[5vh] min-w-0 flex-1 rounded-full border border-(--mpx-white)/15 bg-transparent px-[1.1vw] text-22 text-(color:--mpx-paper) outline-none transition-colors duration-300 placeholder:text-(color:--mpx-white)/60 focus:border-(--mpx-paper) max-lg:h-[5.2vh] max-lg:px-[3vw] max-md:h-[5.8vh] max-md:flex-none max-md:px-[5vw]"
              />
              <PixelButton label="Subscribe" type="submit" size="sm" tone="dark" magnetic={0} />
            </form>
            <p aria-live="polite" className="text-14 text-(color:--mpx-white)/60 empty:hidden">
              {message}
            </p>
          </div>

          <div className="col-span-6 col-start-7 grid grid-cols-3 gap-x-9 max-lg:col-span-6 max-lg:col-start-auto max-lg:gap-x-8 max-md:col-span-2 max-md:grid-cols-2">
            {COLUMNS.map((column, columnIndex) => (
              <div key={column.title} className={`flex flex-col gap-4 max-md:gap-2 ${column.title === "Services" ? "max-md:hidden" : ""}`}>
                <h3 className="mpx-eyebrow text-14 text-(color:--mpx-white)/60">{column.title}</h3>
                <ul className="flex flex-col gap-2 text-22 max-md:gap-1">
                  {column.links.map((link, linkIndex) => (
                    <FadeUp as="li" key={link.label} delay={columnIndex * 0.02 + linkIndex * 0.03}>
                      <UnderlineLink href={link.href}>{link.label}</UnderlineLink>
                    </FadeUp>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div ref={markRef} aria-hidden className="flex flex-col gap-5 overflow-hidden max-md:gap-4">
            <div className="h-px w-full bg-(--mpx-white)/15" />
            <div className="relative">
              <div
                ref={markInnerRef}
                className="font-mpx-head flex justify-center overflow-hidden whitespace-nowrap py-[0.8vw] text-128 font-semibold leading-[1.3] tracking-tighter text-transparent"
              >
                {MARK.map((letter, index) => (
                  <span key={index} data-mark-letter className="inline-block will-change-transform">
                    {letter === " " ? "\u00A0" : letter}
                  </span>
                ))}
              </div>
              <WordmarkPixels innerRef={markInnerRef} progressRef={markProgressRef} />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-(--mpx-white)/15 py-[1.5vw] text-14 text-(color:--mpx-white)/60 max-lg:gap-6 max-lg:py-[3vw] max-md:flex-col max-md:items-start max-md:gap-2 max-md:py-[3vh]">
            <span>© {new Date().getFullYear()} The Missing Pixel. Made with an unreasonable amount of care.</span>
            <nav aria-label="Legal" className="flex gap-5 max-lg:gap-6">
              {LEGAL.map((item) => (
                <span key={item} className="cursor-pointer transition-colors duration-300 hover:text-(color:--mpx-paper)">
                  {item}
                </span>
              ))}
            </nav>
            <button
              type="button"
              onClick={toTop}
              className="group flex items-center gap-2 transition-colors duration-300 hover:text-(color:--mpx-paper)"
            >
              Back to top
              <ArrowRight className="size-[0.7vw] -rotate-90 transition-transform duration-500 group-hover:-translate-y-[0.2vw] max-lg:size-[2vw] max-md:size-[3.3vw]" />
            </button>
          </div>
        </div>
      </div>
    </FooterParallax>
  );
};

export default Footer;
