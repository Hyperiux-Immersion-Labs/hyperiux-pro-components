"use client";

import { useEffect, useRef, useState } from "react";

/**
 * @typedef {Object} FooterParallaxProps
 * @property {import('react').ReactNode} [children]
 * @property {string} [id]
 * @property {string} [outerClassName]
 * @property {string} [footerClassName]
 */

/** @param {FooterParallaxProps} props */
const FooterParallax = ({
 children,
 id ="footer",
 outerClassName ="",
 footerClassName ="",
}) => {
 const footerRef = useRef(/** @type {HTMLElement|null} */ (null));
 const [height, setHeight] = useState(1);

 useEffect(() => {
 /** @type {number|undefined} */
 let frameId;

 const updateHeight = () => {
 const el = footerRef.current;
 if (!el) return;

 frameId = requestAnimationFrame(() => {
 const rect = el.getBoundingClientRect();
 setHeight(rect.height);
 });
 };

 updateHeight();

 const el = footerRef.current;
 if (!el) return;

 const resizeObserver = new ResizeObserver(updateHeight);
 resizeObserver.observe(el);

 window.addEventListener("resize", updateHeight);

 return () => {
 cancelAnimationFrame(/** @type {number} */ (frameId));
 resizeObserver.disconnect();
 window.removeEventListener("resize", updateHeight);
 };
 }, [children]);

 return (
 <div
 id={id}
 className={`w-screen relative z-1 ${outerClassName}`}
 style={{
 height,
 clipPath:"rect(0px, 100%, 100%, 0px)",
 }}
 >
 <footer
 ref={footerRef}
 className={`w-screen fixed bottom-0 left-0 ${footerClassName}`}
 >
 {children}
 </footer>
 </div>
 );
};

export { FooterParallax };
