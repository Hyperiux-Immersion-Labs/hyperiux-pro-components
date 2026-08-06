'use client'

import { TransitionRouter } from 'next-transition-router'
import { usePathname } from 'next/navigation'
import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '@/lib/motion'

gsap.registerPlugin(ScrollTrigger)

const SHRINK_SCALE = 0.82
const COMPACT_SHRINK_SCALE = 0.9

function isCompactViewport() {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 1025
}

// vh, not % - wrapperRef's own box height is its content's natural height
// (which can be several viewports on a long page), not the viewport. A
// percentage-based inset would clip relative to that full content height,
// so most of the reveal would happen below the fold (already hidden by the
// frame's own overflow:hidden) and the visible slice would only start
// moving in the last few percent of the animation - a fast, late snap
// instead of a smooth reveal. vh ties the offset to the actual viewport
// height regardless of how tall the underlying page is.
function clipInset(top: number) {
  return `inset(${top}vh 0% 0% 0%)`
}

const HIDDEN_CLIP = clipInset(100)

interface ApertureTransitionProps {
  children: React.ReactNode
  bgColor?: string
}

export default function ApertureTransition({ children, bgColor = '#0b0b0c' }: ApertureTransitionProps) {
  // frameRef sits in normal document flow at rest (no fixed positioning, no
  // fixed height) so a page taller than one viewport scrolls exactly like it
  // would without this component. Only while a transition is actually
  // running does it become a viewport-sized, clipped, scaling frame - and
  // wrapperRef gets pinned inside it at the scroll offset the page was at
  // the moment the transition started. Without that freeze, scaling a
  // container that holds a 5000px-tall page would shrink the *entire*
  // document toward its own center - which could be thousands of pixels
  // below whatever the user was actually looking at - instead of shrinking
  // the part of the page that was on screen.
  const frameRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const cloneRef = useRef<HTMLElement | null>(null)
  const pathname = usePathname()
  const isFirstRenderRef = useRef(true)

  useLayoutEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }
    if (prefersReducedMotion()) return

    if (wrapperRef.current) {
      wrapperRef.current.style.transform = 'translateY(0px)'
      wrapperRef.current.style.clipPath = HIDDEN_CLIP
    }
  }, [pathname])

  return (
    <TransitionRouter
      auto
      leave={(next) => {
        if (prefersReducedMotion()) {
          const tl = gsap.timeline({ onComplete: next })
          tl.to(wrapperRef.current, { opacity: 0, duration: 0.2, ease: 'power1.out' }, 0)
          return () => tl.kill()
        }

        // Freeze the page at its current scroll position: pin the frame to
        // the viewport and shift the (possibly much taller) content up by
        // however far it was scrolled, so what's visually on screen right
        // now stays exactly where it is once the frame stops being part of
        // the scrollable document.
        const scrollY = window.scrollY || document.documentElement.scrollTop || 0
        document.body.style.overflow = 'hidden'

        frameRef.current!.style.position = 'fixed'
        frameRef.current!.style.inset = '0'
        frameRef.current!.style.overflow = 'hidden'

        wrapperRef.current!.style.position = 'fixed'
        wrapperRef.current!.style.top = '0'
        wrapperRef.current!.style.left = '0'
        wrapperRef.current!.style.width = '100%'
        wrapperRef.current!.style.transform = `translateY(-${scrollY}px)`

        const tl = gsap.timeline({
          onComplete: () => {
            // Freeze the outgoing content as a static clone, stacked
            // beneath the incoming content's z-index. It inherits its
            // position:fixed and translateY straight from wrapperRef's
            // current inline style (cloneNode copies it), and because the
            // frame is a transformed ancestor by now, that "fixed"
            // resolves relative to the frame - so the clone tracks the
            // frame's own scale automatically, with no separate tween of
            // its own needed.
            const clone = wrapperRef.current!.cloneNode(true) as HTMLElement
            clone.style.pointerEvents = 'none'
            overlayRef.current!.appendChild(clone)
            cloneRef.current = clone

            next()
          },
        })

        tl.to(frameRef.current, {
          scale: isCompactViewport() ? COMPACT_SHRINK_SCALE : SHRINK_SCALE,
          duration: 0.6,
          ease: 'power2.inOut',
        })

        return () => tl.kill()
      }}
      enter={(next) => {
        const tl = gsap.timeline({
          onComplete: () => {
            cloneRef.current?.remove()
            cloneRef.current = null

            // Release the freeze - the new page goes back to normal,
            // scrollable in-flow layout instead of staying pinned inside
            // the fixed frame.
            document.body.style.overflow = ''
            if (frameRef.current) {
              frameRef.current.style.position = ''
              frameRef.current.style.inset = ''
              frameRef.current.style.overflow = ''
            }
            if (wrapperRef.current) {
              wrapperRef.current.style.position = ''
              wrapperRef.current.style.top = ''
              wrapperRef.current.style.left = ''
              wrapperRef.current.style.width = ''
              wrapperRef.current.style.transform = ''
            }

            ScrollTrigger.refresh()
            next()
          },
        })

        if (prefersReducedMotion()) {
          tl.to(wrapperRef.current, { opacity: 1, duration: 0.2, ease: 'power1.out', clearProps: 'all' }, 0)
          return () => tl.kill()
        }

        const state = { top: 100 }
        const applyClip = () => {
          if (wrapperRef.current) wrapperRef.current.style.clipPath = clipInset(state.top)
        }

        tl.to(state, {
          top: 0,
          duration: 0.4,
          ease: 'power2.in',
          onUpdate: applyClip,
          onComplete: () => {
            if (wrapperRef.current) wrapperRef.current.style.clipPath = ''
          },
        })

        tl.to(frameRef.current, {
          scale: 1,
          duration: 1.0,
          ease: 'power3.inOut',
          clearProps: 'transform',
        }, '-=0.35')

        return () => tl.kill()
      }}
    >
      <div className='fixed inset-0 -z-10 pointer-events-none' style={{ backgroundColor: bgColor }} />

      <div ref={frameRef} className='relative w-full' style={{ transformOrigin: '50% 50%' }}>
        <div ref={overlayRef} className='absolute inset-0 z-10 pointer-events-none' />

        <div ref={wrapperRef} className='relative z-20 w-full'>
          {children}
        </div>
      </div>
    </TransitionRouter>
  )
}
