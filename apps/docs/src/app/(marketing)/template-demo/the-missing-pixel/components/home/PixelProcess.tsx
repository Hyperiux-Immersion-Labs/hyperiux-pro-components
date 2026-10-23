// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FadeUp, MaskReveal, RuleDraw } from "../Animations/gsapAnim";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import { testimonialSwiper } from "../effects/testimonial-swiper";
import { playSound } from "../Sound/pixelSfx";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STEPS = [
  {
    title: "Look closer",
    text: "We interview your people, your customers and your competitors’ customers. Somewhere in the noise is the thing nobody has said yet.",
    time: "Weeks 1 to 2",
  },
  {
    title: "Say it straight",
    text: "We turn what we found into a positioning short enough to remember and sharp enough to argue with.",
    time: "Weeks 3 to 4",
  },
  {
    title: "Make it unmissable",
    text: "Two or three routes, tested on real touchpoints instead of mood boards. We choose one together and build it into a system.",
    time: "Weeks 5 to 9",
  },
  {
    title: "Hand it over, stay close",
    text: "Files, guidelines, code and training, plus a team that still answers the phone after launch day.",
    time: "Week 10 onward",
  },
];

const GRID = 10;
const GAP_INDEX = 3 * GRID + 6;
const CELLS = Array.from({ length: GRID * GRID }, (_, index) => index);

const CELL_INDICES = CELLS.filter((index) => index !== GAP_INDEX);

const nearCentre = (index: number) =>
  Math.abs((index % GRID) - 4.5) + Math.abs(Math.floor(index / GRID) - 4.5) <= 5;

const PixelProcess = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const grid = gridRef.current;
      if (!section || !grid || prefersReducedMotion()) return;

      const fadeIn = (start: string) => {
        const tween = gsap.fromTo(
          grid.querySelectorAll("[data-px-hover]"),
          { opacity: 0, scale: 0.6, rotation: () => gsap.utils.random(-45, 45) },
          {
            opacity: 1,
            scale: 1,
            rotation: 0,
            ease: "power2.out",
            duration: 0.8,
            stagger: { amount: 0.6, from: "random" },
            paused: true,
          },
        );
        const trigger = ScrollTrigger.create({
          trigger: section,
          start,
          onEnter: () => tween.play(),
          onLeaveBack: () => tween.reverse(),
        });
        return () => {
          trigger.kill();
          tween.kill();
        };
      };

      const mm = gsap.matchMedia();

      mm.add("(max-width: 1025px)", () => {
        return fadeIn("top 60%");
      });

      mm.add("(min-width: 1026px)", () => {
        const killFade = fadeIn("top 40%");
        const cells = gsap.utils.toArray<HTMLElement>("[data-px-cell]", grid);
        const missing = grid.querySelector<HTMLElement>("[data-px-missing]");
        const steps = gsap.utils.toArray<HTMLElement>("[data-px-step]", section);
        if (!missing || steps.length < 4) return;

        const spreadX = window.innerWidth * 0.3;
        const spreadY = window.innerHeight * 0.36;

        const gridBox = grid.getBoundingClientRect();
        const centres = cells.map((cell) => {
          const box = cell.getBoundingClientRect();
          return {
            x: box.left + box.width / 2,
            y: window.innerHeight / 2 + (box.top + box.height / 2 - gridBox.top - gridBox.height / 2),
          };
        });
        const limitX = [window.innerWidth * 0.03, window.innerWidth * 0.97];
        const limitY = [window.innerHeight * 0.14, window.innerHeight * 0.96];
        const scatter = (spread: number, centre: number, [min, max]: number[]) =>
          gsap.utils.clamp(min - centre, max - centre, gsap.utils.random(-spread, spread));

        gsap.set(cells, {
          x: (i) => scatter(spreadX, centres[i].x, limitX),
          y: (i) => scatter(spreadY, centres[i].y, limitY),
          rotation: () => gsap.utils.random(-12, 12),
          scale: (i) => nearCentre(CELL_INDICES[i]) ? 1 : 0.55,
          opacity: 1,
        });
        gsap.set(missing, { y: -260, opacity: 0, rotation: -90 });
        gsap.set(steps.slice(1), { autoAlpha: 0 });

        let found = false;
        let scatterStrength = 1;
        const hoverPixels = cells.map((cell) => cell.querySelector<HTMLElement>("[data-px-hover]"));
        gsap.set(hoverPixels, {
          backgroundColor: (i) => nearCentre(CELL_INDICES[i]) ? ((CELL_INDICES[i] + 1) % 17 === 0 ? "#ff5f00" : "#0a0a0a") : "#9a9a9a",
        });
        const scatterOffsets = cells.map(() => ({
          x: gsap.utils.random(-32, 32),
          y: gsap.utils.random(-32, 32),
          rotation: gsap.utils.random(-12, 12),
        }));
        const movePixels = (event: PointerEvent) => {
          if (event.pointerType === "touch") return;
          const radius = window.innerWidth * 0.12;
          cells.forEach((cell, index) => {
            const pixel = hoverPixels[index];
            if (!pixel) return;
            const bounds = cell.getBoundingClientRect();
            const dx = bounds.left + bounds.width / 2 - event.clientX;
            const dy = bounds.top + bounds.height / 2 - event.clientY;
            const distance = Math.hypot(dx, dy);
            const proximity = Math.max(0, 1 - distance / radius);
            const influence = proximity * proximity * (3 - 2 * proximity) * scatterStrength;
            const offset = scatterOffsets[index];
            gsap.to(pixel, {
              x: offset.x * influence,
              y: offset.y * influence,
              rotation: offset.rotation * influence,
              duration: 0.9,
              ease: "power3.out",
              overwrite: "auto",
            });
          });
        };
        const resetPixels = () => {
          gsap.to(hoverPixels, { x: 0, y: 0, rotation: 0, duration: 1.2, ease: "power3.out", overwrite: "auto" });
        };
        section.addEventListener("pointermove", movePixels);
        section.addEventListener("pointerleave", resetPixels);

        const gather = gsap.to(cells, {
          x: 0,
          y: 0,
          rotation: 0,
          duration: 1.6,
          ease: "expo.out",
          stagger: { each: 0.006, from: "random" },
          paused: true,
        });
        const gatherTrigger = ScrollTrigger.create({
          trigger: section,
          start: "top -8%",
          onEnter: () => gather.play(),
          onLeaveBack: () => gather.reverse(),
        });

        const arrive = gsap.to(missing, {
          y: 0,
          opacity: 1,
          rotation: 0,
          duration: 2,
          ease: "power4.out",
          paused: true,
        });
        const arriveTrigger = ScrollTrigger.create({
          trigger: section,
          start: "top -235%",
          onEnter: () => arrive.play(),
          onLeaveBack: () => arrive.reverse(),
        });

        const timeline = gsap
          .timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.8,
              onUpdate: (self) => {
                scatterStrength = Math.max(0, 1 - self.progress / 0.25);
                if (scatterStrength === 0) resetPixels();
                if (self.progress > 0.9 && !found) {
                  found = true;
                  playSound("found");
                }
              },
            },
          })
          .to(cells, { scale: (i) => (nearCentre(CELL_INDICES[i]) ? 1 : 0.55), opacity: 1, duration: 0.8, stagger: { each: 0.004, from: "center" } }, 1.3)
          .to(hoverPixels, {
            backgroundColor: (i) => nearCentre(CELL_INDICES[i]) ? ((CELL_INDICES[i] + 1) % 17 === 0 ? "#ff5f00" : "#0a0a0a") : "#9a9a9a",
            duration: 0.8,
            stagger: { each: 0.004, from: "center" },
          }, 1.3)
          .to(grid, { rotation: 8, scale: 0.9, duration: 0.8 }, 2.4)
          .to(grid, { rotation: 0, scale: 1, duration: 0.6 }, 3.3)
          .to(cells, { scale: 1, opacity: 1, duration: 0.5, ease: "power3.inOut" }, 3.9)
          .to([...hoverPixels, missing], {
            backgroundColor: "#0a0a0a",
            duration: 0.5,
            ease: "power3.inOut",
          }, 3.9);

        const textSwiper = testimonialSwiper(steps);
        const textTrigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            const time = self.progress * timeline.duration();
            textSwiper.show(time >= 3.4 ? 3 : time >= 2.3 ? 2 : time >= 1.1 ? 1 : 0);
          },
        });

        return () => {
          killFade();
          gatherTrigger.kill();
          gather.kill();
          arriveTrigger.kill();
          arrive.kill();
          textTrigger.kill();
          textSwiper.destroy();
          section.removeEventListener("pointermove", movePixels);
          section.removeEventListener("pointerleave", resetPixels);
          gsap.killTweensOf(hoverPixels);
          gsap.set(hoverPixels, { clearProps: "transform" });
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="process"
      aria-label="How we work"
      className="relative h-[400vh] overflow-clip max-lg:h-auto"
    >
      <div className="sticky top-0 flex h-screen pl-[5vw] max-lg:px-[6vw] max-md:px-[7vw] items-center justify-between gap-9 max-lg:relative max-lg:h-auto max-lg:flex-col-reverse max-lg:items-start max-lg:gap-14 max-lg:py-[12%] max-md:gap-10 max-md:py-[15%]">
        <div className="flex w-[42%] flex-col gap-9 max-lg:w-full max-lg:gap-10 max-md:gap-18">
          <MaskReveal as="h2">How we find it</MaskReveal>
          <FadeUp delay={0.15} className="grid max-lg:gap-0">
            {STEPS.map((step, index) => (
              <div
                key={step.title}
                data-px-step
                className={`relative col-start-1 row-start-1 flex w-[90%] flex-col max-lg:w-full gap-3 max-lg:col-auto max-lg:row-auto max-lg:py-8 ${
                  index === 0 ? "" : "opacity-0 max-lg:opacity-100"
                }`}
              >
                <span className="text-14 tabular-nums max-lg:hidden text-mpx-muted">
                  {String(index + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
                </span>
                <h3 className="text-30 max-md:text-[6vw]! leading-none">{step.title}</h3>
                <p className="text-28 leading-[1.5] max-md:leading-[1.3] text-mpx-muted">{step.text}</p>
                <span className="text-14 max-md:pt-2 max-md:text-[4vw]! text-mpx-ink">{step.time}</span>
                <div className="absolute inset-x-0 bottom-0 hidden max-lg:block">
                  <RuleDraw className="h-px w-full bg-(--mpx-ink)/20" />
                </div>
              </div>
            ))}
          </FadeUp>
        </div>

        <div aria-hidden className="flex w-[50%] items-center justify-center max-lg:w-full">
          <div
            ref={gridRef}
            className="grid aspect-square w-[min(100%,48vh)] grid-cols-10 gap-4 max-lg:w-[min(100%,50vw)] max-lg:gap-3 max-md:w-[90%] max-md:gap-2"
          >
            {CELLS.map((index) =>
              index === GAP_INDEX ? (
                <span
                  key={index}
                  data-px-missing
                  className="rounded-xs bg-(--mpx-accent) will-change-transform"
                />
              ) : (
                <span
                  key={index}
                  data-px-cell
                  className="will-change-transform"
                >
                  <span
                    data-px-hover
                    className={`block h-full w-full rounded-xs will-change-transform ${
                      (index + 1) % 17 === 0 ? "bg-(--mpx-accent)" : "bg-(--mpx-ink)"
                    }`}
                  />
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PixelProcess;
