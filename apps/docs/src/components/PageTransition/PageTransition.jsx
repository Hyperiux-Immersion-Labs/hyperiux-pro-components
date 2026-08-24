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
 * 2x2 Glitch Pixel Squares indicator with smooth slower pixel blink
 */
function LoopedPixelSquares() {
  return (
    <span
      aria-hidden="true"
      className="grid grid-cols-2 gap-1.5 md:gap-2"
    >
      <style>{`
        @keyframes pixelGlitchInLoop {
          0%, 22%, 44% { opacity: 0; }
          11%, 33%, 55%, 100% { opacity: 1; }
        }
        @keyframes pixelGlitchFlashLoop {
          0%, 18%, 34%, 56%, 78%, 100% { opacity: 0; }
          9%, 26%, 45%, 67% { opacity: 1; }
        }
        .animate-glitch-square {
          animation: pixelGlitchInLoop 1.6s steps(1, end) infinite;
        }
        .animate-glitch-cell {
          animation: pixelGlitchFlashLoop 1.4s steps(1, end) infinite;
        }
      `}</style>
      {Array.from({ length: 4 }).map((_, i) => (
        <span
          key={i}
          style={{ animationDelay: `${i * 200}ms` }}
          className="animate-glitch-square relative size-4 md:size-6 bg-white shadow-xl"
        >
          <span
            style={{ animationDelay: `${i * 200}ms` }}
            className="animate-glitch-cell absolute inset-0 bg-[#0e0e0e]"
          />
        </span>
      ))}
    </span>
  )
}

// Internal workspace routes (skip transition when navigating internally)
const INTERNAL_WORKSPACE_PREFIXES = [
  '/dashboard',
  '/app/dashboard',
  '/effects',
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

  // Draw 2D Bayer Dither Wave Frame (Cover from top -> Exit in opposite direction from bottom to top)
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const { cols, rows, image, pixels } = gridRef.current
    if (!canvas || !image || !cols || !rows || !pixels) return

    const ctx = canvas.getContext('2d')
    const { cover, exit } = progressRef.current

    if (cover <= 0) {
      ctx.clearRect(0, 0, cols, rows)
      return
    }

    const dotColor = packHex('#ff5f00')
    const invRows = rows > 1 ? 1 / (rows - 1) : 0

    pixels.fill(0)

    for (let y = 0; y < rows; y++) {
      const band = y * invRows
      const rowBase = (y & 7) * 8
      const offset = y * cols

      for (let x = 0; x < cols; x++) {
        // Wave curve for dynamic bowed dither edge
        const wave = Math.sin(x * 0.08) * 0.12 + Math.cos(x * 0.04) * 0.08
        const depth = band + wave * 0.15

        // Cover: Enters from top to bottom
        const coverRaw = Math.max(0, Math.min(1, (cover - depth) / 0.35 + 0.5))

        // Exit: Opposite direction (clears from bottom to top)
        const exitRaw = Math.max(0, Math.min(1, (1.25 - exit - (1 - band) + wave * 0.15) / 0.35 + 0.5))

        const raw = Math.min(coverRaw, exitRaw)
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
  }, [router])

  // Cover current page: dither wave sweeps DOWN from top to bottom
  const coverScreenAndNavigate = (targetPath) => {
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
      cover: 1.25,
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
  }

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
  }, [pathname, draw])

  const revealScreen = () => {
    if (!containerRef.current) {
      isTransitioningRef.current = false
      return
    }

    if (progressRef.current.cover < 1) {
      progressRef.current.cover = 1.25
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

    // Sweep dither wave UP towards top (opposite direction) to reveal newly rendered page (slower duration)
    tl.to(
      progressRef.current,
      {
        exit: 1.25,
        duration: 0.72,
        ease: 'power2.inOut',
        onUpdate: draw
      },
      '-=0.12'
    )
  }

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

      {/* 2x2 Glitch Pixel Squares Indicator from PricingV3 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div ref={logoRef} className="opacity-0">
          <LoopedPixelSquares />
        </div>
      </div>
    </div>
  )
}
