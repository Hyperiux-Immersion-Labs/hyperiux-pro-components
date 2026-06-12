'use client'

import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

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

    if (children) {
      const split = SplitText.create(wrapper, {
        type: 'lines',
        mask: 'lines',
      })

      if (reduceMotion) {
        gsap.set(split.lines, { yPercent: 0 })
        return () => split.revert()
      }

      const ctx = gsap.context(() => {
        gsap.fromTo(
          split.lines,
          { yPercent: 100 },
          {
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
        ctx.revert()
        split.revert()
      }
    }

    const el = lineRef.current
    if (!el) return

    if (reduceMotion) {
      gsap.set(el, { scaleX: 1, transformOrigin: origin })
      return
    }

    const ctx = gsap.context(() => {
      gsap.set(el, { scaleX: 0, transformOrigin: origin })
      gsap.to(el, {
        scaleX: 1,
        delay,
        duration,
        ease,
        scrollTrigger: {
          trigger: el,
          start,
          once,
        },
      })
    }, el)

    return () => ctx.revert()
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
