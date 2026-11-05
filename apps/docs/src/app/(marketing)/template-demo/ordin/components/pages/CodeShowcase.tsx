// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import LineReveal from "../Animations/LineReveal";
import { OrdButton } from "../Buttons";
import Icon from "../Icon";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// A tiny highlighter: keywords, strings and comments in three greens, everything else plain.
// Works for the TypeScript, YAML and shell snippets the pages use.
const KEYWORDS = "import|from|const|new|await|export|npm|npx";
const TOKEN = new RegExp(`(\\/\\/.*$|#.*$|"[^"]*"|\\b(?:${KEYWORDS})\\b|^\\s*[\\w-]+(?=:))`, "g");
const paint = (line: string) =>
  line.split(TOKEN).map((part, i) => {
    if (!part) return null;
    const color = /^(\/\/|#)/.test(part)
      ? "text-ord-stone"
      : part.startsWith('"')
        ? "text-ord-primary"
        : new RegExp(`^(${KEYWORDS})$`).test(part) || /^\s*[\w-]+$/.test(part)
          ? "text-ord-primary-light"
          : "";
    return (
      <span key={i} className={color}>
        {part}
      </span>
    );
  });

type CodeShowcaseProps = {
  orb: string;
  chapter: string;
  id?: string;
  heading: React.ReactNode;
  copy: string;
  points: string[];
  cta: string;
  ctaHref: string;
  file: string;
  lang: string;
  code: string[];
  run: { label: string; meta: string };
};

// Dark section: copy and points on the left, a code card on the right whose lines write in on scroll
const CodeShowcase = ({ orb, chapter, id, heading, copy, points, cta, ctaHref, file, lang, code, run }: CodeShowcaseProps) => {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-pl-code]", {
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-pl-code]", start: "top 85%", once: true },
      });
      // The code types itself as you scroll: each line wipes open in steps, one character at a time,
      // with the caret riding the end of the line being written
      const lines = gsap.utils.toArray<HTMLElement>("[data-pl-type]", root.current);
      const caret = root.current?.querySelector<HTMLElement>("[data-pl-caret]");
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: "[data-pl-code]", start: "top 70%", end: "bottom 55%", scrub: 0.6 },
      });
      gsap.set(lines, { clipPath: "inset(0% 100% 0% 0%)" });
      if (caret && lines[0]) gsap.set(caret, { top: lines[0].offsetTop, left: lines[0].offsetLeft, height: lines[0].offsetHeight });
      lines.forEach((line) => {
        const chars = Math.max(1, line.textContent?.length ?? 1);
        const dur = 0.15 + chars * 0.02;
        tl.to(line, { clipPath: "inset(0% 0% 0% 0%)", duration: dur, ease: `steps(${chars})` });
        if (caret) {
          tl.set(caret, { top: line.offsetTop, height: line.offsetHeight }, `<`);
          tl.fromTo(caret, { left: line.offsetLeft }, { left: line.offsetLeft + line.offsetWidth, duration: dur, ease: `steps(${chars})` }, "<");
        }
      });
      tl.fromTo("[data-pl-run]", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" })
        .fromTo("[data-pl-tick]", { scale: 0 }, { scale: 1, duration: 0.4, ease: "back.out(2.4)" }, "<0.1");
      gsap.from("[data-pl-point]", {
        opacity: 0,
        y: 16,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-pl-points]", start: "top 85%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id={id} data-ord-orb={orb} data-ord-chapter={chapter} className="relative ord-section">
      <div className="flex items-center justify-between gap-16 ord-container max-lg:flex-col max-lg:items-start max-md:gap-10">
        <div className="flex w-[38%] flex-col gap-10 max-lg:w-full max-md:gap-6">
          <LineReveal>
            <h2>{heading}</h2>
          </LineReveal>
          <LineReveal delay={0.15}>
            <p className="text-28 text-ord-ash">{copy}</p>
          </LineReveal>
          <ul data-pl-points className="flex flex-col">
            {points.map((p) => (
              <li key={p} data-pl-point className="flex items-center gap-3 border-t border-(--ord-bone)/10 py-[1.6vh] text-24 last:border-b">
                <Icon name="check" className="h-[1.8vh] aspect-square shrink-0 text-ord-primary-light" />
                {p}
              </li>
            ))}
          </ul>
          <div>
            <OrdButton href={ctaHref}>{cta}</OrdButton>
          </div>
        </div>
        <div data-pl-code className="w-[54%] border border-(--ord-bone)/12 max-lg:w-full">
          <div className="flex items-center justify-between border-b border-(--ord-bone)/12 px-[1.4vw] py-[1.6vh] ord-label text-14 uppercase text-ord-stone max-lg:px-[3vw] max-md:px-[4vw]">
            <span>{file}</span>
            <span className="flex items-center gap-2 text-ord-primary-light">
              <span className="h-[0.6vh] aspect-square rounded-full bg-(--ord-primary-light)" />
              {lang}
            </span>
          </div>
          <pre className="relative overflow-x-auto px-[1.4vw] py-[2.4vh] text-22 leading-[1.9] max-lg:px-[3vw] max-md:px-[4vw]">
            <span data-pl-caret aria-hidden className="absolute block w-[0.5ch] bg-(--ord-primary-light)/70" />
            <code>
              {code.map((line, i) => (
                <span key={i} data-pl-code-line className="flex gap-6 max-md:gap-3">
                  <span aria-hidden className="w-[2ch] shrink-0 text-right text-(--ord-stone)/50 select-none">
                    {i + 1}
                  </span>
                  <span data-pl-type className="inline-block whitespace-pre text-ord-bone">
                    {line ? paint(line) : " "}
                  </span>
                </span>
              ))}
            </code>
          </pre>
          <div
            data-pl-run
            className="flex items-center justify-between gap-4 border-t border-(--ord-bone)/12 px-[1.4vw] py-[1.8vh] ord-label text-14 uppercase max-lg:px-[3vw] max-md:px-[4vw]"
          >
            <span className="flex items-center gap-3 text-ord-bone">
              <span data-pl-tick className="flex h-[2.4vh] aspect-square items-center justify-center bg-(--ord-primary) text-ord-ink">
                <Icon name="check" className="h-[70%] aspect-square" />
              </span>
              {run.label}
            </span>
            <span className="text-ord-stone">{run.meta}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CodeShowcase;
