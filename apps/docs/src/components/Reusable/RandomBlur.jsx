'use client'

import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

/**
 * Scroll-triggered random character blur reveal.
 * @param {object} props
 * @param {React.ReactNode} props.children - Text content to split and reveal character-by-character.
 * @param {keyof JSX.IntrinsicElements} props.as - Semantic element for text content. Defaults to 'div'.
 * @param {string} props.className - Class name for the outer wrapper.
 * @param {string} props.start - ScrollTrigger start position.
 * @param {number} props.delay - Delay before animation starts.
 * @param {boolean} props.once - Whether to run the animation only once.
 * @param {number} props.duration - Individual character reveal duration.
 * @param {number} props.staggerAmount - Total time to distribute the random stagger across.
 * @param {string} props.ease - GSAP easing style.
 * @param {string} props.blur - Starting blur value (e.g. '15px').
 */
export default function RandomBlur({
  children,
  as: Tag = 'div',
  className = '',
  start = 'top 90%',
  delay = 0,
  once = true,
  duration = 1,
  staggerAmount = 0.5,
  ease = 'power3.out',
  blur = '10px',
}) {
  const containerRef = useRef(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

    const split = SplitText.create(container, {
      type: 'words,chars',
      charsClass: 'inline-block',
    })

    if (reduceMotion) {
      gsap.set(split.chars, { opacity: 1, filter: 'blur(0px)' })
      return () => split.revert()
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        split.chars,
        {
          opacity: 0,
          filter: `blur(${blur})`,
          force3D: true,
        },
        {
          opacity: 1,
          filter: 'blur(0px)',
          force3D: true,
          delay,
          duration,
          ease,
          stagger: {
            amount: staggerAmount,
            from: 'random',
          },
          scrollTrigger: {
            trigger: container,
            start,
            once,
          },
        }
      )
    }, container)

    return () => {
      ctx.revert()
      split.revert()
    }
  }, [children, start, once, duration, staggerAmount, ease, delay, blur])

  return (
    <Tag ref={containerRef} className={className}>
      {children}
    </Tag>
  )
}
