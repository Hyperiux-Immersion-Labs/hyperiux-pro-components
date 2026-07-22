"use client";

import { useLayoutEffect, useRef } from"react";
import gsap from"gsap";
import ScrollTrigger from"gsap/ScrollTrigger";
import { useLenis } from"lenis/react";

gsap.registerPlugin(ScrollTrigger);

export default function StackingCardComp({ data = [] }) {
 const containerRef = useRef(null);
 const cardsRef = useRef([]);

 useLenis(() => {
 ScrollTrigger.update();
 }, [], 1);

 useLayoutEffect(() => {
 cardsRef.current = cardsRef.current.slice(0, data.length);

 const ctx = gsap.context(() => {
 const reduceMotion = window.matchMedia(
 "(prefers-reduced-motion: reduce)"
 ).matches;

 const cards = cardsRef.current.filter(Boolean);
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
 const rotateDir = (i - 1) % 2 === 0 ? -5 : 5;
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
 style={{"--stack-height": `${data.length * 100}vh` }}
 >
 <div
 ref={containerRef}
 className="sticky top-0 h-screen w-screen overflow-hidden bg-black"
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
 max-md:min-h-svh max-xl:flex-col max-xl:justify-start max-md:py-8`}
 >
 <div
 className="flex h-full w-[55%] flex-col justify-between px-[2vw] py-[4vw] max-xl:py-28
 max-xl:w-full   max-md:px-5 max-md:py-6"
 >
 <div>
 <h2
 className="mb-[2vw] text-[7vw] text-black font-third
 max-md:mb-4 max-md:text-[12vw] max-md:leading-none"
 >
 {category}
 </h2>
 </div>

 <div className="mb-6 hidden h-[42svh] w-full max-xl:block">
 <div className="h-full max-md:w-full overflow-hidden max-xl:w-[80%] max-xl:mx-auto max-md:rounded-[6vw] max-xl:rounded-[3vw]">
 <img src={image} alt={title} className="h-full w-full object-cover" />
 </div>
 </div>

 <div
 className="flex justify-between max-xl:px-8 max-md:px-0 gap-[12vw]
 max-md:flex-col max-md:gap-5"
 >
 <div
 className="mb-[3vw] w-fit text-[8vw] leading-none text-black
 max-md:mb-0 max-md:text-[14vw]"
 >
 {id}
 </div>

 <div
 className="flex flex-grow flex-col justify-center space-y-[2vw]
 max-md:space-y-3"
 >
 <h3
 className="font-display text-[2.5vw] text-black leading-[1.2]
 max-md:text-[7vw] max-xl:text-[4.5vw]"
 >
 {title}
 </h3>
 <p
 className="text-[1.4vw] leading-[1.2] text-gray-700
 max-md:text-[4.2vw] max-xl:text-[3.5vw] max-md:leading-[1.45]"
 >
 {description}
 </p>
 </div>
 </div>
 </div>

 <div
 className="my-auto h-[75%] w-[40%] p-[4vw]
 max-xl:hidden"
 >
 <div className="h-full w-full overflow-hidden rounded-[2vw]">
 <img src={image} alt={title} className="card-image h-full w-full rounded-[2vw] object-cover" />
 </div>
 </div>
 </div>
 );
};
