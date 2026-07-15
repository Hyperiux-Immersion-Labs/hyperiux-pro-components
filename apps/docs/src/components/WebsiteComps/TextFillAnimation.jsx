'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SplitText from 'gsap/SplitText';
import { prefersReducedMotion } from '@/lib/motion';

const TEXT_REVEAL_STYLE_PREFIX = 'tfa-style-';
const SPLIT_CHARACTER_SELECTOR = '.split-chars';

const REDUCED_MOTION_DURATION = 0.4;
const REDUCED_MOTION_EASE = 'power1.out';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/**
 * Scroll-scrubbed character fill - each character warms from `dimColor`
 * through `primaryColor` to `textColor` as the section passes the viewport.
 *
 * Under `prefers-reduced-motion: reduce` the heading still fades in once, but
 * in `textColor` from the start - no split, no scrubbed character stagger.
 */
export function TextFillAnimation({
  text = "Design systems should feel effortless, not like you're fighting your own components every time you build.",
  textColor = '#111111',
  primaryColor = '#ff6b00',
  dimColor = '#dddddd',
  backgroundColor = '',
  className = '',
  id = 'section-break',
  textSize = '5vw',
  textWidth = '80%',
  containerClassName = '',
  mobileTextSize = '8vw',
  mobileTextWidth = '95%',
  tabletTextSize = '6.5vw',
  tabletTextWidth = '88%',
}) {
  // State and refs
  const sectionRef = useRef(null);
  const textRef = useRef(null);

  // Effects
  useEffect(() => {
    const styleId = `${TEXT_REVEAL_STYLE_PREFIX}${id}`;
    const styleElement = document.createElement('style');

    styleElement.id = styleId;
    styleElement.textContent = `
      #${id} .split__wrapper ${SPLIT_CHARACTER_SELECTOR} {
        color: ${dimColor};
      }

      #${id} .tfa-text-wrapper {
        width: ${textWidth};
      }

      #${id} .tfa-heading {
        font-size: ${textSize};
      }

      @media (min-width: 768px) and (max-width: 1024px) {
        #${id} .tfa-text-wrapper {
          width: ${tabletTextWidth};
        }

        #${id} .tfa-heading {
          font-size: ${tabletTextSize};
        }
      }

      @media (max-width: 767px) {
        #${id} .tfa-text-wrapper {
          width: ${mobileTextWidth};
        }

        #${id} .tfa-heading {
          font-size: ${mobileTextSize};
        }
      }
    `;

    document.head.appendChild(styleElement);

    const context = gsap.context(() => {
      const textElement = textRef.current;

      if (!textElement) {
        return;
      }

      // A fade is not motion, so the heading still reveals itself - but in its
      // final colour, with no split and no scrubbed character stagger.
      if (prefersReducedMotion()) {
        gsap.set(textElement, { color: textColor });

        gsap.fromTo(
          textElement,
          { opacity: 0 },
          {
            opacity: 1,
            duration: REDUCED_MOTION_DURATION,
            ease: REDUCED_MOTION_EASE,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              once: true,
            },
          }
        );

        return;
      }

      const split = SplitText.create(textElement, {
        type: 'words chars',
        aria: false,
        tag: 'span',
        charsClass: 'split-chars',
      });

      gsap.set(textElement, {
        opacity: 1,
      });

      const characters = Array.from(
        textElement.querySelectorAll(SPLIT_CHARACTER_SELECTOR)
      );

      gsap.set(characters, { color: dimColor });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            end: 'bottom 70%',
            scrub: 0.25,
            // markers:true
          },
        })
        .to(
          characters,
          {
            keyframes: {
              color: [dimColor, primaryColor, textColor],
              easeEach: 'power2.inOut',
            },
            duration: 0.4,
            stagger: 0.05,
          },
          0
        );

      return () => {
        split.revert();
      };
    });

    return () => {
      context.revert();
      document.getElementById(styleId)?.remove();
    };
  }, [
    dimColor,
    id,
    mobileTextSize,
    mobileTextWidth,
    primaryColor,
    tabletTextSize,
    tabletTextWidth,
    textColor,
    textSize,
    textWidth,
  ]);

  // Return
  return (
    <section
      id={id}
      ref={sectionRef}
      className={`relative h-fit w-full ${containerClassName}`}
      style={{ backgroundColor }}
    >
      <div className="flex h-screen items-center justify-center overflow-x-hidden max-md:h-fit">

        <div className="split__wrapper tfa-text-wrapper relative z-10 mx-auto">
          <h2
            ref={textRef}
            className={`tfa-heading opacity-0 font-display font-medium leading-[1.18] max-sm:leading-[1.4]! ${className}`}
          >
            {text}
          </h2>
        </div>
      </div>
    </section>
  );
}
