// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { AnimatePresence, MotionConfig, motion, type Transition, type Variants } from "motion/react";
import React, { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";

export interface AnimatedTabItem {
  id?: string | number;
  label: string;
  content: ReactNode;
}

/** underline: a bar slides to the active tab. glide: a pill slides there. fade: the bar fades in place. */
export type TabsIndicator = "underline" | "glide" | "fade";
/** slide: content leaves one way and arrives from the other. fade: it fades out, then the next fades in. */
export type TabsAnimation = "slide" | "fade" | "none";
/** solid: the pill is filled with the accent colour. soft: a light tint of the text colour. */
export type TabsPillStyle = "solid" | "soft";
export type TabsRounded = "none" | "sm" | "md" | "lg" | "xl" | "full";

export interface AnimatedTabsCompProps {
  tabs?: AnimatedTabItem[];
  defaultActiveIndex?: number;
  className?: string;
  /** How content changes when you switch tabs. */
  animationType?: TabsAnimation;
  /** How far the content slides, in px. */
  slideDistance?: number;
  /** Active tab text, the indicator, the solid pill and the focus ring. */
  accentColor?: string;
  /** Seconds. How long the indicator and the content take. */
  duration?: number;
  /** Springiness of the indicator and the slide. */
  bounce?: number;
  indicator?: TabsIndicator;
  /** Only used by the glide indicator. */
  pillStyle?: TabsPillStyle;
  /** A soft highlight follows the pointer over the tabs. */
  hoverHighlight?: boolean;
  /** The panel grows and shrinks to fit the content instead of jumping. */
  smoothHeight?: boolean;
  /** A line under the row of tabs. */
  divider?: boolean;
  /** A border around the row of tabs. */
  listBorder?: boolean;
  /** A border around the content. */
  panelBorder?: boolean;
  rounded?: TabsRounded;
}

const ROUNDED: Record<TabsRounded, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

// The content panel is a tall box, so "full" would clip it into a capsule; it stops at 3xl
const PANEL_ROUNDED: Record<TabsRounded, string> = { ...ROUNDED, full: "rounded-3xl" };

// Slow at both ends, so the fade never looks like it starts or stops abruptly
const fadeEase = [0.45, 0, 0.25, 1] as const;

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const read = () => setReduce(mq.matches);
    read();
    mq.addEventListener?.("change", read);
    return () => mq.removeEventListener?.("change", read);
  }, []);
  return reduce;
}

// Measures the content so the panel can grow and shrink to fit it
function useHeight() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize[0].blockSize));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, height] as const;
}

const AnimatedTabsComp = ({
  tabs = [],
  defaultActiveIndex = 0,
  className = "",
  animationType = "slide",
  slideDistance = 40,
  accentColor = "#ff6b00",
  duration = 0.35,
  bounce = 0.15,
  indicator = "underline",
  pillStyle = "solid",
  hoverHighlight = false,
  smoothHeight = true,
  divider = true,
  listBorder = false,
  panelBorder = false,
  rounded = "md",
}: AnimatedTabsCompProps) => {
  const safeDefaultIndex =
    tabs.length > 0 ? Math.min(Math.max(defaultActiveIndex, 0), tabs.length - 1) : 0;
  const values = tabs.map((tab, index) => String(tab.id ?? index));

  const id = useId();
  const reduceMotion = usePrefersReducedMotion();
  const [active, setActive] = useState(values[safeDefaultIndex]);
  // 1 when the new tab is further right, -1 when it is further left
  const [direction, setDirection] = useState(1);
  const [hovered, setHovered] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const seen = useRef(false);
  const [measure, height] = useHeight();

  const safeDuration = Math.max(0.05, Number(duration) || 0.35);
  const pill = indicator === "glide";
  const activeIndex = Math.max(values.indexOf(active), 0);

  const still: Transition = { duration: 0 };
  const move: Transition = reduceMotion ? still : { type: "spring", duration: safeDuration * 0.6, bounce };
  const quick: Transition = reduceMotion ? still : { duration: 0.25, ease: fadeEase };
  const grow: Transition = reduceMotion ? still : { type: "spring", duration: 0.4, bounce: 0 };

  // When the row scrolls, bring the tab you switched to into view
  useEffect(() => {
    if (!seen.current) {
      seen.current = true;
      return;
    }
    const el = tabRefs.current[activeIndex];
    const scroller = scrollRef.current;
    if (!el || !scroller) return;
    const left = el.offsetLeft;
    const right = left + el.offsetWidth;
    if (left >= scroller.scrollLeft && right <= scroller.scrollLeft + scroller.clientWidth) return;
    scroller.scrollTo({
      left: left - (scroller.clientWidth - el.offsetWidth) / 2,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [activeIndex, reduceMotion]);

  if (!tabs.length) return null;

  const slide = animationType === "slide" && !reduceMotion;
  const instant = animationType === "none" || reduceMotion;

  const variants: Variants = {
    enter: (d: number) => ({ opacity: instant ? 1 : 0, x: slide ? d * slideDistance : 0 }),
    center: {
      opacity: 1,
      x: 0,
      transition: instant
        ? still
        : slide
          ? { type: "spring", duration: safeDuration, bounce }
          : { duration: safeDuration, ease: fadeEase },
    },
    exit: (d: number) => ({
      opacity: instant ? 1 : 0,
      x: slide ? -d * slideDistance : 0,
      // Sliding out is quick so the switch never feels slow; a fade takes the same time each way
      transition: instant
        ? still
        : slide
          ? { duration: safeDuration * 0.5, ease: "easeIn" }
          : { duration: safeDuration, ease: fadeEase },
    }),
  };

  const bar = "absolute inset-x-0 bottom-0 z-0 h-0.5 bg-(--tabs-accent) max-md:h-[0.4vw]";
  const activeTab = tabs[activeIndex];

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
      <TabsPrimitive.Root
        value={active}
        onValueChange={(next) => {
          const value = String(next);
          setDirection(values.indexOf(value) >= values.indexOf(active) ? 1 : -1);
          setActive(value);
        }}
        style={{ "--tabs-accent": accentColor } as CSSProperties}
        className={`flex h-full w-full flex-col gap-[2vw] px-[7vw] py-[4vw] max-lg:gap-[4vw] max-lg:p-[6vw] max-md:gap-[5vw] max-md:px-[5vw] max-md:py-[8vw] ${className}`}
      >
        {/* A pill row or a bordered row gets some air above the divider, so the two lines never touch */}
        <div className={cx("flex min-w-0 flex-col", (pill || listBorder) && "gap-[1vw] max-md:gap-[3vw]")}>
          {/* On a narrow screen the row scrolls sideways, with no scrollbar, and is clipped at its border */}
          <div
            ref={scrollRef}
            className={cx(
              "w-fit max-w-full overflow-x-auto overscroll-x-contain scrollbar-none [&::-webkit-scrollbar]:hidden",
              (pill || listBorder) && ROUNDED[rounded],
              listBorder && "border border-current/10"
            )}
          >
            <TabsPrimitive.List
              // Arrow keys move to the next tab and show its content straight away
              activateOnFocus
              className={cx(
                "relative flex w-max items-center",
                pill ? "gap-1 p-1" : "gap-[2vw] max-lg:gap-[3vw] max-md:gap-[4vw]",
                listBorder && !pill && "p-1"
              )}
            >
              {tabs.map((tab, index) => {
                const value = values[index];
                const isActive = value === active;

                return (
                  <TabsPrimitive.Tab
                    key={value}
                    ref={(el: HTMLButtonElement | null) => {
                      tabRefs.current[index] = el;
                    }}
                    value={value}
                    id={`${id}-tab-${index}`}
                    aria-controls={isActive ? `${id}-panel-${index}` : undefined}
                    onPointerEnter={() => setHovered(value)}
                    onPointerLeave={() => setHovered(null)}
                    className={cx(
                      "relative flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap border-none bg-transparent px-[2vw] py-[1vw] outline-none max-lg:px-[2.5vw] max-lg:py-[1.5vw] max-md:px-[3vw] max-md:py-[2.5vw]",
                      "transition-colors duration-300 ease-in-out motion-reduce:transition-none",
                      // Inside the tab, so the scrolling row doesn't clip the focus ring
                      "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--tabs-accent)",
                      "data-disabled:cursor-not-allowed data-disabled:opacity-50",
                      ROUNDED[rounded],
                      isActive
                        ? pill && pillStyle === "solid"
                          ? "text-white"
                          : "text-(--tabs-accent)"
                        : "text-current/50 hover:text-current"
                    )}
                  >
                    <AnimatePresence initial={false}>
                      {hoverHighlight && hovered === value && !isActive && (
                        <motion.span
                          key="hover"
                          aria-hidden
                          layoutId={`${id}-hover`}
                          className={cx("absolute inset-0 z-0 bg-current/8", ROUNDED[rounded])}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={move}
                        />
                      )}
                    </AnimatePresence>

                    {pill && isActive && (
                      <motion.span
                        aria-hidden
                        layoutId={`${id}-pill`}
                        className={cx(
                          "absolute inset-0 z-0",
                          pillStyle === "solid" ? "bg-(--tabs-accent)" : "bg-current/8 ring-1 ring-current/10",
                          ROUNDED[rounded]
                        )}
                        transition={move}
                      />
                    )}

                    {indicator === "underline" && isActive && (
                      <motion.span aria-hidden layoutId={`${id}-line`} className={bar} transition={move} />
                    )}

                    {indicator === "fade" && (
                      <motion.span
                        aria-hidden
                        className={bar}
                        initial={false}
                        animate={{ opacity: isActive ? 1 : 0 }}
                        transition={quick}
                      />
                    )}

                    <span className="relative z-10 text-[1.2vw] font-medium max-lg:text-[2.2vw] max-md:text-[4vw]">
                      {tab.label}
                    </span>
                  </TabsPrimitive.Tab>
                );
              })}
            </TabsPrimitive.List>
          </div>
          {divider && <div aria-hidden className="h-px w-full bg-current/10" />}
        </div>

        <div
          className={cx(
            "relative w-full overflow-hidden",
            panelBorder && "border border-current/10",
            PANEL_ROUNDED[rounded]
          )}
        >
          <motion.div
            initial={false}
            animate={{ height: smoothHeight && height !== null ? height : "auto" }}
            transition={grow}
          >
            <div ref={measure}>
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.div
                  key={active}
                  role="tabpanel"
                  id={`${id}-panel-${activeIndex}`}
                  aria-labelledby={`${id}-tab-${activeIndex}`}
                  tabIndex={0}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className={cx(
                    "h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--tabs-accent)",
                    panelBorder && "p-[1.5vw] max-lg:p-[3vw] max-md:p-[4vw]"
                  )}
                >
                  {activeTab.content}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </TabsPrimitive.Root>
    </MotionConfig>
  );
};

const tabsData = [
  {
    id: "overview",
    label: "Overview",
    content: (
      <div className="h-full w-full rounded-[1.5vw] border border-black/20  p-[2vw] text-black backdrop-blur-sm max-lg:rounded-[2.5vw] max-lg:p-[4vw] max-md:rounded-[4vw] max-md:p-[5vw]">
        <h2 className="mb-[1vw] text-[2.2vw] font-medium leading-[1.1] max-lg:mb-[2vw] max-lg:text-[4.5vw] max-md:mb-[3vw] max-md:text-[7vw]">
          Digital Experiences That Feel Expensive
        </h2>

        <p className="w-[72%] text-[1.1vw] leading-relaxed text-black/70 max-lg:w-[90%] max-lg:text-[2.2vw] max-md:w-full max-md:text-[4vw] max-md:leading-[1.6]">
          Hyperiux designs and builds premium websites, product interfaces, and
          interaction systems for brands that cannot afford to look like another
          polite rectangle on the internet.
        </p>

        <div className="mt-[2vw] flex gap-[1.5vw] max-lg:mt-[3vw] max-lg:gap-[2.2vw] max-md:mt-[5vw] max-md:flex-col max-md:gap-[3vw]">
          <div className="flex-1 rounded-[1vw] border border-white/10  p-[1.5vw] max-lg:rounded-[1.8vw] max-lg:p-[2.5vw] max-md:rounded-[3vw] max-md:p-[4vw]">
            <h3 className="mb-[0.5vw] text-[2vw] font-semibold leading-none max-lg:mb-[1vw] max-lg:text-[3.8vw] max-md:mb-[1.5vw] max-md:text-[6vw]">
              UX
            </h3>
            <p className="text-[1vw] leading-[1.4] text-black/60 max-lg:text-[1.9vw] max-md:text-[3.7vw] max-md:leading-relaxed">
              Strategy, structure, and product thinking before pixels start behaving.
            </p>
          </div>

          <div className="flex-1 rounded-[1vw] border border-white/10  p-[1.5vw] max-lg:rounded-[1.8vw] max-lg:p-[2.5vw] max-md:rounded-[3vw] max-md:p-[4vw]">
            <h3 className="mb-[0.5vw] text-[2vw] font-semibold leading-none max-lg:mb-[1vw] max-lg:text-[3.8vw] max-md:mb-[1.5vw] max-md:text-[6vw]">
              UI
            </h3>
            <p className="text-[1vw] leading-[1.4] text-black/60 max-lg:text-[1.9vw] max-md:text-[3.7vw] max-md:leading-relaxed">
              Interfaces with sharper hierarchy, stronger taste, and fewer filler sections.
            </p>
          </div>

          <div className="flex-1 rounded-[1vw] border border-white/10  p-[1.5vw] max-lg:rounded-[1.8vw] max-lg:p-[2.5vw] max-md:rounded-[3vw] max-md:p-[4vw]">
            <h3 className="mb-[0.5vw] text-[2vw] font-semibold leading-none max-lg:mb-[1vw] max-lg:text-[3.8vw] max-md:mb-[1.5vw] max-md:text-[6vw]">
              Motion
            </h3>
            <p className="text-[1vw] leading-[1.4] text-black/60 max-lg:text-[1.9vw] max-md:text-[3.7vw] max-md:leading-relaxed">
              Scroll, hover, transition, and WebGL details that earn their place.
            </p>
          </div>
        </div>
      </div>
    ),
  },

  {
    id: "services",
    label: "Services",
    content: (
      <div className="h-full w-full rounded-[1.5vw] border border-black/20  p-[2vw] text-black backdrop-blur-sm max-lg:rounded-[2.5vw] max-lg:p-[4vw] max-md:rounded-[4vw] max-md:p-[5vw]">
        <h2 className="mb-[1vw] text-[2.2vw] font-medium leading-[1.1] max-lg:mb-[2vw] max-lg:text-[4.5vw] max-md:mb-[3vw] max-md:text-[7vw]">
          From Strategy to the Last Hover State
        </h2>

        <div className="mt-[2vw] grid grid-cols-2 gap-[1.5vw] max-lg:mt-[3vw] max-lg:gap-[2.2vw] max-md:mt-[5vw] max-md:grid-cols-1 max-md:gap-[4vw]">
          <div className="rounded-[1vw] border border-white/10  p-[1.4vw] max-lg:rounded-[1.8vw] max-lg:p-[2.2vw] max-md:rounded-[3vw] max-md:p-[4vw]">
            <h4 className="mb-[0.5vw] text-[1.3vw] font-medium leading-[1.2] max-lg:mb-[1vw] max-lg:text-[2.4vw] max-md:mb-[1.5vw] max-md:text-[4.5vw]">
              Website Redesign
            </h4>
            <p className="text-[1vw] leading-relaxed text-black/60 max-lg:text-[1.9vw] max-md:text-[3.8vw] max-md:leading-[1.6]">
              Rebuild tired pages into sharper digital experiences with clearer journeys.
            </p>
          </div>

          <div className="rounded-[1vw] border border-white/10  p-[1.4vw] max-lg:rounded-[1.8vw] max-lg:p-[2.2vw] max-md:rounded-[3vw] max-md:p-[4vw]">
            <h4 className="mb-[0.5vw] text-[1.3vw] font-medium leading-[1.2] max-lg:mb-[1vw] max-lg:text-[2.4vw] max-md:mb-[1.5vw] max-md:text-[4.5vw]">
              Product UX Design
            </h4>
            <p className="text-[1vw] leading-relaxed text-black/60 max-lg:text-[1.9vw] max-md:text-[3.8vw] max-md:leading-[1.6]">
              Flows, screens, systems, and decisions designed for real product use.
            </p>
          </div>

          <div className="rounded-[1vw] border border-white/10  p-[1.4vw] max-lg:rounded-[1.8vw] max-lg:p-[2.2vw] max-md:rounded-[3vw] max-md:p-[4vw]">
            <h4 className="mb-[0.5vw] text-[1.3vw] font-medium leading-[1.2] max-lg:mb-[1vw] max-lg:text-[2.4vw] max-md:mb-[1.5vw] max-md:text-[4.5vw]">
              Creative Frontend
            </h4>
            <p className="text-[1vw] leading-relaxed text-black/60 max-lg:text-[1.9vw] max-md:text-[3.8vw] max-md:leading-[1.6]">
              Next.js, animation, interaction systems, and frontend polish that feels deliberate.
            </p>
          </div>

          <div className="rounded-[1vw] border border-white/10  p-[1.4vw] max-lg:rounded-[1.8vw] max-lg:p-[2.2vw] max-md:rounded-[3vw] max-md:p-[4vw]">
            <h4 className="mb-[0.5vw] text-[1.3vw] font-medium leading-[1.2] max-lg:mb-[1vw] max-lg:text-[2.4vw] max-md:mb-[1.5vw] max-md:text-[4.5vw]">
              CRO & Performance
            </h4>
            <p className="text-[1vw] leading-relaxed text-black/60 max-lg:text-[1.9vw] max-md:text-[3.8vw] max-md:leading-[1.6]">
              Cleaner paths, faster pages, stronger messaging, and fewer leaks in the funnel.
            </p>
          </div>
        </div>
      </div>
    ),
  },

  {
    id: "contact",
    label: "Contact",
    content: (
      <div className="h-full w-full rounded-[1.5vw] border border-black/20  p-[2vw] text-black backdrop-blur-sm max-lg:rounded-[2.5vw] max-lg:p-[4vw] max-md:rounded-[4vw] max-md:p-[5vw]">
        <h2 className="mb-[1vw] text-[2.2vw] font-medium leading-[1.1] max-lg:mb-[2vw] max-lg:text-[4.5vw] max-md:mb-[3vw] max-md:text-[7vw]">
          Bring Us the Messy Part
        </h2>

        <p className="w-[72%] text-[1.1vw] leading-relaxed text-black/70 max-lg:w-[90%] max-lg:text-[2.2vw] max-md:w-full max-md:text-[4vw] max-md:leading-[1.6]">
          Send the brief, the broken homepage, the product flow, or the idea that
          still sounds better in your head. We will help turn it into something
          structured, useful, and memorable.
        </p>

        <div className="mb-[3vw] mt-[2vw] flex gap-[3vw] max-lg:mt-[3vw] max-lg:gap-[5vw] max-md:mt-[5vw] max-md:flex-col max-md:gap-[4vw]">
          <div className="flex flex-col gap-[0.3vw] max-lg:gap-[0.7vw] max-md:gap-[1vw]">
            <p className="text-[0.9vw] leading-[1.3] text-black/45 max-lg:text-[1.7vw] max-md:text-[3.4vw]">
              Email
            </p>
            <span className="text-[1.1vw] font-medium leading-[1.4] max-lg:text-[2.1vw] max-md:text-[4vw]">
              hello@hyperiux.com
            </span>
          </div>

          <div className="flex flex-col gap-[0.3vw] max-lg:gap-[0.7vw] max-md:gap-[1vw]">
            <p className="text-[0.9vw] leading-[1.3] text-black/45 max-lg:text-[1.7vw] max-md:text-[3.4vw]">
              Work With Us
            </p>
            <span className="text-[1.1vw] font-medium leading-[1.4] max-lg:text-[2.1vw] max-md:text-[4vw]">
              Strategy, UX, UI, frontend, CRO
            </span>
          </div>
        </div>
      </div>
    ),
  },
];

export type AnimatedTabsProps = Omit<AnimatedTabsCompProps, "tabs" | "className">;

export default function AnimatedTabs(props: AnimatedTabsProps) {
  return (
    <section className="w-full bg-white text-black">
      <AnimatedTabsComp key={props.defaultActiveIndex ?? 0} tabs={tabsData} {...props} />
    </section>
  );
}

export { AnimatedTabsComp };
