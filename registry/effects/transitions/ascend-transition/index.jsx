// Built using Hyperiux Vault: https://vault.hyperiux.com

'use client'

import { TransitionRouter } from 'next-transition-router'
import React, { useRef } from 'react'
import gsap from 'gsap'

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
}

const START_SCALE = 0.8
// Matches this project's `md` breakpoint (--breakpoint-md: 1025px in
// globals.css). The same 0.8 shrink reads as a much bigger margin on a
// phone/tablet's smaller viewport than on desktop, so compact screens get a
// closer-to-1 scale to keep the margin proportionally similar.
const COMPACT_START_SCALE = 0.9
const HOLD_DELAY = 0.12

function isCompactViewport() {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 1025
}

function clipInset(top) {
  return `inset(${top}% 0% 0% 0%)`
}

const HIDDEN_CLIP = clipInset(100)

export default function AscendTransition({ children, bgColor = '#0b0b0c' }) {
  const panelRef = useRef(null)

  return (
    <TransitionRouter
      auto
      leave={(next) => {
        if (prefersReducedMotion()) {
          const tl = gsap.timeline({ onComplete: next })
          tl.to(panelRef.current, { opacity: 1, duration: 0.2, ease: 'power1.out' }, 0)
          return () => tl.kill()
        }

        const tl = gsap.timeline({ onComplete: next })

        const startScale = isCompactViewport() ? COMPACT_START_SCALE : START_SCALE
        const state = { top: 100 }
        const applyClip = () => {
          if (panelRef.current) panelRef.current.style.clipPath = clipInset(state.top)
        }

        let scaleQueued = false

        tl.set(panelRef.current, { opacity: 1, scale: startScale })
        tl.set(state, { top: 100, onUpdate: applyClip })

        // power3.inOut front-loads most of its motion - top is already past
        // the halfway *value* well before halfway through the tween's
        // duration - so a fixed time offset for the scale tween drifts out
        // of sync with "starts around h-50" whenever the reveal's
        // duration/ease changes. Watching the actual value and inserting the
        // scale tween at the live playhead position the moment it crosses
        // keeps the two locked together regardless.
        tl.to(state, {
          top: 0,
          duration: 0.9,
          ease: 'power3.inOut',
          onUpdate: () => {
            applyClip()

            if (!scaleQueued && state.top <= 80) {
              scaleQueued = true

              // Fit: the panel scales up to fill the screen, starting right
              // as the reveal crosses its threshold - not after it finishes -
              // so the motion stays continuous instead of a dead stop
              // between "reveal" and "grow to fit."
              tl.to(panelRef.current, {
                scale: 1,
                duration: 0.5,
                ease: 'power2.inOut',
              }, tl.time())
            }
          },
        })

        return () => tl.kill()
      }}
      enter={(next) => {
        const tl = gsap.timeline({
          // Explicit opacity: 0, not clearProps: 'all' - clearProps wipes the
          // *entire* inline style attribute, not just what GSAP touched. That
          // would also strip the backgroundColor React set via the style prop
          // once (and never rewrites again, since from React's diff the value
          // never changes) - leaving the panel transparent on every
          // transition after the first.
          onComplete: () => {
            gsap.set(panelRef.current, { opacity: 0 })
            next()
          },
        })

        if (prefersReducedMotion()) {
          tl.to(panelRef.current, { opacity: 0, duration: 0.2, ease: 'power1.out' }, 0)
          return () => tl.kill()
        }

        // The incoming page is already sitting still underneath, fully
        // covered by the panel - a short hold keeps the full-screen cover
        // legible for a beat before it fades away to reveal it.
        tl.to(panelRef.current, {
          opacity: 0,
          duration: 0.35,
          delay: HOLD_DELAY,
          ease: 'power1.out',
        })

        return () => tl.kill()
      }}
    >
      {children}
      <div
        ref={panelRef}
        aria-hidden
        className='fixed inset-0 z-50 pointer-events-none opacity-0'
        style={{ backgroundColor: bgColor, clipPath: HIDDEN_CLIP }}
      />
    </TransitionRouter>
  )
}
