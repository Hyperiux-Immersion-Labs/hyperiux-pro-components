"use client";

import React, { useLayoutEffect, useRef } from"react";
import gsap from"gsap";
import { SplitText } from"gsap/SplitText";
import { ScrollTrigger } from"gsap/ScrollTrigger";

gsap.registerPlugin(SplitText, ScrollTrigger);

export default function PerspectiveTextReveal({
 children,
 animateOnScroll = true,
 delay = 0,
 className ="",
 scrub = true,
}) {
 const containerRef = useRef(null);
 const splitRefs = useRef([]);
 const linesRef = useRef([]);

 useLayoutEffect(() => {
 if (!containerRef.current) return;

 splitRefs.current = [];
 linesRef.current = [];

 const elements = containerRef.current.hasAttribute("data-copy-wrapper")
 ? Array.from(containerRef.current.children)
 : [containerRef.current];

 let ctx;

 const init = async () => {
 await document.fonts.ready;

 ctx = gsap.context(() => {
 elements.forEach((element) => {
 const split = SplitText.create(element, {
 type:"lines",
 linesClass:"line++",
 reduceWhiteSpace: false,
 });

 splitRefs.current.push(split);
 linesRef.current.push(...split.lines);
 });

 gsap.set(linesRef.current, {
 yPercent: -100,
 rotateX: 70,
 opacity: 0,
 transformPerspective: 800,
 transformOrigin:"50% 100%",
 willChange:"transform, opacity",
 });

 gsap.set(containerRef.current, { opacity: 1 });

 const animationProps = {
 yPercent: 0,
 rotateX: 0,
 opacity: 1,
 duration: 0.8,
 stagger: 0.08,
 ease:"power3.out",
 delay,
 };

 if (animateOnScroll) {
 gsap.to(linesRef.current, {
 ...animationProps,
 scrollTrigger: {
 trigger: containerRef.current,
 start:"top 90%",
 end:"bottom 60%",
 scrub,
 },
 });
 } else {
 gsap.to(linesRef.current, animationProps);
 }
 }, containerRef);
 };

 init();

 return () => {
 if (ctx) ctx.revert();
 splitRefs.current.forEach((split) => split?.revert());
 };
 }, [animateOnScroll, delay, scrub]);

 return (
 <div
 ref={containerRef}
 data-copy-wrapper="true"
 className={`opacity-0 ${className}`.trim()}
 style={{ perspective:"800px" }}
 >
 {children}
 </div>
 );
}
