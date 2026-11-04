// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useIsPresent,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
  type Transition,
  type Variants,
} from "motion/react";
import { twMerge } from "tailwind-merge";

function toClass(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(toClass).filter(Boolean).join(" ");
  if (Object.getPrototypeOf(value) !== Object.prototype) return "";
  const record = value as Record<string, unknown>;
  return Object.keys(record)
    .filter((key) => record[key])
    .join(" ");
}

function cn(...inputs: unknown[]) {
  return twMerge(toClass(inputs));
}

type FloatingTooltipVariant = "default" | "outline";
type FloatingTooltipRounded = "none" | "sm" | "md" | "lg" | "xl" | "full";
type FloatingTooltipFollow = "cursor" | "anchor";
type FloatingTooltipSide = "top" | "bottom" | "left" | "right";
type FloatingTooltipAppear = "scale" | "fade" | "none";
type FloatingTooltipChange = "instant" | "fade" | "roll" | "slide";
type FloatingTooltipOffset = "1" | "2" | "3" | "4" | "6" | "8";

type FloatingTooltipOptions = {
  variant: FloatingTooltipVariant;
  rounded: FloatingTooltipRounded;
  follow: FloatingTooltipFollow;
  side: FloatingTooltipSide;
  sideOffset: FloatingTooltipOffset;
  appearAnimation: FloatingTooltipAppear;
  changeAnimation: FloatingTooltipChange;
  stretchOnMove: boolean;
  tiltOnMove: boolean;
  elastic: boolean;
  stiffness: number;
  closeDelay: number;
  duration: number;
  bounce: number;
};

const TEXT_SIZE = "px-3.5 py-2.5 text-sm";

const ROUNDED: Record<FloatingTooltipRounded, string> = {
  none: "rounded-none",
  sm: "rounded-md",
  md: "rounded-md",
  lg: "rounded-md",
  xl: "rounded-md",
  full: "rounded-md",
};

const VARIANT: Record<FloatingTooltipVariant, string> = {
  default: "bg-[#151927] text-[#f5f6fa] shadow-lg shadow-[#151927]/15",
  outline: "border border-[#e2e4ec] bg-white text-[#151927]",
};

const EDGE = 8;

const TOUCH_HOLD = 2500;

const TOUCH_IN = { duration: 0.45, ease: [0.45, 0, 0.25, 1] } as const;
const TOUCH_OUT = { duration: 0.25, ease: [0.45, 0, 0.55, 1] } as const;
const TOUCH_SWITCH = 280;

type Payload = {
  key: string;
  content: React.ReactNode;
  description?: React.ReactNode;
  contentClassName?: string;
  descriptionClassName?: string;
};

type Show = (payload: Payload, anchor: HTMLElement, source: "pointer" | "focus" | "touch", point?: { x: number; y: number }) => void;

type Controller = {
  show: Show;
  move: (point: { x: number; y: number }) => void;
  hide: (key?: string) => void;
  activeKey: string | null;
  tooltipId: string;
};

const OptionsContext = React.createContext<FloatingTooltipOptions | null>(null);
const ControllerContext = React.createContext<Controller | null>(null);

function useOptions() {
  const value = React.useContext(OptionsContext);
  if (!value) throw new Error("FloatingTooltip must be used inside <FloatingTooltipProvider>.");
  return value;
}

function useController() {
  const value = React.useContext(ControllerContext);
  if (!value) throw new Error("FloatingTooltip must be used inside <FloatingTooltipProvider>.");
  return value;
}

function useReduceMotion() {
  const [reduceMotion, setReduceMotion] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduceMotion(mq.matches);
    read();
    mq.addEventListener?.("change", read);
    return () => mq.removeEventListener?.("change", read);
  }, []);
  return reduceMotion;
}

function ReducedMotionConfig({ children }: { children: React.ReactNode }) {
  const reduce = useReduceMotion();
  return <MotionConfig reducedMotion={reduce ? "always" : "never"}>{children}</MotionConfig>;
}

function useMotionOk(transition: Transition): Transition {
  return useReduceMotion() ? { duration: 0 } : transition;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function FloatingTooltipProvider({
  children,
  variant = "default",
  rounded = "md",
  follow = "cursor",
  side = "top",
  sideOffset = "4",
  appearAnimation = "scale",
  changeAnimation = "instant",
  stretchOnMove = true,
  tiltOnMove = true,
  elastic = true,
  stiffness = 750,
  closeDelay = 0.1,
  duration = 0.35,
  bounce = 0.1,
  portalSelector = ".vey-page",
}: { children: React.ReactNode; portalSelector?: string } & Partial<FloatingTooltipOptions>) {
  const options = React.useMemo(
    () => ({
      variant,
      rounded,
      follow,
      side,
      sideOffset,
      appearAnimation,
      changeAnimation,
      stretchOnMove,
      tiltOnMove,
      elastic,
      stiffness,
      closeDelay,
      duration,
      bounce,
    }),
    [
      variant,
      rounded,
      follow,
      side,
      sideOffset,
      appearAnimation,
      changeAnimation,
      stretchOnMove,
      tiltOnMove,
      elastic,
      stiffness,
      closeDelay,
      duration,
      bounce,
    ],
  );

  const reduceMotion = useReduceMotion();
  const tooltipId = React.useId();
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [open, setOpen] = React.useState(false);
  const [payload, setPayload] = React.useState<Payload | null>(null);
  const [direction, setDirection] = React.useState(1);
  const [touch, setTouch] = React.useState(false);
  const [placed, setPlaced] = React.useState(false);
  const placedRef = React.useRef(false);
  const lastSpot = React.useRef({ x: 0, y: 0 });

  const anchorEl = React.useRef<HTMLElement | null>(null);
  const source = React.useRef<"pointer" | "focus" | "touch">("pointer");
  const cursor = React.useRef({ x: 0, y: 0 });
  const size$ = React.useRef({ w: 0, h: 0 });
  const shell = React.useRef<HTMLDivElement>(null);
  const opening = React.useRef(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const touchTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const switchTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const optionsRef = React.useRef(options);
  const openRef = React.useRef(open);
  const keyRef = React.useRef<string | null>(null);
  const reduceRef = React.useRef(reduceMotion);

  React.useEffect(() => {
    optionsRef.current = options;
    openRef.current = open;
    reduceRef.current = reduceMotion;
  });

  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const springDamping = 2 * Math.sqrt(stiffness) * (elastic ? 1 - bounce : 1);
  const sx = useSpring(tx, { stiffness, damping: springDamping });
  const sy = useSpring(ty, { stiffness, damping: springDamping });
  const position = React.useRef({ tx, ty, sx, sy });
  React.useLayoutEffect(() => {
    position.current = { tx, ty, sx, sy };
  });

  const place = React.useCallback((jump = false) => {
    const { tx, ty, sx, sy } = position.current;
    const o = optionsRef.current;
    const { w, h } = size$.current;
    const gap = Number(o.sideOffset) * 4;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let x = 0;
    let y = 0;

    let target: { left: number; right: number; top: number; bottom: number } | null = null;
    if (o.follow === "cursor" && source.current === "pointer") {
      const { x: cx, y: cy } = cursor.current;
      target = { left: cx, right: cx, top: cy, bottom: cy };
    } else if (anchorEl.current) {
      target = anchorEl.current.getBoundingClientRect();
    }

    if (target) {
      const r = target;
      const cx = (r.left + r.right) / 2;
      const cy = (r.top + r.bottom) / 2;
      let side = o.side;
      if (side === "top" && r.top - gap - h < EDGE) side = "bottom";
      else if (side === "bottom" && r.bottom + gap + h > vh - EDGE) side = "top";
      else if (side === "left" && r.left - gap - w < EDGE) side = "right";
      else if (side === "right" && r.right + gap + w > vw - EDGE) side = "left";
      if (side === "top") [x, y] = [cx - w / 2, r.top - gap - h];
      if (side === "bottom") [x, y] = [cx - w / 2, r.bottom + gap];
      if (side === "left") [x, y] = [r.left - gap - w, cy - h / 2];
      if (side === "right") [x, y] = [r.right + gap, cy - h / 2];
    }

    x = clamp(x, EDGE, Math.max(EDGE, vw - w - EDGE));
    y = clamp(y, EDGE, Math.max(EDGE, vh - h - EDGE));
    lastSpot.current = { x, y };
    tx.set(x);
    ty.set(y);
    if (jump || !placedRef.current || reduceRef.current || source.current === "touch") {
      sx.jump(x);
      sy.jump(y);
      if (!placedRef.current) {
        requestAnimationFrame(() => {
          if (placedRef.current) return;
          sx.jump(lastSpot.current.x);
          sy.jump(lastSpot.current.y);
          placedRef.current = true;
          setPlaced(true);
        });
      }
    }
  }, []);

  const show = React.useCallback<Show>(
    (next, anchor, from, point) => {
      clearTimeout(closeTimer.current);
      clearTimeout(touchTimer.current);
      clearTimeout(switchTimer.current);
      if (point) cursor.current = point;

      const reveal = () => {
        if (openRef.current && anchorEl.current && anchorEl.current !== anchor) {
          const a = anchorEl.current.getBoundingClientRect();
          const b = anchor.getBoundingClientRect();
          const dx = b.left + b.width / 2 - (a.left + a.width / 2);
          const dy = b.top + b.height / 2 - (a.top + a.height / 2);
          setDirection((Math.abs(dx) >= Math.abs(dy) ? dx : dy) >= 0 ? 1 : -1);
        }
        anchorEl.current = anchor;
        keyRef.current = next.key;
        source.current = from;
        setTouch(from === "touch");
        opening.current = !openRef.current;
        if (!openRef.current) {
          placedRef.current = false;
          setPlaced(false);
        }
        setPayload(next);
        setOpen(true);
        if (openRef.current) place();
        if (from === "touch") {
          touchTimer.current = setTimeout(() => setOpen(false), TOUCH_HOLD);
        }
      };

      if (from === "touch" && openRef.current && anchorEl.current !== anchor) {
        setOpen(false);
        switchTimer.current = setTimeout(reveal, reduceRef.current ? 0 : TOUCH_SWITCH);
      } else reveal();
    },
    [place],
  );

  const move = React.useCallback(
    (point: { x: number; y: number }) => {
      cursor.current = point;
      if (openRef.current) place();
    },
    [place],
  );

  const hide = React.useCallback((key?: string) => {
    if (key && keyRef.current && key !== keyRef.current) return;
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), optionsRef.current.closeDelay * 1000);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      clearTimeout(switchTimer.current);
      setOpen(false);
    };
    const away = (e: Event) => {
      if (source.current !== "touch" || !openRef.current) return;
      if (e.type === "pointerdown" && (e.target as Element | null)?.closest?.("[data-floating-tooltip-trigger]")) return;
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", away, true);
    window.addEventListener("scroll", away, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", away, true);
      window.removeEventListener("scroll", away, true);
      clearTimeout(closeTimer.current);
      clearTimeout(touchTimer.current);
      clearTimeout(switchTimer.current);
    };
  }, []);

  React.useLayoutEffect(() => {
    const el = shell.current;
    if (!el) return;
    const measure = () => {
      size$.current = { w: el.offsetWidth, h: el.offsetHeight };
      if (!el.offsetWidth) return;
      place(opening.current);
      opening.current = false;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [open, place]);

  const controller = React.useMemo(
    () => ({ show, move, hide, activeKey: open ? (payload?.key ?? null) : null, tooltipId }),
    [show, move, hide, open, payload, tooltipId],
  );

  const vx = useVelocity(sx);
  const stretchOn = useMotionValue(0);
  const tiltOn = useMotionValue(0);
  React.useEffect(() => {
    stretchOn.set(elastic && stretchOnMove && !reduceMotion ? 1 : 0);
    tiltOn.set(elastic && tiltOnMove && !reduceMotion ? 1 : 0);
  }, [elastic, stretchOnMove, tiltOnMove, reduceMotion, stretchOn, tiltOn]);
  const scaleX = useTransform(() => 1 + clamp(vx.get() / 1000, -1.5, 1.5) * 0.15 * stretchOn.get());
  const scaleY = useTransform(() => 1 - clamp(Math.abs(vx.get()) / 1000, 0, 1.5) * 0.06 * stretchOn.get());
  const skewX = useTransform(() => clamp(vx.get() / 1000, -1.5, 1.5) * 3 * tiltOn.get());

  const how = reduceMotion ? "none" : touch && appearAnimation === "scale" ? "fade" : appearAnimation;
  const appearIn = how === "scale" ? { opacity: 0, scale: 0.9 } : { opacity: 0 };
  const appearOut = how === "scale" ? { opacity: 0, scale: 0.8 } : { opacity: 0 };
  const enter: Transition = how === "none" ? { duration: 0 } : touch ? TOUCH_IN : { duration: 0.12, ease: "easeOut" };
  const exit: Transition = how === "none" ? { duration: 0 } : touch ? TOUCH_OUT : { duration: 0.12, ease: "easeIn" };

  return (
    <OptionsContext.Provider value={options}>
      <ControllerContext.Provider value={controller}>
        {children}
        {mounted &&
          createPortal(
            <ReducedMotionConfig>
              <AnimatePresence>
                {open && payload && (
                  <motion.div
                    key="floating-tooltip"
                    ref={shell}
                    id={tooltipId}
                    role="tooltip"
                    data-slot="floating-tooltip"
                    className="pointer-events-none fixed top-0 left-0 z-50 w-max"
                    style={{ x: sx, y: sy }}
                    initial={appearIn}
                    animate={placed ? { opacity: 1, scale: 1, transition: enter } : appearIn}
                    exit={{ ...appearOut, transition: exit }}
                  >
                    <motion.div
                      className={cn(
                        "w-max font-medium",
                        VARIANT[variant],
                        ROUNDED[rounded],
                        changeAnimation !== "instant" && !touch && "overflow-hidden",
                      )}
                      style={{
                        scaleX,
                        scaleY,
                        skewX,
                        transformOrigin: follow === "cursor" ? "0% 0%" : "50% 50%",
                      }}
                    >
                      <Body payload={payload} direction={direction} touch={touch} />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ReducedMotionConfig>,
            document.querySelector(portalSelector) ?? document.body,
          )}
      </ControllerContext.Provider>
    </OptionsContext.Provider>
  );
}

function Text({ payload }: { payload: Payload }) {
  return (
    <div className={cn("flex w-max flex-col gap-1", TEXT_SIZE)}>
      <div className={payload.contentClassName}>{payload.content}</div>
      {payload.description && <div className={cn("font-normal opacity-70", payload.descriptionClassName)}>{payload.description}</div>}
    </div>
  );
}

function Body({ payload, direction, touch }: { payload: Payload; direction: number; touch: boolean }) {
  const { changeAnimation } = useOptions();
  if (touch) return <FadeOnly payload={payload} />;
  if (changeAnimation === "instant") return <Text payload={payload} />;
  return <Morph payload={payload} direction={direction} mode={changeAnimation} />;
}

function FadeOnly({ payload }: { payload: Payload }) {
  const fade = useMotionOk(TOUCH_IN);
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={payload.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade}>
        <Text payload={payload} />
      </motion.div>
    </AnimatePresence>
  );
}

function Morph({ payload, direction, mode }: { payload: Payload; direction: number; mode: FloatingTooltipChange }) {
  const { duration, bounce } = useOptions();
  const reduceMotion = useReduceMotion();
  const reshape = useMotionOk({ type: "spring", duration, bounce });
  const width = useMotionValue(0);
  const height = useMotionValue(0);
  const placed = React.useRef(false);
  const box = React.useRef<HTMLDivElement>(null);

  const onSize = React.useCallback(
    (w: number, h: number) => {
      if (!placed.current || reduceMotion) {
        placed.current = true;
        width.jump(w);
        height.jump(h);
        return;
      }
      animate(width, w, reshape);
      animate(height, h, reshape);
    },
    [width, height, reshape, reduceMotion],
  );

  React.useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.width = `${width.get()}px`;
    el.style.height = `${height.get()}px`;
  }, [width, height]);

  const slide = mode === "slide" && !reduceMotion;
  const roll = mode === "roll" && !reduceMotion;
  const shift = (d: number) => (slide ? `${d * 100}%` : 0);
  const variants: Variants = {
    enter: (d: number) => ({ opacity: 0, x: shift(d), y: roll ? `${d * 100}%` : "0%" }),
    center: { opacity: 1, x: 0, y: "0%" },
    exit: (d: number) => ({ opacity: 0, x: shift(-d), y: roll ? `${-d * 100}%` : "0%" }),
  };

  return (
    <motion.div ref={box} className="relative" style={{ width, height }}>
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <Measured key={payload.key} onSize={onSize} variants={variants} direction={direction} transition={reshape}>
          <Text payload={payload} />
        </Measured>
      </AnimatePresence>
    </motion.div>
  );
}

function Measured({
  onSize,
  variants,
  direction,
  transition,
  children,
}: {
  onSize: (w: number, h: number) => void;
  variants: Variants;
  direction: number;
  transition: Transition;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isPresent = useIsPresent();

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !isPresent) return;
    onSize(el.offsetWidth, el.offsetHeight);
    const observer = new ResizeObserver(() => onSize(el.offsetWidth, el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, [onSize, isPresent]);

  return (
    <motion.div
      ref={ref}
      className="absolute top-0 left-0 w-max"
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
function FloatingTooltip({
  content,
  description,
  contentClassName,
  descriptionClassName,
  disabled,
  children,
}: {
  content: React.ReactNode;
  description?: React.ReactNode;
  contentClassName?: string;
  descriptionClassName?: string;
  disabled?: boolean;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}) {
  const controller = useController();
  const key = React.useId();
  const child = children.props;

  const payload = (): Payload => ({ key, content, description, contentClassName, descriptionClassName });
  const active = controller.activeKey === key;

  return React.cloneElement(children, {
    "data-floating-tooltip-trigger": "",
    "aria-describedby": active ? controller.tooltipId : child["aria-describedby"],
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      child.onPointerDown?.(e);
      if (disabled || e.pointerType !== "touch") return;
      controller.show(payload(), e.currentTarget, "touch");
    },
    onPointerEnter: (e: React.PointerEvent<HTMLElement>) => {
      child.onPointerEnter?.(e);
      if (disabled || e.pointerType === "touch") return;
      controller.show(payload(), e.currentTarget, "pointer", { x: e.clientX, y: e.clientY });
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      child.onPointerMove?.(e);
      if (disabled || e.pointerType === "touch") return;
      controller.move({ x: e.clientX, y: e.clientY });
    },
    onPointerLeave: (e: React.PointerEvent<HTMLElement>) => {
      child.onPointerLeave?.(e);
      if (e.pointerType === "touch") return;
      controller.hide(key);
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      child.onFocus?.(e);
      if (disabled || !e.currentTarget.matches(":focus-visible")) return;
      controller.show(payload(), e.currentTarget, "focus");
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      child.onBlur?.(e);
      controller.hide(key);
    },
  } as React.HTMLAttributes<HTMLElement>);
}

export { FloatingTooltip, FloatingTooltipProvider };
