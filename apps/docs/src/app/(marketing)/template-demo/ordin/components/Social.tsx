// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { useReveal } from "./Animations/useReveal";
import LineReveal from "./Animations/LineReveal";
import DraggableMarquee from "./effects/draggable-marquee";
import Icon from "./Icon";

gsap.registerPlugin(useGSAP, SplitText);

const LOGOS = ["Kestrel", "Monarch Labs", "Fieldnote", "Opaline", "Brightwave", "Atlas Freight", "Northbeam", "Quill & Co"];

const QUOTES = [
  {
    text: "We replaced four internal tools and a pager rotation with one Ordin workflow.",
    name: "Priya Raman",
    role: "Head of Finance Ops, Kestrel",
  },
  {
    text: "Policies on the action, not the prompt, is the reason legal signed off in a week.",
    name: "Daniel Okafor",
    role: "VP Engineering, Atlas Freight",
  },
  {
    text: "Every run is replayable, so when an agent surprises us we know exactly why within minutes.",
    name: "Mei Lindqvist",
    role: "Head of Platform, Northbeam",
  },
];

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("");

const LINE = "border-[#0c1218]/12";

const Social = () => {
  const root = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const quote = QUOTES[index];
  useReveal(root);

  const busy = useRef(false);
  const entering = useRef(false);

  // Masked line split of the quote, name and role, so each line slides through its own window
  const split = () =>
    gsap.utils
      .toArray<HTMLElement>("[data-ord-q-split]", quoteRef.current)
      .map((el) => SplitText.create(el, { type: "lines", mask: "lines", linesClass: "ord-q-line" }));

  const go = (step: number) => {
    const next = (index + step + QUOTES.length) % QUOTES.length;
    if (prefersReducedMotion() || !quoteRef.current) return setIndex(next);
    if (busy.current) return;
    busy.current = true;
    const splits = split();
    gsap
      .timeline({
        onComplete: () => {
          // Hide while React swaps the text, then the new lines rise in from their masks
          gsap.set(quoteRef.current, { autoAlpha: 0 });
          splits.forEach((sp) => sp.revert());
          entering.current = true;
          setIndex(next);
        },
      })
      .to(splits.flatMap((sp) => sp.lines), { yPercent: -105, duration: 0.5, stagger: 0.04, ease: "power3.in" }, 0)
      .to("[data-ord-q-avatar]", { scale: 0.6, opacity: 0, duration: 0.35, ease: "power2.in" }, 0.1);
  };

  useGSAP(
    () => {
      if (!entering.current || !quoteRef.current) return;
      entering.current = false;
      const splits = split();
      gsap.set(quoteRef.current, { autoAlpha: 1 });
      gsap
        .timeline({
          onComplete: () => {
            splits.forEach((sp) => sp.revert());
            busy.current = false;
          },
        })
        .from(splits.flatMap((sp) => sp.lines), { yPercent: 105, duration: 0.9, stagger: 0.07, ease: "expo.out" }, 0)
        .fromTo("[data-ord-q-avatar]", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: "expo.out" }, 0.1);
    },
    { scope: root, dependencies: [index] },
  );

  return (
    <section ref={root} data-ord-orb="social" data-ord-light className="relative bg-ord-bone text-ord-ink">
      <div className="flex items-center justify-between gap-12 ord-container ord-section max-lg:flex-col max-lg:items-start max-md:gap-8">
        <LineReveal className="w-[32%] max-lg:w-[70%] max-md:w-full">
          <h2>Trusted by teams who hand agents real work.</h2>
        </LineReveal>
        <div className="flex w-[58%] flex-col gap-6 max-lg:w-full">
          <div data-ord-reveal className={`border ${LINE}`}>
            <DraggableMarquee
              items={LOGOS.map((title, id) => ({ id, title }))}
              speed={1}
              loopEndMultiplier={-1}
              gapClassName="gap-24 max-md:gap-12"
              className="py-[3.4vh]"
              itemClassName="select-none"
              renderItem={(item) => (
                <span className="text-30 whitespace-nowrap text-[#7d8f8a] transition-colors duration-300 hover:text-ord-primary-deep">
                  {item.title}
                </span>
              )}
            />
          </div>
          <figure
            data-ord-reveal
            className={`flex flex-col gap-10 border ${LINE} bg-white/50 px-[2.4vw] py-[2.4vw] transition-colors duration-500 hover:border-[#73bea1] max-lg:px-[4vw] max-lg:py-[4vw] max-md:gap-6 max-md:px-[5vw] max-md:py-[6vw]`}
          >
            <div className="flex items-start justify-between gap-4">
              <span aria-hidden className="text-64 leading-none text-ord-primary-deep">
                &ldquo;
              </span>
              <span className="ord-label text-14 text-[#4d5f5a]">
                {String(index + 1).padStart(2, "0")} / {String(QUOTES.length).padStart(2, "0")}
              </span>
            </div>
            <div ref={quoteRef} aria-live="polite" className="flex flex-col gap-10 max-md:gap-6">
              <blockquote data-ord-q-split className="text-40">
                {quote.text}
              </blockquote>
              <figcaption className="flex items-center gap-4">
                <span
                  data-ord-q-avatar
                  aria-hidden
                  className="flex h-[5.4vh] aspect-square items-center justify-center bg-ord-ink text-22 text-[#6ef2b1] max-lg:h-[4vh] max-md:h-[6vh]"
                >
                  {initialsOf(quote.name)}
                </span>
                <span className="flex flex-col">
                  <span data-ord-q-split className="text-24 font-medium">
                    {quote.name}
                  </span>
                  <span data-ord-q-split className="text-22 text-[#4d5f5a]">
                    {quote.role}
                  </span>
                </span>
              </figcaption>
            </div>
            <div className={`flex items-center justify-end gap-2 border-t ${LINE} pt-[1.6vw] max-lg:pt-[3vw] max-md:pt-[5vw]`}>
              {[-1, 1].map((step) => (
                <button
                  key={step}
                  type="button"
                  aria-label={step < 0 ? "Previous testimonial" : "Next testimonial"}
                  onClick={() => go(step)}
                  className={`group/btn flex h-[5vh] aspect-square items-center justify-center border ${LINE} text-ord-ink transition-colors duration-300 hover:border-ord-ink hover:bg-ord-ink hover:text-[#6ef2b1] focus-visible:outline-2 focus-visible:outline-[#13605d] max-lg:h-[4vh] max-md:h-[5.6vh]`}
                >
                  <Icon
                    name="arrow"
                    className={`h-[40%] aspect-square transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] ${step < 0 ? "-rotate-135 group-hover/btn:-translate-x-[0.2vw]" : "rotate-45 group-hover/btn:translate-x-[0.2vw]"}`}
                  />
                </button>
              ))}
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
};

export default Social;
