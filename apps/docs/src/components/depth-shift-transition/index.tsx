'use client'

// @refresh reset
// This component holds imperative GSAP/ScrollTrigger state (clone tweens,
// pre-positioned transforms) across navigations. Fast Refresh's default
// state-preserving remount can leave that state stale after an edit here -
// e.g. a split-text reveal stuck at opacity 0 until a hard reload - so force
// a full remount on every edit instead of trying to preserve it.
import { TransitionRouter } from 'next-transition-router'
import { usePathname } from 'next/navigation'
import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '@/lib/motion'

gsap.registerPlugin(ScrollTrigger)

// Matches this project's `md` breakpoint (--breakpoint-md: 1025px in
// globals.css, i.e. Tailwind's max-[1025px]: cutoff) so mobile and tablet share
// the same tamed travel distance, and only true desktop gets the full one.
function isCompactViewport() {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 1025
}

interface DepthShiftTransitionProps {
  children: React.ReactNode
  bgColor?: string
}

export default function DepthShiftTransition({ children, bgColor = '#0b0b0c' }: DepthShiftTransitionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const cloneRef = useRef<HTMLElement | null>(null)
  const pathname = usePathname()
  const isFirstRenderRef = useRef(true)

  // Pre-position the incoming page off-screen synchronously, before the
  // browser paints the swapped content. Without this, the new page briefly
  // renders in its natural resting position for a frame - between React
  // committing the route swap and enter()'s gsap.fromTo() actually applying
  // the "from" state via a regular effect - before jumping off-screen and
  // animating in. That gap is imperceptible on fast devices but shows up as
  // a flash-then-jump-then-animate glitch on slower mobile hardware.
  useLayoutEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }
    if (prefersReducedMotion()) return

    gsap.set(wrapperRef.current, {
      xPercent: isCompactViewport() ? -30 : -80,
      yPercent: 100,
      rotate: -3,
      scale: 0.85,
    })
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

        // Freeze the outgoing page as a floating clone so it can keep
        // animating on top while the real page underneath is swapped and
        // starts entering immediately - that's what keeps both halves of
        // the transition visible and moving at once instead of leave
        // fully finishing before enter is allowed to start.
        const clone = wrapperRef.current!.cloneNode(true) as HTMLElement
        clone.style.position = 'fixed'
        clone.style.inset = '0'
        clone.style.margin = '0'
        clone.style.pointerEvents = 'none'
        clone.style.transformOrigin = '50% 50%'
        overlayRef.current!.appendChild(clone)
        cloneRef.current = clone

        // No onComplete removal here - the clone stays put once its tween
        // settles instead of vanishing early and exposing the backdrop
        // before the incoming page has actually arrived to cover it.
        // enter() below removes it once the new page has fully landed.
        gsap.to(clone, {
          xPercent: isCompactViewport() ? 8 : 20,
          yPercent: isCompactViewport() ? 12 : 30,
          rotate: 3,
          scale: 0.7,
          duration: 0.65,
          ease: 'power2.in',
        })

        // Navigate immediately instead of waiting for the clone's exit tween
        // to finish - the router's "entering" transition calls whatever this
        // function returns the moment the route changes, which would kill a
        // timeline handed back here. The clone tween above is untethered
        // from that lifecycle on purpose so it keeps animating on its own
        // clock while the real page enters underneath.
        next()
      }}
      enter={(next) => {
        const tl = gsap.timeline({
          onComplete: () => {
            cloneRef.current?.remove()
            cloneRef.current = null
            // Any ScrollTrigger created on the incoming page (e.g. a text
            // reveal) measures its trigger element's position while that
            // page is still mid-transition and transformed off-screen, so
            // its start/end are wrong until this recalculates them against
            // the now-settled layout - without it those triggers can end up
            // never firing.
            ScrollTrigger.refresh()
            next()
          },
        })

        if (prefersReducedMotion()) {
          tl.to(wrapperRef.current, { opacity: 1, duration: 0.2, ease: 'power1.out', clearProps: 'all' }, 0)
          return () => tl.kill()
        }

        // The off-screen starting position is already applied by the
        // layout effect above (synchronously, before this ever paints), so
        // this only has to animate it back in - no fromTo/from-state race
        // with the browser's next paint. The delay is the short head start
        // that keeps the incoming page parked off-screen for a beat, so the
        // outgoing clone's exit reads as its own visible moment instead of
        // being instantly buried under the new page (z-20 vs z-10).
        tl.to(wrapperRef.current, {
          xPercent: 0,
          yPercent: 0,
          rotate: 0,
          scale: 1,
          duration: 0.4,
          delay: 0.35,
          ease: 'power2.out',
          clearProps: 'all',
        })

        return () => tl.kill()
      }}
    >
      <div className='fixed inset-0 h-screen w-screen overflow-hidden'>
        <div className='absolute inset-0 -z-10' style={{ backgroundColor: bgColor }} />
        <div ref={overlayRef} className='absolute inset-0 z-10 pointer-events-none' />

        <div
          ref={wrapperRef}
          className='relative z-20 h-full w-full'
          style={{ transformOrigin: '50% 50%' }}
        >
          {children}
        </div>
      </div>
    </TransitionRouter>
  )
}
