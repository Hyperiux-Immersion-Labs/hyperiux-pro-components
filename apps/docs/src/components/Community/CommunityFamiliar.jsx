"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import LineReveal from "@/components/Animations/LineReveal";
import { useFadeUp } from "@/components/Animations/gsapAnimations";
import { useSectionOverlay } from "@/components/Animations/useSectionOverlay";
import { useInteraction } from "@/homepage/components/InteractionProvider";
import { prefersReducedMotion } from "@/lib/motion";
import { MEDIA } from "@/lib/breakpoints";
import { useCommunity } from "./community-store";
import { CritiqueCard, FeaturedCard, TeardownCard, VoteCard } from "./WhyJoinPanels";
import { buttonId } from "@/lib/button-id";

const FAMILIAR = [
  { text: "You’ve rebuilt the same scroll reveal six times this year." },
  { text: "You spent an hour on one easing curve. Nobody noticed.", em: "You", after: " did." },
  { text: "Someone called your page transition “just an animation.”" },
  { text: "You shipped something beautiful, with nobody around who’d really get it." },
];

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SPY_OFFSET = 140;

const PANELS = [
  {
    nav: "See how it’s built",
    title: "Monthly live teardowns.",
    text: "We take a Vault effect or an award-winning site apart, frame by frame: the timing, the easing, the performance trade-offs, and the code. Drag the timeline above. That’s the idea, live, with the people who built it.",
    Card: TeardownCard,
  },
  {
    nav: "Get it first",
    title: "New effects land here first.",
    text: "Members get new effects before they hit the public catalog. Test them, break them, tell us what’s missing, and vote on what we build next. The roadmap has your fingerprints on it.",
    Card: VoteCard,
  },
  {
    nav: "Get real critique",
    title: "Critique from people who care.",
    text: "Share work in progress and get specific, kind, useful feedback from developers who can tell 0.4s from 0.6s, and who’ll tell you which one is right.",
    Card: CritiqueCard,
  },
  {
    nav: "Get seen",
    title: "Get seen for the details.",
    text: "Standout work gets featured across Vault and our channels. And when studios ask us for motion-literate developers, the community is where we’ll look first.",
    Card: FeaturedCard,
  },
];

export default function CommunityFamiliar() {
  const rootRef = useRef(null);
  const lenis = useLenis();
  const { sound } = useInteraction() ?? {};
  const { joined } = useCommunity();
  const [lit, setLit] = useState(-1);
  const [spy, setSpy] = useState(0);
  // The sound object can change identity between renders; read it from a ref so the
  // scroll triggers below are built once, not torn down and rebuilt (which re-fired
  // enter / leave-back and flashed the lines)
  const soundRef = useRef(sound);
  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  useFadeUp(rootRef);
  useSectionOverlay(rootRef);

  useGSAP(() => {
    const root = rootRef.current;
    root.querySelectorAll("[data-fam]").forEach((li, i) => {
      ScrollTrigger.create({
        trigger: li,
        start: "top 62%",
        end: "max",
        // Lines stay lit once reached, and go dark again only when scrolled back above them
        onEnter: () => { setLit((cur) => Math.max(cur, i)); soundRef.current?.note?.(i); },
        onLeaveBack: () => setLit((cur) => Math.min(cur, i - 1)),
      });
    });
    root.querySelectorAll("[data-panel]").forEach((panel, i) => {
      ScrollTrigger.create({
        trigger: panel,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => { if (self.isActive) setSpy(i); },
      });
    }); 
    if (prefersReducedMotion()) return;

    const list = root.querySelector("[data-fam-list]");
    const rows = gsap.utils.toArray("[data-fam]", root);
    if (list && rows.length) {
      // The line nearest the scroll position leans right, its neighbours less (impact
      // lines either side). One quickTo per row, made once: scrolling only retargets
      // them, rather than starting a new tween per row on every frame
      const impact = 3;
      const moveTo = rows.map((row) => gsap.quickTo(row, "x", { duration: 0.8, ease: "power3.out" }));
      const settle = () => moveTo.forEach((to) => to(0));
      ScrollTrigger.create({
        trigger: list,
        start: "top 62%",
        end: "bottom 62%",
        onUpdate: ({ progress }) => {
          const p = progress < 0.1 ? 0 : progress > 0.9 ? 1 : (progress - 0.1) / 0.8;
          const current = p * (rows.length - 1);
          // The lean grows in over the first 15% of the scroll and out over the last 15%,
          // so entering or leaving the list never snaps a line sideways
          const ramp = Math.min(1, progress / 0.15, (1 - progress) / 0.15);
          const shift = list.offsetWidth * 0.04 * Math.max(0, ramp);
          moveTo.forEach((to, i) => to(shift * (1 - Math.min(Math.abs(i - current) / impact, 1))));
        },
        onLeave: settle,
        onLeaveBack: settle,
      });
    }

    root.querySelectorAll("[data-panel] > :first-child").forEach((card) => {
      gsap.from(card, { opacity: 0, y: 60, duration: 2, ease: "expo.out", scrollTrigger: { trigger: card, start: "top 90%" } });
    });
  }, { scope: rootRef });

  // Desktop: once scrolling stops inside the panels, ease to the nearest one. Done with
  // Lenis (the page's smooth scroll), not ScrollTrigger's snap, which scrolls the page
  // natively underneath Lenis - the two fought, so the page jumped and lagged
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(`(not ${MEDIA.tablet})`, () => {
      if (prefersReducedMotion() || !lenis) return;
      const panels = [...rootRef.current.querySelectorAll("[data-panel]")];
      if (panels.length < 2) return;
      const onScrollEnd = () => {
        const tops = panels.map((panel) => window.scrollY + panel.getBoundingClientRect().top - SPY_OFFSET);
        const last = panels.at(-1);
        const y = window.scrollY;
        if (y < tops[0] - window.innerHeight * 0.25 || y > tops.at(-1) + last.offsetHeight * 0.5) return;
        const nearest = tops.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a));
        // close enough already, or too far to be a nudge
        if (Math.abs(nearest - y) < 4 || Math.abs(nearest - y) > window.innerHeight * 0.45) return;
        lenis.scrollTo(nearest, { duration: 0.7, easing: (t) => 1 - Math.pow(1 - t, 3) });
      };
      ScrollTrigger.addEventListener("scrollEnd", onScrollEnd);
      return () => ScrollTrigger.removeEventListener("scrollEnd", onScrollEnd);
    });
    return () => mm.revert();
  }, { scope: rootRef, dependencies: [lenis] });

  const goToPanel = (i) => {
    const panel = rootRef.current.querySelector(`[data-panel="${i}"]`);
    if (!panel) return;
    sound?.note?.(i);
    const top = panel.getBoundingClientRect().top + window.scrollY - SPY_OFFSET;
    if (lenis) lenis.scrollTo(top);
    else window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <div ref={rootRef} className="relative z-1 bg-light text-ink" data-zone="sheet" data-sound-flow="off">
      <section id="familiar" className="px-[calc(var(--cvw)*7.5)] py-[10%] max-lg:px-[6vw] max-md:px-[7vw] max-md:py-[12%]" aria-labelledby="fam-h">
        <div className="site-container flex flex-col gap-[calc(var(--cvw)*7)] max-lg:gap-[8vw] max-md:gap-[10vw]">
        <ol data-fam-list className="flex flex-col px-[calc(var(--cvw)*1)]">
          {FAMILIAR.map((item, i) => (
            <li
              key={item.text}
              data-fam
              className="flex items-baseline gap-[calc(var(--cvw)*1)] border-t border-black/10 py-[calc(var(--cvw)*3)] last:border-b max-lg:gap-[3vw] max-lg:py-[4vw] max-md:gap-[4vw] max-md:py-[6vw]"
            >
              <span className={`type-label w-[calc(var(--cvw)*5)] shrink-0 transition-colors duration-500 max-lg:w-[8vw] max-md:w-[11vw] ${lit >= i ? "text-primary" : "text-black/20"}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className={`type-h2 text-[calc(var(--cvw)*2.2)] max-lg:text-[3.2vw] max-md:text-[5vw] font-avenir min-w-0 flex-1 tracking-tight transition-colors duration-500 ${lit >= i ? "text-ink" : "text-black/20"}`}>
                {item.text}
                {item.em && <> <em className=" not-italic">{item.em}</em>{item.after}</>}
              </p>
            </li>
          ))}
        </ol>
        <LineReveal as="h2" id="fam-h" className="type-h1 w-[60%] max-lg:w-[88%] max-md:w-full">
          You’re Not the Only One. <span className="gradient-text-animate gradient-text-single">There’s a Room for This.</span>
        </LineReveal>
        </div>
      </section>

      <section id="why" className="section-x mt- pb-[calc(var(--cvw)*10)] max-md:mt-0 max-md:py-[12%]">
        <div className="site-container flex justify-between gap-[calc(var(--cvw)*2)] max-lg:flex-col max-lg:gap-[6vw] max-md:gap-[2vw]">
        <div className="sticky top-[35vh] flex w-[32%] flex-col items-start gap-[calc(var(--cvw)*1)] self-start max-lg:hidden">
          {PANELS.map((p, i) => (
            <button
              id={buttonId("community-familiar-go-to-panel", p.nav)}
              key={p.nav}
              type="button"
              aria-current={spy === i ? "true" : undefined}
              onClick={() => goToPanel(i)}
              className={`type-h2 cursor-pointer text-left transition-colors duration-300 ${spy === i ? "text-ink" : "text-black/20 hover:text-black/40"}`}
            >
              {p.nav}
            </button>
          ))}
        </div>
        <div className="flex w-[66%] flex-col gap-[calc(var(--cvw)*14)] max-lg:w-full max-lg:gap-[12vw] max-md:gap-[16vw]">
          {PANELS.map(({ title, text, Card }, i) => (
            <article key={title} data-panel={i} className="flex flex-col gap-[calc(var(--cvw)*1.8)] max-lg:gap-[4vw] max-md:gap-[6vw]">
              <Card joined={joined} />
              <div className="flex flex-col gap-[calc(var(--cvw)*1)] max-lg:gap-[1.5vw] max-md:gap-[3vw]">
                <LineReveal as="h3" className="type-h3">{title}</LineReveal>
                <p data-fadeup-delay="0.15" className="fadeup type-body max-w-[52ch] text-black/60">{text}</p>
              </div>
            </article>
          ))}
        </div>
        </div>
      </section>
    </div>
  );
}
