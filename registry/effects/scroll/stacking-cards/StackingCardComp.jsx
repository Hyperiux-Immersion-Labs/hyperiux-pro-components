"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";

gsap.registerPlugin(ScrollTrigger);

/**
 * @typedef {Object} StackingCardItem
 * @property {string|number} id
 * @property {string} [category]
 * @property {string} [title]
 * @property {string} [description]
 * @property {string} [image]
 * @property {string} [backgroundColor]
 */

/**
 * @typedef {Object} StackingCardCompProps
 * @property {StackingCardItem[]} [data]
 */

/** @param {StackingCardCompProps} props */
export default function StackingCardComp({ data = [] }) {
 const containerRef = useRef(/** @type {HTMLDivElement|null} */ (null));
 const cardsRef = useRef(/** @type {(HTMLDivElement|null)[]} */ ([]));

 useLenis(() => {
 ScrollTrigger.update();
 }, [], 1);

 useLayoutEffect(() => {
 cardsRef.current = cardsRef.current.slice(0, data.length);

 const ctx = gsap.context(() => {
 const reduceMotion = window.matchMedia(
 "(prefers-reduced-motion: reduce)"
 ).matches;

 const cards = /** @type {HTMLDivElement[]} */ (cardsRef.current.filter(Boolean));
 const numCards = cards.length;

 if (!numCards) return;

 cards.forEach((card, i) => {
 gsap.set(card, {
 yPercent: i === 0 ? 0 : 100,
 zIndex: i + 1,
 scale: 1,
 rotation: 0,
 rotateX: 0,
 opacity: 1,
 borderRadius: 0,
 });
 });

 const firstImage = cards[0]?.querySelector(".card-image");

 if (firstImage && !reduceMotion) {
 gsap.fromTo(
 firstImage,
 { scale: 1.5 },
 {
 scale: 1,
 ease:"power2.out",
 scrollTrigger: {
 trigger: containerRef.current,
 start:"50% bottom",
 end:"bottom 60%",
 scrub: true,
 invalidateOnRefresh: true,
 },
 }
 );
 }

 const tl = gsap.timeline({
 scrollTrigger: {
 trigger: containerRef.current,
 start:"top top",
 end: () => `+=${Math.max(numCards - 1, 0) * window.innerHeight}`,
 scrub: true,
 invalidateOnRefresh: true,
 },
 });

 for (let i = 1; i < numCards; i++) {
 const segmentStart = i - 1;

 tl.to(
 cards[i],
 {
 yPercent: 0,
 duration: 0.55,
 ease:"none",
 },
 segmentStart
 );

 // Reduced motion: the outgoing card still fades out (a crossfade,
 // not spatial motion) so it doesn't sit at full opacity behind the
 // incoming one indefinitely - without this, any tiny viewport/
 // positioning edge case lets it bleed through above the current
 // card. Everything actually spatial (tilt, scale, rotateX,
 // border-radius morph, image zoom) is still skipped.
 if (reduceMotion) {
 tl.to(
 cards[i - 1],
 {
 opacity: 0,
 ease:"none",
 duration: 0.25,
 },
 segmentStart + 0.4
 );

 continue;
 }

 const currentImage = cards[i].querySelector(".card-image");

 if (currentImage) {
 tl.to(
 currentImage,
 {
 keyframes: [
 { scale: 1.5, ease:"none", duration: 0.16 },
 { scale: 1, ease:"none", duration: 0.39 },
 ],
 },
 segmentStart
 );
 }

 const rotateDir = (i - 1) % 2 === 0 ? -5 : 5;

 tl.to(
 cards[i - 1],
 {
 scale: 0.8,
 rotation: rotateDir,
 rotateX: 20,
 borderRadius:"3vw",
 ease:"linear",
 duration: 0.5,
 },
 segmentStart
 ).to(
 cards[i - 1],
 {
 opacity: 0,
 ease:"none",
 duration: 0.25,
 },
 segmentStart + 0.4
 );
 }

 ScrollTrigger.refresh();
 }, containerRef);

 return () => ctx.revert();
 }, [data]);

 return (
 <section
 className="relative z-0 h-[var(--stack-height)] w-full"
 style={/** @type {import('react').CSSProperties} */ ({"--stack-height": `${data.length * 100}svh` })}
 >
 <div
 ref={containerRef}
 className="sticky top-0 h-screen max-md:h-svh w-screen overflow-hidden bg-black"
 style={{ perspective:"1200px" }}
 >
 {data.map((item, i) => (
 <div
 key={item.id}
 ref={(el) => {
 if (el) cardsRef.current[i] = el;
 }}
 className="absolute inset-0 overflow-hidden opacity-0"
 >
 <SliderCard {...item} />
 </div>
 ))}
 </div>
 </section>
 );
}

/** @param {StackingCardItem} props */
const SliderCard = ({
 id,
 category,
 title,
 description,
 image,
 backgroundColor,
}) => {
 return (
 <div
 className={`flex h-full w-full shrink-0 items-stretch justify-between overflow-hidden origin-center ${backgroundColor}
 max-[1025px]:min-h-svh max-[1025px]:flex-col max-[1025px]:justify-start max-[1025px]:py-8`}
 >
 <div
 className="flex h-full w-[55%] flex-col justify-between px-[2vw] py-[4vw] max-[1025px]:py-28
 max-[1025px]:w-full   max-[1025px]:px-5 max-[1025px]:py-6"
 >
 <div>
 <h2
 className="mb-[2vw] text-[7vw] text-black font-third
 max-[1025px]:mb-4 max-[1025px]:text-[12vw] max-[1025px]:leading-none"
 >
 {category}
 </h2>
 </div>

 <div className="mb-6 hidden h-[42svh] w-full max-[1025px]:block">
 <div className="h-full max-[1025px]:w-full overflow-hidden max-[1025px]:w-[80%] max-[1025px]:mx-auto max-[1025px]:rounded-[6vw] max-[1025px]:rounded-[3vw]">
 <img src={image} alt={title} className="h-full w-full object-cover" />
 </div>
 </div>

 <div
 className="flex justify-between max-[1025px]:px-8 max-[1025px]:px-0 gap-[12vw]
 max-[1025px]:flex-col max-[1025px]:gap-5"
 >
 <div
 className="mb-[3vw] w-fit text-[8vw] leading-none text-black
 max-[1025px]:mb-0 max-[1025px]:text-[14vw]"
 >
 {id}
 </div>

 <div
 className="flex flex-grow flex-col justify-center space-y-[2vw]
 max-[1025px]:space-y-3"
 >
 <h3
 className="font-display text-[2.5vw] text-black leading-[1.2]
 max-[1025px]:text-[7vw] max-[1025px]:text-[4.5vw]"
 >
 {title}
 </h3>
 <p
 className="text-[1.4vw] leading-[1.2] text-gray-700
 max-[1025px]:text-[4.2vw] max-[1025px]:text-[3.5vw] max-[1025px]:leading-[1.45]"
 >
 {description}
 </p>
 </div>
 </div>
 </div>

 <div
 className="my-auto h-[75%] w-[40%] p-[4vw]
 max-[1025px]:hidden"
 >
 <div className="h-full w-full overflow-hidden rounded-[2vw]">
 <img src={image} alt={title} className="card-image h-full w-full rounded-[2vw] object-cover" />
 </div>
 </div>
 </div>
 );
};
