// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";

import { LIQUID_TEXTURE } from "./LiquidText";

function usePrefersReducedMotion() {
 const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

 useEffect(() => {
 const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
 const update = () => setPrefersReducedMotion(mediaQuery.matches);
 update();
 mediaQuery.addEventListener("change", update);
 return () => mediaQuery.removeEventListener("change", update);
 }, []);

 return prefersReducedMotion;
}

/**
 * @typedef {Object} LiquidGlassCursorProps
 * @property {number} [baseSize]
 * @property {number} [textHoverSize]
 * @property {number} [distortionScale]
 * @property {number} [blurAmount]
 * @property {string} [brightness]
 * @property {string} [borderColor]
 * @property {number} [maxButtonWidth]
 * @property {number} [maxButtonHeight]
 */

/** @param {LiquidGlassCursorProps} props */
export default function LiquidGlassCursor({
 baseSize = 40,
 textHoverSize = 120,
 distortionScale = 1.5,
 blurAmount = 0.002,
 brightness ="90%",
 borderColor ="rgba(255,255,255,0.1)",
 maxButtonWidth = 200,
 maxButtonHeight = 150,
 }) {
 const uid = useId().replace(/:/g, "");
 const frostedFilterId = `frosted-${uid}`;
 const internalDivId = `internaldiv-${uid}`;
 const cursorRef = useRef(/** @type {HTMLDivElement|null} */ (null));
 const innerRef = useRef(/** @type {HTMLDivElement|null} */ (null));
 const textRef = useRef(/** @type {HTMLSpanElement|null} */ (null));
 const prefersReducedMotion = usePrefersReducedMotion();

 useEffect(() => {
 // Hide default cursor
 document.body.style.cursor ="none";

 // GSAP QuickTo for high performance following
 const xTo = gsap.quickTo(cursorRef.current,"x", {
 duration: 0.35,
 ease:"power3.out",
 });
 const yTo = gsap.quickTo(cursorRef.current,"y", {
 duration: 0.35,
 ease:"power3.out",
 });

 // Center the cursor so animations grow evenly from the center
 gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });

 const move = (/** @type {MouseEvent} */ e) => {
 xTo(e.clientX);
 yTo(e.clientY);
 };

 const handleMouseOver = (/** @type {MouseEvent} */ e) => {
 const target = /** @type {Element} */ (e.target).closest("[data-cursor]");
 if (!target) return;

 const type = target.getAttribute("data-cursor");
 const bounds = target.getBoundingClientRect();
 const textEl = /** @type {HTMLSpanElement} */ (textRef.current);

 if (type ==="button") {
 gsap.to(innerRef.current, {
 width: Math.min(bounds.width + 80, maxButtonWidth),
 height: Math.min(bounds.height + 40, maxButtonHeight),
 borderRadius:"999px",
 border: `2px solid rgba(255,255,255,0.2)`,
 boxShadow: `inset 10px 5px 16px #fff`,
 duration: 0.4,
 ease:"power3.out",
 overwrite: true
 });
 textEl.innerText ="DISCOVER";
 gsap.to(textEl, {
 opacity: 1,
 scale: 1,
 duration: 0.3,
 delay: 0.1,
 ease:"back.out(1.7)",
 overwrite: true
 });
 } else if (type ==="text") {
 gsap.to(innerRef.current, {
 width: textHoverSize,
 height: textHoverSize,
 border: `1px solid ${borderColor}`,
 boxShadow: `inset 10px 5px 16px #fff`,
 borderRadius:"50%",
 duration: 0.4,
 ease:"power3.out",
 overwrite: true
 });
 textEl.innerText ="CLICK";
 gsap.to(textEl, {
 opacity: 1,
 scale: 1,
 duration: 0.3,
 delay: 0.1,
 ease:"back.out(1.7)",
 overwrite: true
 });
 }
 };

 const handleMouseOut = (/** @type {MouseEvent} */ e) => {
 const target = /** @type {Element} */ (e.target).closest("[data-cursor]");
 if (!target) return;

 // Return to default round droplet shape
 gsap.to(innerRef.current, {
 width: baseSize,
 height: baseSize,
 borderRadius:"999px",
 duration: 0.4,
 ease:"power3.out",
 boxShadow: `inset 0 10px 15px ${borderColor}`,
 overwrite: true
 });
 gsap.to(textRef.current, { opacity: 0, scale: 0.5, duration: 0.2, overwrite: true });
 };

 window.addEventListener("mousemove", move);
 document.addEventListener("mouseover", handleMouseOver);
 document.addEventListener("mouseout", handleMouseOut);

 return () => {
 window.removeEventListener("mousemove", move);
 document.removeEventListener("mouseover", handleMouseOver);
 document.removeEventListener("mouseout", handleMouseOut);
 document.body.style.cursor ="auto";
 };
 }, [baseSize, borderColor, maxButtonHeight, maxButtonWidth, textHoverSize]);

 return (
 <>
 <svg className="h-0 w-0 opacity-0 absolute">
 <filter
 id={frostedFilterId}
 colorInterpolationFilters="sRGB"
 primitiveUnits="objectBoundingBox"
 x="-50%"
 y="-50%"
 width="200%"
 height="200%"
 >
 {/*  Zooming in (width/height 1.5) removes the sharp padding edges. 'slice' prevents the oval stretch and keeps it perfectly proportional!  */}
 <feImage
 href={LIQUID_TEXTURE}
 x="-0.25"
 y="-0.25"
 width="1.5"
 height="1.5"
 preserveAspectRatio="xMidYMid slice"
 result="mapImage"
 />
 <feFlood floodColor="rgb(128,128,128)" result="grayBg" />
 <feComposite
 in="mapImage"
 in2="grayBg"
 operator="over"
 result="map"
 />

 <feGaussianBlur
 in="SourceGraphic"
 stdDeviation={blurAmount}
 result="blur"
 />
 <feDisplacementMap
 // ref={displacementRef}
 in="blur"
 in2="map"
 scale={distortionScale}
 xChannelSelector="R"
 yChannelSelector="G"
 />
 </filter>
 </svg>

 <div
 ref={cursorRef}
 className="fixed pointer-events-none top-0 left-0 z-50 flex items-center justify-center"
 >
 {/* Inner wrapper that changes size and border-radius dynamically via GSAP */}
 <div
 ref={innerRef}
 className="relative flex items-center justify-center"
 style={{
 width: baseSize,
 height: baseSize,
 borderRadius:"999px",
 willChange:"width, height",
 // border: `1px solid ${borderColor}`,
 boxShadow: `inset 0 0px 5px ${borderColor}` //FOR CAPSULE

 }}
 >
 <div
 style={{
 filter:
 `url(#${frostedFilterId}) blur(1px) drop-shadow(10px -4px 6px rgb(255, 255, 255)) brightness(${brightness})`,
 backdropFilter:"blur(1px)",

 isolation:"isolate",
 borderRadius:"inherit",
 }}
 className="absolute bg-white/0 left-0 right-0 size-full"
 >
 <div className="size-full relative">
 <div
 style={
 {
 // border: `1px solid ${borderColor}`,
 }
 }
 id={internalDivId}
 className="bg-white/10 rounded-full absolute left-0 right-0"
 ></div>
  </div>
 </div>

 {/* Dynamic inner text */}
 <span
 ref={textRef}
 className="relative z-10 text-white text-center opacity-0 scale-50 [text-shadow:0_2px_10px_rgba(0,0,0,0.18),0_0px_2px_rgba(0,0,0,0.25)]"
 ></span>
  </div>
 </div>
 {prefersReducedMotion && (
 <div
   aria-live="polite"
   className="pointer-events-none fixed bottom-4 right-4 z-40 w-fit max-w-65 rounded-md border border-black/10 bg-[#F8F8F3] p-3 text-center "
 >
   <h2 className="text-sm leading-none text-[#111111]">
     The glass keeps flowing.
   </h2>
   <p className="mt-2 text-xs leading-5 text-black/65">
     Liquid Glass Cursor&apos;s ripple follows your pointer in real
     time. Since the distortion is the interaction itself, reduced
     motion can&apos;t be applied here.
   </p>
 </div>
 )}
 </>
 );
}
