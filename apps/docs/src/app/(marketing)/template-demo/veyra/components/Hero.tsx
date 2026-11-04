// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ParticleField, { type FieldState } from "./ParticleField";
import Lines from "./Animations/Lines";
import AsciiBand from "./effects/ascii-band";
import ScrambleText from "./effects/scramble-text";
import TypingText from "./effects/typing-text";
import { VeyButton } from "./Buttons";
import { Arrow, Icon, Mark } from "./Icons";
import { hero, intro } from "../content";
import { prefersReducedMotion } from "./Animations/reducedMotion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STEP_ICONS = ["search", "spark", "chat"] as const;

const Hero = () => {
  const ref = useRef<HTMLElement>(null);
  const field = useRef<FieldState>({ order: 0, intensity: 0 });
  const [typing, setTyping] = useState(false);

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);
      const header = document.querySelector(".vey-header");
      const shown = [q("[data-hero-copy]"), q("[data-hero-light]"), q("[data-hero-badge]"), header];

      if (prefersReducedMotion()) {
        gsap.set(shown, { opacity: 1 });
        gsap.set(q("[data-intro]"), { autoAlpha: 0 });
        gsap.set(q("[data-step-bar]"), { scaleX: 1 });
        gsap.set(q("[data-step-done]"), { autoAlpha: 1 });
        gsap.set(q("[data-step-wait]"), { autoAlpha: 0 });
        field.current.order = 0.45;
        field.current.intensity = 0.6;
        setTyping(true);
        return;
      }

      const count = { v: 0 };
      const counter = q("[data-intro-count]")[0];
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.set(q("[data-hero-copy]"), { opacity: 1 })
        .set(q("[data-line]"), { y: 0, yPercent: 115 })
        .set(q("[data-hero-fade]"), { autoAlpha: 0, y: 24 })
        .set(q("[data-hero-card]"), { autoAlpha: 0, y: 60, rotateX: 14 })
        .set(q("[data-hero-badge]"), { autoAlpha: 0, y: 30 })
        .to(field.current, { intensity: 0.7, duration: 1.4, ease: "power1.out" }, 0)
        .fromTo(q("[data-intro-label]"), { yPercent: 110 }, { yPercent: 0, duration: 0.7 }, 0.1)
        .fromTo(q("[data-intro-bar]"), { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: "power2.inOut" }, 0.25)
        .to(
          count,
          {
            v: 100,
            duration: 1.3,
            ease: "power2.inOut",
            onUpdate: () => {
              if (counter) counter.textContent = String(Math.round(count.v)).padStart(3, "0");
            },
          },
          0.25,
        )
        .to(field.current, { order: 0.45, duration: 2.2, ease: "power2.inOut" }, 0.3)
        .to(q("[data-intro-label]"), { yPercent: -110, duration: 0.5, ease: "power2.in" }, 1.6)
        .to(q("[data-intro-bar]"), { scaleY: 40, autoAlpha: 0, duration: 0.7, ease: "power2.in" }, 1.6)
        .set(q("[data-intro]"), { autoAlpha: 0 }, 2.3)
        .fromTo(q("[data-hero-light]"), { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 2.2, ease: "power2.out" }, 1.7)
        .to(q("[data-line]"), { y: 0, yPercent: 0, duration: 1.1, stagger: 0.12 }, 2.05)
        .to(q("[data-hero-fade]"), { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 }, 2.4)
        .fromTo(header, { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 2.3)
        .to(q("[data-hero-card]"), { autoAlpha: 1, y: 0, rotateX: 0, duration: 1.2 }, 2.6)
        .to(q("[data-hero-badge]"), { autoAlpha: 1, y: 0, duration: 1, stagger: 0.15 }, 3)
        .call(() => setTyping(true), [], 3.1);

      q("[data-hero-step]").forEach((step, i) => {
        const at = 5.4 + i * 1.1;
        tl.fromTo(step.querySelector("[data-step-bar]"), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "power1.inOut" }, at)
          .to(step.querySelector("[data-step-wait]"), { autoAlpha: 0, y: -6, duration: 0.25 }, at + 0.9)
          .fromTo(step.querySelector("[data-step-done]"), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.3 }, at + 1)
          .to(step.querySelector("[data-step-icon]"), { backgroundColor: "#aeb8e8", color: "#0b1020", duration: 0.3 }, at + 1);
      });

      gsap.to(q("[data-hero-badge]"), { y: "+=10", duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.8, delay: 4 });

      gsap
        .timeline({
          scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: 0.8 },
          defaults: { ease: "none" },
        })
        .fromTo(q("[data-hero-light]"), { scale: 1, yPercent: 0 }, { scale: 1.15, yPercent: -8, immediateRender: false }, 0)
        .fromTo(q("[data-hero-head]"), { y: 0, opacity: 1 }, { y: () => -window.innerHeight * 0.18, opacity: 0, immediateRender: false }, 0)
        .fromTo(q("[data-hero-card-wrap]"), { y: 0 }, { y: () => -window.innerHeight * 0.08, immediateRender: false }, 0)
        .fromTo(field.current, { intensity: 0.7 }, { intensity: 0.2, immediateRender: false }, 0);
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="top"
      data-vey-tone="dark"
      data-vey-chapter="0"
      aria-label="Introduction"
      className="relative h-svh w-full overflow-hidden max-md:h-auto max-md:min-h-svh"
    >
      <div data-hero-light aria-hidden className="vey-pre pointer-events-none absolute inset-0">
        <AsciiBand
          backgroundColor="#0b1020"
          hue={28}
          saturation={0.5}
          intensity={0.62}
          softness={1.15}
          cellSize={14}
          glyphOpacity={0.6}
          gaps={0.32}
          flicker={1}
          speed={0.6}
          grain={0.04}
        />
      </div>
      <ParticleField state={field} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_46%_40%_at_50%_44%,rgba(11,16,32,0.82),rgba(11,16,32,0)_100%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[22vh] bg-linear-to-b from-[#0b1020]/0 to-[#0b1020]" />

      <div data-intro aria-hidden className="vey-intro absolute inset-0 flex flex-col justify-center gap-4 vey-container">
        <div className="flex items-end justify-between gap-6">
          <span className="block overflow-hidden">
            <span data-intro-label className="block text-28 text-[#f5f6fa]">
              <ScrambleText text={intro.message} trigger="mount" delay={0.1} duration={0.5} stagger={0.025} />
            </span>
          </span>
          <span className="block overflow-hidden font-vey-mono text-14 text-vey-dim">
            <span data-intro-label className="block">
              <span data-intro-count>000</span>%
            </span>
          </span>
        </div>
        <span className="block h-px w-full bg-white/10">
          <span
            data-intro-bar
            className="block h-px w-full origin-left bg-linear-to-r from-[#aeb8e8]/0 via-[#aeb8e8] to-[#f5f6fa] [transform:scaleX(0)]"
          />
        </span>
      </div>

      <div
        data-hero-copy
        className="vey-pre relative z-10 flex h-full flex-col items-center justify-center gap-10 vey-container py-[12vh] text-center max-md:gap-8 max-md:py-[18vh]"
      >
        <div data-hero-head className="flex w-full flex-col items-center gap-7">
          <Lines as="h1" lines={hero.lines} className="w-[80%] max-lg:w-full" />
          <p data-hero-fade className="w-[36%] text-28 text-vey-dim max-lg:w-[70%] max-md:w-full">
            {hero.description}
          </p>
          <div data-hero-fade className="flex items-center gap-4 max-md:w-full max-md:flex-col max-md:items-stretch">
            <VeyButton href={hero.primary.href}>{hero.primary.label}</VeyButton>
            <VeyButton href={hero.secondary.href} variant="ghost">
              {hero.secondary.label}
            </VeyButton>
          </div>
        </div>

        <div data-hero-card-wrap className="w-[54%] [perspective:1200px] max-lg:w-[86%] max-md:w-full">
          <div
            data-hero-card
            className="flex flex-col gap-4 rounded-md border border-white/12 bg-linear-to-b from-[#202b4a]/80 to-[#0b1020]/90 px-[1.2vw] py-[1.2vw] text-left shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] max-lg:px-[2.4vw] max-lg:py-[2.4vw] max-md:px-[4vw] max-md:py-[4vw]"
          >
            <div className="flex items-center gap-3 rounded-md border border-white/10 bg-[#0b1020]/60 px-[0.8vw] py-[0.7vw] max-lg:px-[1.6vw] max-lg:py-[1.4vw] max-md:px-[3vw] max-md:py-[3vw]">
              <Mark className="h-[1.1vw] w-[1.1vw] shrink-0 text-[#aeb8e8] max-lg:h-[2.2vw] max-lg:w-[2.2vw] max-md:h-[4.4vw] max-md:w-[4.4vw]" />
              <span className="flex-1 truncate text-24 text-[#f5f6fa] max-md:whitespace-normal">
                <span className="sr-only">{hero.command.placeholder}: </span>
                {typing ? (
                  <TypingText text={hero.command.prompt} charactersPerSecond={38} play />
                ) : (
                  <span className="text-vey-dim">{hero.command.placeholder}</span>
                )}
              </span>
              <span
                aria-hidden
                className="flex h-[4vh] aspect-square shrink-0 items-center justify-center rounded-md bg-[#aeb8e8] text-[#0b1020] max-lg:h-[3vh] max-md:h-[4.4vh]"
              >
                <Arrow className="h-[45%] w-[45%] -rotate-90" />
              </span>
            </div>
            <ol className="grid grid-cols-3 gap-3 max-md:grid-cols-1 max-md:gap-2">
              {hero.command.steps.map((step, i) => (
                <li
                  key={step.label}
                  data-hero-step
                  className="flex flex-col gap-2 rounded-md border border-white/8 bg-white/[0.03] px-[0.8vw] py-[0.7vw] max-lg:px-[1.6vw] max-lg:py-[1.4vw] max-md:px-[3vw] max-md:py-[2.6vw]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      data-step-icon
                      className="flex h-[2.8vh] aspect-square items-center justify-center rounded-md bg-white/8 text-[#aeb8e8] max-md:h-[3.2vh]"
                    >
                      <Icon name={STEP_ICONS[i]} className="h-[60%] w-[60%]" />
                    </span>
                    <span className="flex-1 text-22 font-medium">{step.label}</span>
                    <span className="grid text-14">
                      <span data-step-wait className="col-start-1 row-start-1 text-right text-vey-dim">
                        Queued
                      </span>
                      <span data-step-done className="col-start-1 row-start-1 text-right text-[#aeb8e8] opacity-0">
                        {step.done}
                      </span>
                    </span>
                  </div>
                  <span className="block h-0.5 w-full overflow-hidden rounded-md bg-white/10">
                    <span data-step-bar className="block h-full w-full origin-left bg-[#aeb8e8] [transform:scaleX(0)]" />
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {hero.badges.map((b, i) => (
        <div
          key={b.label}
          aria-hidden
          className={`pointer-events-none absolute z-10 max-lg:hidden ${i === 0 ? "left-[7vw] top-[62%]" : "right-[7vw] top-[44%]"}`}
        >
          <div
            data-hero-badge
            className="vey-pre flex items-center gap-3 rounded-md border border-white/10 bg-[#0b1020]/70 px-[1vw] py-[0.7vw]"
          >
            <span className="block h-[0.9vh] aspect-square rounded-full bg-[#aeb8e8] shadow-[0_0_10px_rgba(174,184,232,0.9)]" />
            <span className="flex flex-col text-left">
              <span className="text-30 font-medium tabular-nums">{b.value}</span>
              <span className="text-14 text-vey-dim">{b.label}</span>
            </span>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Hero;
