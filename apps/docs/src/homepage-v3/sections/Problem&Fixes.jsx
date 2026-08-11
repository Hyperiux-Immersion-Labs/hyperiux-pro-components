'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import ScrambleTextV3 from '../components/ScrambleTextV3'

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
    description: 'Lightweight by default. Smooth under pressure.',
    label: 'Hidden bundle cost',
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

export default function ProblemFixes() {
  const sectionRef = useRef(null)
  const cardsRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let ctx

    const mount = () => {
      setArmed(true)

      ctx = gsap.context(() => {
        const cardEls = gsap.utils.toArray('.tension-card')
        const checkIcons = gsap.utils.toArray('.tension-check')
        const xIcons = gsap.utils.toArray('.tension-x')
        const total = cardEls.length

        const rowHeight =
          total > 1
            ? cardEls[1].getBoundingClientRect().top -
            cardEls[0].getBoundingClientRect().top
            : 60

        cardEls.forEach((card, i) => {
          gsap.set(card, {
            position: 'relative',
            zIndex: total - i,
            y: -i * rowHeight,
            opacity: i === 0 ? 1 : 0,
          })
        })

        // A zero-length dash still paints a dot with `stroke-linecap: round`,
        // so the icons stay hidden until their stroke actually has length.
        checkIcons.forEach((icon) => {
          gsap.set(icon.querySelectorAll('path, polyline, line'), {
            drawSVG: '100% 100%',
          })
          gsap.set(icon, { autoAlpha: 0 })
        })

        xIcons.forEach((icon) => {
          gsap.set(icon.querySelectorAll('path, polyline, line'), {
            drawSVG: '0% 0%',
          })
          gsap.set(icon, { autoAlpha: 0 })
        })

        const revealCard = (index) => ({
          onStart: () => setActiveIndex((current) => Math.max(current, index)),
          onReverseComplete: () =>
            setActiveIndex((current) => Math.min(current, index - 1)),
        })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 70%',
            end: 'bottom 50%',
            scrub: true,
            markers: false,
          },
        })

        tl.to(
          checkIcons[0].querySelectorAll('path, polyline, line'),
          {
            drawSVG: '0% 100%',
            duration: 0.4,
            ease: 'linear',
            ...revealCard(0),
          },
          0,
        )
        tl.to(checkIcons[0], { autoAlpha: 1, duration: 0.05 }, 0)
        tl.to(
          xIcons[0].querySelectorAll('path, polyline, line'),
          { drawSVG: '0% 100%', duration: 0.4, ease: 'linear' },
          0,
        )
        tl.to(xIcons[0], { autoAlpha: 1, duration: 0.05 }, 0)

        for (let i = 1; i < total; i++) {
          const t = i * 0.8

          for (let j = i; j < total; j++) {
            tl.to(
              cardEls[j],
              { y: -(j - i) * rowHeight, duration: 1, ease: 'power1.out' },
              t,
            )
          }

          tl.to(
            cardEls[i],
            {
              opacity: 1,
              duration: 0.6,
              ease: 'linear',
              ...revealCard(i),
            },
            t + 0.1,
          )
          tl.to(
            checkIcons[i].querySelectorAll('path, polyline, line'),
            { drawSVG: '0% 100%', duration: 0.5, ease: 'linear' },
            t + 0.7,
          )
          tl.to(checkIcons[i], { autoAlpha: 1, duration: 0.05 }, t + 0.7)
          tl.to(
            xIcons[i].querySelectorAll('path, polyline, line'),
            { drawSVG: '0% 100%', duration: 0.5, ease: 'linear' },
            t + 0.7,
          )
          tl.to(xIcons[i], { autoAlpha: 1, duration: 0.05 }, t + 0.7)
        }
      }, sectionRef)
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          io.disconnect()
          mount()
        }
      },
      { rootMargin: '500px 0px' },
    )
    io.observe(section)

    return () => {
      io.disconnect()
      ctx?.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative z-200 w-full overflow-hidden px-[3vw] pb-[10%] text-white max-md:px-[6vw] max-md:py-24 max-sm:px-5 max-sm:py-20"
    >
      <div className="mx-auto relative z-200 flex w-full flex-col items-center">
        <div className="w-full text-center">
          <h2 className="t96 w-full">
            Good Motion is{' '}
            <span className="gradient-text-animate">Harder</span> Than It Looks
          </h2>
          <p className="text24 mx-auto mt-[2vw] max-w-[65vw] leading-[1.55] text-white max-md:mt-[5vw] max-md:max-w-[85vw] max-md:text-sm max-sm:mt-[10vw] max-sm:max-w-full max-sm:leading-[1.3]">
            Anyone can add a fade. The hard part is everything around it: timing, restraint, layout awareness, responsive behavior, reduced-motion support, dependency clarity, and performance discipline.Get it wrong and your "wow moment" janks on mobile, tanks your Lighthouse score, or quietly breaks for the people who turned motion off.
          </p>
        </div>

        <div
          ref={cardsRef}
          className="mt-[8vw] h-fit w-[85vw] space-y-[1vw] max-md:mt-20 max-md:w-full max-md:space-y-5 max-sm:mt-20 max-sm:space-y-5"
        >
          <div className="text24 flex w-full items-center justify-between px-[.5vw] max-sm:text-sm">
            <p>Fixes</p>
            <p>Solves</p>
          </div>

          {cards.map((item, index) => (
            <div
              key={item.title}
              className="tension-card bg-grey/30 flex items-center justify-between p-[.7vw] pr-[1.5vw] max-md:p-3 max-sm:p-2 max-sm:pr-2"
            >
              <div className="flex min-w-0 flex-1 items-center max-md:flex-col max-md:items-start max-md:gap-3 max-sm:gap-2.5">
                <div className="flex w-[25vw] shrink-0 items-center gap-[1vw] max-md:gap-4 max-sm:w-auto max-sm:gap-2.5">
                  <div className="flex size-[3vw] shrink-0 items-center justify-center bg-background p-1.5 max-md:size-8 max-sm:size-9">
                    <svg
                      className="tension-check h-full w-full opacity-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#03E07C"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="text34 whitespace-nowrap capitalize ">
                    {item.title}
                  </p>
                </div>
                <p className="text-light-grey font-mono text18 max-md:text-[3vw]! max-md:pr-0! min-w-0 flex-1 px-[2vw] text-left [--scramble-flash:var(--primary)] [--scramble-pre:var(--primary)] max-sm:w-full max-sm:flex-none max-sm:px-0 ">
                  <ScrambleTextV3
                    text={item.description}
                    active={index <= activeIndex}
                    armed={armed}
                  />
                </p>
              </div>
              <div className="flex w-[13vw] shrink-0 items-center gap-[1vw] max-md:w-[30%] max-sm:w-fit max-sm:gap-0! max-md:max-w-[35%]">
                <div className="flex size-[3vw] shrink-0 items-center justify-center max-md:size-9 max-sm:size-12">
                  <svg
                    className="tension-x h-[60%] w-[60%] opacity-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FF0B0B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
                <p
                  lang="en"
                  className="text24 capitalize max-sm:min-w-0 max-sm:flex-1 max-sm:text-base! max-sm:leading-tight max-sm:wrap-break-word max-sm:hyphens-auto"
                >
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
