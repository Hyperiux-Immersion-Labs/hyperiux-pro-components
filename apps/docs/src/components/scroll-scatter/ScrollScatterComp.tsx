"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState } from "react";


const RESPONSIVE = {
  desktop: {
    scale: null as number | null,
    small: false,
    colX: null as number | null,
    card: null as { w: number; h: number } | null,
  },
  small: {
    scale: 0.72,
    small: true,
    colX: 22,
    card: { w: 40, h: 20 },
  },
};

function useResponsive() {
  const [r, setR] = useState(RESPONSIVE.desktop);
  useEffect(() => {
    const read = () => {
      setR(window.innerWidth <= 1025 ? RESPONSIVE.small : RESPONSIVE.desktop);
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  return r;
}

export interface ScrollScatterItem {
  src: string;
  alt?: string;
}

export interface ScrollScatterTarget {
  x: number;
  y: number;
  rotate: number;
  scale?: number;
  w: number;
  h: number;
}

export interface ScrollScatterCard {
  item: ScrollScatterItem;
  target: ScrollScatterTarget;
  /** final x/y (vw/vh) for tablet + mobile; falls back to `target` */
  targetSm?: { x: number; y: number };
  /** angle while clustered */
  stackRotate?: number;
  /** offset while clustered (vw/vh) */
  stackOffset?: { x: number; y: number };
  /** paint order, higher on top */
  z?: number;
}

function Card({
  card,
  progress,
  reduce,
  clusterRotation,
  scaleMul,
  isSmall,
  colX,
  fixedCard,
}: {
  card: ScrollScatterCard;
  progress: MotionValue<number>;
  reduce: boolean | null;
  clusterRotation: boolean;
  /** uniform rest-scale for every card; null = use each card's own scale */
  scaleMul: number | null;
  isSmall: boolean;
  colX: number | null;
  fixedCard: { w: number; h: number } | null;
}) {
  const { item, target } = card;

  const flat = reduce === true;
  const stackRotate = flat ? 0 : clusterRotation ? card.stackRotate ?? 0 : 0;
  const stackOffset = card.stackOffset ?? { x: 0, y: 0 };
  const restScale = scaleMul ?? target.scale ?? 1;

  // final resting spot: column grid on small screens, scatter on desktop
  const sm = isSmall && card.targetSm ? card.targetSm : null;
  const endX = sm
    ? colX != null
      ? Math.sign(sm.x) * colX
      : sm.x
    : target.x;
  const endY = sm ? sm.y : target.y;
  const endRotate = flat || isSmall ? 0 : target.rotate;

  // -50% keeps card centred on its anchor
  const translate = useTransform(progress, (p) => {
    const tx = stackOffset.x + (endX - stackOffset.x) * p;
    const ty = stackOffset.y + (endY - stackOffset.y) * p;
    return `calc(-50% + ${tx}vw) calc(-50% + ${ty}vh)`;
  });
  const rotate = useTransform(progress, [0, 1], [stackRotate, endRotate]);
  const scale = useTransform(progress, [0, 1], [0.82, restScale]);

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 will-change-transform"
      style={{
        width: `${fixedCard ? fixedCard.w : target.w}vw`,
        height: `${fixedCard ? fixedCard.h : target.h}vh`,
        zIndex: card.z ?? 1,
        translate,
        rotate,
        scale,
      }}
    >
      <CardFace item={item} />
    </motion.div>
  );
}

function CardFace({ item }: { item: ScrollScatterItem }) {
  return (
    <div className="h-full w-full overflow-hidden rounded-lg  max-md:rounded-[4vw]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.src}
        alt={item.alt ?? ""}
        className="h-full w-full object-cover"
        draggable={false}
      />
    </div>
  );
}

export interface ScrollScatterCompProps {
  cards: ScrollScatterCard[];
  /** scatter scroll distance, in vh */
  scrollLength?: number;
  bgColor?: string;
  /** fan the clustered stack (default) or start flat */
  clusterRotation?: boolean;
}

const HEADLINE = "";
const SUB = "Digital products, interfaces, and experiences built around people.";

export default function ScrollScatterComp({
  cards,
  scrollLength = 350,
  bgColor = "#ececeb",
  clusterRotation = true,
}: ScrollScatterCompProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scale: scaleMul, small: isSmall, colX, card: fixedCard } =
    useResponsive();

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  // hold, scatter, then settle
  const progress = useTransform(
    scrollYProgress,
    [0, 0.12, 0.9, 1],
    [0, 0, 1, 1],
  );

  // centre copy always fades in on scroll; the scale-in is dropped only when
  // reduced motion is confirmed (`true`), not on the null SSR value.
  const noScale = reduce === true;
  const copyOpacity = useTransform(progress, [0.3, 0.65], [0, 1]);
  const copyScale = useTransform(progress, [0.3, 0.9], [0.85, 1]);

  return (
    <section
      ref={wrapRef}
      className="relative w-full"
      style={{ height: `${scrollLength}vh`, backgroundColor: bgColor }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* centre copy */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-5 flex flex-col items-center justify-center px-6 text-center max-md:px-8"
          style={{
            opacity: copyOpacity,
            scale: noScale ? 1 : copyScale,
          }}
        >
          <h2 className="w-full whitespace-pre-line font-display text-[4.5vw] font-normal leading-none! tracking-tight text-[#141414] max-md:text-[10vw]">
            Design

           <span className="text-[#929292]"> {" "}
              That
               {" "}
              </span>
              Responds.
          </h2>
          <p className="mt-[1.2vw] w-full max-w-[42ch] text-[1.15vw] leading-relaxed tracking-tight text-[#141414]/60 max-md:mt-3 max-md:text-[3.6vw]">
            {SUB}
          </p>
        </motion.div>

        {/* scattering cards */}
        <div className="absolute inset-0 z-10">
          {cards.map((card, i) => (
            <Card
              key={i}
              card={card}
              progress={progress}
              reduce={reduce}
              clusterRotation={clusterRotation}
              scaleMul={scaleMul}
              isSmall={isSmall}
              colX={colX}
              fixedCard={fixedCard}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
