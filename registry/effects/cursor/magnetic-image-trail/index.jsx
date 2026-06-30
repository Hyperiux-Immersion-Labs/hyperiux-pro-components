'use client'

import ImageTrail from './MagneticTrail'
import { useEffect, useState } from 'react'

const Content = () => (
  <main className="relative min-h-screen max-sm:h-screen w-full overflow-hidden bg-[#f4f4f1] text-black">

    <div className="absolute top-[30%] left-1/2 w-[50%] hidden max-md:flex -translate-x-1/2 -translate-y-1/2 h-fit max-sm:w-[70%] px-6 text-center">
      <p className="rounded-xl bg-black/10 px-5 py-3 leading-[1.2] text-base text-black backdrop-blur-sm">
        Follow the motion. <br />
        Open on desktop for the full magnetic effect
      </p>
    </div>

    {/* content */}
    <section className="flex min-h-screen items-end px-8 pb-8">
      <div>
        <h1 className="font-mono text-[8vh] max-sm:text-[15vw] leading-none w-[30vw] font-black uppercase">
          Magnetic
          <br />
          Image Trail
        </h1>

        <p className="mt-6 font-mono text-sm uppercase tracking-[0.25em] text-black/40">
          Cursor · Images · Momentum
        </p>
      </div>
    </section>

  </main>
)

export default function MagneticImageTrail() {
  const [isMobile, setIsMobile] = useState(null)

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 1025)
    }

    check()
    window.addEventListener('resize', check)

    return () => window.removeEventListener('resize', check)
  }, [])

  // prevent desktop component flash during hydration
  if (isMobile === null) return null

  return isMobile ? <Content /> : <ImageTrail />
}
