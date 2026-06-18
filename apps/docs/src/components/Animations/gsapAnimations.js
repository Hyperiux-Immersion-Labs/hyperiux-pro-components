"use client";
import gsap from "gsap";
import { useEffect } from "react";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { shouldSkipSidebarDocsAnimation } from "@/lib/sidebar-navigation";

gsap.registerPlugin(ScrollTrigger);

function getFadeTargets(containerRef) {
  if (containerRef && containerRef.current) {
    return containerRef.current.querySelectorAll(".fadeup");
  }

  return document.querySelectorAll(".fadeup");
}

export function useFadeUp(containerRef) {
  useEffect(() => {
    if (shouldSkipSidebarDocsAnimation()) return;

    const ctx = gsap.context(() => {
      const content = getFadeTargets(containerRef);
      content.forEach((element) => {
        gsap.set(element, { opacity: 0, y: 50 });
        gsap.to(element, {
          scrollTrigger: {
            trigger: element,
            start: "top 90%",
          },
          opacity: 1,
          y: 0,
          ease: "power3.out",
          duration: 2,
        });
      });
    });
    return () => ctx.revert();
  }, [containerRef]);
}

export function useLineAnim(containerRef) {
  useEffect(() => {
    if (shouldSkipSidebarDocsAnimation()) return;

    const ctx = gsap.context(() => {
      const root = containerRef && containerRef.current ? containerRef.current : document;
      const lineDraws = root.querySelectorAll(
        '.lineDraw, [class*="contentDivider"]'
      );
      lineDraws.forEach((lineDraw) => {
        gsap.from(lineDraw, {
          scrollTrigger: {
            trigger: lineDraw,
            start: "top 80%",
          },
          scaleX: 0,
          transformOrigin: "left",
          duration: 1,
          stagger: 0.07,
          ease: "power3.out",
        });
      });
    });
    const st = gsap.ScrollTrigger || ScrollTrigger;
    st?.refresh?.();
    return () => ctx.revert();
  }, [containerRef]);
}
