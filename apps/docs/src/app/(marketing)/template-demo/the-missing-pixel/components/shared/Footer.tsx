// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { FadeUp, MaskReveal } from "../Animations/gsapAnim";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import PixelButton from "../Buttons/PixelButton";
import UnderlineLink from "../Buttons/UnderlineLink";
import { ArrowRight, LogoMark } from "../Buttons/icons";
import PixelField from "./PixelField";
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
      if (textWidth) inner.style.fontSize = `${Math.floor((inner.clientWidth / textWidth) * 85)}px`;
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
      if (!mark || prefersReducedMotion()) return;

      gsap.fromTo(
        mark.querySelectorAll("[data-mark-letter]"),
        { yPercent: 100 },
        {
          yPercent: 0,
          ease: "power3.out",
          stagger: 0.03,
          scrollTrigger: {
            trigger: mark,
            start: "50% bottom",
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
    <footer
      data-mpx-inert
      className="overflow-hidden rounded-t-lg bg-(--mpx-ink) text-(color:--mpx-paper)"
    >
      <div className="flex flex-col px-[5vw] max-lg:px-[6vw] max-md:px-[7vw]">
        <div className="flex flex-col gap-11 border-b border-(--mpx-white)/15 py-[6vw] max-lg:gap-10 max-lg:py-[9vw] max-md:gap-8 max-md:py-[17vw]">
          <MaskReveal as="h2" className="w-[40%] leading-none max-lg:w-[70%] max-md:w-full">
            Got a missing pixel? Let’s find it.
          </MaskReveal>
          <FadeUp className="flex flex-wrap items-center justify-between gap-6 max-md:flex-col max-md:items-start">
            <UnderlineLink href="mailto:hello@themissingpixel.studio" className="font-mpx-head text-30">
              hello@themissingpixel.studio
            </UnderlineLink>
            <PixelButton label="Start A Project" href={ROUTES.contact} tone="dark" icon />
          </FadeUp>
          <PixelField />
        </div>

        <div className="grid grid-cols-12 gap-x-9 gap-y-9 py-[4vw] max-lg:grid-cols-6 max-lg:gap-x-8 max-lg:gap-y-12 max-lg:py-[7vw] max-md:grid-cols-2 max-md:gap-y-10 max-md:py-[14vw]">
          <div className="col-span-4 flex flex-col gap-5 max-lg:col-span-6 max-md:col-span-2">
            <span className="flex items-center gap-2 text-22 font-medium leading-none tracking-tight">
              <LogoMark className="size-[1.4vw] max-lg:size-[4vw] max-md:size-[6.5vw]" />
              <span className="font-mpx-head">
                the missing <b className="font-bold">pixel</b>
              </span>
            </span>
            <p className="w-[85%] text-24 leading-[1.3] text-(color:--mpx-white)/60 max-lg:w-[60%] max-md:w-full">
              A brand and digital studio in Delhi, London, Dubai and New York. One newsletter a month. Zero filler.
            </p>
            <form onSubmit={handleSubmit} noValidate className="flex w-[85%] gap-1 max-lg:w-[60%] max-lg:gap-2 max-md:w-full max-md:flex-col max-md:gap-3">
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
            <p aria-live="polite" className="min-h-[1.6vh] text-14 max-lg:min-h-[1.4vh] max-md:min-h-[2.1vh] text-(color:--mpx-white)/60">
              {message}
            </p>
          </div>

          {COLUMNS.map((column, columnIndex) => (
            <div key={column.title} className="col-span-2 flex flex-col gap-3 max-lg:col-span-2 max-lg:gap-4 max-md:col-span-1">
              <h3 className="mpx-eyebrow text-14 text-(color:--mpx-white)/60">{column.title}</h3>
              <ul className="flex flex-col gap-2 text-22">
                {column.links.map((link, linkIndex) => (
                  <FadeUp as="li" key={link.label} delay={columnIndex * 0.02 + linkIndex * 0.03}>
                    <UnderlineLink href={link.href}>{link.label}</UnderlineLink>
                  </FadeUp>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 flex flex-col gap-3 max-lg:col-span-6 max-lg:gap-4 max-md:col-span-2">
            <h3 className="mpx-eyebrow text-14 text-(color:--mpx-white)/60">Studios</h3>
            <ul className="flex flex-col gap-3 text-14 max-lg:grid max-lg:grid-cols-4 max-lg:gap-x-8 max-md:flex max-md:gap-4">
              {STUDIOS.map((studio, studioIndex) => (
                <FadeUp as="li" key={studio.city} delay={COLUMNS.length * 0.02 + studioIndex * 0.03} className="flex flex-col">
                  <strong className="font-medium text-(color:--mpx-paper)">{studio.city}</strong>
                  <span className="text-(color:--mpx-white)/60">{studio.address}</span>
                </FadeUp>
              ))}
            </ul>
          </div>
        </div>

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

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-(--mpx-white)/15 py-[1.5vw] text-14 text-(color:--mpx-white)/60 max-lg:gap-6 max-lg:py-[3vw] max-md:flex-col max-md:items-start max-md:gap-5 max-md:py-[7vw]">
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
    </footer>
  );
};

export default Footer;

const STUDIOS = [
  { city: "Delhi", address: "14 Hauz Khas Village, New Delhi 110016" },
  { city: "London", address: "22 Redchurch Street, London E2 7DJ" },
  { city: "Dubai", address: "Alserkal Avenue, Warehouse 47, Al Quoz, Dubai" },
  { city: "New York", address: "88 Walker Street, New York, NY 10013" },
];