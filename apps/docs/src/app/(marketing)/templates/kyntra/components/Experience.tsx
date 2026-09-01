// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Image, { type StaticImageData } from "next/image";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import SmoothInfiniteCarousel, {
  type KeyboardSlider,
} from "./smooth-carousel/SmoothInfiniteCarousel";
import CarouselNavButtons from "./Buttons/NavButtons";

import exp01 from "../assets/exp-a.jpg";

import exp02 from "../assets/exp02.jpg";
import exp03 from "../assets/exp03.jpg";
import exp04 from "../assets/exp04.jpg";
// Stand-in imagery for the three newest testimonials until real portraits land.
import pers01 from "../assets/exp-e.jpg";
import trustInside from "../assets/exp-f.jpg";
import trustOutside from "../assets/exp-g.jpg";

import FocusTextWrap from "./effects/focus-text/wrap";
import { FadeUp, ParaAnim } from "./Animations/gsapAnim";
if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

type Testimonial = {
  quote: string;
  name: string;
  meta: string;
  image: StaticImageData;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The thing I didn't expect to love was the history. I can open the apartment and see every repair we've done since moving in. When the AC had the same problem twice, Kyntra already knew the previous technician, the unit and what had been repaired.",
    name: "Sarah Mitchell",
    meta: "Kyntra member for 18 months",
    image: exp01,
  },
  {
    quote:
      "Booking a professional used to mean three phone calls and re-explaining everything. Now I describe the problem once, Kyntra pulls the appliance record and the right person shows up with context.",
    name: "James Whitfield",
    meta: "Kyntra member for 11 months",
    image: exp02,
  },
  {
    quote:
      "We manage two properties and every warranty, invoice and service visit lives in the right place. Nothing gets lost between tenants anymore.",
    name: "Priya Nair",
    meta: "Kyntra member for 2 years",
    image: exp03,
  },
  {
    quote:
      "The maintenance reminders alone paid for the subscription. Small things get handled before they turn into the expensive kind.",
    name: "Daniel Osei",
    meta: "Kyntra member for 7 months",
    image: exp04,
  },
  {
    quote:
      "We inherited a house full of appliances nobody had paperwork for. Scanning them in took an afternoon, and now every manual and warranty date is a search away.",
    name: "Elena Volkov",
    meta: "Kyntra member for 9 months",
    image: pers01,
  },
  {
    quote:
      "What sold me was the handover. When we sold the flat, the buyers got the entire service history in one link instead of a shoebox of receipts.",
    name: "Marcus Bennett",
    meta: "Kyntra member for 14 months",
    image: trustInside,
  },
  {
    quote:
      "I used to guess whether a repair was still under warranty. Kyntra flags it before I book, and that has saved me two call-out fees already.",
    name: "Aisha Rahman",
    meta: "Kyntra member for 5 months",
    image: trustOutside,
  },
];

const FADE_IN_DELAY = 0;

const IMAGE_HIDDEN_CLIP = "inset(50%)";
const IMAGE_VISIBLE_CLIP = "inset(0%)";
const IMAGE_REVEAL_DURATION = 0.6;

const STEP_STAGGER = 0.16;

const STEP_SETTLE = 0.7;

const THUMB_HIDE_DELAY = 0.75;

const LEFT_BLEED = 0.4;

const STRIP_REPEATS = 2;

const GRID_GAP_VW = 1.5;
const bleed = (thumbVw: number, gapVw: number) =>
  `min(calc(${thumbVw}vw * ${LEFT_BLEED} + ${gapVw}vw), ${GRID_GAP_VW}vw)`;

const BLEED_VARS = {
  "--exp-bleed-desktop": bleed(13, 1.6),
  "--exp-bleed-tablet": bleed(25, 1.6),
  "--exp-bleed-mobile": bleed(26, 3),
} as CSSProperties;

const STRIP = Array.from(
  { length: TESTIMONIALS.length * STRIP_REPEATS },
  (_, i) => TESTIMONIALS[i % TESTIMONIALS.length],
);

const Experience = () => {
  const sliderRef = useRef<KeyboardSlider | null>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  // Refs for the crossfading quote card
  const imageWrapRef = useRef<HTMLDivElement | null>(null);
  const prevImageWrapRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [prevImage, setPrevImage] = useState<Testimonial | null>(null);
  const animating = useRef(false);
  const splitRef = useRef<SplitText | null>(null);
  const [hiddenThumb, setHiddenThumb] = useState(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef(false);
  const pendingDirRef = useRef(1);
  const stripShiftRef = useRef<HTMLDivElement | null>(null);

  const count = TESTIMONIALS.length;
  useEffect(() => {
    return () => {
      splitRef.current?.revert();
      splitRef.current = null;
      stepTimers.current.forEach(clearTimeout);
      stepTimers.current = [];
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);
  const crossfadeTo = (idx: number, dir: number) => {
    const imageWrap = imageWrapRef.current;
    const content = contentRef.current;

    if (!imageWrap || !content) {
      setActive(idx);
      return;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      setActive(idx);
      return;
    }

    const prevWrap = prevImageWrapRef.current;
    pendingDirRef.current = dir;
    // `activeRef` has already been advanced by select(); `active` is the state
    // still rendered on screen, so that is the photo currently in the frame.
    const outgoing = TESTIMONIALS[active];

    gsap.killTweensOf([content, imageWrap, prevWrap]);
    splitRef.current?.revert();
    splitRef.current = null;
    animating.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        animating.current = false;
      },
    });
    tl.to(
      content,
      { autoAlpha: 0, y: dir * 14, duration: 0.24, ease: "power2.in" },
      0,
    );
    tl.add(() => {
   
      splitRef.current?.revert();
      splitRef.current = null;
      pendingRef.current = true;

      setPrevImage(outgoing);
      setActive(idx);

      const prev = prevImageWrapRef.current;
      if (prev) gsap.set(prev, { xPercent: 0, autoAlpha: 1 });
    });
    tl.add(() => {
      requestAnimationFrame(() => {
        const c = contentRef.current;
        const img = imageWrapRef.current;
        const prev = prevImageWrapRef.current;
        if (prev) {
          gsap.set(prev, { xPercent: 0, autoAlpha: 1, zIndex: 1 });
        }

        if (img) {
          gsap.set(img, {
            xPercent: 0,
            zIndex: 2,
            visibility: "visible",
            clipPath: IMAGE_HIDDEN_CLIP,
          });
          gsap.to(img, {
            clipPath: IMAGE_VISIBLE_CLIP,
            duration: IMAGE_REVEAL_DURATION,
            ease: "power2.inOut",
    
            onComplete: () => setPrevImage(null),
          });
        } else {
          setPrevImage(null);
        }

        if (!c) {
          pendingRef.current = false;
          return;
        }
        const split = SplitText.create(c.querySelectorAll("p"), {
          type: "lines",
          mask: "lines",
        });
        splitRef.current = split;
        gsap.set(split.lines, { yPercent: 100 });
        gsap.set(c, { visibility: "visible", autoAlpha: 1 });
        pendingRef.current = false;

        gsap.to(split.lines, {
          yPercent: 0,
          duration: 0.72,
          ease: "power3.out",
          stagger: 0.06,
        });
      });
    }, `+=${FADE_IN_DELAY}`);
  };

  const carouselConfig = useMemo(
    () => ({
      infinite: true,
      snap: true,
      variableWidth: true,
      dragSensitivity: 0.005,
      lerpFactor: 0.22,
      setOffset: () => 0,
      onSlideChange: (current: number) => {
        if (steppingRef.current) return;
        const centre = ((current % count) + count) % count;
        const target = (centre - 1 + count) % count;
        if (target === activeRef.current) return;
        activeRef.current = target;
        crossfadeTo(target, 1);
      },
    }),
    [],
  );

  const getBleedPx = (shiftEl: HTMLElement) => {
    const clip = shiftEl.closest<HTMLElement>(".exp-clip");
    const column = clip?.parentElement;
    if (!clip || !column) return 0;
    return Math.max(0, clip.getBoundingClientRect().width - column.clientWidth);
  };

  const syncStripShift = () => {
    const shiftEl = stripShiftRef.current;
    const slider = sliderRef.current;
    if (!shiftEl || !slider) return;

    const slot = slider.viewport.itemWidth;
  
    const bleedPx = getBleedPx(shiftEl);
    const half = slider.viewport.wrapperWidth / 2 - slot / 2 - bleedPx;
    shiftEl.style.transform = `translateX(${-half}px)`;
  };


  const select = (idx: number, dir: 1 | -1) => {
    const clamped = ((idx % count) + count) % count;
    if (clamped === activeRef.current) return;
    activeRef.current = clamped;

    const slider = sliderRef.current;
    if (slider) {
      const wanted = (clamped + 1) % count;
      const stripLen = STRIP.length;
      const from = slider.currentSlide;

      let best = wanted;
      let bestDist = Infinity;
      for (let r = 0; r < STRIP_REPEATS; r++) {
        const candidate = wanted + r * count;
        let delta = (((candidate - from) % stripLen) + stripLen) % stripLen;
        if (delta > stripLen / 2) delta -= stripLen;
        if (Math.abs(delta) < bestDist) {
          bestDist = Math.abs(delta);
          best = from + delta;
        }
      }
      slider.goToIndex(best);
    }
    syncStripShift();


    if (hideTimer.current) clearTimeout(hideTimer.current);
    setHiddenThumb(-1);
    hideTimer.current = setTimeout(
      () => setHiddenThumb(clamped),
      THUMB_HIDE_DELAY * 1000,
    );

    crossfadeTo(clamped, dir);
  };

  const go = (dir: 1 | -1) => {
    select(activeRef.current + dir, dir);
  };


  const stepTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const steppingRef = useRef(false);

  const clearStepQueue = () => {
    stepTimers.current.forEach(clearTimeout);
    stepTimers.current = [];
    steppingRef.current = false;
  };

  const goToThumb = (idx: number) => {
    const target = ((idx % count) + count) % count;
    const from = activeRef.current;
    if (target === from) return;

    clearStepQueue();

    // Shortest way round the ring.
    let delta = target - from;
    if (delta > count / 2) delta -= count;
    if (delta < -count / 2) delta += count;
    const dir: 1 | -1 = delta > 0 ? 1 : -1;
    const steps = Math.abs(delta);

    // One step: just go.
    if (steps === 1) {
      select(target, dir);
      return;
    }

    steppingRef.current = true;
    select((((from + dir) % count) + count) % count, dir);
    for (let i = 2; i <= steps; i++) {
      const to = (((from + dir * i) % count) + count) % count;
      const isLast = i === steps;
      stepTimers.current.push(
        setTimeout(
          () => {
            select(to, dir);
            if (isLast) {
              stepTimers.current.push(
                setTimeout(() => {
                  steppingRef.current = false;
                }, STEP_SETTLE * 1000),
              );
            }
          },
          (i - 1) * STEP_STAGGER * 1000,
        ),
      );
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-white py-[7%] text-black max-[1025px]:py-[10%]">
      <div className="pl-[5%]">
        <FocusTextWrap>
          <h2 className="font-helvetica-neue w-[45vw] text-[3.8vw] leading-[1.1] font-normal tracking-[-0.02em] max-[1025px]:w-full max-[1025px]:text-[6vw] max-md:text-[9vw]">
            Real Homes. Real Experiences
          </h2>
        </FocusTextWrap>
        <ParaAnim
          as="p"
          className="text-24 mt-[1.6vw] max-w-[42vw] tracking-wide leading-[1.6] text-black max-[1025px]:mt-[3vw] max-[1025px]:max-w-full max-[1025px]:text-[2.6vw] max-md:text-[4vw]"
        >
          Kyntra Keeps Your Appliances, Repairs, Warranties And Maintenance
          History Together So Every Future Job Starts With Context.
        </ParaAnim>
      </div>

      <div className="mt-[4vw] grid grid-cols-[minmax(0,1fr)_36vw] pl-[5%] items-start gap-[1.5vw] max-[1025px]:grid-cols-1 max-[1025px]:gap-[8vw]">
      
        <FadeUp className="border-kyntra-primary relative min-h-[23.5vw] overflow-hidden rounded-[1.6vw] border px-[3vw] py-[3.2vw] max-[1025px]:min-h-0 max-md:rounded-[5vw] max-md:p-[7vw]">
        
          <div className="flex items-start gap-[2.6vw] max-md:flex-col max-md:gap-[6vw]">
  
            <div className="relative aspect-square w-[18vw] shrink-0 overflow-hidden rounded-[1.1vw] max-[1025px]:w-[26vw] max-md:w-full max-md:rounded-[4vw]">
              <div ref={prevImageWrapRef} className="absolute inset-0">
                {prevImage ? (
                  <Image
                    src={prevImage.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 84vw, 16vw"
                    className="object-cover grayscale"
                    draggable={false}
                    aria-hidden
                  />
                ) : null}
              </div>
          
              <div
                ref={imageWrapRef}
                className="absolute inset-0"
                style={
                  pendingRef.current ? { visibility: "hidden" } : undefined
                }
              >
                <Image
                  src={TESTIMONIALS[active].image}
                  alt={TESTIMONIALS[active].name}
                  fill
                  sizes="(max-width: 768px) 84vw, 16vw"
                  className="object-cover grayscale"
                  draggable={false}
                />
              </div>
            </div>

            {/* text */}
            <div className="flex flex-1 flex-col justify-start">
      
              <svg className="h-auto w-16" width="79" height="59" viewBox="0 0 79 59" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M60.5663 58.4512C70.7473 58.4512 79.0005 50.1957 79.0005 40.0111C79.0005 29.8302 70.7473 21.5747 60.5663 21.5747C60.5663 21.5747 60.6555 14.7251 66.2201 4.86679C66.8382 2.89148 65.7364 0.787945 63.7598 0.173382C62.3574 -0.267754 60.8817 0.161037 59.9288 1.15918C47.1337 15.1539 42.1252 31.6248 42.1252 40.0111C42.1252 50.1957 50.3783 58.4512 60.5663 58.4512Z" fill="#134BD6"/>
<path d="M18.4413 58.4512C28.6223 58.4512 36.8755 50.1955 36.8755 40.0111C36.8755 29.8302 28.6223 21.5747 18.4413 21.5747C18.4413 21.5747 18.5305 14.7251 24.0951 4.86679C24.7132 2.89148 23.6112 0.787949 21.6348 0.173386C20.2324 -0.26775 18.7567 0.161041 17.8039 1.15919C5.0087 15.1539 6.86646e-05 31.6248 6.86646e-05 40.0111C6.86646e-05 50.1957 8.25326 58.4512 18.4413 58.4512Z" fill="#134BD6"/>
</svg>


              <div
                ref={contentRef}
                key={active}
                style={
                  pendingRef.current ? { visibility: "hidden" } : undefined
                }
              >
                <p className="mt-[1.4vw] text-24 leading-[1.4] text-black max-[1025px]:text-[2.4vw] max-md:mt-[5vw] max-md:text-[4vw]">
                  &ldquo;{TESTIMONIALS[active].quote}&rdquo;
                </p>
                <p className="mt-[1.6vw] text-[1.55vw] text-kyntra-primary max-[1025px]:text-[2.6vw] max-md:mt-[6vw] max-md:text-[4.4vw]">
                  {TESTIMONIALS[active].name}
                </p>
                <p className="mt-[0.1vw] text-22 text-black max-[1025px]:text-[2vw] max-md:text-[3.6vw]">
                  {TESTIMONIALS[active].meta}
                </p>
              </div>
            </div>
          </div>
        </FadeUp>

        <div className="flex w-full flex-col items-end gap-[2vw] max-[1025px]:items-start">
          <div className="pr-[7vw]">
            <CarouselNavButtons onPrev={() => go(-1)} onNext={() => go(1)} />
          </div>

          <div
            style={BLEED_VARS}
            className="exp-clip -ml-(--exp-bleed) w-[calc(100%+var(--exp-bleed))] overflow-hidden [--exp-bleed:var(--exp-bleed-desktop)] max-[1025px]:[--exp-bleed:var(--exp-bleed-tablet)] max-md:[--exp-bleed:var(--exp-bleed-mobile)]"
          >
            <FadeUp className="w-full">
              <SmoothInfiniteCarousel
                wrapperClassName="exp-strip will-change-transform"
              
                className="w-full"
                config={carouselConfig}
                itemClassName="cursor-grab active:cursor-grabbing"
                onReady={(slider) => {
                  sliderRef.current = slider;
            
                  stripShiftRef.current = slider.wrapper as HTMLDivElement;
                  requestAnimationFrame(() => {
                    // Start: testimonial 0 in the card, strip begins at 1.
                    slider.goToIndex(1);
                    syncStripShift();
                  });
                }}
              >
                {STRIP.map((t, stripIndex) => {
                  const i = stripIndex % count;
                  return (
          
                    <div
                      key={`${t.name}-${stripIndex}`}
                      className="pr-[1.6vw] max-md:pr-[3vw]"
                    >
                      <button
                        type="button"
                        onClick={() => goToThumb(i)}
                        aria-label={`Show testimonial from ${t.name}`}
                        aria-hidden={stripIndex >= count}
                        tabIndex={stripIndex >= count ? -1 : undefined}
                      
                        className={`relative block aspect-square w-[13vw] overflow-hidden rounded-[1vw] max-[1025px]:w-[25vw] max-md:w-[26vw] max-md:rounded-[3vw] ${
                          hiddenThumb === i ? "opacity-0" : "opacity-100"
                        }`}
                      >
                        <Image
                          src={t.image}
                          alt={t.name}
                          fill
                          sizes="(max-width: 768px) 26vw, 13vw"
                          className="object-cover"
                          draggable={false}
                        />
                      </button>
                    </div>
                  );
                })}
              </SmoothInfiniteCarousel>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
