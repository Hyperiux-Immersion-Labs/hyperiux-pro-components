// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { AnimatePresence, MotionConfig, motion, type Transition, type Variants } from "motion/react";
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";

export type AnimatedTabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

type AnimatedTabsProps = {
  tabs: AnimatedTabItem[];
  ariaLabel: string;
  defaultActiveIndex?: number;
  onChange?: (index: number) => void;
  className?: string;
  listClassName?: string;
  tabClassName?: string;
  labelClassName?: string;
  accentColor?: string;
  activeTextColor?: string;
  slideDistance?: number;
  duration?: number;
  bounce?: number;
  hoverHighlight?: boolean;
};

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

export default function AnimatedTabs({
  tabs,
  ariaLabel,
  defaultActiveIndex = 0,
  onChange,
  className = "",
  listClassName = "",
  tabClassName = "",
  labelClassName = "",
  accentColor = "#151927",
  activeTextColor = "#f5f6fa",
  slideDistance = 40,
  duration = 0.45,
  bounce = 0.15,
  hoverHighlight = true,
}: AnimatedTabsProps) {
  const values = tabs.map((tab) => tab.id);
  const id = useId();
  const reduceMotion = usePrefersReducedMotion();
  const [active, setActive] = useState(values[Math.min(Math.max(defaultActiveIndex, 0), tabs.length - 1)]);
  const [direction, setDirection] = useState(1);
  const [hovered, setHovered] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const seen = useRef(false);
  const [measure, height] = useHeight();
  const activeIndex = Math.max(values.indexOf(active), 0);

  const still: Transition = { duration: 0 };
  const move: Transition = reduceMotion ? still : { type: "spring", duration: duration * 0.6, bounce };
  const grow: Transition = reduceMotion ? still : { type: "spring", duration: 0.4, bounce: 0 };

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
    scroller.scrollTo({ left: left - (scroller.clientWidth - el.offsetWidth) / 2, behavior: reduceMotion ? "auto" : "smooth" });
  }, [activeIndex, reduceMotion]);

  if (!tabs.length) return null;

  const variants: Variants = {
    enter: (d: number) => ({ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : d * slideDistance }),
    center: { opacity: 1, x: 0, transition: reduceMotion ? still : { type: "spring", duration, bounce } },
    exit: (d: number) => ({
      opacity: reduceMotion ? 1 : 0,
      x: reduceMotion ? 0 : -d * slideDistance,
      transition: reduceMotion ? still : { duration: duration * 0.5, ease: "easeIn" },
    }),
  };

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
      <TabsPrimitive.Root
        value={active}
        onValueChange={(next) => {
          const value = String(next);
          const index = values.indexOf(value);
          setDirection(index >= values.indexOf(active) ? 1 : -1);
          setActive(value);
          onChange?.(index);
        }}
        style={{ "--tabs-accent": accentColor, "--tabs-active-text": activeTextColor } as CSSProperties}
        className={`flex w-full flex-col ${className}`}
      >
        <div ref={scrollRef} className="w-full overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsPrimitive.List activateOnFocus aria-label={ariaLabel} className={cx("relative flex w-max items-center", listClassName)}>
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
                    "relative flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-md border-none bg-transparent outline-none",
                    "transition-colors duration-300 ease-in-out motion-reduce:transition-none",
                    "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#aeb8e8]",
                    isActive ? "text-(--tabs-active-text)" : "text-current/60 hover:text-current",
                    tabClassName,
                  )}
                >
                  <AnimatePresence initial={false}>
                    {hoverHighlight && hovered === value && !isActive && (
                      <motion.span
                        key="hover"
                        aria-hidden
                        layoutId={`${id}-hover`}
                        className="absolute inset-0 z-0 rounded-md bg-current/6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={move}
                      />
                    )}
                  </AnimatePresence>
                  {isActive && (
                    <motion.span
                      aria-hidden
                      layoutId={`${id}-pill`}
                      className="absolute inset-0 z-0 rounded-md bg-(--tabs-accent)"
                      transition={move}
                    />
                  )}
                  <span className={cx("relative z-10", labelClassName)}>{tab.label}</span>
                </TabsPrimitive.Tab>
              );
            })}
          </TabsPrimitive.List>
        </div>

        <div className="relative w-full overflow-hidden">
          <motion.div initial={false} animate={{ height: height !== null ? height : "auto" }} transition={grow}>
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
                  className="w-full outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#aeb8e8]"
                >
                  {tabs[activeIndex].content}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </TabsPrimitive.Root>
    </MotionConfig>
  );
}
