'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import gsap from 'gsap'

/** Bayer 8x8 ordered-dither matrix for retro halftone dissolve effect */
const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36,
  14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23,
  61, 29, 53, 21
]

/** Pack hex string into little-endian ABGR Uint32 */
function packHex(hex) {
  let h = String(hex).replace('#', '')
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  if (h.length === 6) h += 'ff'
  const n = parseInt(h, 16)
  const r = (n >>> 24) & 255
  const g = (n >>> 16) & 255
  const b = (n >>> 8) & 255
  const a = (n & 255) / 255
  return ((Math.round(a * 255) << 24) | (b << 16) | (g << 8) | r) >>> 0
}

/**
 * Grid Squares Loader Component
 */
function GridSquares({
  rows = 3,
  cols = 3,
  size = 56,
  squareSize = 8,
  color = '#ffffff',
  className = '',
  style,
  ...props
}) {
  const total = rows * cols

  return (
    <>
      <style>{`
        @keyframes amicro-grid-square-wave {
          0%, 100% {
            transform: scale(0.35) translateY(0);
            opacity: 0.2;
          }
          40% {
            transform: scale(1.15) translateY(-2px);
            opacity: 1;
          }
          70% {
            transform: scale(0.65) translateY(0);
            opacity: 0.55;
          }
        }
      `}</style>
      <div
        role="status"
        aria-label="Loading"
        className={`inline-grid gap-1 items-center justify-center select-none ${className}`}
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          width: size,
          height: size,
          ...style,
        }}
        {...props}
      >
        {Array.from({ length: total }).map((_, i) => {
          const row = Math.floor(i / cols)
          const col = i % cols
          const delay = (row + col) * 0.12

          return (
            <span
              key={i}
              className="rounded-none will-change-transform"
              style={{
                width: squareSize,
                height: squareSize,
                borderRadius: 0,
                backgroundColor: color,
                animation: 'amicro-grid-square-wave 1.4s ease-in-out infinite',
                animationDelay: `${delay}s`,
              }}
            />
          )
        })}
        <span className="sr-only">Loading</span>
      </div>
    </>
  )
}

// Internal workspace routes (skip transition when navigating internally)
const INTERNAL_WORKSPACE_PREFIXES = [
  '/dashboard',
  '/app/dashboard',
  '/effects',
  '/templates',
  '/docs',
  '/legal',
  '/mcp'
]

function isInternalWorkspaceRoute(path) {
  if (!path) return false
  return INTERNAL_WORKSPACE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(prefix + '/')
  )
}

function shouldSkipTransition(prevPath, targetPath) {
  if (isInternalWorkspaceRoute(prevPath) && isInternalWorkspaceRoute(targetPath)) {
    return true
  }
  return false
}

export default function PageTransition() {
  const pathname = usePathname()
  const router = useRouter()

  const prevPathRef = useRef(pathname)
  const isFirstRenderRef = useRef(true)
  const isTransitioningRef = useRef(false)

  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const logoRef = useRef(null)

  const progressRef = useRef({ cover: 0, exit: 0 })
  const gridRef = useRef({ cols: 0, rows: 0, image: null, pixels: null })

  // Initialize Canvas pixel grid
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const cellSize = 4
    const cols = Math.max(1, Math.ceil(window.innerWidth / cellSize))
    const rows = Math.max(1, Math.ceil(window.innerHeight / cellSize))

    canvas.width = cols
    canvas.height = rows

    const ctx = canvas.getContext('2d')
    const image = ctx.createImageData(cols, rows)
    gridRef.current = {
      cols,
      rows,
      image,
      pixels: new Uint32Array(image.data.buffer)
    }
  }, [])

  // Draw 2D Bayer Dither Wave Frame (Cover sweeps DOWN from top -> Exit sweeps DOWN all the way off the bottom)
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const { cols, rows, image, pixels } = gridRef.current
    if (!canvas || !image || !cols || !rows || !pixels) return

    const ctx = canvas.getContext('2d')
    const { cover, exit } = progressRef.current

    if (cover <= 0 || exit >= 1) {
      ctx.clearRect(0, 0, cols, rows)
      return
    }

    const dotColor = packHex('#ff5f00')
    const invRows = rows > 1 ? 1 / (rows - 1) : 0

    pixels.fill(0)

    const span = 0.35
    const amp = 0.04
    const range = 1 + span + 2 * amp

    const leadPos = cover * range - amp
    const trailPos = exit * range - amp

    for (let y = 0; y < rows; y++) {
      const v = y * invRows
      const rowBase = (y & 7) * 8
      const offset = y * cols

      for (let x = 0; x < cols; x++) {
        // Minimal subtle organic curvature
        const wave = Math.sin(x * 0.03) * 0.015 + Math.cos(x * 0.015) * 0.01

        // Cover leading edge sweeps DOWN
        const coverAlpha = Math.max(0, Math.min(1, (leadPos - v + wave) / span))

        // Exit trailing edge sweeps DOWN (uncovering from top to bottom all the way off the bottom)
        const exitAlpha = Math.max(0, Math.min(1, 1 - (trailPos - v + wave) / span))

        const raw = Math.min(coverAlpha, exitAlpha)
        if (raw <= 0) continue

        const threshold = (BAYER[rowBase + (x & 7)] + 0.5) / 64
        if (raw >= threshold) {
          pixels[offset + x] = dotColor
        }
      }
    }

    ctx.putImageData(image, 0, 0)
  }, [])

  useEffect(() => {
    initCanvas()
    window.addEventListener('resize', initCanvas)
    return () => window.removeEventListener('resize', initCanvas)
  }, [initCanvas])

  // Cover current page: dither wave sweeps DOWN from top to bottom
  const coverScreenAndNavigate = useCallback((targetPath) => {
    if (!containerRef.current) {
      router.push(targetPath)
      isTransitioningRef.current = false
      return
    }

    progressRef.current.cover = 0
    progressRef.current.exit = 0

    gsap.set(containerRef.current, { display: 'block', pointerEvents: 'all' })
    if (logoRef.current) {
      gsap.set(logoRef.current, { opacity: 0, scale: 0.9 })
    }

    const tl = gsap.timeline()

    // Sweep dither wave DOWN from top to cover full viewport (slower duration)
    tl.to(progressRef.current, {
      cover: 1,
      duration: 0.65,
      ease: 'power2.inOut',
      onUpdate: draw
    })

    if (logoRef.current) {
      tl.to(
        logoRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.32,
          ease: 'power2.out'
        },
        '-=0.25'
      )
    }

    tl.call(() => {
      // Execute route change while screen is flooded with dithered orange & pixel squares
      router.push(targetPath)
    })
  }, [draw, router])

  const revealScreen = useCallback(() => {
    if (!containerRef.current) {
      isTransitioningRef.current = false
      return
    }

    if (progressRef.current.cover < 1) {
      progressRef.current.cover = 1
      progressRef.current.exit = 0
      draw()
      gsap.set(containerRef.current, { display: 'block', pointerEvents: 'all' })
      if (logoRef.current) {
        gsap.set(logoRef.current, { opacity: 1, scale: 1 })
      }
    }

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(containerRef.current, { display: 'none', pointerEvents: 'none' })
        progressRef.current.cover = 0
        progressRef.current.exit = 0
        draw()
        isTransitioningRef.current = false
      }
    })

    if (logoRef.current) {
      tl.to(logoRef.current, {
        opacity: 0,
        scale: 1.06,
        duration: 0.25,
        ease: 'power2.in'
      })
    }

    // Sweep dither wave DOWN all the way off the bottom to reveal newly rendered page
    tl.to(
      progressRef.current,
      {
        exit: 1,
        duration: 0.72,
        ease: 'power2.inOut',
        onUpdate: draw
      },
      '-=0.12'
    )
  }, [draw])

  // 2. Reveal new page: dither wave sweeps DOWN all the way off the bottom
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      prevPathRef.current = pathname
      isTransitioningRef.current = false
      return
    }

    const prevPath = prevPathRef.current
    const currentPath = pathname

    prevPathRef.current = pathname

    if (shouldSkipTransition(prevPath, currentPath)) {
      isTransitioningRef.current = false
      return
    }

    revealScreen()
  }, [pathname, revealScreen])

  // 1. Cover Screen BEFORE route change on link click
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      if (
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        anchor.target === '_blank' ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return
      }

      const currentPath = window.location.pathname
      let targetPath = href
      try {
        targetPath = new URL(href, window.location.origin).pathname
      } catch (err) {
        return
      }

      if (currentPath === targetPath) return

      if (shouldSkipTransition(currentPath, targetPath)) {
        isTransitioningRef.current = false
        return
      }

      if (isTransitioningRef.current) return
      isTransitioningRef.current = true

      e.preventDefault()

      coverScreenAndNavigate(targetPath)
    }

    document.addEventListener('click', handleAnchorClick, { capture: true })
    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true })
    }
  }, [coverScreenAndNavigate])

  // 2. Reveal new page: dither wave sweeps UP from bottom to top (opposite direction)
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      prevPathRef.current = pathname
      isTransitioningRef.current = false
      return
    }

    const prevPath = prevPathRef.current
    const currentPath = pathname

    prevPathRef.current = pathname

    if (shouldSkipTransition(prevPath, currentPath)) {
      isTransitioningRef.current = false
      return
    }

    revealScreen()
  }, [pathname, revealScreen])

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      aria-hidden="true"
      className="fixed inset-0 z-[99999] hidden pointer-events-none overflow-hidden select-none"
    >
      {/* 2D Bayer Dither Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Grid Squares Loading Indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div ref={logoRef} className="opacity-0 flex items-center justify-center">
          <GridSquares size={56} squareSize={8} color="#0e0e0e" />
        </div>
      </div>
    </div>
  )
}
