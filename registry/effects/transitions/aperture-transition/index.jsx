// Built using Hyperiux Vault: https://vault.hyperiux.com

'use client'

// @refresh reset
// This component holds imperative GSAP state (pre-positioned transforms and
// a hand-rolled clip-path) across navigations. Fast Refresh's default
// state-preserving remount can leave that state stale after an edit here -
// e.g. the page stuck mid-shrink or clipped away - so force a full remount
// on every edit instead of trying to preserve it.
import { TransitionRouter } from 'next-transition-router'
import { usePathname } from 'next/navigation'
import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
}

// Matches this project's `md` breakpoint (--breakpoint-md: 1025px in
// globals.css). The same shrink reads as a much bigger margin on a
// phone/tablet's smaller viewport than on desktop, so compact screens get a
// closer-to-1 scale to keep the margin proportionally similar.
const SHRINK_SCALE = 0.82
const COMPACT_SHRINK_SCALE = 0.9

const SHRINK_DURATION = 0.5
// Beat held at the shrunk, fully-clipped state before the reveal starts -
// gives the zoom-out its own moment to read instead of immediately chaining
// into the next motion.
const HOLD_DURATION = 0.1
// The incoming page's clip-path reveal and the scale-up back to full size
// run together across this span, not one after the other.
const REVEAL_DURATION = 0.6

function isCompactViewport() {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 1025
}

// top offset shrinking from 100 (clip rect pinned to zero height at the very
// bottom of the box) to 0 (full box) reads as the reveal's top edge rising
// while its bottom edge stays pinned to the page bottom - i.e. a bottom-to-
// top curtain, not a top-to-bottom one.
//
// vh, not % - wrapperRef's own box height is its *content's* natural
// height (which can be several viewports tall on a long page), not the
// viewport. A percentage-based inset would clip relative to that full
// content height, so almost the entire reveal would happen below the fold
// (invisible, since the frame's own overflow:hidden already hides
// anything past one viewport) and the visible slice would only start
// moving in the last few percent of the animation - reading as a fast,
// late snap instead of a smooth reveal. vh ties the offset to the actual
// viewport height regardless of how tall the underlying page is.
function clipInset(top) {
  return `inset(${top}vh 0% 0% 0%)`
}

const HIDDEN_CLIP = clipInset(100)

export default function ApertureTransition({ children, bgColor = '#0b0b0c' }) {
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
  const frameRef = useRef(null)
  const wrapperRef = useRef(null)
  const overlayRef = useRef(null)
  const cloneRef = useRef(null)
  const pathname = usePathname()
  const isFirstRenderRef = useRef(true)

  // Pre-clip the incoming content and reset its scroll-freeze offset back to
  // 0 synchronously, before the browser paints the swapped children.
  // Without the clip pre-set, the new page briefly renders unclipped for a
  // frame - between React committing the route swap and enter()'s tween
  // actually applying the "from" state via a regular effect - before jumping
  // to fully-hidden and revealing.
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

        frameRef.current.style.position = 'fixed'
        frameRef.current.style.inset = '0'
        frameRef.current.style.overflow = 'hidden'

        wrapperRef.current.style.position = 'fixed'
        wrapperRef.current.style.top = '0'
        wrapperRef.current.style.left = '0'
        wrapperRef.current.style.width = '100%'
        wrapperRef.current.style.transform = `translateY(-${scrollY}px)`

        // Scale the frame down toward its center first, while the outgoing
        // page is still what's on it - the swap only happens once this
        // settles.
        const tl = gsap.timeline({
          onComplete: () => {
            // Freeze the outgoing content as a static clone, stacked
            // beneath the incoming content's z-index. It inherits its
            // position:fixed and translateY straight from wrapperRef's
            // current inline style (cloneNode copies it), and because the
            // frame is a transformed ancestor by now, that "fixed"
            // resolves relative to the frame - so the clone tracks the
            // frame's own scale automatically, with no separate tween of
            // its own needed. Without it, the area the clip-path hasn't
            // revealed yet would show bare background instead of the old
            // page still sitting there.
            const clone = wrapperRef.current.cloneNode(true)
            clone.style.pointerEvents = 'none'
            overlayRef.current.appendChild(clone)
            cloneRef.current = clone

            next()
          },
        })

        tl.to(frameRef.current, {
          scale: isCompactViewport() ? COMPACT_SHRINK_SCALE : SHRINK_SCALE,
          duration: SHRINK_DURATION,
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

            // Any ScrollTrigger created on the incoming page (e.g. a text
            // reveal) measures its trigger element's position while that
            // page is still shrunk and clipped, so its start/end are wrong
            // until this recalculates them against the now-settled layout -
            // without it those triggers can end up never firing.
            ScrollTrigger.refresh()
            next()
          },
        })

        if (prefersReducedMotion()) {
          tl.to(wrapperRef.current, { opacity: 1, duration: 0.2, ease: 'power1.out', clearProps: 'all' }, 0)
          return () => tl.kill()
        }

        // The shrunk, fully-clipped starting state is already applied by
        // the layout effect above. Hold there for a beat, then reveal the
        // new page bottom-to-top and scale the frame back to full size at
        // the same time - not offset, the same motion.
        const state = { top: 100 }
        const applyClip = () => {
          if (wrapperRef.current) wrapperRef.current.style.clipPath = clipInset(state.top)
        }

        tl.to({}, { duration: HOLD_DURATION })

        tl.to(state, {
          top: 0,
          duration: REVEAL_DURATION,
          ease: 'power2.out',
          onUpdate: applyClip,
          onComplete: () => {
            if (wrapperRef.current) wrapperRef.current.style.clipPath = ''
          },
        })

        tl.to(frameRef.current, {
          scale: 1,
          duration: REVEAL_DURATION,
          ease: 'power2.out',
          clearProps: 'transform',
        }, '<')

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
