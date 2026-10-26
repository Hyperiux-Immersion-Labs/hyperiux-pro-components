// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { FadeUp, MaskReveal, LineReveal, RuleDraw } from "../Animations/gsapAnim";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import UnderlineLink from "../Buttons/UnderlineLink";
import strategy from "../../assets/pictures/s-strategy.webp";
import identity from "../../assets/pictures/s-identity.webp";
import web from "../../assets/pictures/s-web.webp";
import motion from "../../assets/pictures/s-motion.webp";
import packaging from "../../assets/pictures/s-packaging.webp";
import content from "../../assets/pictures/s-content.webp";
import { ROUTES } from "../../routes";

const DESKTOP_QUERY = "(min-width: 1026px)";
const HIDDEN_DOWN = "inset(100% 0% 0% 0%)";
const HIDDEN_UP = "inset(0% 0% 100% 0%)";
const SHOWN = "inset(0% 0% 0% 0%)";

type Service = {
  title: string;
  meta: string;
  image: StaticImageData;
};

const SERVICES: Service[] = [
  { title: "Brand strategy", meta: "Positioning, naming and messaging", image: strategy },
  { title: "Brand identity", meta: "Logos, type and visual systems", image: identity },
  { title: "Websites and products", meta: "UX, UI and engineering", image: web },
  { title: "Motion and 3D", meta: "Moving identities and launch films", image: motion },
  { title: "Packaging", meta: "Structure, range and production", image: packaging },
  { title: "Content and campaigns", meta: "Launches and social systems", image: content },
];

const pad = (value: number) => String(value).padStart(2, "0");

const Services = () => {
  const router = useRouter();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const layerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const picRefs = useRef<(HTMLImageElement | null)[]>([]);
  const activeRef = useRef(0);
  const zRef = useRef(1);
  const [active, setActive] = useState(0);

  const show = (index: number, direction: number) => {
    const previous = activeRef.current;
    if (index === previous) return;

    activeRef.current = index;
    setActive(index);

    const layers = layerRefs.current;
    const pics = picRefs.current;
    const next = layers[index];
    if (!next) return;
    zRef.current += 1;
    next.style.zIndex = String(zRef.current);

    if (prefersReducedMotion()) {
      layers.forEach((layer, n) => {
        if (layer) layer.style.clipPath = n === index ? SHOWN : HIDDEN_DOWN;
      });
      return;
    }

    layers.forEach((layer, n) => {
      if (!layer || n === index) return;
      gsap.killTweensOf(layer);
      if (n === previous) {
        layer.style.clipPath = SHOWN;
        layer.style.zIndex = "1";
        return;
      }
      layer.style.clipPath = HIDDEN_DOWN;
      layer.style.zIndex = "0";
      gsap.killTweensOf(pics[n]);
      gsap.set(pics[n], { yPercent: 0, scale: 1 });
    });

    gsap.killTweensOf([next, pics[index]]);
    gsap.fromTo(
      next,
      { clipPath: direction > 0 ? HIDDEN_DOWN : HIDDEN_UP },
      {
        clipPath: SHOWN,
        duration: 1.1,
        ease: "expo.out",
        onComplete: () => {
          if (activeRef.current !== index) return;
          layers.forEach((layer, n) => {
            if (layer && n !== index) layer.style.clipPath = HIDDEN_DOWN;
          });
        },
      },
    );
    gsap.fromTo(
      pics[index],
      { yPercent: direction > 0 ? 18 : -18, scale: 1.18 },
      { yPercent: 0, scale: 1, duration: 1.4, ease: "expo.out" },
    );
    gsap.to(pics[previous], {
      yPercent: direction > 0 ? -12 : 12,
      duration: 1.1,
      ease: "expo.out",
      overwrite: "auto",
      onComplete: () => {
        if (activeRef.current !== previous) gsap.set(pics[previous], { yPercent: 0, scale: 1 });
      },
    });
  };

  const showRef = useRef(show);
  showRef.current = show;

  useEffect(() => {
    const layers = layerRefs.current;
    layers.forEach((layer, n) => {
      if (!layer) return;
      layer.style.clipPath = n === 0 ? SHOWN : HIDDEN_DOWN;
      layer.style.zIndex = n === 0 ? "1" : "0";
    });

    const desktop = window.matchMedia(DESKTOP_QUERY);
    let queued = false;

    const pick = () => {
      const frame = frameRef.current;
      const rows = rowRefs.current.filter(Boolean) as HTMLLIElement[];
      if (!desktop.matches || !frame || rows.length === 0) return;

      const box = frame.getBoundingClientRect();
      const centre = box.top + box.height / 2;
      let index = activeRef.current;

      if (centre < rows[0].getBoundingClientRect().top) index = 0;
      else if (centre >= rows[rows.length - 1].getBoundingClientRect().bottom) index = rows.length - 1;
      else {
        for (let n = 0; n < rows.length; n += 1) {
          const rect = rows[n].getBoundingClientRect();
          if (centre >= rect.top && centre < rect.bottom) {
            index = n;
            break;
          }
        }
      }

      if (index !== activeRef.current) showRef.current(index, index > activeRef.current ? 1 : -1);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        pick();
      });
    };

    const clearOverlays = () => document.querySelectorAll("[data-service-expand]").forEach((el) => el.remove());

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("pageshow", clearOverlays);
    pick();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pageshow", clearOverlays);
      clearOverlays();
      gsap.killTweensOf([...layers, ...picRefs.current]);
    };
  }, []);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (prefersReducedMotion() || !window.matchMedia(DESKTOP_QUERY).matches) return;

    const frame = frameRef.current;
    const window_ = frame?.querySelector("[data-service-window]");
    if (!window_) return;

    event.preventDefault();
    if (index !== activeRef.current) show(index, index > activeRef.current ? 1 : -1);

    const box = window_.getBoundingClientRect();
    const overlay = document.createElement("div");
    overlay.setAttribute("data-service-expand", "");
    overlay.className = "pointer-events-none fixed z-120 overflow-hidden rounded-lg";
    gsap.set(overlay, { top: box.top, left: box.left, width: box.width, height: box.height });

    const picture = document.createElement("img");
    picture.src = SERVICES[index].image.src;
    picture.alt = "";
    picture.className = "h-full w-full object-cover";
    overlay.append(picture);
    document.body.append(overlay);

    gsap.to(overlay, {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      borderRadius: 0,
      duration: 1,
      ease: "expo.inOut",
      onComplete: () => router.push(ROUTES.service),
    });
    gsap.fromTo(picture, { scale: 1.15 }, { scale: 1, duration: 1, ease: "expo.inOut" });
  };

  return (
    <section
      id="services"
      className="flex flex-col gap-[6vw] px-[5vw] py-[7%] max-lg:gap-[10vw] max-lg:px-[6vw] max-lg:py-[12%] max-md:gap-14 max-md:px-[7vw] max-md:py-[15%]"
    >
      <div className="grid grid-cols-[1fr_31%] items-start gap-x-[2vw] gap-y-[1vw] max-lg:grid-cols-1 max-lg:gap-y-4">
        <MaskReveal
          as="h2"
        >
          What we’re good at
        </MaskReveal>
        <LineReveal className="w-[83%] text-24 leading-[1.55] text-mpx-muted max-lg:w-[70%]  max-md:w-full ">
          Six disciplines, one team, no hand-offs. Strategy, design and code share a table, so nothing gets lost in translation.
        </LineReveal>
        <FadeUp>
          <UnderlineLink
            href={ROUTES.services}
            className="font-mpx-head text-24 font-medium text-mpx-ink "
          >
            All services
          </UnderlineLink>
        </FadeUp>
      </div>

      <div className="relative grid grid-cols-12 gap-x-[3.3vw]">
        <div
          ref={frameRef}
          aria-hidden
          className="pointer-events-none sticky top-[calc(50vh-6.3vw)] z-20 col-span-3 col-start-6 row-start-1 my-[1.5vw] grid cursor-none justify-items-center self-start justify-self-center max-lg:hidden"
        >
          <FadeUp className="grid justify-items-center gap-[0.6vw]">
          <div
            data-service-window
            className="relative aspect-4/3 h-[12.5vw] max-w-full overflow-hidden rounded-lg bg-mpx-surface"
          >
            {SERVICES.map((service, index) => (
              <span
                key={service.title}
                ref={(el) => {
                  layerRefs.current[index] = el;
                }}
                className={`absolute inset-0 overflow-hidden will-change-[clip-path] ${
                  index === 0 ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(100%_0_0_0)]"
                }`}
              >
                <Image
                  quality={95}
                  ref={(el: HTMLImageElement | null) => {
                    picRefs.current[index] = el;
                  }}
                  src={service.image}
                  alt=""
                  sizes="20vw"
                  loading="eager"
                  className="h-full w-full object-cover will-change-transform"
                />
              </span>
            ))}
          </div>
          <span className="text-14 tabular-nums text-mpx-muted">{pad(active + 1)} / {pad(SERVICES.length)}</span>
          </FadeUp>
        </div>

        <ol className="col-span-full row-start-1">
          {SERVICES.map((service, index) => {
            const isActive = index === active;
            return (
              <li
                key={service.title}
                ref={(el) => {
                  rowRefs.current[index] = el;
                }}
                className="relative"
              >
                <RuleDraw className="absolute inset-x-0 top-0 h-px bg-(--mpx-ink)/20" />
                {index === SERVICES.length - 1 && <RuleDraw className="absolute inset-x-0 bottom-0 h-px bg-(--mpx-ink)/20" />}
                <Link
                  href={ROUTES.service}
                  data-cursor="View"
                  onClick={(event) => handleClick(event, index)}
                  className={`grid min-h-[15.5vw] grid-cols-12 items-center gap-x-[3.3vw] py-[1.4vw] transition-colors duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] hover:text-mpx-ink focus-visible:text-mpx-ink motion-reduce:transition-none max-lg:min-h-0 max-lg:gap-y-2 max-lg:py-5 max-lg:text-mpx-ink max-md:gap-y-3 max-md:py-6 ${
                    isActive ? "text-mpx-ink" : "text-mpx-muted"
                  }`}
                >
                  <span
                    className={`font-mpx-head col-span-5 max-md:pt-3 text-40 font-medium leading-[1.05] tracking-tight transition-transform duration-900 ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none max-lg:col-span-7 max-lg:row-start-1 max-lg:translate-x-0 max-md:col-span-12 max-md:row-start-2 ${
                      isActive ? "translate-x-[0.8vw]" : "translate-x-0"
                    }`}
                  >
                    <LineReveal as="div">{service.title}</LineReveal>
                  </span>
                  <span className="col-span-3 col-start-9 inline-flex items-center gap-[0.6vw] text-22 max-lg:col-span-7 max-lg:col-start-1 max-lg:row-start-2 max-lg:gap-2 max-lg:text-mpx-muted max-md:col-span-12 max-md:row-start-3">
                    <span
                      aria-hidden
                      className={`size-1.5 max-md:hidden shrink-0 rounded-full transition-colors duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none ${
                        isActive ? "bg-(--mpx-accent)" : "bg-current"
                      }`}
                    />
                    <LineReveal as="span" className="block">{service.meta}</LineReveal>
                  </span>
                  <span
                    aria-hidden
                    className="col-start-12 justify-self-end text-22 tabular-nums max-lg:hidden"
                  >
                    <LineReveal as="span" className="block">{pad(index + 1)}</LineReveal>
                  </span>
                  <FadeUp
                    as="span"
                    aria-hidden
                    className="hidden aspect-4/3 overflow-hidden rounded-lg max-lg:col-span-5 max-lg:col-start-8 max-lg:row-span-2 max-lg:row-start-1 max-lg:block max-md:col-span-12 max-md:col-start-1 max-md:row-span-1"
                  >
                    <Image
                      quality={95}
                      src={service.image}
                      alt=""
                      sizes="(max-width: 768px) 100vw, 30vw"
                      className="h-full w-full object-cover"
                    />
                  </FadeUp>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default Services;
