// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion, useMotionValue, useSpring, useMotionValueEvent, } from "motion/react";
import { useEffect, useRef, useState } from "react";
const IMG_BASE = "https://picsum.photos/seed";
const IMG = {
    plane: `${IMG_BASE}/stackspread1/1600/1200`,
    painting: `${IMG_BASE}/stackspread2/1600/1200`,
    breaker: `${IMG_BASE}/stackspread3/1600/1200`,
    dog: `${IMG_BASE}/stackspread4/1600/1200`,
    footballer: `${IMG_BASE}/stackspread5/1600/1200`,
    jacket: `${IMG_BASE}/stackspread6/1600/1200`,
    meadow: `${IMG_BASE}/stackspread7/1600/1200`,
    stripes: `${IMG_BASE}/stackspread8/1600/1200`,
};
// per-image rest scale, keyed by img index (1-8). default 1, drop below to shrink.
const SCALE = {
    1: 0.9,
    2: 0.8,
    3: 0.9,
    4: 0.8,
    5: 0.8,
    6: 0.9,
    7: 0.9,
    8: 0.7,
};
const s = (i) => SCALE[i] ?? 1;
// array order = stack order, back (z 2) -> front (z 9)
const CARDS = [
    // top-left stripes (img08) - sm row 1 left
    {
        item: { src: IMG.stripes, alt: "Colour stripes" },
        stackOffset: { x: -8, y: -10 },
        stackRotate: -18,
        target: { x: -20, y: -34, rotate: 0, scale: s(8), w: 17, h: 22 },
        targetSm: { x: -22, y: -40 },
        z: 2,
    },
    // top-right meadow (img07) - sm row 1 right
    {
        item: { src: IMG.meadow, alt: "Wildflower meadow" },
        stackOffset: { x: 14, y: -10 },
        stackRotate: 20,
        target: { x: 32, y: -30, rotate: 0, scale: s(7), w: 18, h: 32 },
        targetSm: { x: 22, y: -40 },
        z: 3,
    },
    // mid-left jacket (img06) - sm row 2 left
    {
        item: { src: IMG.jacket, alt: "Figure in a leather jacket" },
        stackOffset: { x: -16, y: 0 },
        stackRotate: -4,
        target: { x: -36, y: -2, rotate: 0, scale: s(6), w: 15, h: 32 },
        targetSm: { x: -22, y: -19 },
        z: 4,
    },
    // top-centre footballer (img05) - sm row 2 right
    {
        item: { src: IMG.footballer, alt: "Footballer mid-kick" },
        stackOffset: { x: 1, y: -10 },
        stackRotate: -2,
        target: { x: 6, y: -32, rotate: 0, scale: s(5), w: 25, h: 30 },
        targetSm: { x: 22, y: -19 },
        z: 5,
    },
    // mid-right dog (img04) - sm row 3 left
    {
        item: { src: IMG.dog, alt: "Terrier in profile" },
        stackOffset: { x: 18, y: 1 },
        stackRotate: 6,
        target: { x: 37, y: 6, rotate: 0, scale: s(4), w: 18, h: 32 },
        targetSm: { x: -22, y: 20 },
        z: 6,
    },
    // bottom-left breaker (img03) - sm row 3 right
    {
        item: { src: IMG.breaker, alt: "Breakdancer holding a pose" },
        stackOffset: { x: -6, y: 10 },
        stackRotate: 6,
        target: { x: -24, y: 34, rotate: 0, scale: s(3), w: 22, h: 25 },
        targetSm: { x: 22, y: 20 },
        z: 7,
    },
    // bottom-centre painting (img02) - sm row 4 left
    {
        item: { src: IMG.painting, alt: "Renaissance fresco detail" },
        stackOffset: { x: 8, y: 7 },
        stackRotate: 3,
        target: { x: 2, y: 36, rotate: 0, scale: s(2), w: 20, h: 26 },
        targetSm: { x: -22, y: 40 },
        z: 8,
    },
    // bottom-right plane (img01) - sm row 4 right
    {
        item: { src: IMG.plane, alt: "Vintage fighter plane" },
        stackOffset: { x: 20, y: 12 },
        stackRotate: -7,
        target: { x: 30, y: 34, rotate: 0, scale: s(1), w: 16, h: 20 },
        targetSm: { x: 22, y: 40 },
        z: 9,
    },
];
// ---------------------------------------------------------------------------
// Mechanism
// ---------------------------------------------------------------------------
// Scroll progress where the cluster starts scattering and where it finishes.
const SCATTER_START = 0.12;
const SCATTER_END = 0.9;
const PARALLAX_X = 2.6;
const PARALLAX_Y = 2.2;
const PARALLAX_SPRING = { stiffness: 90, damping: 22, mass: 0.6 };
const parallaxDepth = (i, total) => total <= 1 ? 1 : 0.55 + (i / (total - 1)) * 0.75;
// Deterministic pseudo-random in [0, 1) - keeps SSR and client in sync.
const rand = (seed) => {
    const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return v - Math.floor(v);
};
const parallaxDrift = (i) => ({
    x: (rand(i + 1) < 0.5 ? -1 : 1) * (0.55 + rand(i + 11) * 0.9),
    y: (rand(i + 21) < 0.5 ? -1 : 1) * (0.55 + rand(i + 31) * 0.9),
});
const SUB = "Digital products, interfaces, and experiences built around people.";
const RESPONSIVE = {
    desktop: {
        scale: null,
        small: false,
        colX: null,
        card: null,
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
function usePointerParallax(active, enabled) {
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const x = useSpring(rawX, PARALLAX_SPRING);
    const y = useSpring(rawY, PARALLAX_SPRING);
    useEffect(() => {
        if (!enabled)
            return;
        if (!active) {
            rawX.set(0);
            rawY.set(0);
            return;
        }
        const onMove = (event) => {
            rawX.set((event.clientX / window.innerWidth) * 2 - 1);
            rawY.set((event.clientY / window.innerHeight) * 2 - 1);
        };
        const onLeave = () => {
            rawX.set(0);
            rawY.set(0);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("pointerleave", onLeave);
        return () => {
            window.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerleave", onLeave);
        };
    }, [active, enabled, rawX, rawY]);
    return { x, y };
}
function Card({ card, progress, reduce, clusterRotation, scaleMul, isSmall, colX, fixedCard, stackScale, cardRadius, pointer, depth, drift, }) {
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
    const translate = useTransform([progress, pointer.x, pointer.y], ([p, px, py]) => {
        const tx = stackOffset.x + (endX - stackOffset.x) * p;
        const ty = stackOffset.y + (endY - stackOffset.y) * p;
        const amount = depth * p;
        const dx = tx - px * PARALLAX_X * amount * drift.x;
        const dy = ty - py * PARALLAX_Y * amount * drift.y;
        return `calc(-50% + ${dx}vw) calc(-50% + ${dy}vh)`;
    });
    const rotate = useTransform(progress, [0, 1], [stackRotate, endRotate]);
    const scale = useTransform(progress, [0, 1], [stackScale, restScale]);
    return (<motion.div className="absolute left-1/2 top-1/2 will-change-transform" style={{
            width: `${fixedCard ? fixedCard.w : target.w}vw`,
            height: `${fixedCard ? fixedCard.h : target.h}vh`,
            zIndex: card.z ?? 1,
            translate,
            rotate,
            scale,
        }}>
      <CardFace item={item} cardRadius={cardRadius}/>
    </motion.div>);
}
function CardFace({ item, cardRadius, }) {
    return (<div className="relative h-full w-full overflow-hidden max-md:rounded-[4vw]" style={{ borderRadius: `${cardRadius}px` }}>
      <Image src={item.src} alt={item.alt ?? ""} fill sizes="(max-width: 1025px) 40vw, 25vw" className="object-cover" draggable={false}/>
    </div>);
}
function StackSpreadStage({ cards, scrollLength = 350, bgColor = "#ececeb", clusterRotation = true, stackScale = 0.82, cardRadius = 8, textColor = "#141414", textFadeStart = 0.3, }) {
    const wrapRef = useRef(null);
    const reduce = useReducedMotion();
    const { scale: scaleMul, small: isSmall, colX, card: fixedCard } = useResponsive();
    const { scrollYProgress } = useScroll({
        target: wrapRef,
        offset: ["start start", "end end"],
    });
    // hold, scatter, then settle
    const progress = useTransform(scrollYProgress, [0, SCATTER_START, SCATTER_END, 1], [0, 0, 1, 1]);
    // centre text always fades in on scroll; the scale-in is dropped only when
    // reduced motion is confirmed (`true`), not on the null SSR value.
    const [spread, setSpread] = useState(false);
    useMotionValueEvent(progress, "change", (p) => {
        setSpread((was) => (was ? p > 0.985 : p >= 0.999));
    });
    const parallaxEnabled = reduce !== true && !isSmall;
    const pointer = usePointerParallax(spread, parallaxEnabled);
    const noScale = reduce === true;
    const copyOpacity = useTransform(progress, [textFadeStart, textFadeStart + 0.35], [0, 1]);
    const copyScale = useTransform(progress, [textFadeStart, 0.9], [0.85, 1]);
    return (<section ref={wrapRef} className="relative w-full" style={{ height: `${scrollLength}vh`, backgroundColor: bgColor }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* centre text */}
        <motion.div className="pointer-events-none absolute inset-0 z-5 flex flex-col items-center justify-center px-6 text-center max-md:px-8" style={{
            opacity: copyOpacity,
            scale: noScale ? 1 : copyScale,
        }}>
          <h2 className="w-full whitespace-pre-line font-display text-[4.5vw] font-normal leading-none! tracking-tight max-md:text-[10vw]" style={{ color: textColor }}>
            Design

           <span className="opacity-60"> {" "}
              That
               {" "}
              </span>
              Responds.
          </h2>
          <p className="mt-[1.2vw] w-full max-w-[42ch] text-[1.15vw] leading-relaxed tracking-tight max-md:mt-3 max-md:text-[3.6vw]" style={{ color: textColor, opacity: 0.6 }}>
            {SUB}
          </p>
        </motion.div>

        {/* scattering cards */}
        <div className="absolute inset-0 z-10">
          {cards.map((card, i) => (<Card key={i} card={card} progress={progress} reduce={reduce} clusterRotation={clusterRotation} scaleMul={scaleMul} isSmall={isSmall} colX={colX} fixedCard={fixedCard} stackScale={stackScale} cardRadius={cardRadius} pointer={pointer} depth={parallaxEnabled ? parallaxDepth(i, cards.length) : 0} drift={parallaxDrift(i)}/>))}
        </div>
      </div>
    </section>);
}
export default function StackSpread({ scrollLength = 350, bgColor = "#ececeb", clusterRotation = true, stackScale = 0.82, cardRadius = 8, textColor = "#141414", textFadeStart = 0.3, }) {
    return (<StackSpreadStage cards={CARDS} scrollLength={scrollLength} bgColor={bgColor} clusterRotation={clusterRotation} stackScale={stackScale} cardRadius={cardRadius} textColor={textColor} textFadeStart={textFadeStart}/>);
}
