"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

interface FooterParallaxProps {
 children?: ReactNode;
 id?: string;
  outerClassName?: string;
  footerClassName?: string;
  footerStyle?: CSSProperties;
}

const FooterParallax = ({
 children,
 id ="footer",
 outerClassName ="",
 footerClassName ="",
  footerStyle,
}: FooterParallaxProps) => {
 const footerRef = useRef<HTMLElement | null>(null);
 const [height, setHeight] = useState(1);
 // The reveal pins the footer to the viewport bottom and lets the page scroll
 // over it. That only works while the footer is shorter than the viewport -
 // below the breakpoint it is taller, so the top would be permanently cut off.
 // There it renders as a normal block instead.
 const [parallax, setParallax] = useState(true);

 useEffect(() => {
 let frameId: number | undefined;

 const query = window.matchMedia("(min-width: 1026px)");

 const updateHeight = () => {
 const el = footerRef.current;
 if (!el) return;

 frameId = requestAnimationFrame(() => {
 const rect = el.getBoundingClientRect();
 setHeight(rect.height);
 });
 };

 const updateMode = () => setParallax(query.matches);

 updateMode();
 updateHeight();

 const el = footerRef.current;
 if (!el) return;

 const resizeObserver = new ResizeObserver(updateHeight);
 resizeObserver.observe(el);

 window.addEventListener("resize", updateHeight);
 query.addEventListener("change", updateMode);

 return () => {
 cancelAnimationFrame(frameId as number);
 resizeObserver.disconnect();
 window.removeEventListener("resize", updateHeight);
 query.removeEventListener("change", updateMode);
 };
 }, [children]);

 return (
 <div
 id={id}
 className={`relative z-0 w-screen ${outerClassName}`}
 style={
 parallax
 ? { height, clipPath:"inset(0 0 0 0)" }
 : undefined
 }
 >
 <footer
 ref={footerRef}
 className={`left-0 z-0 w-screen ${
 parallax ?"fixed bottom-0" :"relative"
 } ${footerClassName}`}
 style={footerStyle}
 >
 {children}
 </footer>
 </div>
 );
};

export { FooterParallax };
