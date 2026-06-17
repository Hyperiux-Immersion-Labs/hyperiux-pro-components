'use client'

import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { SplitText } from 'gsap/dist/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

/**
 * Scroll-triggered line reveal — text lines or a decorative horizontal line.
 * @param {object} props
 * @param {React.ReactNode} props.children - Text content to split and reveal line-by-line.
 * @param {keyof JSX.IntrinsicElements} props.as - Semantic element for text content. Defaults to 'div'.
 * @param {string} props.className - Class name for the outer wrapper.
 * @param {string} props.lineClassName - Class name for the decorative line (when no children).
 * @param {string} props.start - ScrollTrigger start position.
 * @param {number} props.delay - Delay before animation.
 * @param {boolean} props.once - Whether to run animation once.
 * @param {number} props.duration - Animation duration.
 * @param {string} props.ease - GSAP ease string.
 * @param {string} props.origin - Transform origin for line scale. Defaults to '0% 50%'.
 * @param {number} props.stagger - Stagger between text lines.
 */
export default function SplitLine({
  children,
  as: Tag = 'div',
  className = '',
  lineClassName = '',
  start = 'top 92%',
  delay = 0,
  once = true,
  duration = 0.9,
  ease = 'power3.out',
  origin = '0% 50%',
  stagger = 0.08,
}) {
  const wrapperRef = useRef(null)
  const lineRef = useRef(null)

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

    let split;
    if (children) {
      split = SplitText.create(wrapper, {
        type: 'lines',
        mask: 'lines',
      })
      if (reduceMotion) {
        gsap.set(split.lines, { yPercent: 0 })
        return () => split.revert()
      }
      // Hide lines immediately to prevent visual flash before loader complete
      gsap.set(split.lines, { opacity: 0, yPercent: 100 })
    } else {
      const el = lineRef.current
      if (el) {
        if (reduceMotion) {
          gsap.set(el, { scaleX: 1, transformOrigin: origin })
          return () => {}
        }
        // Hide line immediately to prevent visual flash before loader complete
        gsap.set(el, { opacity: 0, scaleX: 0, transformOrigin: origin })
      }
    }

    const isLoaderActive = typeof document !== 'undefined' && document.body.classList.contains("loader-active");

    const runAnimation = () => {
      if (children) {
        const innerCtx = gsap.context(() => {
          gsap.fromTo(
            split.lines,
            { opacity: 0, yPercent: 100 },
            {
              opacity: 1,
              yPercent: 0,
              delay,
              duration,
              ease,
              stagger,
              scrollTrigger: {
                trigger: wrapper,
                start,
                once,
              },
            }
          )
        }, wrapper)

        return () => {
          innerCtx.revert()
        }
      } else {
        const el = lineRef.current
        if (!el) return () => {}

        const innerCtx = gsap.context(() => {
          gsap.fromTo(
            el,
            { opacity: 0, scaleX: 0, transformOrigin: origin },
            {
              opacity: 1,
              scaleX: 1,
              delay,
              duration,
              ease,
              scrollTrigger: {
                trigger: el,
                start,
                once,
              },
            }
          )
        }, el)

        return () => innerCtx.revert()
      }
    };

    let cleanup;
    if (isLoaderActive) {
      const handleLoaderComplete = () => {
        cleanup = runAnimation();
        // Force ScrollTrigger refresh on loader complete to adjust all triggers
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 100);
      };
      window.addEventListener("loaderComplete", handleLoaderComplete);
      return () => {
        window.removeEventListener("loaderComplete", handleLoaderComplete);
        if (cleanup) cleanup();
        if (split) split.revert();
      };
    } else {
      cleanup = runAnimation();
      return () => {
        if (cleanup) cleanup();
        if (split) split.revert();
      };
    }
  }, [children, start, once, duration, ease, origin, delay, stagger])

  if (children) {
    return (
      <Tag ref={wrapperRef} className={className}>
        {children}
      </Tag>
    )
  }

  return (
    <div className={className}>
      <div ref={lineRef} className={lineClassName} />
    </div>
  )
}
