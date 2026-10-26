// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FadeUp } from "../Animations/gsapAnim";
import Globe from "../effects/globe";

const formatTime = (zone: string) =>
  new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: zone }).format(new Date());

const T = "transition-colors duration-300 delay-200 ease-out";

const StudioMap = () => {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [compact, setCompact] = useState<boolean | null>(null);
  const [engaged, setEngaged] = useState(false);
  const [box, setBox] = useState({ top: 0, height: 0 });
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const shown = hovered ?? (compact === false || engaged ? active : -1);
  const [times, setTimes] = useState<string[]>(STUDIOS.map(() => ""));

  useEffect(() => {
    const tick = () => setTimes(STUDIOS.map((studio) => formatTime(studio.zone)));
    tick();
    const timer = window.setInterval(tick, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const sync = () => setCompact(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const measure = () => {
      const el = itemRefs.current[shown];
      if (el) setBox({ top: el.offsetTop, height: el.offsetHeight });
      else setBox((current) => ({ ...current, height: 0 }));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [shown]);

  const step = (direction: number) => {
    setEngaged(true);
    setActive((current) => (current + direction + STUDIOS.length) % STUDIOS.length);
  };

  return (
    <div className="flex items-center justify-between gap-[2vw] rounded-[2vw] border border-(--mpx-ink)/10 bg-(--mpx-white) p-[2vw] max-lg:flex-col max-lg:items-stretch max-lg:rounded-[3vw] max-lg:p-[3vw] max-md:rounded-[5vw] max-md:p-[4vw]">
      <FadeUp className="aspect-square w-[56%] overflow-hidden rounded-[1.5vw] max-lg:w-full max-lg:rounded-[2.5vw] max-md:rounded-[4vw]">
        <Globe mapColor="#ff5f00" activeIndex={active} />
      </FadeUp>
      <FadeUp delay={0.1} className="flex w-[40%] flex-col gap-6 max-lg:w-full">
        <ol className="relative flex flex-col gap-2" onMouseLeave={() => setHovered(null)}>
          <span
            aria-hidden
            style={{ transform: `translateY(${box.top}px)`, height: box.height }}
            className="pointer-events-none absolute inset-x-0 top-0 rounded-[1.2vw] bg-(--mpx-ink) transition-[transform,height] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] max-lg:rounded-[2vw] max-md:rounded-[3vw]"
          />
          {STUDIOS.map((studio, index) => {
            const isActive = index === shown;
            const muted = isActive ? "text-(color:--mpx-paper)/60" : "text-mpx-muted";
            return (
              <li key={studio.city} ref={(node) => { itemRefs.current[index] = node; }} className="relative">
                <button
                  type="button"
                  aria-pressed={index === active}
                  onMouseEnter={() => setHovered(index)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                  onClick={() => {
                    setEngaged(true);
                    setActive(index);
                  }}
                  className={`grid w-full cursor-pointer grid-cols-[2.5vw_1fr_auto] items-baseline gap-x-4 gap-y-1 rounded-[1.2vw] px-[1.2vw] py-[1.2vw] text-left transition-colors duration-300 delay-200 ease-out max-lg:grid-cols-[6vw_1fr_auto] max-lg:rounded-[2vw] max-lg:px-[3vw] max-lg:py-[3vw] max-md:flex max-md:flex-col max-md:items-center max-md:gap-2 max-md:rounded-[3vw] max-md:px-[4vw] max-md:py-[4vw] max-md:text-center ${
                    isActive ? "text-(color:--mpx-paper)" : "text-(color:--mpx-ink)"
                  }`}
                >
                  <span className={`text-14 tabular-nums ${T} ${muted}`}>{String(index + 1).padStart(2, "0")}</span>
                  <span className="font-mpx-head text-30">{studio.city}</span>
                  <span className={`text-14 tabular-nums ${T} ${muted}`}>{times[index]}</span>
                  <span className={`col-start-2 col-end-4 text-22 ${T} ${muted}`}>
                    {studio.lines[0]}
                    <br />
                    {studio.lines[1]}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="flex items-center gap-4 px-[1.2vw] max-lg:px-[3vw] max-md:px-[4vw] max-md:justify-center">
          <button
            type="button"
            aria-label="Previous studio"
            onClick={() => step(-1)}
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-(--mpx-ink)/30 transition-colors duration-300 hover:bg-(--mpx-ink) hover:text-(color:--mpx-paper)"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <span className="text-22 text-mpx-muted tabular-nums">
            <span className="text-(color:--mpx-ink)">0</span>
            <span className="inline-block h-[1lh] overflow-hidden align-bottom text-(color:--mpx-ink)">
              <span
                style={{ transform: `translateY(-${(active * 100) / STUDIOS.length}%)` }}
                className="flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
              >
                {STUDIOS.map((studio, index) => (
                  <span key={studio.city}>{index + 1}</span>
                ))}
              </span>
            </span>{" "}
            / {String(STUDIOS.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            aria-label="Next studio"
            onClick={() => step(1)}
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-(--mpx-ink)/30 transition-colors duration-300 hover:bg-(--mpx-ink) hover:text-(color:--mpx-paper)"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </FadeUp>
    </div>
  );
};

export default StudioMap;

const STUDIOS = [
  { city: "Delhi", zone: "Asia/Kolkata", lines: ["14 Hauz Khas Village", "New Delhi 110016"] },
  { city: "London", zone: "Europe/London", lines: ["22 Redchurch Street", "London E2 7DJ"] },
  { city: "Dubai", zone: "Asia/Dubai", lines: ["Alserkal Avenue", "Warehouse 47, Al Quoz"] },
  { city: "New York", zone: "America/New_York", lines: ["88 Walker Street", "New York, NY 10013"] },
];
