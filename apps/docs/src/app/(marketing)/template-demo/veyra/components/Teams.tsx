// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Lines from "./Animations/Lines";
import { lineIn, useReveal } from "./Animations/scene";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { Icon } from "./Icons";
import AnimatedTabs from "./effects/animated-tabs";
import { teams } from "../content";

type TeamItem = (typeof teams.items)[number];

function TeamPanel({ item, index, animate }: { item: TeamItem; index: number; animate: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!animate || prefersReducedMotion()) return;
      const q = gsap.utils.selector(ref);
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(q("[data-team-step]"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.12 }, 0.2)
        .fromTo(q("[data-team-bar]"), { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, 0.2)
        .fromTo(q("[data-team-point]"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.06 }, 0.3);
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      data-team-card
      className="grid grid-cols-2 items-center gap-10 rounded-md border border-[#e2e4ec] bg-white px-[3vw] py-[3vw] max-lg:grid-cols-1 max-lg:px-[5vw] max-lg:py-[5vw] max-md:gap-8 max-md:px-[6vw] max-md:py-[7vw]"
    >
      <div className="flex flex-col gap-6">
        <span className="font-vey-mono text-14 text-vey-slate">
          {String(index + 1).padStart(2, "0")} / {String(teams.items.length).padStart(2, "0")} {item.label}
        </span>
        <h3 className="text-64">{item.title}</h3>
        <p className="w-[90%] text-28 text-vey-slate max-md:w-full">{item.text}</p>
        <ul className="flex flex-wrap gap-2">
          {item.points.map((p) => (
            <li
              key={p}
              data-team-point
              className="flex items-center gap-2 rounded-md bg-[#f7f7f5] px-[1vw] py-[0.4vw] text-22 max-lg:px-[2vw] max-lg:py-[0.8vw] max-md:px-[3.5vw] max-md:py-[1.6vw]"
            >
              <Icon
                name="check"
                className="h-[0.9vw] w-[0.9vw] text-[#202b4a] max-lg:h-[1.8vw] max-lg:w-[1.8vw] max-md:h-[3.6vw] max-md:w-[3.6vw]"
                strokeWidth={2}
              />
              {p}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-5 rounded-md bg-[#151927] px-[1.8vw] py-[1.8vw] text-[#f5f6fa] max-lg:px-[3.6vw] max-lg:py-[3.6vw] max-md:px-[5vw] max-md:py-[5vw]">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-3">
            <span className="flex h-[4.2vh] aspect-square items-center justify-center rounded-md bg-[#aeb8e8]/15 text-[#aeb8e8]">
              <Icon name="agent" className="h-1/2 w-1/2" />
            </span>
            <span className="text-24 font-medium">{item.demo.title}</span>
          </span>
          <span className="rounded-md bg-[#aeb8e8]/15 px-[0.8vw] py-[0.3vw] text-14 text-[#aeb8e8] max-lg:px-[1.6vw] max-lg:py-[0.6vw] max-md:px-[3vw] max-md:py-[1vw]">
            {item.label}
          </span>
        </div>
        <span className="block h-0.5 w-full overflow-hidden rounded-md bg-white/10">
          <span data-team-bar className="block h-full w-full origin-left bg-[#aeb8e8]" />
        </span>
        <ol className="flex flex-col gap-2">
          {item.demo.steps.map((s, i) => (
            <li
              key={s}
              data-team-step
              className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-white/[0.03] px-[1vw] py-[0.8vw] max-lg:px-[2vw] max-lg:py-[1.6vw] max-md:px-[4vw] max-md:py-[3vw]"
            >
              <span className="flex items-center gap-3 text-22">
                <span className="flex h-[2.6vh] aspect-square items-center justify-center rounded-full bg-[#aeb8e8] text-[#0b1020]">
                  <Icon name="check" className="h-[60%] w-[60%]" strokeWidth={2.4} />
                </span>
                {s}
              </span>
              <span className="font-vey-mono text-14 text-[#f5f6fa]/50">0{i + 1}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

const Teams = () => {
  const ref = useRef<HTMLElement>(null);
  const [changed, setChanged] = useState(false);

  useReveal(ref, (tl, { q }) => {
    lineIn(tl, q("[data-line]"), 0, 1);
    tl.fromTo(q('[role="tab"]'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.05 }, 0.3);
    tl.fromTo(
      q("[data-team-card]"),
      { clipPath: "inset(12% 0% 0% 0% round 6px)" },
      { clipPath: "inset(0% 0% 0% 0% round 6px)", duration: 1.2, ease: "power3.inOut", clearProps: "clipPath" },
      0.5,
    );
  });

  return (
    <section ref={ref} id="teams" aria-labelledby="teams-title" data-vey-tone="light" className="relative bg-vey-paper text-vey-ink">
      <div className="flex flex-col gap-12 vey-container vey-section max-md:gap-8">
        <Lines id="teams-title" lines={teams.heading} className="w-[55%] max-lg:w-[85%] max-md:w-full" />

        <AnimatedTabs
          ariaLabel="Teams"
          onChange={() => setChanged(true)}
          className="gap-8 max-md:gap-6"
          listClassName="gap-2 rounded-md border border-[#e2e4ec] bg-white px-[0.3vw] py-[0.3vw] max-lg:px-[0.6vw] max-lg:py-[0.6vw] max-md:px-[1.2vw] max-md:py-[1.2vw]"
          tabClassName="h-[5vh] px-[1.4vw] max-lg:h-[3.8vh] max-lg:px-[2.8vw] max-md:h-[5vh] max-md:px-[5vw]"
          labelClassName="text-22"
          accentColor="#151927"
          activeTextColor="#f5f6fa"
          tabs={teams.items.map((item, i) => ({
            id: item.label.toLowerCase(),
            label: item.label,
            content: <TeamPanel item={item} index={i} animate={changed} />,
          }))}
        />
      </div>
    </section>
  );
};

export default Teams;
