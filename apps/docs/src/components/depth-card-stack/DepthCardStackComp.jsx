"use client";

import { useEffect, useRef, useState, useCallback } from"react";
import { gsap } from"gsap";
import { ChevronLeft, ChevronRight } from"lucide-react";
import SliderCard from "./SliderCard";

const CARD_W = 300;
const CARD_H = 450;
const TABLET_CARD_W = 340;
const TABLET_CARD_H = 500;
const AUTO_PLAY_DELAY = 5000;

function getSlotProps(slot) {
 switch (slot) {
 case 0:
 return { x: 0, y: 0, rotateX: 0, rotateZ: 0, rotateY: 0, scale: 1, opacity: 1, zIndex: 20 };
 case 1:
 return { x: 20, y: -20, rotateX: 0, rotateZ: 2, rotateY: 0, scale: 0.9, opacity: 1, zIndex: 10 };
 case 2:
 return { x: 35, y: -40, rotateX: 0, rotateZ: 4, rotateY: 0, scale: 0.83, opacity: 0.9, zIndex: 8 };
 case -1:
 return { x: -20, y: -20, rotateX: 0, rotateZ: -2, rotateY: 0, scale: 0.9, opacity: 1, zIndex: 10 };
 case -2:
 return { x: -35, y: -40, rotateX: 0, rotateZ: -4, rotateY: 0, scale: 0.83, opacity: 0.9, zIndex: 8 };
 default:
 return { x: 0, y: -30, rotateX: 0, rotateZ: 0, rotateY: 0, scale: 0.75, opacity: 0, zIndex: 0 };
 }
}

function computeSlot(cardIdx, centerIdx, total) {
 const rel = ((cardIdx - centerIdx) % total + total) % total;
 if (rel === 0) return 0;
 if (rel === 1) return 1;
 if (rel === 2) return 2;
 if (rel === total - 1) return -1;
 if (rel === total - 2) return -2;
 return null;
}


export default function DepthCardStackComp({ cards }) {
 const sectionRef = useRef(null);
 const cardRefs = useRef([]);
 const cardFaceRefs = useRef([]);
 const textureRefs = useRef([]);
 const centerRef = useRef(0);
 const animating = useRef(false);
 const isHoveredRef = useRef(false);
 const timelineRef = useRef(null);
 const [autoplayResetKey, setAutoplayResetKey] = useState(0);
 const [claimedText, setClaimedText] = useState(cards[0].claimedText);
 const [isMobile, setIsMobile] = useState(false);
 const [isTablet, setIsTablet] = useState(false);
 const [isStackReady, setIsStackReady] = useState(false);

  useEffect(() => {
    const check = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 640);
      setIsTablet(width > 640 && width <= 1024);
    };
    queueMicrotask(() => {
      check();
    });
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // On mobile, the cards' 3D/composited layers (perspective + preserve-3d +
  // will-change) can leave the section's bottom strip unpainted, exposing the
  // dark body background as a "black margin". A card move repaints it, so force
  // that repaint proactively - on mount and whenever the viewport changes
  // (e.g. the mobile URL bar collapsing, which is exactly when the strip shows).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const forceRepaint = () => {
      el.style.transform = "translateZ(0)";
      requestAnimationFrame(() => {
        if (sectionRef.current === el) el.style.transform = "";
      });
    };

    forceRepaint();
    window.addEventListener("resize", forceRepaint);
    window.addEventListener("orientationchange", forceRepaint);
    return () => {
      window.removeEventListener("resize", forceRepaint);
      window.removeEventListener("orientationchange", forceRepaint);
    };
  }, [isStackReady]);

 const cardWidth = isTablet ? TABLET_CARD_W : CARD_W;
 const cardHeight = isTablet ? TABLET_CARD_H : CARD_H;

 const applyLayout = useCallback((animate) => {
 const total = cards.length;
 timelineRef.current?.kill();
 timelineRef.current = null;

 cardRefs.current.forEach((el, i) => {
 if (!el) return;
 gsap.killTweensOf(el);
 const slot = computeSlot(i, centerRef.current, total);
 const props = getSlotProps(slot);
 if (animate && slot !== null) {
 gsap.to(el, { ...props, duration: 0.55, ease:"power2.inOut", force3D: true });
 } else {
 gsap.set(el, { ...props, force3D: true });
 }
 });
 }, [cards]);

  useEffect(() => {
    queueMicrotask(() => {
      setIsStackReady(false);
    });
    applyLayout(false);
    const cards = cardRefs.current;
    const readyFrame = requestAnimationFrame(() => {
      setIsStackReady(true);
    });

 return () => {
 cancelAnimationFrame(readyFrame);
 timelineRef.current?.kill();
 timelineRef.current = null;
 cards.forEach((el) => el && gsap.killTweensOf(el));
 };
 }, [applyLayout]);

 const navigate = useCallback((dir) => {
 if (animating.current) return;
 animating.current = true;

 const total = cards.length;
 const oldCenter = centerRef.current;
 const newCenter = ((oldCenter + dir) % total + total) % total;
 centerRef.current = newCenter;

 const oldFace = cardFaceRefs.current[oldCenter];
 const oldTexture = textureRefs.current[oldCenter];
 if (oldFace) {
 gsap.killTweensOf(oldFace);
 gsap.set(oldFace, { rotateX: 0, rotateY: 0, x: 0, y: 0 });
 }
 if (oldTexture) {
 gsap.killTweensOf(oldTexture);
 gsap.set(oldTexture, { opacity: 0,"--reveal-x":"50%","--reveal-y":"50%" });
 }

 timelineRef.current?.kill();

 const tl = gsap.timeline({
 onComplete: () => {
 animating.current = false;
 timelineRef.current = null;
 },
 });
 timelineRef.current = tl;

 cardRefs.current.forEach((cardEl, i) => {
 if (!cardEl) return;

 gsap.killTweensOf(cardEl);

 const oldSlot = computeSlot(i, oldCenter, total);
 const newSlot = computeSlot(i, newCenter, total);
 const oldProps = getSlotProps(oldSlot);
 const newProps = getSlotProps(newSlot);

 gsap.set(cardEl, { ...oldProps, force3D: true });

 if (oldSlot === null && newSlot !== null) {
 gsap.set(cardEl, {
 ...oldProps,
 x: newProps.x + (newSlot > 0 ? 28 : -28),
 y: newProps.y - 8,
 scale: Math.max(newProps.scale - 0.04, 0.72),
 opacity: 0,
 zIndex: newProps.zIndex,
 force3D: true,
 });
 }

 if (i === oldCenter) {
 const swingX = dir > 0 ? -(cardWidth * 0.9) : (cardWidth * 0.9);
 const swingRotateY = dir > 0 ? -30 : 30;

 gsap.set(cardEl, { zIndex: 30 });
 tl.to(cardEl, {
 x: swingX,
 y: -10,
 rotateZ: dir > 0 ? -3 : 3,
 rotateY: swingRotateY,
 scale: 0.88,
 opacity: 1,
 ease:"cubic-bezier(.25, .46, .45, .94)",
 duration: 0.3,
 force3D: true,
 }, 0);
 tl.to(cardEl, {
 ...newProps,
 rotateY: 0,
 duration: 0.18,
 ease:"cubic-bezier(.32, .72, 0, 1)",
 force3D: true,
 }, 0.22);
 return;
 }

 gsap.set(cardEl, { zIndex: newSlot === 0 ? 25 : newProps.zIndex });
 tl.to(cardEl, {
 ...newProps,
 duration: 0.54,
 ease:"power2.inOut",
 force3D: true,
 }, 0.06);
 });

 setClaimedText(cards[newCenter].claimedText);
 }, [cards]);

 useEffect(() => {
 const autoplayId = setInterval(() => {
 if (isHoveredRef.current) return;
 navigate(1);
 }, AUTO_PLAY_DELAY);

 return () => clearInterval(autoplayId);
 }, [navigate, autoplayResetKey]);

 useEffect(() => {
 const cards = cardRefs.current;
 const handlers = [];

 cards.forEach((cardEl, i) => {
 const cardFace = cardFaceRefs.current[i];
 const textureEl = textureRefs.current[i];
 if (!cardEl || !cardFace || !textureEl) return;

 // Track per-card enter progress so first mousemove eases in gently
 let enterProgress = 0;
 let enterRaf = null;

 const handleEnter = (e) => {
 if (i !== centerRef.current || animating.current) return;
 isHoveredRef.current = true;
 enterProgress = 0;

 // Cancel any in-flight enter ramp
 if (enterRaf) cancelAnimationFrame(enterRaf);

 // Smoothly ramp enterProgress from 0 → 1 over ~350ms
 const startTime = performance.now();
 const RAMP_DURATION = 350;

 const ramp = (now) => {
 enterProgress = Math.min((now - startTime) / RAMP_DURATION, 1);
 if (enterProgress < 1) enterRaf = requestAnimationFrame(ramp);
 else enterRaf = null;
 };
 enterRaf = requestAnimationFrame(ramp);
 };

 const handleMove = (e) => {
 if (i !== centerRef.current || animating.current) return;

 const rect = cardEl.getBoundingClientRect();
 const x = e.clientX - rect.left;
 const y = e.clientY - rect.top;
 const centerX = rect.width / 2;
 const centerY = rect.height / 2;

 // Scale tilt & shift by enterProgress so first frames are subtle
 const ease = enterProgress;
 const rotateX = ((y - centerY) / 20) * ease;
 const rotateY = -(((x - centerX) / 20)) * ease;
 const moveX = ((x - centerX) / 60) * ease;
 const moveY = ((y - centerY) / 60) * ease;

 gsap.to(textureEl, {
"--reveal-x": `${x}px`,
"--reveal-y": `${y}px`,
 opacity: 0.3 * ease,
 duration: 0.28,
 ease:"power2.out",
 overwrite:"auto",
 });
 gsap.to(cardFace, {
 rotateX,
 rotateY,
 x: moveX,
 y: moveY,
 transformPerspective: 800,
 transformOrigin:"center",
 ease:"power2.out",
 duration: 0.4,
 overwrite:"auto",
 });
 };

 const handleLeave = () => {
 if (i !== centerRef.current) return;
 isHoveredRef.current = false;

 // Cancel any enter ramp still running
 if (enterRaf) {
 cancelAnimationFrame(enterRaf);
 enterRaf = null;
 }
 enterProgress = 0;

 gsap.to(cardFace, {
 rotateX: 0,
 rotateY: 0,
 x: 0,
 y: 0,
 ease:"power3.out",
 duration: 0.7,
 overwrite:"auto",
 });
 gsap.to(textureEl, {
 opacity: 0,
 ease:"power2.out",
 duration: 0.5,
 overwrite:"auto",
 });
 };

 cardEl.addEventListener("mouseenter", handleEnter);
 cardEl.addEventListener("mousemove", handleMove);
 cardEl.addEventListener("mouseleave", handleLeave);
 handlers.push({ cardEl, handleEnter, handleMove, handleLeave, getRaf: () => enterRaf });
 });

 return () => {
 handlers.forEach(({ cardEl, handleEnter, handleMove, handleLeave, getRaf }) => {
 cardEl.removeEventListener("mouseenter", handleEnter);
 cardEl.removeEventListener("mousemove", handleMove);
 cardEl.removeEventListener("mouseleave", handleLeave);
 const raf = getRaf();
 if (raf) cancelAnimationFrame(raf);
 });
 };
 }, []);

 return (
 <section ref={sectionRef} className="flex flex-col items-center px-6 pt-20 max-md:pt-40 max-sm:pt-20 h-screen max-sm:w-screen max-sm:overflow-x-hidden pb-5 select-none bg-white max-sm:h-full max-sm:min-h-dvh">
<p className="text-sm max-sm:text-sm max-md:text-lg font-medium text-blue-500 mb-1 max-md:mb-3">
  Hyperiux-UI Library
</p>

<h3 className="text-5xl max-md:text-4xl max-sm:text-2xl font-medium text-center mb-0.5 leading-none tracking-tight text-gray-900">
  Build futuristic interfaces.
</h3>

<p className="text-5xl text-center max-md:text-4xl max-sm:text-2xl text-gray-400 leading-none tracking-tight mb-4 max-md:mb-10">
  Crafted for modern web experiences.
</p>

 <div className="max-sm:grid max-sm:grid-cols-2 max-sm:place-items-center max-sm:gap-4 flex items-center justify-center">
 <button
 onClick={() => {
 navigate(-1);
 setAutoplayResetKey((value) => value + 1);
 }}
 className="max-sm:hidden w-9 h-9 max-md:h-15 max-md:w-15 rounded-full border cursor-pointer border-gray-400 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors shrink-0 relative z-30"
 aria-label="Previous card"
 >
 <ChevronLeft size={20} strokeWidth={2} />
 </button>

 <div
 className="relative shrink-0 max-sm:row-start-1 max-sm:col-span-2 transition-opacity duration-200"
 style={{
 width: isMobile
 ? window.innerWidth - 32
 : cardWidth + 112 * 2 + 40,
 height: cardHeight + 70,
 opacity: isStackReady ? 1 : 0,
 perspective: 900,
 perspectiveOrigin:"50% 50%",
 }}
 >
 {cards.map((card, i) => (
 <SliderCard
 key={card.num}
 card={card}
 index={i}
 cardRefs={cardRefs}
 cardFaceRefs={cardFaceRefs}
 textureRefs={textureRefs}
 cardWidth={cardWidth}
 cardHeight={cardHeight}
 />
 ))}
 </div>

 <button
 onClick={() => {
 navigate(1);
 setAutoplayResetKey((value) => value + 1);
 }}
 className="max-sm:hidden w-9 h-9 max-md:h-15 max-md:w-15 cursor-pointer rounded-full border border-gray-400 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors shrink-0 relative z-30"
 aria-label="Next card"
 >
 <ChevronRight size={20} strokeWidth={2} />
 </button>
 </div>
 <div className="hidden max-sm:flex max-sm:order-2 items-center justify-center gap-8 mt-4">
 <button
 onClick={() => {
 navigate(-1);
 setAutoplayResetKey((value) => value + 1);
 }}
 className="w-15 h-15 rounded-full border border-gray-400  flex items-center justify-center text-gray-600 hover:bg-gray-100  transition-colors"
 aria-label="Previous card"
 >
 <ChevronLeft size={25} strokeWidth={2} />
 </button>

 <button
 onClick={() => {
 navigate(1);
 setAutoplayResetKey((value) => value + 1);
 }}
 className="w-15 h-15 rounded-full border border-gray-400  flex items-center justify-center text-gray-600 hover:bg-gray-100  transition-colors"
 aria-label="Next card"
 >
 <ChevronRight size={25} strokeWidth={2} />
 </button>
 </div>

 <p
 key={claimedText}
 className="mt-4 max-md:mt-8 max-sm:mt-3 max-sm:order-1 text-xs max-md:text-lg max-sm:text-base text-gray-400 h-5"
 style={{ animation:"fadeUp 0.4s ease forwards" }}
 >
 {claimedText}
 </p>

 <style>{`
 @keyframes fadeUp {
 from { opacity: 0; transform: translateY(6px); }
 to { opacity: 1; transform: translateY(0); }
 }
 `}</style>
 </section>
 );
}
