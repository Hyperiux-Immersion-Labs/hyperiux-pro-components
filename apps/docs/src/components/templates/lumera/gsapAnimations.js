/* eslint-disable react-hooks/rules-of-hooks */
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Add `data-fade-in` to any element (text, image, card, whatever) to have it
// fade in as it scrolls into view. Call fadeIn() once inside a component.
export function fadeIn() {
  useGSAP(() => {
    const elements = document.querySelectorAll('[data-fade-in]');
    elements.forEach((element) => {
      gsap.from(element, {
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
        },
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: 'power2.out',
      });
    });
  });
}

// Add `data-line-draw` to a line/divider element to have it scale in from
// x-0 to x-100 as it scrolls into view. Call lineDraw() once inside a component.
export function lineDraw() {
  useGSAP(() => {
    const elements = document.querySelectorAll('[data-line-draw]');
    elements.forEach((element) => {
      gsap.from(element, {
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
        },
        scaleX: 0,
        transformOrigin: 'left',
        duration: 0.8,
        ease: 'power2.out',
      });
    });
  });
}
