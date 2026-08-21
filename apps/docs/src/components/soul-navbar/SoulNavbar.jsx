'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Leva } from 'leva'
import SoulVeil from './SoulVeil'
import { createVisibilityGate } from '../fish-eye/createSuspendedRaf'
import { usePrefersReducedMotion } from '@/lib/motion'

// The veil owns the first and last beat of the sequence. On the way in the
// menu waits for the ink to have covered the screen; on the way out the ink
// waits for the text to have left. Nothing overlaps, so the two never read as
// one muddled transition.
const ENTER_DURATION = 800
const ENTER_STAGGER = 80
const EXIT_DURATION = 420
const EXIT_STAGGER = 10

// The fade runs on its own clock, longer than the slide and eased out rather
// than linear. A linear opacity ramp spends most of its time near full
// brightness, which is what made the lines pop in; easing out keeps them low
// for longer so they surface out of the ink instead of appearing on top of it.
const ENTER_FADE = 1100
const EXIT_FADE = 300
const FADE_IN_EASE = 'cubic-bezier(0.33,1,0.68,1)'
const FADE_OUT_EASE = 'cubic-bezier(0.65,0,0.35,1)'

export default function SoulNavbar({
  items = ['Work', 'Studio', 'Journal', 'Contact'],
  hoverText = 'Menu',
  veilControls,
  forcedProgress = null,
  debug = false,
}) {
  const rootRef = useRef(null)
  const progressRef = useRef(0)
  const isHovering = useRef(false)
  const isClosing = useRef(false)
  const timerRef = useRef(null)
  // Whether the user currently wants the menu, and whether the ink has
  // actually finished covering the screen. The menu needs both.
  const wantsMenu = useRef(false)
  const isCovered = useRef(false)

  const [isOpen, setIsOpen] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [frameloop, setFrameloop] = useState('always')
  const prefersReducedMotion = usePrefersReducedMotion()
  const showVeil = !prefersReducedMotion

  const isForced = forcedProgress !== null

  // How long the text needs to clear the mask, last item included.
  const exitDuration = prefersReducedMotion
    ? 0
    : Math.max(EXIT_DURATION, EXIT_FADE) + EXIT_STAGGER * Math.max(items.length - 1, 0)

  const clearTimer = useCallback(() => {
    if (timerRef.current === null) return
    clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  const setProgress = useCallback((value) => {
    if (isForced) return
    progressRef.current = value
  }, [isForced])

  const handleEnter = useCallback(() => {
    isHovering.current = true
    setIsHovered(true)
    if (isOpen || isClosing.current) return
    setProgress(1)
  }, [isOpen, setProgress])

  const handleLeave = useCallback(() => {
    isHovering.current = false
    setIsHovered(false)
    if (isOpen || isClosing.current) return
    setProgress(0)
  }, [isOpen, setProgress])

  const close = useCallback(() => {
    clearTimer()
    isClosing.current = true
    wantsMenu.current = false
    setMenuVisible(false)
    setIsOpen(false)

    // Hold the veil at full cover until the last line has slid back behind
    // its mask, then let it retract.
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      isClosing.current = false
      setProgress(isHovering.current ? 1 : 0)
    }, exitDuration)
  }, [clearTimer, exitDuration, setProgress])

  const open = useCallback(() => {
    clearTimer()
    isClosing.current = false
    wantsMenu.current = true
    setIsOpen(true)
    setProgress(2)

    // Normally the veil reports back when it has covered the screen. Two cases
    // never produce that crossing: there is no veil at all, and a reopen so
    // fast the ink never uncovered in between.
    if (!showVeil || isCovered.current) setMenuVisible(true)
  }, [clearTimer, showVeil, setProgress])

  const toggle = useCallback(() => {
    if (isOpen) {
      close()
      return
    }
    open()
  }, [isOpen, open, close])

  const handleCoverChange = useCallback((covered) => {
    isCovered.current = covered
    // Only the rising edge matters. Hiding is the toggle's job, so that the
    // text is gone before the ink starts to retract.
    if (covered && wantsMenu.current) setMenuVisible(true)
  }, [])

  useEffect(() => clearTimer, [clearTimer])

  // Leva-driven state on the demo page bypasses the click handlers, so it gets
  // the same staging applied to the menu on its own. Deliberately blind to
  // `isOpen`: the click path owns its own timing and must not be re-driven
  // here, or closing would snap the veil back before the text has left.
  useEffect(() => {
    clearTimer()
    isClosing.current = false

    const next = isForced ? forcedProgress : (isHovering.current ? 1 : 0)

    if (!isForced) setIsOpen(false)

    if (next === 2) {
      wantsMenu.current = true
      progressRef.current = 2
      if (!showVeil || isCovered.current) setMenuVisible(true)
      return undefined
    }

    wantsMenu.current = false
    setMenuVisible(false)

    // Coming down off a full cover, the ink waits for the text here too.
    if (progressRef.current === 2) {
      const timer = setTimeout(() => {
        progressRef.current = next
      }, exitDuration)
      return () => clearTimeout(timer)
    }

    progressRef.current = next
    return undefined
  }, [isForced, forcedProgress, exitDuration, showVeil, clearTimer])

  useEffect(() => {
    if (!isOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      close()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, close])

  useEffect(() => {
    const gate = createVisibilityGate({
      root: rootRef,
      onChange: (active) => setFrameloop(active ? 'always' : 'never'),
    })
    setFrameloop(gate.isActive ? 'always' : 'never')
    return () => gate.destroy()
  }, [])

  const isOpenIntent = isForced ? forcedProgress === 2 : isOpen

  // 0 = Initial Menu, 1 = Hovered Text (About), 2 = Open (Close)
  const activeIndex = isOpenIntent ? 2 : (isHovered ? 1 : 0)

  const itemStyles = useMemo(
    () =>
      items.map((_, index) => {
        if (prefersReducedMotion) {
          return {
            transform: 'none',
            opacity: menuVisible ? 1 : 0,
            transition: 'opacity 260ms ease-out, color 300ms ease',
          }
        }

        // Entering runs top-down, leaving runs bottom-up, so the list always
        // resolves away from the direction it came in.
        const step = menuVisible
          ? index * ENTER_STAGGER
          : (items.length - 1 - index) * EXIT_STAGGER
        const duration = menuVisible ? ENTER_DURATION : EXIT_DURATION
        const fade = menuVisible ? ENTER_FADE : EXIT_FADE
        const fadeEase = menuVisible ? FADE_IN_EASE : FADE_OUT_EASE

        return {
          transform: menuVisible ? 'translateY(0%)' : 'translateY(115%)',
          opacity: menuVisible ? 1 : 0,
          transition: `transform ${duration}ms ${step}ms, opacity ${fade}ms ${fadeEase} ${step}ms, color 300ms ease`,
        }
      }),
    [items, menuVisible, prefersReducedMotion],
  )

  return (
    <>
      <Leva
        hidden={!debug}
        theme={{
          sizes: {
            rootWidth: '420px',
            controlWidth: '200px',
          },
        }}
      />
      <div ref={rootRef} className="pointer-events-none fixed inset-0 z-50">
      {showVeil && (
        <div className="pointer-events-none absolute inset-0">
          <SoulVeil
            progressRef={progressRef}
            frameloop={frameloop}
            controls={veilControls}
            onCoverChange={handleCoverChange}
          />
        </div>
      )}

      {!showVeil && isOpenIntent && (
        <div className="pointer-events-none absolute inset-0 bg-[#0e0e10]" />
      )}

      <div
        className={`absolute inset-0 z-10 flex items-center justify-center ${
          menuVisible ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <ul className="flex flex-col items-center gap-1 text-center sm:gap-2">
          {items.map((item, index) => (
            // The mask: each line slides inside its own clipped box. The
            // vertical padding on the link lives inside that box so ascenders
            // and descenders are not shaved off.
            <li key={item} className="overflow-hidden">
              <a
                href="#"
                tabIndex={menuVisible ? 0 : -1}
                aria-hidden={!menuVisible}
                style={itemStyles[index]}
                className="block px-[0.06em] py-[0.1em] text-4xl leading-none text-white/60 will-change-transform hover:text-white sm:text-6xl"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <nav className="pointer-events-none absolute right-0 top-0 z-20 flex items-center gap-6 p-6 sm:p-8">
        <button
          type="button"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onFocus={handleEnter}
          onBlur={handleLeave}
          onClick={toggle}
          aria-expanded={isOpen}
          aria-label={isOpenIntent ? 'Close menu' : 'Open menu'}
          className="pointer-events-auto cursor-pointer bg-transparent text-sm tracking-wide text-white mix-blend-difference"
        >
          <span className="relative block h-5 overflow-hidden select-none">
            <span
              className="flex flex-col transition-transform duration-500 "
              style={{ transform: `translateY(-${(activeIndex * 100) / 3}%)` }}
            >
              <span className="flex h-5 items-center mix-blend-difference! text-white! justify-center">Menu</span>
              <span className="flex h-5 items-center justify-center">{hoverText}</span>
              <span className="flex h-5 items-center justify-center">Close</span>
            </span>
          </span>
        </button>
      </nav>
    </div>
    </>
  )
}
