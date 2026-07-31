"use client";

import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * @typedef {Object} AnimatedTabItem
 * @property {string | number} [id]
 * @property {string} label
 * @property {import('react').ReactNode} content
 */

/**
 * @typedef {Object} AnimatedTabsCompProps
 * @property {AnimatedTabItem[]} [tabs]
 * @property {number} [defaultActiveIndex]
 * @property {string} [className]
 * @property {'fade' | 'slide'} [animationType]
 * @property {number} [slideDistance]
 */

/** @param {AnimatedTabsCompProps} props */
const AnimatedTabsComp = ({
 tabs = [],
 defaultActiveIndex = 0,
 className ="",
 animationType ="slide", //"fade" |"slide"
 slideDistance = 40,
 accentColor ="#ff6b00",
 duration = 0.35,
}) => {
 const safeDefaultIndex =
 tabs.length > 0
 ? Math.min(Math.max(defaultActiveIndex, 0), tabs.length - 1)
 : 0;

 const [activeTab, setActiveTab] = useState(safeDefaultIndex);
 const labelRefs = useRef(/** @type {(HTMLButtonElement | null)[]} */ ([]));
 const contentRefs = useRef(/** @type {(HTMLDivElement | null)[]} */ ([]));
 const activeLineRef = useRef(/** @type {HTMLDivElement | null} */ (null));
 const reduceMotionRef = useRef(
 typeof window !=="undefined" &&
 (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false)
 );
 const baseId = useId();
 const safeDuration = Math.max(0.05, Number(duration) || 0.35);

 useEffect(() => {
 const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
 if (!mq) return;
 /** @param {MediaQueryListEvent} event */
 const onChange = (event) => {
 reduceMotionRef.current = event.matches;
 };
 reduceMotionRef.current = mq.matches;
 mq.addEventListener?.("change", onChange);
 return () => mq.removeEventListener?.("change", onChange);
 }, []);

 /** @param {number} index */
 const moveActiveLine = (index) => {
 const activeLabel = labelRefs.current[index];
 const activeLine = activeLineRef.current;

 if (!activeLabel || !activeLine) return;

 gsap.to(activeLine, {
 x: activeLabel.offsetLeft,
 width: activeLabel.offsetWidth,
 duration: safeDuration,
 ease:"power3.out",
 });
 };

 /**
  * @param {number} currentIndex
  * @param {number} nextIndex
  */
 const animateContent = (currentIndex, nextIndex) => {
 const currentContent = contentRefs.current[currentIndex];
 const nextContent = contentRefs.current[nextIndex];

 if (!currentContent || !nextContent || currentIndex === nextIndex) return;

 const direction = nextIndex > currentIndex ? 1 : -1;
 // Reduced-motion: opacity fade only — no X slide.
 const useSlide =
 animationType ==="slide" && !reduceMotionRef.current;

 gsap.killTweensOf([currentContent, nextContent]);

 if (useSlide) {
 gsap.to(currentContent, {
 opacity: 0,
 x: -direction * slideDistance,
 duration: safeDuration * 0.75,
 ease:"power2.out",
 onComplete: () => {
 gsap.set(currentContent, {
 display:"none",
 pointerEvents:"none",
 x: 0,
 });

 gsap.set(nextContent, {
 display:"block",
 pointerEvents:"auto",
 opacity: 0,
 x: direction * slideDistance,
 });

 gsap.to(nextContent, {
 opacity: 1,
 x: 0,
 duration: safeDuration,
 ease:"power3.out",
 });
 },
 });
 } else {
 gsap.to(currentContent, {
 opacity: 0,
 duration: safeDuration * 0.65,
 ease:"power2.out",
 onComplete: () => {
 gsap.set(currentContent, {
 display:"none",
 pointerEvents:"none",
 x: 0,
 });

 gsap.set(nextContent, {
 display:"block",
 pointerEvents:"auto",
 opacity: 0,
 x: 0,
 });

 gsap.to(nextContent, {
 opacity: 1,
 duration: safeDuration,
 ease:"power2.out",
 });
 },
 });
 }
 };

 /** @param {number} index */
 const handleTabClick = (index) => {
 if (index === activeTab) return;

 animateContent(activeTab, index);
 moveActiveLine(index);
 setActiveTab(index);
 };

 /**
  * @param {import('react').KeyboardEvent<HTMLButtonElement>} event
  * @param {number} index
  */
 const handleTabKeyDown = (event, index) => {
 const count = tabs.length;
 let nextIndex;

 switch (event.key) {
 case"ArrowRight":
 nextIndex = (index + 1) % count;
 break;
 case"ArrowLeft":
 nextIndex = (index - 1 + count) % count;
 break;
 case"Home":
 nextIndex = 0;
 break;
 case"End":
 nextIndex = count - 1;
 break;
 default:
 return;
 }

 event.preventDefault();
 labelRefs.current[nextIndex]?.focus();
 handleTabClick(nextIndex);
 };

 useLayoutEffect(() => {
 if (!tabs.length) return;

 const activeLabel = labelRefs.current[safeDefaultIndex];
 const activeLine = activeLineRef.current;

 if (activeLabel && activeLine) {
 gsap.set(activeLine, {
 x: activeLabel.offsetLeft,
 width: activeLabel.offsetWidth,
 });
 }

 contentRefs.current.forEach((content, index) => {
 if (!content) return;

 gsap.set(content, {
 display: index === safeDefaultIndex ?"block" :"none",
 opacity: index === safeDefaultIndex ? 1 : 0,
 pointerEvents: index === safeDefaultIndex ?"auto" :"none",
 x: 0,
 });
 });
 }, [tabs, safeDefaultIndex]);

 if (!tabs.length) return null;

 return (
 <div className={`h-full w-full px-[7vw] py-[7vw] max-[1025px]:p-[6vw] max-md:px-[5vw] max-md:py-[8vw] ${className}`}>
 <div className="relative border-b  border-b-black/10">
 <div role="tablist" aria-orientation="horizontal" className="flex gap-[2vw] overflow-x-auto max-[1025px]:gap-[3vw] max-md:gap-[4vw]">
 {tabs.map((tab, index) => (
 <button
 key={tab.id || index}
 ref={(el) => { labelRefs.current[index] = el; }}
 role="tab"
 id={`${baseId}-tab-${index}`}
 aria-selected={activeTab === index}
 aria-controls={`${baseId}-panel-${index}`}
 tabIndex={activeTab === index ? 0 : -1}
 onClick={() => handleTabClick(index)}
 onKeyDown={(event) => handleTabKeyDown(event, index)}
 className="relative cursor-pointer whitespace-nowrap border-none bg-transparent px-[2vw] py-[1vw] transition-colors duration-300 ease-in-out max-[1025px]:px-[2.5vw] max-[1025px]:py-[1.5vw] max-md:px-[3vw] max-md:py-[2.5vw]"
 style={{ color: activeTab === index ? accentColor : "rgba(0,0,0,0.5)" }}
 type="button"
 >
 <span className="text-[1.2vw] font-medium max-[1025px]:text-[2.2vw] max-md:text-[4vw]">{tab.label}</span>
 </button>
 ))}
 </div>

 <div ref={activeLineRef} className="absolute bottom-0 left-0 h-0.5 max-md:h-[0.4vw]" style={{ backgroundColor: accentColor }} />
 </div>

 <div className="relative min-h-[24vw] w-full max-md:overflow-hidden pt-[2vw] max-[1025px]:min-h-[32vw] max-[1025px]:pt-[4vw] max-md:min-h-[48vw] max-md:pt-[5vw]">
 {tabs.map((tab, index) => (
 <div
 key={tab.id || index}
 ref={(el) => { contentRefs.current[index] = el; }}
 role="tabpanel"
 id={`${baseId}-panel-${index}`}
 aria-labelledby={`${baseId}-tab-${index}`}
 tabIndex={0}
 className="h-full w-full"
 style={{
 display: index === safeDefaultIndex ?"block" :"none",
 opacity: index === safeDefaultIndex ? 1 : 0,
 }}
 >
 {tab.content}
 </div>
 ))}
 </div>
 </div>
 );
};

export default AnimatedTabsComp
