/* eslint-disable react-hooks/rules-of-hooks */
import gsap from 'gsap';
import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { SplitInLine } from './splitTextUtils';

gsap.registerPlugin(ScrollTrigger);

export function paraAnim() {
  useEffect(() => {
    const paraAnimations = document.querySelectorAll("[data-para-anim]");
    let ctx = gsap.context(() => {
      paraAnimations.forEach((paraAnimation) => {
        SplitInLine(paraAnimation);
        let paraLine = paraAnimation.querySelectorAll(".line-internal");
        gsap.from(paraLine, {
          scrollTrigger: {
            trigger: paraAnimation,
            start: "top 90%",
          },
          duration: 1,
          yPercent: 100,
          stagger: 0.1,
          ease: "power4.out",
        });
      });
    });
    return () => ctx.revert();
  });
}

export function lineAnim() {
  if (globalThis.innerWidth <= 1023 && globalThis.innerWidth > 541) {
    useEffect(() => {
      const lineDraws = document.querySelectorAll(".lineDraw");
      let ctx = gsap.context(() => {
        lineDraws.forEach((lineDraw) => {
          gsap.from(lineDraw, {
            scrollTrigger: {
              trigger: lineDraw,
              start: "top 80%",
            },
            scaleX: 0,
            transformOrigin: "left",
            duration: 1,
            yPercent: 100,
            stagger: 0.1,
            ease: "power4.out",
          });
        });
      });
      return () => ctx.revert();
    });
  }
  else {
    useEffect(() => {
      const lineDraws = document.querySelectorAll(".lineDraw");
      let ctx = gsap.context(() => {
        lineDraws.forEach((lineDraw) => {
          gsap.from(lineDraw, {
            scrollTrigger: {
              trigger: lineDraw,
              start: "top 95%",
            },
            scaleX: 0,
            transformOrigin: "left",
            duration: 1,
            yPercent: 100,
            stagger: 0.1,
            ease: "power4.out",
          });
        });
      });
      return () => ctx.revert();
    });
  }
}

export function fadeUp() {
  useEffect(() => {
    const content = document.querySelectorAll(".fadeup");
    let ctx = gsap.context(() => {
      content.forEach((content) => {
        gsap.from(content, {
          scrollTrigger: {
            trigger: content,
            start: "top 90%",
            end: "bottom 60%",

          },
          opacity: 0,
          delay: 0.3,
          y: 50,
          ease: "power3.Out",
          duration: 0.7,
          stagger: 0.5
        });
      });
    });
    return () => ctx.revert();
  });
}