// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import Scene from "./Scene";
import Lines from "./Animations/Lines";
import { useScene } from "./Animations/scene";
import { smooth, type Point } from "./Animations/paths";
import { Icon } from "./Icons";
import { outcome } from "../content";

const W = 1440;
const H = 620;
const START: Point = [-40, 330];
const DEST: Point = [1200, 330];
const CARDS: { x: number; y: number; dx: number; dy: number; rot: number }[] = [
  { x: 330, y: 330, dx: -30, dy: -140, rot: -5 },
  { x: 650, y: 330, dx: 30, dy: 130, rot: 4 },
  { x: 970, y: 330, dx: 10, dy: -100, rot: -3 },
];
const STRANDS = [0, 46, -38];

function threadPath(org: number, strand: number) {
  const spread = (1 - org) * strand;
  const pts: Point[] = [
    [START[0], START[1] + 90 * (1 - org) + spread],
    ...CARDS.map((c): Point => [c.x + c.dx * (1 - org), c.y + c.dy * (1 - org) + spread * 0.8]),
    [DEST[0], DEST[1] + spread * 0.3],
  ];
  return smooth(pts, 0.9);
}

function Spark({ kind }: { kind: number }) {
  if (kind === 0)
    return (
      <span className="flex flex-col gap-1.5">
        {["w-full", "w-[86%]", "w-[64%]"].map((w) => (
          <span key={w} className={`block h-[0.5vh] rounded-md bg-white/15 ${w}`} />
        ))}
      </span>
    );
  if (kind === 1)
    return (
      <span className="flex gap-1">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className={`block h-[1.6vh] flex-1 rounded-md ${i < 9 ? "bg-[#aeb8e8]/70" : "bg-white/10"}`} />
        ))}
      </span>
    );
  return (
    <svg viewBox="0 0 100 30" aria-hidden className="h-[4vh] w-full">
      <path d="M0 26 C15 24 22 14 35 16 S55 22 65 12 S85 4 100 3" fill="none" stroke="#aeb8e8" strokeWidth="1.5" />
    </svg>
  );
}

const Outcome = () => {
  const ref = useRef<HTMLElement>(null);
  const paths = useRef<(SVGPathElement | null)[]>([]);

  useScene(
    ref,
    (tl, { q, el, mobile, reduce }) => {
      const stage = q("[data-out-stage]")[0] as HTMLElement | undefined;
      const inner = el.firstElementChild as HTMLElement;
      const cards = q(mobile ? "[data-out-list] [data-out-card]" : "[data-out-stage] [data-out-card]");
      const state = { org: 0 };
      const render = () => {
        paths.current.forEach((p, i) => p?.setAttribute("d", threadPath(state.org, STRANDS[i % 3])));
        if (!stage || mobile) return;
        const k = stage.offsetWidth / W;
        cards.forEach((card, i) => {
          const c = CARDS[i];
          gsap.set(card, { x: c.dx * (1 - state.org) * k, y: c.dy * (1 - state.org) * k, rotate: c.rot * (1 - state.org) });
        });
      };
      render();

      const center = () => {
        const dest = q("[data-out-dest]")[0] as HTMLElement | undefined;
        const box = inner.getBoundingClientRect();
        if (!dest || mobile) return `${box.width / 2}px ${box.height / 2}px`;
        const r = dest.getBoundingClientRect();
        return `${r.left - box.left}px ${r.top - box.top}px`;
      };

      tl.fromTo(cards, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, stagger: 0.2 }, 0.4);
      tl.fromTo(q("[data-thread-clip]"), { attr: { width: 0 } }, { attr: { width: W + 120 }, duration: 2.8, ease: "power1.inOut" }, 0.6);
      tl.to(state, { org: 1, duration: 2.2, ease: "power2.inOut", onUpdate: render }, 3.4);
      tl.to(q("[data-strand]"), { autoAlpha: 0, duration: 1.4 }, 4.2);
      tl.fromTo(q("[data-out-dest-dot]"), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: "back.out(2)" }, 5.4);
      tl.fromTo(q("[data-out-dest-label]"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 5.6);
      if (mobile || reduce) {
        if (reduce && !mobile) gsap.set([q("[data-light]"), q("[data-reduce-band]")], { display: (i) => (i === 0 ? "none" : "block") });
        tl.to({}, { duration: 1 });
        return;
      }
      tl.fromTo(q("[data-dawn]"), { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 2, ease: "power1.in" }, 5.8);
      tl.to(inner, { backgroundColor: "#202b4a", duration: 1.8 }, 6);
      tl.to(q("[data-out-fade]"), { autoAlpha: 0, y: -20, duration: 1.2, ease: "power1.in" }, 6.4);
      tl.fromTo(
        q("[data-light]"),
        { clipPath: () => `circle(0% at ${center()})` },
        { clipPath: () => `circle(150% at ${center()})`, duration: 2.4, ease: "power2.in" },
        7.2,
      );
      tl.fromTo(q("[data-light-line]"), { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: "power2.out" }, 8.6);
      tl.to({}, { duration: 1 });
    },
    {
      start: "top 35%",
      onUpdate: (p, { el, mobile, reduce }) => {
        const tone = p > 0.8 && !mobile && !reduce ? "light" : "dark";
        if (el.dataset.veyTone === tone) return;
        el.dataset.veyTone = tone;
        window.dispatchEvent(new Event("vey:tone"));
      },
    },
  );

  return (
    <Scene sectionRef={ref} id="outcome" chapter={10} minHeight="min-h-[185vh]" innerClassName="bg-[#0b1020]">
      <div className="relative h-svh max-md:h-auto">
        <div data-out-fade className="relative z-10 vey-container py-[14vh] max-md:py-[14vw]">
          <Lines id="outcome-title" lines={outcome.heading} className="w-[55%] max-lg:w-[85%] max-md:w-full" />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute left-[83%] top-[58%] h-[140vh] w-[140vh] -translate-x-1/2 -translate-y-1/2 max-md:hidden"
        >
          <div
            data-dawn
            className="h-full w-full rounded-md bg-[radial-gradient(closest-side,rgba(232,234,245,0.5),rgba(174,184,232,0.22)_45%,rgba(174,184,232,0))] opacity-0"
          />
        </div>

        <div data-out-stage className="absolute inset-x-0 bottom-[8vh] aspect-[1440/620] max-md:hidden">
          <svg viewBox={`0 0 ${W} ${H}`} aria-hidden className="absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <linearGradient id="vey-out-thread" gradientUnits="userSpaceOnUse" x1="0" x2={W} y1="0" y2="0">
                <stop offset="0" stopColor="#aeb8e8" stopOpacity="0" />
                <stop offset="0.2" stopColor="#aeb8e8" stopOpacity="0.8" />
                <stop offset="1" stopColor="#f5f6fa" />
              </linearGradient>
              <clipPath id="vey-out-clip">
                <rect data-thread-clip x="-60" y="-200" width={W + 120} height={H + 400} />
              </clipPath>
            </defs>
            <g clipPath="url(#vey-out-clip)">
              {STRANDS.map((s, i) => (
                <path
                  strokeLinecap="round"
                  key={s}
                  ref={(node) => {
                    paths.current[i] = node;
                  }}
                  data-thread
                  data-strand={i > 0 ? "" : undefined}
                  d={threadPath(1, s)}
                  fill="none"
                  stroke="url(#vey-out-thread)"
                  strokeOpacity={i === 0 ? 1 : 0.35}
                  strokeWidth={i === 0 ? 2 : 1}
                />
              ))}
            </g>
          </svg>

          {outcome.cards.map((card, i) => (
            <div
              key={card.title}
              className="absolute w-[17%] -translate-x-1/2 -translate-y-1/2 max-lg:w-[21%]"
              style={{ left: `${(CARDS[i].x / W) * 100}%`, top: `${(CARDS[i].y / H) * 100}%` }}
            >
              <div
                data-out-card
                className="flex flex-col gap-4 rounded-md border border-white/10 bg-linear-to-b from-[#161f38] to-[#0b1020] px-[1.1vw] py-[1.1vw] max-lg:px-[1.6vw] max-lg:py-[1.6vw]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-[3.6vh] aspect-square items-center justify-center rounded-md bg-[#aeb8e8]/15 text-[#aeb8e8]">
                    <Icon name={card.icon} className="h-1/2 w-1/2" />
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-22 font-medium">{card.title}</span>
                    <span className="truncate text-14 text-vey-dim">{card.meta}</span>
                  </div>
                </div>
                <Spark kind={i} />
              </div>
            </div>
          ))}

          <div data-out-dest className="absolute h-0 w-0" style={{ left: `${(DEST[0] / W) * 100}%`, top: `${(DEST[1] / H) * 100}%` }}>
            <span className="absolute flex h-0 w-0 items-center justify-center">
              <span
                data-out-dest-dot
                className="absolute block h-[1.8vh] aspect-square rounded-full bg-[#f5f6fa] shadow-[0_0_24px_6px_rgba(174,184,232,0.6)]"
              />
            </span>
            <span data-out-dest-label className="absolute left-[1.2vw] top-[-1vh] whitespace-nowrap text-14 text-[#e8eaf5] max-lg:hidden">
              Outcome delivered
            </span>
          </div>
        </div>

        <ul data-out-fade data-out-list className="hidden flex-col gap-3 vey-container max-md:flex max-md:py-[8vw]">
          {outcome.cards.map((card, i) => (
            <li
              key={card.title}
              data-out-card
              className="flex flex-col gap-4 rounded-md border border-white/10 bg-linear-to-b from-[#161f38] to-[#0b1020] px-[5vw] py-[5vw]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-[4.4vh] aspect-square items-center justify-center rounded-md bg-[#aeb8e8]/15 text-[#aeb8e8]">
                  <Icon name={card.icon} className="h-1/2 w-1/2" />
                </span>
                <div className="flex flex-col">
                  <span className="text-24 font-medium">{card.title}</span>
                  <span className="text-14 text-vey-dim">{card.meta}</span>
                </div>
              </div>
              <Spark kind={i} />
            </li>
          ))}
        </ul>
      </div>

      <div aria-hidden className="hidden h-[40vw] w-full bg-linear-to-b from-[#0b1020] via-[#202b4a] to-[#f7f7f5] max-md:block" />

      <div
        data-reduce-band
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[30vh] bg-linear-to-b from-[#0b1020]/0 via-[#202b4a] to-[#f7f7f5]"
      />

      <div
        data-light
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 bg-[#f7f7f5] [clip-path:circle(0%_at_83%_58%)] max-md:hidden"
      >
        <span className="absolute inset-x-0 top-[58%] block h-px max-md:top-1/2">
          <span data-light-line className="block h-px w-full origin-right bg-linear-to-r from-[#aeb8e8]/0 via-[#aeb8e8] to-[#aeb8e8]/30" />
        </span>
      </div>
    </Scene>
  );
};

export default Outcome;
