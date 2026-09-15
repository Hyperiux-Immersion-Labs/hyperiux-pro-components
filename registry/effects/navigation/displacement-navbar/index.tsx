'use client'
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react'
import { gsap } from 'gsap'
import Image from 'next/image'
import Link from 'next/link'
import { usePrefersReducedMotion } from '@/lib/motion'

export interface DisplacementNavbarLink {
  label: string
  href?: string
}

type LinkHoverProps = Omit<ComponentPropsWithoutRef<typeof Link>, 'children'> & {
  children: string
  staggerStep?: number
  showLine?: boolean
  arrow?: boolean
  reduced?: boolean
}

export function LinkHover({
  children,
  className = '',
  staggerStep = 0.015,
  showLine = true,
  arrow = false,
  reduced = false,
  ...props
}: LinkHoverProps) {
  // The roll-up IS this control's animation, so there is no gentler version of
  // it to fall back to — under reduced motion the label renders plainly and
  // hover does nothing. This also drops the per-character spans a screen
  // reader would otherwise have to step over.
  if (reduced) {
    return (
      <Link {...props} className={`inline-flex items-center gap-[0.35em] no-underline ${className}`}>
        <span className="leading-[1.2]">{children}</span>
        {arrow && (
          <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" className="h-[0.8em] w-[0.8em] flex-none">
            <path
              d="M3 11L11 3M11 3H5M11 3V9"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </Link>
    )
  }

  return (
    <Link
      {...props}
      className={`group/link-hover inline-flex items-center gap-[0.35em] no-underline ${className}`}
    >
      <span className="sr-only">{children}</span>
      <span aria-hidden="true" className="relative inline-block overflow-hidden align-middle leading-[1.2]">
        {[...children].map((char, index) => (
          <span
            key={index}
            className="relative inline-block whitespace-pre transition-transform duration-500 ease-[cubic-bezier(0.625,0.05,0,1)] group-hover/link-hover:translate-y-[-1.2em] group-focus-visible/link-hover:translate-y-[-1.2em]"
            style={{
              textShadow: '0 1.2em currentColor',
              transitionDelay: `${index * staggerStep}s`,
            }}
          >
            {char === ' ' ? ' ' : char}
          </span>
        ))}
        {showLine && (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-right scale-x-0 bg-current transition-transform duration-[0.4s] ease-[cubic-bezier(0.625,0.05,0,1)] group-hover/link-hover:origin-left group-hover/link-hover:scale-x-100 group-focus-visible/link-hover:origin-left group-focus-visible/link-hover:scale-x-100" />
        )}
      </span>
      {arrow && (
        <svg
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          className="h-[0.8em] w-[0.8em] flex-none transition-transform duration-300 ease-[cubic-bezier(0.625,0.05,0,1)] group-hover/link-hover:translate-x-[0.15em] group-hover/link-hover:translate-y-[-0.15em]"
        >
          <path
            d="M3 11L11 3M11 3H5M11 3V9"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </Link>
  )
}

export interface DisplacementNavbarMedia {
  src: string
  caption: string
}

export interface DisplacementNavbarProps {
  primaryLinks?: DisplacementNavbarLink[]
  infoLinks?: DisplacementNavbarLink[]
  media?: DisplacementNavbarMedia[]
  brand?: string
  email?: string
  socials?: DisplacementNavbarLink[]
  cities?: string
  className?: string
  children?: React.ReactNode
  /** Page displacement + bar/mark open duration, in seconds. */
  openDuration?: number
  /** Page displacement + bar/mark close duration, in seconds. Matches `openDuration` by default so the close mirrors the open. */
  closeDuration?: number
  /** Delay (seconds) between each shelf content item fading in on open, and out again on close in reverse order. */
  contentStagger?: number
  /** Duration of the figure image cross-swap on link hover, in seconds. */
  imageSwapDuration?: number
  /** Shelf + header background color. */
  shelfBackground?: string
  /** Displaced page background color. */
  pageBackground?: string
  /** Primary/info link text color. */
  linkColor?: string
  /** Index numerals, captions, and dimmed-state color. */
  mutedColor?: string
  /** Bar seam and footer divider color. */
  hairlineColor?: string
  /** Per-character reveal delay in `LinkHover`, in seconds. */
  charStagger?: number
  /** Shows the underline draw-in under hovered links. */
  showLinkUnderline?: boolean
  /** Dims sibling primary links while one is hovered. */
  dimInactiveLinks?: boolean
  /** Shows the figure image panel next to the primary links. */
  showMedia?: boolean
}

const defaultPrimaryLinks: DisplacementNavbarLink[] = [
  { label: 'Components' },
  { label: 'Templates' },
  { label: 'Showcase' },
  { label: 'Docs' },
]

const defaultInfoLinks: DisplacementNavbarLink[] = [
  { label: 'About' },
  { label: 'Pricing' },
  { label: 'Changelog' },
  { label: 'Contact' },
]

const defaultSocials: DisplacementNavbarLink[] = [
  { label: 'X' },
  { label: 'GitHub' },
  { label: 'Discord' },
]

const defaultMedia: DisplacementNavbarMedia[] = [
  {
    src: 'https://picsum.photos/seed/1/800/600',
    caption: 'Drop-in motion primitives',
  },
  {
    src: 'https://picsum.photos/seed/2/800/600',
    caption: 'Full pages, wired and ready',
  },
  {
    src: 'https://picsum.photos/seed/3/800/600',
    caption: 'Built with Hyperiux in the wild',
  },
  {
    src: 'https://picsum.photos/seed/4/800/600',
    caption: 'Guides, props and recipes',
  },
]

// Fixed — not exposed to the remixer. `EASE` and `IMG_PARK_SCALE` were excluded
// by request; the mark-block geometry is an internal detail of the hamburger
// icon, not a style choice.
const EASE = 'expo.out'
const IMG_PARK_SCALE = 1.08
const MARK_DURATION = 0.45
const MARK_BLOCK_WIDTH = '60%'
const MARK_BLOCK_HEIGHT = '32%'

// Reduced motion keeps the same choreography but collapses it: the page still
// makes room for the shelf (that displacement is the component's function, not
// decoration), it just gets there quickly, and everything that was travelling
// or staggering becomes a plain fade. Not remixable — this is an accessibility
// floor, not a style choice.
const RM_EASE = 'power1.out'
const RM_OPEN_DURATION = 0.2
const RM_CLOSE_DURATION = 0.16
const RM_CONTENT_DURATION = 0.15
const RM_IMG_FADE = 0.2

const DisplacementNavbar = ({
  primaryLinks = defaultPrimaryLinks,
  infoLinks = defaultInfoLinks,
  media = defaultMedia,
  brand = 'Hyperiux',
  email = 'hello@hyperiux.com',
  socials = defaultSocials,
  cities = 'Remote / Worldwide',
  className = '',
  children,
  openDuration = 0.65,
  closeDuration = 0.65,
  contentStagger = 0.055,
  imageSwapDuration = 0.5,
  shelfBackground = '#151515',
  pageBackground = '#f4f3f1',
  linkColor = '#f4f3f1',
  mutedColor = 'rgba(244,243,241,0.38)',
  hairlineColor = 'rgba(244,243,241,0.14)',
  charStagger = 0.015,
  showLinkUnderline = true,
  dimInactiveLinks = true,
  showMedia = true,
}: DisplacementNavbarProps) => {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const barRef = useRef<HTMLDivElement | null>(null)
  const barLineRef = useRef<HTMLSpanElement | null>(null)
  const markLineRef = useRef<HTMLSpanElement | null>(null)
  const markBlockRef = useRef<HTMLSpanElement | null>(null)
  const shelfRef = useRef<HTMLDivElement | null>(null)
  const pageRef = useRef<HTMLDivElement | null>(null)
  const primaryNavRef = useRef<HTMLDivElement | null>(null)
  const contentRefs = useRef<HTMLElement[]>([])
  const imageRefs = useRef<HTMLDivElement[]>([])
  const captionRef = useRef<HTMLSpanElement | null>(null)

  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const scrollYRef = useRef(0)
  const scrollLockStylesRef = useRef<{
    htmlOverflow: string
    bodyOverflow: string
    bodyPosition: string
    bodyTop: string
    bodyWidth: string
    bodyPaddingRight: string
  } | null>(null)
  const activeMediaRef = useRef(0)

  const [isOpen, setIsOpen] = useState(false)
  const phase = useRef<'closed' | 'opening' | 'open' | 'closing'>('closed')

  // open/close/swapMedia are stable-identity callbacks, so remixer-driven prop
  // changes (and the reduced-motion preference) are read through refs at call
  // time rather than captured in a closure that would go stale.
  const reducedMotion = usePrefersReducedMotion()
  const reducedRef = useRef(reducedMotion)
  reducedRef.current = reducedMotion

  const timingRef = useRef({ openDuration, closeDuration, contentStagger, imageSwapDuration })
  timingRef.current = { openDuration, closeDuration, contentStagger, imageSwapDuration }

  const registerContent = useCallback((node: HTMLElement | null, index: number) => {
    if (node) contentRefs.current[index] = node
  }, [])

  const registerImage = useCallback((node: HTMLDivElement | null, index: number) => {
    if (node) imageRefs.current[index] = node
  }, [])

  // The hamburger's two marks are offset from the centre by a share of the
  // icon box, not a fixed pixel count — the box is sized in vw and grows a lot
  // on mobile, where a hardcoded offset would leave the marks nearly touching.
  const markOffsets = useCallback(() => {
    const box = markLineRef.current?.parentElement?.getBoundingClientRect()
    const h = box?.height ?? 14
    return { line: -h * 0.22, block: h * 0.18, nudge: h * 0.32 }
  }, [])

  useLayoutEffect(() => {
    const marks = markOffsets()
    gsap.set(markLineRef.current, { xPercent: -50, yPercent: -50, y: marks.line, rotation: 0 })
    gsap.set(markBlockRef.current, {
      xPercent: -50,
      yPercent: -50,
      y: marks.block,
      rotation: 0,
      width: MARK_BLOCK_WIDTH,
      height: MARK_BLOCK_HEIGHT,
    })
    gsap.set(barLineRef.current, { scaleX: 0 })
    // The shelf travels rather than sitting still and being uncovered: it parks
    // one shelf-height above its resting slot so its bottom edge is level with
    // the bar, then slides down in step with the page. Parked, it is invisible
    // without needing a mask — the wrapper behind it is the same
    // `shelfBackground`, and its contents start at `autoAlpha: 0`.
    gsap.set(shelfRef.current, { y: -(shelfRef.current?.offsetHeight ?? 0) })
    gsap.set(contentRefs.current, { autoAlpha: 0, y: reducedMotion ? 0 : -18 })
    imageRefs.current.forEach((el, i) => {
      // Reduced motion swaps images by cross-fade, so they all sit stacked in
      // place at zero offset and only opacity separates them.
      if (reducedMotion) {
        gsap.set(el, { yPercent: 0, autoAlpha: i === 0 ? 1 : 0, zIndex: i === 0 ? 1 : 0, scale: 1 })
      } else {
        gsap.set(el, { yPercent: i === 0 ? 0 : 101, autoAlpha: 1, zIndex: i === 0 ? 1 : 0, scale: IMG_PARK_SCALE })
      }
    })
  }, [markOffsets, reducedMotion])

  const swapMedia = useCallback((index: number) => {
    if (index === activeMediaRef.current) return
    const images = imageRefs.current
    const next = images[index]
    const prev = images[activeMediaRef.current]
    if (!next) return
    const direction = index > activeMediaRef.current ? 1 : -1
    activeMediaRef.current = index
    const swapDur = timingRef.current.imageSwapDuration

    if (reducedRef.current) {
      // Cross-fade in place: nothing travels, the outgoing frame just hands off
      // opacity to the incoming one.
      gsap.killTweensOf(images)
      images.forEach((el) => {
        if (el !== next && el !== prev) gsap.set(el, { autoAlpha: 0, yPercent: 0, zIndex: 0 })
      })
      gsap.set(next, { yPercent: 0, zIndex: 2 })
      if (prev) gsap.set(prev, { zIndex: 1 })
      gsap.to(next, { autoAlpha: 1, duration: RM_IMG_FADE, ease: RM_EASE, overwrite: 'auto' })
      if (prev) gsap.to(prev, { autoAlpha: 0, duration: RM_IMG_FADE, ease: RM_EASE, overwrite: 'auto' })
    } else {
      gsap.killTweensOf(images, 'yPercent')
      images.forEach((el) => {
        if (el !== next && el !== prev) gsap.set(el, { yPercent: 101 * direction, zIndex: 0 })
      })
      gsap.set(next, { yPercent: -100 * direction, zIndex: 2 })
      if (prev) gsap.set(prev, { zIndex: 1 })

      gsap.to(next, { yPercent: 0, duration: swapDur, ease: EASE, overwrite: 'auto' })
      if (prev) gsap.to(prev, { yPercent: 100 * direction, duration: swapDur, ease: EASE, overwrite: 'auto' })
    }

    if (captionRef.current) {
      gsap.killTweensOf(captionRef.current)
      if (reducedRef.current) {
        captionRef.current.textContent = media[index]?.caption ?? ''
        gsap.fromTo(
          captionRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: RM_IMG_FADE, ease: RM_EASE, overwrite: 'auto' }
        )
      } else {
        gsap.to(captionRef.current, {
          autoAlpha: 0,
          duration: 0.12,
          ease: 'power1.out',
          onComplete: () => {
            if (captionRef.current) captionRef.current.textContent = media[index]?.caption ?? ''
            gsap.to(captionRef.current, { autoAlpha: 1, duration: 0.24, ease: 'power1.out' })
          },
        })
      }
    }
  }, [media])

  const unlockScroll = useCallback(() => {
    const styles = scrollLockStylesRef.current
    if (!styles) return

    document.documentElement.style.overflow = styles.htmlOverflow
    document.body.style.overflow = styles.bodyOverflow
    document.body.style.position = styles.bodyPosition
    document.body.style.top = styles.bodyTop
    document.body.style.width = styles.bodyWidth
    document.body.style.paddingRight = styles.bodyPaddingRight
    scrollLockStylesRef.current = null
    window.scrollTo(0, scrollYRef.current)
  }, [])

  const open = useCallback(() => {
    if (phase.current === 'open' || phase.current === 'opening') return
    timelineRef.current?.kill()

    const barH = barRef.current?.offsetHeight ?? 0
    const shelfH = shelfRef.current?.offsetHeight ?? 0
    const distance = shelfH + barH
    scrollYRef.current = window.scrollY

    // Freeze the document at its current visual position while the shelf is
    // out. `overflow: hidden` alone can jump a tall document back to the top on
    // some browsers; fixing the body with the inverse scroll offset keeps a
    // mid-page open perfectly still. Preserve inline styles so embedding this
    // component never destroys a host page's own scroll-lock state.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    scrollLockStylesRef.current = {
      htmlOverflow: document.documentElement.style.overflow,
      bodyOverflow: document.body.style.overflow,
      bodyPosition: document.body.style.position,
      bodyTop: document.body.style.top,
      bodyWidth: document.body.style.width,
      bodyPaddingRight: document.body.style.paddingRight,
    }
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollYRef.current}px`
    document.body.style.width = '100%'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`

    if (shelfRef.current) {
      shelfRef.current.style.visibility = 'visible'
      shelfRef.current.style.pointerEvents = 'auto'
    }

    phase.current = 'opening'
    setIsOpen(true)

    const tl = gsap.timeline({
      defaults: { force3D: true, overwrite: 'auto' },
      onComplete: () => {
        phase.current = 'open'
      },
    })
    timelineRef.current = tl

    const rm = reducedRef.current
    const t = timingRef.current
    const ease = rm ? RM_EASE : EASE
    const openDur = rm ? RM_OPEN_DURATION : t.openDuration
    const markDur = rm ? RM_OPEN_DURATION : MARK_DURATION

    // Shelf and page share a start, a duration and a curve, so the shelf's
    // bottom edge stays welded to the top of the page for the whole travel
    // rather than being uncovered by it.
    tl.to(pageRef.current, { y: distance, duration: openDur, ease }, 0)
    tl.to(shelfRef.current, { y: 0, duration: openDur, ease }, 0)
    tl.to(barLineRef.current, { scaleX: 1, duration: rm ? openDur : Math.max(openDur, 0.1) * 1.2, ease }, 0)
    tl.to(markLineRef.current, { y: 0, rotation: 45, duration: markDur, ease }, 0)
    tl.to(
      markBlockRef.current,
      {
        y: 0,
        rotation: -45,
        width: '100%',
        height: 2,
        duration: markDur,
        ease,
      },
      0
    )
    // Reduced motion: content arrives as a quick fade — no upward travel, no
    // stagger cascade — and the images are already at rest scale.
    tl.to(
      contentRefs.current,
      rm
        ? { autoAlpha: 1, y: 0, duration: RM_CONTENT_DURATION, stagger: 0, ease }
        : { autoAlpha: 1, y: 0, duration: 0.5, stagger: t.contentStagger, ease },
      rm ? 0.05 : 0.195
    )
    if (!rm) {
      tl.to(imageRefs.current, { scale: 1, duration: openDur, ease: EASE }, 0.195)
    }
  }, [])

  const close = useCallback(() => {
    if (phase.current === 'closed' || phase.current === 'closing') return
    timelineRef.current?.kill()

    phase.current = 'closing'

    const tl = gsap.timeline({
      defaults: { force3D: true, overwrite: 'auto' },
      onComplete: () => {
        if (shelfRef.current) {
          shelfRef.current.style.visibility = 'hidden'
          shelfRef.current.style.pointerEvents = 'none'
        }
        phase.current = 'closed'
        setIsOpen(false)
        unlockScroll()
      },
    })
    timelineRef.current = tl

    const rm = reducedRef.current
    const t = timingRef.current
    const ease = rm ? RM_EASE : EASE
    const closeDur = rm ? RM_CLOSE_DURATION : t.closeDuration
    const markDur = rm ? RM_CLOSE_DURATION : MARK_DURATION

    // The open, read right-to-left. There the content was last to arrive, so
    // here it is first to leave: it runs from 0 on a reverse stagger — last
    // item in, first item out — and is gone before the page finishes
    // travelling. Page, bar and mark share a start, as they do on the way out,
    // and every duration matches its opening counterpart so the two directions
    // take the same time. The curve stays `EASE` in both directions: an
    // inverted `expo.in` holds still for a third of its span before moving,
    // which reads as lag rather than as a rewind. Under reduced motion content
    // parks without the upward offset, so reopening is a pure fade.
    const contentDur = rm ? RM_CONTENT_DURATION : 0.5
    tl.to(
      contentRefs.current,
      rm
        ? { autoAlpha: 0, y: 0, duration: contentDur, stagger: 0, ease }
        : { autoAlpha: 0, y: -18, duration: contentDur, stagger: { each: t.contentStagger, from: 'end' }, ease },
      0
    )
    if (!rm) {
      tl.to(imageRefs.current, { scale: IMG_PARK_SCALE, duration: closeDur, ease: EASE }, 0)
    }
    tl.to(pageRef.current, { y: 0, duration: closeDur, ease }, 0)
    tl.to(shelfRef.current, { y: -(shelfRef.current?.offsetHeight ?? 0), duration: closeDur, ease }, 0)
    tl.to(barLineRef.current, { scaleX: 0, duration: rm ? closeDur : Math.max(closeDur, 0.1) * 1.2, ease }, 0)
    const marks = markOffsets()
    tl.to(markLineRef.current, { y: marks.line, rotation: 0, duration: markDur, ease }, 0)
    tl.to(
      markBlockRef.current,
      {
        y: marks.block,
        rotation: 0,
        width: MARK_BLOCK_WIDTH,
        height: MARK_BLOCK_HEIGHT,
        duration: markDur,
        ease,
      },
      0
    )
  }, [markOffsets, unlockScroll])

  const toggle = useCallback(() => {
    if (phase.current === 'open' || phase.current === 'opening') close()
    else open()
  }, [open, close])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (phase.current === 'open' || phase.current === 'opening')) close()
    }
    const onPointerDown = (e: PointerEvent) => {
      if (phase.current !== 'open' && phase.current !== 'opening') return
      const target = e.target as Node
      if (barRef.current?.contains(target) || shelfRef.current?.contains(target)) return
      close()
    }
    // The document is frozen while open, so a wheel/touch gesture cannot scroll
    // it — the gesture just dismisses the shelf. Cancelling the event is both
    // redundant and unreliable (a wheel already handed to the compositor keeps
    // scrolling), so the lock does the holding and this only triggers the close.
    const onGesture = () => {
      if (phase.current !== 'open' && phase.current !== 'opening') return
      close()
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('wheel', onGesture, { passive: true })
    window.addEventListener('touchmove', onGesture, { passive: true })
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('wheel', onGesture)
      window.removeEventListener('touchmove', onGesture)
      unlockScroll()
    }
  }, [close, unlockScroll])

  return (
    <div
      ref={wrapRef}
      data-menu-phase={isOpen ? 'open' : 'closed'}
      className={`relative min-h-screen ${className}`}
      style={{ backgroundColor: shelfBackground, color: linkColor }}
    >
      {/* The bar is transparent when closed so the page shows through it. Once
          the shelf is out it carries `shelfBackground` itself: the shelf lands
          with its top edge level with the bar's bottom, so it no longer covers
          the bar strip, and the page's top padding would otherwise show through
          as a light band above a dark shelf. */}
      <header
        ref={barRef}
        className="fixed top-0 left-0 right-0 z-30 backdrop-blur-sm flex items-center justify-between h-[4vw] max-[1025px]:h-[16vw] min-[769px]:max-[1025px]:h-[5.5vw] px-[1.7vw] max-[1025px]:px-[5vw] min-[769px]:max-[1025px]:px-[2.6vw] transition-colors duration-300"
        style={{ backgroundColor: isOpen ? shelfBackground : 'transparent', color: isOpen ? linkColor : '#111111' }}
      >
        <Link href="#" aria-label="Home" className="relative block">
          <span className="block text-[2vw] max-[1025px]:text-[4vw]  font-medium tracking-[-0.01em]">
            {brand}
          </span>
        </Link>

        <button
          type="button"
          onClick={toggle}
          onMouseEnter={() => {
            if (reducedMotion || phase.current !== 'closed') return
            gsap.to(markBlockRef.current, { y: markOffsets().nudge, duration: 0.25, ease: EASE, overwrite: 'auto' })
          }}
          onMouseLeave={() => {
            if (reducedMotion || phase.current !== 'closed') return
            gsap.to(markBlockRef.current, { y: markOffsets().block, duration: 0.3, ease: EASE, overwrite: 'auto' })
          }}
          aria-expanded={isOpen}
          aria-controls="displacement-navbar-shelf"
          aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
          className="group relative flex items-center justify-center w-[5vw] h-[5vw] max-[1025px]:w-[12vw] max-[1025px]:h-[12vw] min-[769px]:max-[1025px]:w-[5vw] min-[769px]:max-[1025px]:h-[5vw] mr-[-0.8vw] p-0 border-none bg-transparent cursor-pointer text-current"
        >
          <span
            className={`relative block  max-[1025px]:w-[8vw] max-[1025px]:h-[8vw] min-[769px]:max-[1025px]:w-[3.5vw] min-[769px]:max-[1025px]:h-[3.5vw] transition-transform duration-300 ease-[cubic-bezier(0.625,0.05,0,1)] ${
              isOpen ? 'group-hover:rotate-90 w-[2vw] h-[2vw]' : 'w-[3vw] h-[1.9vw]'
            }`}
          >
            <span
              ref={markLineRef}
              className="absolute top-1/2 left-1/2 w-full h-0.5 origin-center bg-current"
            />
            <span
              ref={markBlockRef}
              className="absolute top-1/2 left-1/2 w-[60%] h-[32%] origin-center bg-current"
            />
          </span>
        </button>

        <span
          ref={barLineRef}
          className="absolute left-[1.7vw] right-[1.7vw] max-[1025px]:left-[5vw] max-[1025px]:right-[5vw] min-[769px]:max-[1025px]:left-[2.6vw] min-[769px]:max-[1025px]:right-[2.6vw] bottom-0 h-px origin-center scale-x-0 pointer-events-none"
          style={{ backgroundColor: hairlineColor }}
        />
      </header>

      <div
        id="displacement-navbar-shelf"
        ref={shelfRef}
        aria-hidden={!isOpen}
        className="fixed top-[4vw] max-[1025px]:top-[16vw] min-[769px]:max-[1025px]:top-[5.5vw] left-0 right-0 z-25 invisible pointer-events-none border-b"
        style={{ backgroundColor: shelfBackground, borderColor: hairlineColor }}
      >
        <div className="py-[2.2vw] px-[1.7vw] max-[1025px]:py-[10vw] max-[1025px]:px-[5vw] min-[769px]:max-[1025px]:py-[4vw] min-[769px]:max-[1025px]:px-[2.6vw]">
          <div className="flex max-[1025px]:flex-col items-start gap-[4vw] max-[1025px]:gap-[10vw] min-[769px]:max-[1025px]:gap-[4vw]">
            <nav
              ref={primaryNavRef}
              aria-label="Site navigation"
              className="flex flex-col flex-none min-w-0"
              onMouseLeave={() => {
                if (reducedMotion || !dimInactiveLinks) return
                contentRefs.current.forEach((el) => {
                  if (el?.dataset.role === 'primary-link') gsap.to(el, { opacity: 1, duration: 0.35, ease: EASE, overwrite: 'auto' })
                })
              }}
            >
              {primaryLinks.map((link, i) => (
                <div
                  key={link.label}
                  ref={(node) => registerContent(node, i)}
                  data-role="primary-link"
                  className="group relative flex items-baseline py-[0.7vw] max-[1025px]:py-[3.2vw] min-[769px]:max-[1025px]:py-[1.3vw]"
                  onMouseEnter={() => {
                    // The image swap still runs under reduced motion — it is an
                    // information change, not decoration — but the sibling
                    // dimming is purely decorative, so it is skipped.
                    if (showMedia) swapMedia(i % media.length)
                    if (reducedMotion || !dimInactiveLinks) return
                    contentRefs.current.forEach((el, idx) => {
                      if (el?.dataset.role === 'primary-link') {
                        gsap.to(el, { opacity: idx === i ? 1 : 0.4, duration: 0.35, ease: EASE, overwrite: 'auto' })
                      }
                    })
                  }}
                >
                  <LinkHover
                    href={link.href ?? '#'}
                    reduced={reducedMotion}
                    staggerStep={charStagger}
                    showLine={showLinkUnderline}
                    className="text-[2.2vw] max-[1025px]:text-[7vw] min-[769px]:max-[1025px]:text-[3.4vw] font-light leading-[1.1] tracking-[-0.02em]"
                    style={{ color: linkColor }}
                  >
                    {link.label}
                  </LinkHover>
                </div>
              ))}
            </nav>

            <nav
              aria-label="Info"
              ref={(node) => registerContent(node, primaryLinks.length)}
              className="flex flex-col max-[1025px]:flex-row max-[1025px]:flex-wrap gap-[0.6vw] max-[1025px]:gap-y-[3.5vw] max-[1025px]:gap-x-[6vw] min-[769px]:max-[1025px]:gap-y-[1.5vw] min-[769px]:max-[1025px]:gap-x-[3vw] min-w-[8vw] flex-none mx-auto max-[1025px]:mx-0 pt-[0.7vw] max-[1025px]:pt-0"
            >
              <span
                className="w-full text-[0.65vw] max-[1025px]:text-[3vw] min-[769px]:max-[1025px]:text-[1.4vw] font-semibold tracking-[0.08em] uppercase"
                style={{ color: mutedColor }}
              >
                Info
              </span>
              {infoLinks.map((link) => (
                <LinkHover
                  key={link.label}
                  href={link.href ?? '#'}
                  reduced={reducedMotion}
                  staggerStep={charStagger}
                  showLine={showLinkUnderline}
                  className="text-[0.9vw] max-[1025px]:text-[3.5vw] min-[769px]:max-[1025px]:text-[1.7vw] font-normal tracking-[-0.01em]"
                  style={{ color: linkColor }}
                >
                  {link.label}
                </LinkHover>
              ))}
            </nav>

            {showMedia && (
              <figure
                ref={(node) => registerContent(node, primaryLinks.length + 1)}
                aria-hidden="true"
                className="m-0 w-[18vw] flex-none pt-[0.7vw] max-[1025px]:hidden"
              >
                <div className="relative aspect-3/2 overflow-hidden">
                  {media.map((item, i) => (
                    <div
                      key={item.src}
                      ref={(node) => registerImage(node, i)}
                      className="absolute inset-0 w-full h-full"
                    >
                      <Image
                        src={item.src}
                        alt=""
                        fill
                        sizes="18vw"
                        className={`object-cover ${
                          reducedMotion ? '' : 'hover:scale-105 duration-300 transition-all ease-in-out'
                        }`}
                      />
                    </div>
                  ))}
                </div>
                <figcaption
                  ref={captionRef}
                  className="mt-[0.4vw] text-[0.65vw] tracking-[0.02em]"
                  style={{ color: mutedColor }}
                >
                  {media[0]?.caption}
                </figcaption>
              </figure>
            )}
          </div>

          <div
            ref={(node) => registerContent(node, primaryLinks.length + (showMedia ? 2 : 1))}
            className="flex max-[1025px]:flex-col items-center max-[1025px]:items-start justify-between gap-[2vw] mt-[1.5vw] max-[1025px]:mt-[10vw] min-[769px]:max-[1025px]:mt-[4vw] pt-[0.85vw] max-[1025px]:pt-[7vw] min-[769px]:max-[1025px]:pt-[2.8vw] border-t text-[0.65vw] max-[1025px]:text-[3vw] min-[769px]:max-[1025px]:text-[1.4vw] max-[1025px]:gap-[5vw] min-[769px]:max-[1025px]:gap-[2.2vw]"
            style={{ borderColor: hairlineColor, color: mutedColor }}
          >
            <LinkHover
              showLine={false}
              reduced={reducedMotion}
              staggerStep={charStagger}
              href={`mailto:${email}`}
              className="text-sm"
              style={{ color: linkColor, opacity: 0.8 }}
            >
              {email}
            </LinkHover>
            <span className="flex gap-[4vw] max-[1025px]:gap-[14vw] min-[769px]:max-[1025px]:gap-[6vw] ">
              {socials.map((social) => (
                <LinkHover
                  key={social.label}
                  showLine={false}
                  reduced={reducedMotion}
                  staggerStep={charStagger}
                  href={social.href ?? '#'}
                  className="text-sm"
                  style={{ color: linkColor, opacity: 0.8 }}
                >
                  {social.label}
                </LinkHover>
              ))}
            </span>
            <span className='text-sm'>{cities}</span>
          </div>
        </div>
      </div>

      <div
        ref={pageRef}
        className="relative z-20 min-h-screen pt-[4vw] max-[1025px]:pt-[16vw] min-[769px]:max-[1025px]:pt-[5.5vw] will-change-transform"
        style={{ backgroundColor: pageBackground, color: '#111111' }}
      >
        {children ?? (
          <div className="grid place-items-center min-h-[90vh] px-[1.7vw] max-[1025px]:px-[5vw] min-[769px]:max-[1025px]:px-[2.6vw]">
            <h1 className="m-0 text-[4vw] max-[1025px]:text-[9vw] min-[769px]:max-[1025px]:text-[4.5vw] font-light leading-[1.05] tracking-[-0.03em] text-center">
              Displacement Navbar
            </h1>
          </div>
        )}
      </div>
    </div>
  )
}

export default DisplacementNavbar
