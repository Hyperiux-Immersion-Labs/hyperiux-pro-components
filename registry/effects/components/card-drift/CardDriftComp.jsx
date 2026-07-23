"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

export default function CardDriftComp({
 data = [],
 cardBg ="bg-blue-700",
 cardTextColor ="text-white",
 barBg ="bg-neutral-700",
 bgColor ="bg-black",
 bgTextColor ="text-white/10",
}) {
 const containerRef = useRef(null);

 useEffect(() => {
 const ctx = gsap.context(() => {
 const container = containerRef.current;
 const cards = gsap.utils.toArray(".testimonial-card");

 const containerRect = container.getBoundingClientRect();

 const isMobile = containerRect.width < 640;
 const isTablet = containerRect.width >= 640 && containerRect.width < 1025;
 const cols = isMobile || isTablet ? 2 : Math.ceil(Math.sqrt(cards.length));
 const rows = Math.ceil(cards.length / cols);

 const cellWidth = containerRect.width / cols;

 // On mobile, base cellHeight on actual card height instead of screen height
 const firstCardRect = cards[0]?.getBoundingClientRect();
 const cardHeight = firstCardRect?.height || 0;
 const cellHeight = isMobile
 ? cardHeight + 60
 : isTablet
 ? cardHeight + 110
 : containerRect.height / rows;

 // Shared z-index counter across all cards
 let zCounter = cards.length;

 cards.forEach((card, i) => {
 const col = i % cols;
 const row = Math.floor(i / cols);

 const cardRect = card.getBoundingClientRect();

 let x =
 col * cellWidth +
 (cellWidth - cardRect.width) / 2 +
 gsap.utils.random(-30, 30);

 const verticalOffset = isMobile
 ? containerRect.height * 0.16
 : isTablet
 ? containerRect.height * 0.08
 : 0;

 let y =
 row * cellHeight +
 (cellHeight - cardRect.height) / 2 +
 verticalOffset +
 gsap.utils.random(-30, 30);

 x = Math.max(0, Math.min(x, containerRect.width - cardRect.width));
 y = Math.max(0, Math.min(y, containerRect.height - cardRect.height));

 gsap.set(card, {
 x,
 y,
 rotation: gsap.utils.random(-3, 3),
 zIndex: i + 1,
 opacity: 1,
 });

 let lastX = x;
 let lastY = y;
 let velX = 0;
 let velY = 0;
 let lastTime = 0;

 Draggable.create(card, {
 type:"x,y",
 // No bounds - card can go freely outside during drag
 onPress() {
 gsap.killTweensOf(card);

 velX = 0;
 velY = 0;
 lastX = gsap.getProperty(card,"x");
 lastY = gsap.getProperty(card,"y");
 lastTime = performance.now();

 // Assign the next highest z-index on press
 zCounter += 1;
 card.style.zIndex = zCounter;

 gsap.to(card, {
 scale: 1.05,
 duration: 0.2,
 ease:"power2.out",
 });
 },

 onDrag() {
 const now = performance.now();
 const dt = now - lastTime;

 if (dt > 0) {
 const curX = gsap.getProperty(card,"x");
 const curY = gsap.getProperty(card,"y");

 // Exponential moving average for smoother velocity
 const alpha = Math.min(1, dt / 30);
 velX = velX * (1 - alpha) + ((curX - lastX) / dt) * alpha;
 velY = velY * (1 - alpha) + ((curY - lastY) / dt) * alpha;

 lastX = curX;
 lastY = curY;
 lastTime = now;
 }
 },

 onRelease() {
 gsap.to(card, {
 scale: 1,
 duration: 0.2,
 ease:"power2.out",
 });

 const bounds = container.getBoundingClientRect();
 const maxX = bounds.width - card.offsetWidth;
 const maxY = bounds.height - card.offsetHeight;

 const throwDuration = 0.7;
 const throwX = velX * throwDuration * 1000 * 0.35;
 const throwY = velY * throwDuration * 1000 * 0.35;

 const curX = gsap.getProperty(card,"x");
 const curY = gsap.getProperty(card,"y");

 // Throw target is always clamped inside bounds -
 // if card is outside, it smoothly comes back in
 const targetX = Math.max(0, Math.min(curX + throwX, maxX));
 const targetY = Math.max(0, Math.min(curY + throwY, maxY));

 const speed = Math.sqrt(velX * velX + velY * velY);

 // Extra duration if card is far outside bounds (longer trip back)
 const distOutX = Math.max(0, -curX, curX - maxX);
 const distOutY = Math.max(0, -curY, curY - maxY);
 const distOut = Math.sqrt(distOutX * distOutX + distOutY * distOutY);
 const baseDuration = gsap.utils.clamp(0.3, 1.0, speed * 0.4);
 const duration = gsap.utils.clamp(0.4, 1.2, baseDuration + distOut * 0.002);

 gsap.to(card, {
 x: targetX,
 y: targetY,
 duration,
 ease:"power3.out",
 });
 },
 });
 });
 }, containerRef);

 return () => ctx.revert();
 }, [data]);

 return (
 <div
 ref={containerRef}
 className={`relative w-screen h-screen overflow-hidden ${bgColor}`}
 >

 <h1
 className={`absolute inset-0 flex items-center justify-center text-9xl max-xl:text-7xl font-light pointer-events-none select-none text-center leading-none ${bgTextColor}`}
 >
 Draggable <br /> Testimonial
 </h1>

 {/* Cards */}
 {data.map((item, index) => (
 <Card
 key={index}
 item={item}
 cardBg={cardBg}
 cardTextColor={cardTextColor}
 barBg={barBg}
 />
 ))}
 </div>
 );
}


function Card({ item, cardBg, cardTextColor, barBg }) {
 return (
 <div className="testimonial-card opacity-0 absolute cursor-grab active:cursor-grabbing">
 <div className={`w-96 max-md:w-42 max-xl:w-60 ${cardBg} ${cardTextColor}`}>
 {/* Top bar */}
 <div
 className={`flex justify-between text-xs px-3 max-md:px-2 py-1 ${barBg}`}
 >
 <span>{item.year}</span>
 <span>{item.tag}</span>
 </div>

 {/* Content */}
 <div className="p-6 max-xl:p-3  text-lg max-xl:text-lg max-md:text-base leading-none font-light">
 {item.text}
 </div>
 </div>
 </div>
 );
}
