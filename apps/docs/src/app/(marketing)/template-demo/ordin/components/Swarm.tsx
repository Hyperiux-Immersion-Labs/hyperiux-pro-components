// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isMobile, prefersReducedMotion } from "./Animations/reducedMotion";
import { useResizeKey } from "./Animations/useResizeKey";
import Spotlight from "./Animations/Spotlight";
import LineReveal from "./Animations/LineReveal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const AGENTS = [
  { name: "Planner", role: "Splits the job into nine ordered steps", time: "0.3s", pos: "left-[5vw] top-[45vh]" },
  { name: "Researcher", role: "Pulls the Q3 ledger and 212 contracts", time: "1.1s", pos: "right-[5vw] top-[45vh]" },
  { name: "Analyst", role: "Finds 14 invoices over budget", time: "1.8s", pos: "left-[5vw] top-[65vh]" },
  { name: "Coder", role: "Writes and tests the reconcile script", time: "2.6s", pos: "right-[5vw] top-[65vh]" },
  { name: "Critic", role: "Re-checks every figure against source", time: "3.4s", pos: "left-[5vw] top-[85vh]" },
  { name: "Courier", role: "Drafts 14 vendor emails for sign-off", time: "4.2s", pos: "right-[5vw] top-[85vh]" },
];

const Swarm = () => {
  const root = useRef<HTMLElement>(null);
  const resizeKey = useResizeKey();

  useGSAP(
    () => {
      const section = root.current;
      const stage = section?.querySelector<HTMLElement>("[data-ord-stage]");
      const svg = section?.querySelector<SVGSVGElement>("svg");
      if (!section || !stage || !svg) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-ord-agent]", section);
      const lines = gsap.utils.toArray<SVGPathElement>("[data-ord-wire]", section);
      const packets = gsap.utils.toArray<SVGPathElement>("[data-ord-packet]", section);
      const box = stage.getBoundingClientRect();
      const mobile = isMobile();
      const cx = box.width / 2;
      const cy = box.height * 0.6;
      svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);

      const ends = cards.map((card) => {
        const r = card.getBoundingClientRect();
        const left = r.left - box.left < cx;
        return { x: left ? r.right - box.left : r.left - box.left, y: r.top - box.top + r.height / 2 };
      });
      const lengths: number[] = [];
      // Scroll drives these, and render() turns them into dashes for whatever length the wire has right now
      const wires = cards.map(() => ({ draw: 0, pkt: 0 }));

      // Wires meet at the globe's core wherever the globe really is, so they stay attached while the section scrolls in
      let last = "";
      const route = (ox: number, oy: number) => {
        const key = `${Math.round(ox)},${Math.round(oy)}`;
        if (key === last) return;
        last = key;
        ends.forEach((e, i) => {
          const mid = (ox + e.x) / 2;
          const d = `M${ox} ${oy} C${mid} ${oy} ${mid} ${e.y} ${e.x} ${e.y}`;
          lines[i].setAttribute("d", d);
          packets[i].setAttribute("d", d);
          lengths[i] = lines[i].getTotalLength();
        });
      };

      const render = () => {
        wires.forEach((w, i) => {
          const len = lengths[i];
          lines[i].style.strokeDasharray = `${len} ${len}`;
          lines[i].style.strokeDashoffset = `${len * (1 - w.draw)}`;
          const seg = Math.min(40, len * 0.2);
          packets[i].style.strokeDasharray = `${seg} ${len * 2}`;
          packets[i].style.strokeDashoffset = `${seg - w.pkt * (len + seg)}`;
          packets[i].style.opacity = w.pkt > 0 && w.pkt < 1 ? "1" : "0";
        });
      };

      const orb = document.querySelector<HTMLElement>("[data-ord-orb-intro]");
      // Once the stage has pinned, the wires stay anchored where the core settled, even as the globe moves on
      const follow = () => {
        if (orb) {
          const o = orb.getBoundingClientRect();
          if (section.getBoundingClientRect().top > 0) {
            const b = stage.getBoundingClientRect();
            route(o.left + o.width / 2 - b.left, o.top + o.height / 2 - b.top);
          } else {
            route(cx, cy);
          }
        }
        render();
      };
      route(cx, cy);

      if (prefersReducedMotion()) {
        follow();
        wires.forEach((w) => (w.draw = 1));
        render();
        gsap.set(cards, { opacity: 1 });
        gsap.set("[data-ord-rule]", { scaleX: 1 });
        gsap.set("[data-ord-done]", { opacity: 1 });
        gsap.set("[data-ord-idle]", { opacity: 0 });
        gsap.set("[data-ord-complete]", { opacity: 1 });
        return;
      }

      follow();
      const watch = ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? gsap.ticker.add(follow) : gsap.ticker.remove(follow)),
      });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: { trigger: section, start: "top 50%", end: "bottom bottom", scrub: 0.8 },
      });

      tl.to({}, { duration: 0.4 });

      cards.forEach((card, i) => {
        const at = 0.4 + i * 0.9;
        const idle = card.querySelector("[data-ord-idle]");
        const done = card.querySelector("[data-ord-done]");
        const rule = card.querySelector("[data-ord-rule]");
        if (!mobile) tl.to(wires[i], { draw: 1, duration: 0.5 }, at);
        tl.fromTo(card, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }, at + (mobile ? 0 : 0.45));
        if (!mobile) tl.to(wires[i], { pkt: 1, duration: 0.6, ease: "none" }, at + 0.4);
        tl.to(rule, { scaleX: 1, duration: 0.5, ease: "none" }, at + 0.4)
          .to(idle, { opacity: 0, duration: 0.1 }, at + 0.9)
          .to(done, { opacity: 1, duration: 0.1 }, at + 0.9);
      });

      tl.to("[data-ord-complete]", { opacity: 1, duration: 0.4 }, ">").to({}, { duration: 0.5 });

      return () => {
        watch.kill();
        gsap.ticker.remove(follow);
      };
    },
    { scope: root, dependencies: [resizeKey], revertOnUpdate: true },
  );

  return (
    <section ref={root} data-ord-orb="swarm" className="relative h-[320vh]">
      <div data-ord-stage className="sticky top-0 h-screen overflow-hidden">
        <svg aria-hidden className="absolute inset-0 h-full w-full max-md:hidden">
          {AGENTS.map((a) => (
            <g key={a.name}>
              <path data-ord-wire d="" fill="none" stroke="rgba(115,190,161,0.45)" strokeWidth="1" />
              <path data-ord-packet d="" fill="none" stroke="#6ef2b1" strokeWidth="2" strokeLinecap="round" opacity="0" />
            </g>
          ))}
        </svg>
        <div className="absolute inset-x-0 top-0 flex flex-col items-center gap-5 ord-container pt-[11vh] text-center max-lg:items-start max-lg:gap-4 max-lg:text-left max-md:pt-[11vh]">
          <LineReveal>
            <h2>
              One prompt. <span className="text-ord-stone">Six specialists.</span>
            </h2>
          </LineReveal>
          <LineReveal className="w-[34%] max-lg:hidden" delay={0.15}>
            <p className="text-28 text-ord-ash">
              The core wakes only the agents a job needs, hands each a scoped brief and keeps them in one shared
              memory.
            </p>
          </LineReveal>
        </div>
        <div className="max-md:absolute max-md:inset-x-[5vw] max-md:bottom-[5vh] max-md:grid max-md:grid-cols-2 max-md:gap-px max-md:bg-[#e6ece4]/10">
          {AGENTS.map((a, i) => (
            <Spotlight
              key={a.name}
              data-ord-agent
              className={`absolute flex w-[21vw] -translate-y-1/2 flex-col gap-3 border border-[#e6ece4]/12 bg-transparent px-[1.2vw] py-[1.8vh] opacity-0 max-lg:w-[28vw] max-lg:px-[2vw] max-md:static max-md:w-full max-md:translate-y-0 max-md:gap-2 max-md:border-0 max-md:px-[3vw] max-md:py-[1.6vh] hover:border-[#73bea1]/50 transition-colors duration-500 ${a.pos}`}
            >
              <div className="flex items-center justify-between ord-label text-14 uppercase text-ord-stone">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span className="relative">
                  <span data-ord-idle>Queued</span>
                  <span data-ord-done className="absolute right-0 top-0 whitespace-nowrap text-ord-primary-light opacity-0">
                    Done {a.time}
                  </span>
                </span>
              </div>
              <h3 className="text-30">{a.name}</h3>
              <p className="text-24 text-ord-stone max-md:hidden">{a.role}</p>
              <span className="block h-px w-full bg-[#e6ece4]/10">
                <span data-ord-rule className="block h-px w-full origin-left bg-[#73bea1] [transform:scaleX(0)]" />
              </span>
            </Spotlight>
          ))}
        </div>
        <p
          data-ord-complete
          className="absolute left-1/2 top-[92vh] flex -translate-x-1/2 items-center gap-4 ord-label text-14 whitespace-nowrap uppercase text-ord-primary-light opacity-0 max-md:top-[47vh]"
        >
          <span className="block h-px w-[4vw] bg-[#e6ece4]/30 max-md:w-[8vw]" />
          Run complete / 4.2s / 0 errors
          <span className="block h-px w-[4vw] bg-[#e6ece4]/30 max-md:w-[8vw]" />
        </p>
      </div>
    </section>
  );
};

export default Swarm;
