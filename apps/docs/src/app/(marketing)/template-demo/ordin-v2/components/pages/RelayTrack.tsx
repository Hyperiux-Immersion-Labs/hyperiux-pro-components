// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isMobile, prefersReducedMotion } from "../Animations/reducedMotion";
import { useResizeKey } from "../Animations/useResizeKey";
import LineReveal from "../Animations/LineReveal";
import Icon from "../Icon";
import { AGENT_TOUR } from "./content";
import { THEME, alpha } from "../../theme";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Agents page signature: the job is handed down a relay. The track scrolls sideways under a fixed
// handoff point; each specialist lights up, runs and settles as it reaches it, and a packet rides the rail.
const RelayTrack = () => {
  const root = useRef<HTMLElement>(null);
  const resizeKey = useResizeKey();

  useGSAP(
    () => {
      const section = root.current;
      const track = section?.querySelector<HTMLElement>("[data-rt-track]");
      if (!section || !track) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-rt-card]", section);
      const nodes = gsap.utils.toArray<HTMLElement>("[data-rt-node]", section);
      const rail = section.querySelector<HTMLElement>("[data-rt-rail]");
      const packet = section.querySelector<HTMLElement>("[data-rt-packet]");
      const handoff = window.innerWidth * (isMobile() ? 0.5 : 0.38);

      if (prefersReducedMotion()) {
        gsap.set(nodes, { backgroundColor: THEME.primaryLight, borderColor: THEME.primaryLight });
        gsap.set("[data-rt-done]", { yPercent: -200 });
        return;
      }

      // Opens with the first card at the handoff point and stops once the last card is fully on screen
      const from = handoff - (cards[0].offsetLeft + cards[0].offsetWidth / 2);
      const to = Math.min(window.innerWidth - track.scrollWidth, from);
      gsap.set(track, { x: from });
      // The travel ends early so the last specialist has room to run and settle before the pin lets go
      const TRAVEL = 0.86;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.8 },
      });
      tl.to(track, { x: to, duration: TRAVEL }, 0);
      if (rail) tl.fromTo(rail, { scaleX: 0 }, { scaleX: 1, duration: TRAVEL }, 0);
      if (packet) tl.fromTo(packet, { left: "0%" }, { left: "100%", duration: TRAVEL }, 0);
      tl.to({}, { duration: 1 - TRAVEL }, TRAVEL);

      cards.forEach((card, i) => {
        // Each card runs as the packet reaches its node; the nodes sit evenly along the rail
        const hit = cards.length > 1 ? (i / (cards.length - 1)) * TRAVEL : 0;
        // Lights a touch early so the first card is already running as the stage pins
        const t = Math.max(hit - 0.04, 0);
        const state = card.querySelectorAll("[data-rt-state] > span");
        // The node fills only once the beam's head actually reaches it
        tl.to(nodes[i], { backgroundColor: THEME.primaryLight, borderColor: THEME.primaryLight, scale: 1.4, duration: 0.02 }, hit)
          .to(nodes[i], { scale: 1, duration: 0.04 }, hit + 0.02)
          .to(card, { borderColor: alpha(THEME.primaryLight, 0.55), backgroundColor: alpha(THEME.primary, 0.07), duration: 0.04 }, t)
          .to(state, { yPercent: -100, duration: 0.03, ease: "expo.out" }, t)
          .fromTo(card.querySelector("[data-rt-bar]"), { scaleX: 0 }, { scaleX: 1, duration: 0.1 }, t)
          .to(state, { yPercent: -200, duration: 0.03, ease: "expo.out" }, t + 0.1)
          .to(card, { borderColor: alpha(THEME.bone, 0.12), backgroundColor: alpha(THEME.primary, 0), duration: 0.05 }, t + 0.12)
          .fromTo(card.querySelectorAll("[data-rt-cap]"), { opacity: 0.25, x: -8 }, { opacity: 1, x: 0, duration: 0.04, stagger: 0.012 }, t + 0.02);
      });
    },
    { scope: root, dependencies: [resizeKey], revertOnUpdate: true },
  );

  return (
    <section ref={root} data-ord-orb="agents-relay" data-ord-chapter="Relay" className="relative h-[240vh] max-md:h-[420vh] motion-reduce:h-auto!">
      <div className="sticky top-0 flex h-screen flex-col justify-center gap-[7vh] overflow-hidden max-md:gap-[5vh] motion-reduce:static motion-reduce:h-auto motion-reduce:py-[14vh]">
        <div className="flex items-end justify-between gap-10 ord-container max-lg:flex-col max-lg:items-start max-lg:gap-4">
          <LineReveal className="w-[46%] max-lg:w-full">
            <h2>
              One job, <span className="text-ord-stone">handed down the line.</span>
            </h2>
          </LineReveal>
          <LineReveal className="w-[28%] max-lg:w-[70%] max-md:hidden" delay={0.15}>
            <p className="text-28 text-ord-ash">
              Every specialist picks up exactly where the last one stopped, from the same shared memory.
            </p>
          </LineReveal>
        </div>

        <div className="relative">
          {/* The rail: fills as the job moves, with one node per specialist and a packet riding the front */}
          <div className="relative mb-[5vh] h-px w-full bg-(--ord-bone)/10 ord-container max-md:mb-[3vh]">
            <span data-rt-rail className="absolute inset-x-[5vw] top-0 block h-px origin-left bg-(--ord-primary-light)/60 [transform:scaleX(0)]" />
            <span className="absolute inset-x-[5vw] top-0 block">
              <span data-rt-packet className="absolute top-0 block h-px w-[6vw] -translate-x-full bg-[linear-gradient(90deg,transparent,var(--ord-primary-light))] max-md:w-[12vw]" />
            </span>
            <span className="absolute inset-x-[5vw] top-0 flex -translate-y-1/2 justify-between">
              {AGENT_TOUR.map((a) => (
                <span key={a.name} data-rt-node className="block h-[1.2vh] aspect-square rounded-full border border-(--ord-bone)/30 bg-transparent max-md:h-[1.4vh]" />
              ))}
            </span>
          </div>

          <div data-rt-track className="flex w-max gap-[2vw] px-[5vw] will-change-transform max-md:gap-[4vw] motion-reduce:grid motion-reduce:w-auto motion-reduce:grid-cols-3 max-lg:motion-reduce:grid-cols-2 max-md:motion-reduce:grid-cols-1">
            {AGENT_TOUR.map((a, i) => (
              <article
                key={a.name}
                data-rt-card
                className="flex w-[30vw] shrink-0 flex-col gap-6 motion-reduce:w-auto border border-(--ord-bone)/12 px-[1.8vw] py-[3vh] max-lg:w-[48vw] max-md:w-[78vw] max-md:gap-4 max-md:px-[5vw]"
              >
                <div className="flex items-center justify-between ord-label text-14 uppercase text-ord-stone">
                  <span>
                    {String(i + 1).padStart(2, "0")} / {a.name}
                  </span>
                  <span data-rt-state className="relative block h-[1.3em] overflow-hidden text-right">
                    <span className="block">Queued</span>
                    <span className="block text-(--ord-primary-light)">Running</span>
                    <span data-rt-done className="block text-ord-primary">
                      Done
                    </span>
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-40">{a.title}</h3>
                  <p className="text-24 text-ord-stone">{a.body}</p>
                </div>
                <ul className="flex flex-col">
                  {a.caps.map((c) => (
                    <li key={c} data-rt-cap className="flex items-center gap-3 border-t border-(--ord-bone)/10 py-[1.2vh] text-22">
                      <Icon name="check" className="h-[1.6vh] aspect-square shrink-0 text-ord-primary-light" />
                      {c}
                    </li>
                  ))}
                </ul>
                <span className="mt-auto block h-px w-full bg-(--ord-bone)/10">
                  <span data-rt-bar className="block h-px w-full origin-left bg-(--ord-primary-light) [transform:scaleX(0)]" />
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RelayTrack;
