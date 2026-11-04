// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { motion, type Transition, type Variants } from "motion/react";
import {
  Children,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

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

const smoothEase = [0.22, 1, 0.36, 1] as const;
const fillEase = [0.215, 0.61, 0.355, 1] as const;
const plusSpin = { duration: 0.3, ease: "easeInOut" } as const;

type MotionPreset = {
  panelOpen: Transition;
  panelClose: Transition;
  fillOpen: Transition;
  fillClose: Transition;
  contentY: Transition;
  delay: number;
  stagger: number;
};

function buildPreset(duration: number, delay: number, stagger: number): MotionPreset {
  const smooth = { duration, ease: smoothEase };
  const fill = { duration, ease: fillEase };
  return {
    panelOpen: smooth,
    panelClose: smooth,
    fillOpen: fill,
    fillClose: fill,
    contentY: { duration: duration * 0.6, ease: "easeOut" },
    delay,
    stagger,
  };
}

type FAQGroupContextValue = {
  openItems: string[];
  toggleItem: (itemId: string) => void;
};

type FAQContextValue = {
  isOpen: boolean;
  contentId: string;
  buttonId: string;
  preset: MotionPreset;
  reduceMotion: boolean;
  onToggle: () => void;
};

const FAQContext = createContext<FAQContextValue | null>(null);
const FAQGroupContext = createContext<FAQGroupContextValue | null>(null);

const useFAQContext = () => {
  const context = useContext(FAQContext);
  if (!context) throw new Error("FAQTitle and FAQContent must be used inside FAQWrapper.");
  return context;
};

export function FAQGroup({
  children,
  allowMultiple = false,
  defaultOpenItems = [],
}: {
  children?: ReactNode;
  allowMultiple?: boolean;
  defaultOpenItems?: string[];
}) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpenItems);

  const toggleItem = useCallback(
    (itemId: string) => {
      setOpenItems((current) => {
        const isOpen = current.includes(itemId);
        if (allowMultiple) return isOpen ? current.filter((id) => id !== itemId) : [...current, itemId];
        return isOpen ? [] : [itemId];
      });
    },
    [allowMultiple],
  );

  const value = useMemo(() => ({ openItems, toggleItem }), [openItems, toggleItem]);
  return <FAQGroupContext.Provider value={value}>{children}</FAQGroupContext.Provider>;
}

export function FAQWrapper({
  children,
  className = "",
  itemId,
  duration = 0.5,
  delay = 0.08,
  stagger = 0.05,
  fillClassName = "",
}: {
  children?: ReactNode;
  className?: string;
  itemId: string;
  duration?: number;
  delay?: number;
  stagger?: number;
  fillClassName?: string;
}) {
  const group = useContext(FAQGroupContext);
  const isOpen = group ? group.openItems.includes(itemId) : false;
  const reduceMotion = usePrefersReducedMotion();
  const preset = useMemo(() => buildPreset(duration, delay, stagger), [duration, delay, stagger]);
  const contentId = useId();
  const buttonId = useId();

  const onToggle = () => group?.toggleItem(itemId);

  const handleWrapperClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("a, button, input, textarea, select")) return;
    onToggle();
  };

  return (
    <FAQContext.Provider value={{ isOpen, contentId, buttonId, preset, reduceMotion, onToggle }}>
      <div data-open={isOpen ? "" : undefined} className={`relative isolate cursor-pointer ${className}`} onClick={handleWrapperClick}>
        {fillClassName ? (
          <motion.div
            aria-hidden
            className={`pointer-events-none absolute inset-0 -z-10 rounded-[inherit] ${fillClassName}`}
            style={{ originY: 0 }}
            initial={false}
            animate={{ scaleY: isOpen ? 1 : 0 }}
            transition={reduceMotion ? { duration: 0 } : isOpen ? preset.fillOpen : preset.fillClose}
          />
        ) : null}
        {children}
      </div>
    </FAQContext.Provider>
  );
}

function MorphPlus({ open, reduceMotion, className }: { open: boolean; reduceMotion: boolean; className: string }) {
  const transition = reduceMotion ? { duration: 0 } : plusSpin;
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      className={className}
      initial={false}
      animate={{ rotate: open ? 180 : 0 }}
      transition={transition}
    >
      <path d="M5 12h14" />
      <motion.path d="M5 12h14" initial={false} animate={{ rotate: open ? 0 : 90 }} transition={transition} />
    </motion.svg>
  );
}

export function FAQTitle({
  children,
  className = "",
  iconClassName = "",
}: {
  children?: ReactNode;
  className?: string;
  iconClassName?: string;
}) {
  const { isOpen, contentId, buttonId, reduceMotion, onToggle } = useFAQContext();
  return (
    <button
      type="button"
      id={buttonId}
      aria-expanded={isOpen}
      aria-controls={contentId}
      onClick={onToggle}
      className={`flex w-full cursor-pointer items-center justify-between gap-6 text-left ${className}`}
    >
      <span className="block flex-1">{children}</span>
      <MorphPlus open={isOpen} reduceMotion={reduceMotion} className={iconClassName} />
    </button>
  );
}

export function FAQContent({ children, className = "" }: { children?: ReactNode; className?: string }) {
  const { isOpen, contentId, buttonId, preset, reduceMotion } = useFAQContext();
  const [settled, setSettled] = useState(isOpen);

  const groupVariants: Variants = {
    open: { transition: { delayChildren: reduceMotion ? 0 : preset.delay, staggerChildren: reduceMotion ? 0 : preset.stagger } },
    closed: {},
  };

  const itemVariants: Variants = {
    open: {
      opacity: 1,
      y: 0,
      transition: reduceMotion ? { duration: 0 } : { y: preset.contentY, opacity: { duration: 0.3, ease: "easeOut" } },
    },
    closed: { opacity: 0, y: reduceMotion ? 0 : 8, transition: { duration: reduceMotion ? 0 : 0.2, ease: "easeOut" } },
  };

  return (
    <motion.div
      id={contentId}
      role="region"
      aria-labelledby={buttonId}
      inert={!isOpen}
      initial={false}
      animate={{ height: isOpen ? "auto" : 0 }}
      transition={reduceMotion ? { duration: 0 } : isOpen ? preset.panelOpen : preset.panelClose}
      onAnimationStart={() => setSettled(false)}
      onAnimationComplete={() => setSettled(isOpen)}
      style={{ overflow: isOpen && settled ? "visible" : "hidden" }}
    >
      <motion.div initial={false} animate={isOpen ? "open" : "closed"} variants={groupVariants} className={className}>
        {Children.toArray(children).map((child, i) => (
          <motion.div key={i} variants={itemVariants}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

const AnimatedFAQ = { Group: FAQGroup, Wrapper: FAQWrapper, Title: FAQTitle, Content: FAQContent };

export default AnimatedFAQ;
