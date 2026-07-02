'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

// Import WebsiteComps
import RandomBlur from '../WebsiteComps/RandomBlur'
import SplitLine from '../WebsiteComps/SplitLine'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin)
}

const cards = [
  {
    title: 'Timing',
    description: 'Precise sequencing that feels intentional, not random.',
    label: 'Drops frames',
  },
  {
    title: 'Restraint',
    description: 'Motion that supports content, not distracts from it.',
    label: 'Motion noise',
  },
  {
    title: 'Reduced-motion',
    description: 'Respects user preferences and accessibility out of the box.',
    label: 'Inaccessible',
  },
  {
    title: 'Performance budget',
    description: 'No jank, no layout jumps, no CLS spikes.',
    label: 'Jank + Drain',
  },
  {
    title: 'Dependency clarity',
    description: 'Lightweight by default. Smooth under pressure',
    label: 'Hidden Bundle',
  },
  {
    title: 'Mobile fallbacks',
    description: 'No mystery bundles or hidden landmines',
    label: 'CLS Spikes',
  },
  {
    title: 'Cleanup on unmount',
    description: 'No leaks, no ghosts, no lingering listeners',
    label: 'Leaks + Ghosts',
  },
]

export default function Tension() {
  const sectionRef = useRef(null)
  const cardsRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray('.tension-card')
      const checkIcons = gsap.utils.toArray('.tension-check')
      const xIcons = gsap.utils.toArray('.tension-x')
      const total = cardEls.length

      /* Measure the row height (distance between consecutive cards) */
      const rowHeight = total > 1
        ? cardEls[1].getBoundingClientRect().top - cardEls[0].getBoundingClientRect().top
        : 60

      /* Initial state: every card stacked at card 0's position */
      cardEls.forEach((card, i) => {
        gsap.set(card, {
          position: 'relative',
          zIndex: total - i,
          y: -i * rowHeight,
          opacity: i === 0 ? 1 : 0,
        })
      })

      /* Set check icons — reverse draw (draw from end to start) */
      checkIcons.forEach(icon => {
        const paths = icon.querySelectorAll('path, polyline, line')
        gsap.set(paths, { drawSVG: '100% 100%' })
        gsap.set(icon, { opacity: 1 })
      })

      /* Set X icons — normal draw (draw from start to end) */
      xIcons.forEach(icon => {
        const paths = icon.querySelectorAll('path, polyline, line')
        gsap.set(paths, { drawSVG: '0% 0%' })
        gsap.set(icon, { opacity: 1 })
      })

      /* Build the timeline */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: cardsRef.current,
          start: 'top 70%',
          end: 'bottom 60%',
          scrub: 1.5,
        },
      })

      /* Draw card 0 icons immediately */
      tl.to(checkIcons[0].querySelectorAll('path, polyline, line'), {
        drawSVG: '0% 100%', duration: 0.4, ease: 'power2.out',
      }, 0)
      tl.to(xIcons[0].querySelectorAll('path, polyline, line'), {
        drawSVG: '0% 100%', duration: 0.4, ease: 'power2.out',
      }, 0)

      /* Cascade reveal: when card i reveals, all cards j >= i move down one row.
         After step i, card j sits at y = -(j - i) * rowHeight.
         So card i lands at y=0, card i+1 is one row behind card i, etc. */
      for (let i = 1; i < total; i++) {
        const t = i * 0.8

        for (let j = i; j < total; j++) {
          tl.to(cardEls[j], {
            y: -(j - i) * rowHeight,
            duration: 1,
            ease: 'power1.out',
          }, t)
        }

        /* Fade in the revealing card */
        tl.to(cardEls[i], {
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
        }, t + 0.1)

        /* Draw check icon (reverse direction) */
        tl.to(checkIcons[i].querySelectorAll('path, polyline, line'), {
          drawSVG: '0% 100%', duration: 0.5, ease: 'power2.out',
        }, t + 0.3)

        /* Draw X icon */
        tl.to(xIcons[i].querySelectorAll('path, polyline, line'), {
          drawSVG: '0% 100%', duration: 0.5, ease: 'power2.out',
        }, t + 0.3)
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-[#0e0e0e] px-[5vw] py-[10%] text-white max-md:px-[6vw] max-md:py-24 max-sm:px-5 max-sm:py-20">
      <div className="mx-auto flex w-full max-w-[90vw] flex-col items-center">
        <div className="w-full text-center">
          <RandomBlur as="h2" className="text110 font-normal leading-[0.95] max-md:leading-[1.02]">
            Good Motion is{' '}
            <span className="text-[#ff5f00]">Harder</span> Than it Looks
          </RandomBlur>

          <SplitLine as="p" className="mx-auto mt-[1.6vw] max-sm:mt-[12vw] max-w-[65vw] text24 font-light leading-[1.55] text-white max-md:mt-5 max-md:max-w-[82vw] max-md:text-sm max-sm:max-w-full">
            Anyone can add a fade. The hard part is everything around it:
            timing, restraint, layout awareness, responsive behavior,
            reduced-motion support, dependency clarity, and performance
            discipline. Get it wrong and your &quot;wow moment&quot; janks on mobile,
            tanks your Lighthouse score, or quietly breaks for the people who
            turned motion off.
          </SplitLine>
        </div>

        <div ref={cardsRef} className="h-fit w-[70vw] mt-[8vw] space-y-[1vw]">
          <div className="text24 px-[.5vw] flex w-full items-center justify-between">
            <p>Fixes</p>
            <p>Solves</p>
          </div>

          {cards.map((items, index) => (
            <div key={index} className="tension-card bg-dark-card rounded-sm flex items-center justify-between pr-[1.5vw] p-[.7vw]">
              <div className="flex items-center gap-[1vw] w-[25vw] shrink-0">
                <div className="size-[3vw] flex items-center justify-center p-1.5 bg-black rounded-sm shrink-0">
                  <svg className="tension-check opacity-0 h-full w-full" viewBox="0 0 24 24" fill="none" stroke="#03E07C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text34 capitalize whitespace-nowrap">{items.title}</p>
              </div>
              <p className="text-light-grey flex-1 text-left px-[2vw] text18">{items.description}</p>
              <div className="flex items-center gap-[1vw] w-[13vw] shrink-0">
                <div className="size-[3vw] flex items-center justify-center shrink-0">
                  <svg className="tension-x opacity-0 h-[60%] w-[60%]" viewBox="0 0 24 24" fill="none" stroke="#FF0B0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
                <p className="text24 capitalize">{items.label}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-[8vw] text-center text-[1.45vw] leading-[1.4] text-white/80 max-md:mt-14 max-md:text-xl max-sm:text-base fadeup">
          That difference has a name.{' '}
          <span className="italic text-[#ff5f00]">
            It&apos;s the interaction layer.
          </span>{' '}
          Here it is.
        </p>
      </div>
    </section>
  )
}