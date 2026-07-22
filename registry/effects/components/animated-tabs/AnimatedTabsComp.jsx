"use client";

import React, { useEffect, useId, useLayoutEffect, useRef, useState } from"react";
import gsap from"gsap";

const AnimatedTabsComp = ({
 tabs = [],
 defaultActiveIndex = 0,
 className ="",
 animationType ="slide", //"fade" |"slide"
 slideDistance = 40,
}) => {
 const safeDefaultIndex =
 tabs.length > 0
 ? Math.min(Math.max(defaultActiveIndex, 0), tabs.length - 1)
 : 0;

 const [activeTab, setActiveTab] = useState(safeDefaultIndex);
 const labelRefs = useRef([]);
 const contentRefs = useRef([]);
 const activeLineRef = useRef(null);
 const reduceMotionRef = useRef(
 typeof window !=="undefined" &&
 (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false)
 );
 const baseId = useId();

 useEffect(() => {
 const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
 if (!mq) return;
 const onChange = (event) => {
 reduceMotionRef.current = event.matches;
 };
 reduceMotionRef.current = mq.matches;
 mq.addEventListener?.("change", onChange);
 return () => mq.removeEventListener?.("change", onChange);
 }, []);

 const moveActiveLine = (index) => {
 const activeLabel = labelRefs.current[index];
 const activeLine = activeLineRef.current;

 if (!activeLabel || !activeLine) return;

 gsap.to(activeLine, {
 x: activeLabel.offsetLeft,
 width: activeLabel.offsetWidth,
 duration: 0.45,
 ease:"power3.out",
 });
 };

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
 duration: 0.28,
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
 duration: 0.38,
 ease:"power3.out",
 });
 },
 });
 } else {
 gsap.to(currentContent, {
 opacity: 0,
 duration: 0.2,
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
 duration: 0.35,
 ease:"power2.out",
 });
 },
 });
 }
 };

 const handleTabClick = (index) => {
 if (index === activeTab) return;

 animateContent(activeTab, index);
 moveActiveLine(index);
 setActiveTab(index);
 };

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
 <div className={`h-full w-full px-[7vw] py-[7vw] max-xl:p-[6vw] max-md:px-[5vw] max-md:py-[8vw] ${className}`}>
 <div className="relative border-b  border-b-black/10">
 <div role="tablist" aria-orientation="horizontal" className="flex gap-[2vw] overflow-x-auto max-xl:gap-[3vw] max-md:gap-[4vw]">
 {tabs.map((tab, index) => (
 <button
 key={tab.id || index}
 ref={(el) => (labelRefs.current[index] = el)}
 role="tab"
 id={`${baseId}-tab-${index}`}
 aria-selected={activeTab === index}
 aria-controls={`${baseId}-panel-${index}`}
 tabIndex={activeTab === index ? 0 : -1}
 onClick={() => handleTabClick(index)}
 onKeyDown={(event) => handleTabKeyDown(event, index)}
 className={`relative cursor-pointer whitespace-nowrap border-none bg-transparent px-[2vw] py-[1vw] transition-colors duration-300 ease-in-out max-xl:px-[2.5vw] max-xl:py-[1.5vw] max-md:px-[3vw] max-md:py-[2.5vw] ${
 activeTab === index
 ?"text-[#ff6b00]"
 :"text-black/50"
 }`}
 type="button"
 >
 <span className="text-[1.2vw] font-medium max-xl:text-[2.2vw] max-md:text-[4vw]">{tab.label}</span>
 </button>
 ))}
 </div>

 <div ref={activeLineRef} className="absolute bottom-0 left-0 h-0.5 bg-[#ff6b00] max-md:h-[0.4vw]" />
 </div>

 <div className="relative min-h-[24vw] w-full max-md:overflow-hidden pt-[2vw] max-xl:min-h-[32vw] max-xl:pt-[4vw] max-md:min-h-[48vw] max-md:pt-[5vw]">
 {tabs.map((tab, index) => (
 <div
 key={tab.id || index}
 ref={(el) => (contentRefs.current[index] = el)}
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
