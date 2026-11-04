// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import * as React from "react";
import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";
import { motion, useMotionValue, useSpring, type MotionValue } from "motion/react";
import { twMerge } from "tailwind-merge";

function usePrefersReducedMotion() {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduce(mq.matches);
    read();
    mq.addEventListener?.("change", read);
    return () => mq.removeEventListener?.("change", read);
  }, []);
  return reduce;
}

type HoverCardMotion = {
  startScale: number;
  openDelay: number;
  closeDelay: number;
  followCursor: boolean;
  fadeContent: boolean;
  underline: boolean;
};

function fadeInContent(card: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (const child of card.querySelectorAll<HTMLElement>(":scope > *")) {
    child.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 300,
      delay: 40,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "backwards",
    });
  }
}

const FOLLOW_STRENGTH = 0.35;

const HoverCardContext = React.createContext<{
  motion: HoverCardMotion;
  follow: MotionValue<number>;
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

function useHoverCard() {
  const context = React.useContext(HoverCardContext);
  if (!context) throw new Error("HoverCard parts must be used inside <HoverCard>.");
  return context;
}

export function HoverCard({
  startScale = 0.92,
  openDelay = 0.25,
  closeDelay = 0.1,
  followCursor = true,
  fadeContent = true,
  underline = true,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: PreviewCardPrimitive.Root.Props & Partial<HoverCardMotion>) {
  const follow = useMotionValue(0);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const context = React.useMemo(
    () => ({
      follow,
      open,
      setOpen: setUncontrolledOpen,
      motion: { startScale, openDelay, closeDelay, followCursor, fadeContent, underline },
    }),
    [follow, open, startScale, openDelay, closeDelay, followCursor, fadeContent, underline],
  );
  return (
    <HoverCardContext.Provider value={context}>
      <PreviewCardPrimitive.Root
        open={open}
        onOpenChange={(next, details) => {
          setUncontrolledOpen(next);
          onOpenChange?.(next, details);
        }}
        {...props}
      />
    </HoverCardContext.Provider>
  );
}

export function HoverCardTrigger({ className, onPointerMove, onPointerDown, onClick, ...props }: PreviewCardPrimitive.Trigger.Props) {
  const { motion: options, follow, open, setOpen } = useHoverCard();
  const pointerType = React.useRef("mouse");
  return (
    <PreviewCardPrimitive.Trigger
      delay={options.openDelay * 1000}
      closeDelay={options.closeDelay * 1000}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        pointerType.current = event.pointerType;
      }}
      onClick={(event) => {
        onClick?.(event);
        if (pointerType.current === "mouse") return;
        event.preventDefault();
        setOpen(!open);
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (!options.followCursor) return;
        const rect = event.currentTarget.getBoundingClientRect();
        follow.set((event.clientX - (rect.left + rect.width / 2)) * FOLLOW_STRENGTH);
      }}
      className={(state) =>
        twMerge(
          options.underline &&
            "relative after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out hover:after:origin-left hover:after:scale-x-100 focus-visible:after:origin-left focus-visible:after:scale-x-100 data-popup-open:after:scale-x-100",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

export function HoverCardContent({
  className,
  container,
  side = "bottom",
  sideOffset = 10,
  align = "center",
  ...props
}: Omit<PreviewCardPrimitive.Popup.Props, "className"> & { className?: string } & Pick<
    PreviewCardPrimitive.Positioner.Props,
    "align" | "side" | "sideOffset"
  > &
  Pick<PreviewCardPrimitive.Portal.Props, "container">) {
  const { motion: options, follow } = useHoverCard();
  const reduceMotion = usePrefersReducedMotion();
  const x = useSpring(follow, { stiffness: 260, damping: 26 });

  const attach = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      follow.jump(0);
      x.jump(0);
      if (options.fadeContent) fadeInContent(node);
    },
    [follow, x, options.fadeContent],
  );

  return (
    <PreviewCardPrimitive.Portal container={container}>
      <PreviewCardPrimitive.Positioner
        align={align}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
        style={{ "--hc-scale": options.startScale } as React.CSSProperties}
      >
        <PreviewCardPrimitive.Popup
          ref={attach}
          render={<motion.div style={{ x: options.followCursor && !reduceMotion ? x : 0 }} />}
          className={twMerge(
            "z-50 origin-(--transform-origin) outline-hidden",
            "transition-[opacity,scale] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:duration-200 motion-reduce:transition-opacity",
            "data-starting-style:scale-(--hc-scale) data-starting-style:opacity-0 data-ending-style:scale-(--hc-scale) data-ending-style:opacity-0",
            className,
          )}
          {...props}
        />
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  );
}

const AnimatedHoverCard = { Root: HoverCard, Trigger: HoverCardTrigger, Content: HoverCardContent };

export default AnimatedHoverCard;
