'use client'


import { TransitionRouter } from 'next-transition-router'
import { usePathname } from 'next/navigation'
import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '@/lib/motion'

gsap.registerPlugin(ScrollTrigger)


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

        const clone = wrapperRef.current!.cloneNode(true) as HTMLElement
        clone.style.position = 'fixed'
        clone.style.inset = '0'
        clone.style.margin = '0'
        clone.style.pointerEvents = 'none'
        clone.style.transformOrigin = '50% 50%'
        overlayRef.current!.appendChild(clone)
        cloneRef.current = clone

     
        gsap.to(clone, {
          xPercent: isCompactViewport() ? 8 : 20,
          yPercent: isCompactViewport() ? 12 : 30,
          rotate: 3,
          scale: 0.7,
          duration: 0.65,
          ease: 'power2.in',
        })


        next()
      }}
      enter={(next) => {
        const tl = gsap.timeline({
          onComplete: () => {
            cloneRef.current?.remove()
            cloneRef.current = null
     
            ScrollTrigger.refresh()
            next()
          },
        })

        if (prefersReducedMotion()) {
          tl.to(wrapperRef.current, { opacity: 1, duration: 0.2, ease: 'power1.out', clearProps: 'all' }, 0)
          return () => tl.kill()
        }

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
